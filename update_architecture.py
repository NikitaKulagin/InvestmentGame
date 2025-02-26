#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Обновлённый скрипт для автоматического обновления ARCHITECTURE.md.
Поддерживаются файлы: Swift, Python, JavaScript и HTML.
Парсинг включает:
  - Извлечение комментариев (однострочных и многострочных).
  - Для классов/структур – сохранение списка полей и методов.
  - По файлам и функциям – поиск импортов/подключений к другим файлам проекта.
Добавлена возможность игнорировать указанные директории и файлы.
"""

import os
import re
import argparse

# ==============================
# Параметры командной строки для игнорирования
# ==============================
def parse_args():
    parser = argparse.ArgumentParser(
        description="Обновление ARCHITECTURE.md с извлечением информации о проекте."
    )
    parser.add_argument(
        "--ignore-dir",
        action="append",
        help="Директория для игнорирования (можно указывать несколько раз)",
    )
    parser.add_argument(
        "--ignore-file",
        action="append",
        help="Файл для игнорирования (можно указывать несколько раз)",
    )
    return parser.parse_args()


# Глобальные переменные для игнорируемых директорий и файлов
ARGS = parse_args()
IGNORED_DIRS = ARGS.ignore_dir if ARGS.ignore_dir else []
IGNORED_FILES = ARGS.ignore_file if ARGS.ignore_file else []

# ==============================
# Регулярные выражения
# ------------------------------
# Swift
SWIFT_CLASS_REGEX = r'^\s*(class|struct)\s+([A-Za-z0-9_]+)'
SWIFT_FUNC_REGEX = r'^\s*func\s+([A-Za-z0-9_]+)\('
SWIFT_FIELD_REGEX = r'^\s*(var|let)\s+([A-Za-z0-9_]+)\s*[:=]'
SWIFT_DOC_REGEX = r'^\s*///\s*(.*)'

# Python
PYTHON_CLASS_REGEX = r'^\s*class\s+([A-Za-z0-9_]+)\s*(\(|:)'
PYTHON_FUNC_REGEX = r'^\s*def\s+([A-Za-z0-9_]+)\('

# JavaScript
JS_CLASS_REGEX = r'^\s*class\s+([A-Za-z0-9_]+)\s*(?:extends\s+[A-Za-z0-9_]+\s*)?{'
JS_FUNC_REGEX = r'^\s*function\s+([A-Za-z0-9_]+)\s*\('
JS_METHOD_REGEX = r'^\s*([A-Za-z0-9_]+)\s*\(.*\)\s*{'
JS_FIELD_REGEX = r'^\s*([A-Za-z0-9_]+)\s*=\s*.+;'

# ==============================
# Вспомогательная функция для поиска импортов
# ==============================
def extract_imports_from_file(lines, lang, project_files):
    """
    Извлекает строки импортов/подключений из переданных строк файла
    для указанного языка. Фильтрует только те импорты, которые, по
    эвристике, относятся к файлам проекта.
    """
    imports = []
    if lang == "python":
        import_regex = re.compile(r'^\s*(import\s+([A-Za-z0-9_\.]+)|from\s+([A-Za-z0-9_\.]+)\s+import)')
        for line in lines:
            m = import_regex.match(line)
            if m:
                module = m.group(2) or m.group(3)
                # Если относительный импорт или если по имени найден файл
                if module.startswith('.'):
                    imports.append(module)
                else:
                    for pf in project_files:
                        if pf.endswith(module.replace('.', os.sep) + ".py") or pf.endswith(module + ".py"):
                            imports.append(module)
                            break
    elif lang == "swift":
        import_regex = re.compile(r'^\s*import\s+([A-Za-z0-9_]+)')
        for line in lines:
            m = import_regex.match(line)
            if m:
                module = m.group(1)
                for pf in project_files:
                    if pf.lower().endswith(module.lower() + ".swift"):
                        imports.append(module)
                        break
    elif lang == "js":
        import_regex = re.compile(r'^\s*import\s+.*\s+from\s+[\'"](.+?)[\'"]')
        require_regex = re.compile(r'^\s*(?:const|let|var)\s+.*=\s+require\([\'"](.+?)[\'"]\)')
        for line in lines:
            m = import_regex.match(line)
            if m:
                module = m.group(1)
                if module.startswith('.') or module.startswith('/'):
                    imports.append(module)
                else:
                    for pf in project_files:
                        if pf.lower().endswith(module.lower() + ".js"):
                            imports.append(module)
                            break
            else:
                m = require_regex.match(line)
                if m:
                    module = m.group(1)
                    if module.startswith('.') or module.startswith('/'):
                        imports.append(module)
                    else:
                        for pf in project_files:
                            if pf.lower().endswith(module.lower() + ".js"):
                                imports.append(module)
                                break
    elif lang == "html":
        script_regex = re.compile(r'<script\s+[^>]*src=["\'](.+?)["\']', re.IGNORECASE)
        link_regex = re.compile(r'<link\s+[^>]*href=["\'](.+?)["\']', re.IGNORECASE)
        for line in lines:
            m = script_regex.search(line)
            if m:
                src = m.group(1)
                if not (src.startswith("http://") or src.startswith("https://") or src.startswith("//")):
                    imports.append(src)
            m = link_regex.search(line)
            if m:
                href = m.group(1)
                if not (href.startswith("http://") or href.startswith("https://") or href.startswith("//")):
                    imports.append(href)
    return list(set(imports))  # Убираем дубли

# ==============================
# Парсинг Swift
# ==============================
def parse_swift_file(file_path, root_dir, project_files):
    """
    Парсит Swift-файл: ищет классы/структуры, для каждого извлекает описание,
    а также список полей (var/let) и методов (func). Дополнительно собирает
    строки импортов (если они относятся к локальным файлам).
    """
    results = []
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    file_imports = extract_imports_from_file(lines, "swift", project_files)
    doc_buffer = []
    i = 0
    total_lines = len(lines)
    while i < total_lines:
        line = lines[i]
        stripped = line.strip()
        # Накопление однострочных комментариев (///)
        doc_match = re.match(SWIFT_DOC_REGEX, line)
        if doc_match:
            doc_buffer.append(doc_match.group(1))
            i += 1
            continue
        # Обнаружение объявления класса/структуры
        class_match = re.match(SWIFT_CLASS_REGEX, stripped)
        if class_match:
            cs_type = class_match.group(1)
            cs_name = class_match.group(2)
            description = " ".join(doc_buffer) if doc_buffer else ""
            doc_buffer = []
            # Считываем тело класса/структуры по подсчёту фигурных скобок
            body_lines = []
            brace_count = 0
            if "{" in line:
                brace_count += line.count("{") - line.count("}")
            j = i + 1
            while j < total_lines and brace_count > 0:
                body_line = lines[j]
                brace_count += body_line.count("{") - body_line.count("}")
                body_lines.append(body_line)
                j += 1
            # Извлекаем методы и поля
            methods = []
            fields = []
            for bl in body_lines:
                bl_stripped = bl.strip()
                func_match = re.match(SWIFT_FUNC_REGEX, bl_stripped)
                if func_match:
                    methods.append(func_match.group(1))
                field_match = re.match(SWIFT_FIELD_REGEX, bl_stripped)
                if field_match:
                    fields.append(field_match.group(2))
            results.append({
                "type": cs_type,
                "name": cs_name,
                "description": description,
                "fields": fields,
                "methods": methods,
                "imports": []
            })
            i = j
            continue
        # Обнаружение функции (за пределами класса)
        func_match = re.match(SWIFT_FUNC_REGEX, stripped)
        if func_match:
            func_name = func_match.group(1)
            description = " ".join(doc_buffer) if doc_buffer else ""
            doc_buffer = []
            results.append({
                "type": "func",
                "name": func_name,
                "description": description,
                "imports": []
            })
            i += 1
            continue
        i += 1
    if file_imports:
        results.append({
            "type": "file_imports",
            "name": os.path.basename(file_path),
            "imports": file_imports
        })
    return results

# ==============================
# Парсинг Python
# ==============================
def parse_python_file(file_path, root_dir, project_files):
    """
    Парсит Python-файл: ищет классы и функции, для классов дополнительно
    извлекает поля (присваивания) и методы, а также пытается вычленить docstring.
    Также собирает строки импортов.
    """
    results = []
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    file_imports = extract_imports_from_file(lines, "python", project_files)
    i = 0
    total_lines = len(lines)
    while i < total_lines:
        line = lines[i]
        stripped = line.strip()
        # Обнаружение класса
        class_match = re.match(PYTHON_CLASS_REGEX, stripped)
        if class_match:
            class_name = class_match.group(1)
            doc_string = ""
            j = i + 1
            if j < total_lines and (lines[j].strip().startswith('"""') or lines[j].strip().startswith("'''")):
                delimiter = lines[j].strip()[:3]
                doc_lines = []
                j += 1
                while j < total_lines and delimiter not in lines[j]:
                    doc_lines.append(lines[j].strip())
                    j += 1
                if j < total_lines:
                    last_line = lines[j].replace(delimiter, "").strip()
                    if last_line:
                        doc_lines.append(last_line)
                    j += 1
                doc_string = " ".join(doc_lines)
            # Считываем блок класса по отступам
            class_indent = len(line) - len(line.lstrip())
            block_lines = []
            while j < total_lines:
                if lines[j].strip() == "":
                    j += 1
                    continue
                current_indent = len(lines[j]) - len(lines[j].lstrip())
                if current_indent <= class_indent:
                    break
                block_lines.append(lines[j])
                j += 1
            # Извлечение методов и полей из блока класса
            methods = []
            fields = []
            k = 0
            while k < len(block_lines):
                sub_line = block_lines[k]
                sub_stripped = sub_line.strip()
                func_match = re.match(PYTHON_FUNC_REGEX, sub_stripped)
                if func_match:
                    method_name = func_match.group(1)
                    method_doc = ""
                    if k+1 < len(block_lines) and (block_lines[k+1].strip().startswith('"""') or block_lines[k+1].strip().startswith("'''")):
                        delimiter = block_lines[k+1].strip()[:3]
                        doc_lines = []
                        k += 2
                        while k < len(block_lines) and delimiter not in block_lines[k]:
                            doc_lines.append(block_lines[k].strip())
                            k += 1
                        if k < len(block_lines):
                            last_line = block_lines[k].replace(delimiter, "").strip()
                            if last_line:
                                doc_lines.append(last_line)
                        method_doc = " ".join(doc_lines)
                    else:
                        k += 1
                    methods.append({
                        "name": method_name,
                        "description": method_doc,
                        "imports": []  # Для простоты не ищем импорты внутри методов
                    })
                else:
                    # Простой поиск полей – строки с присваиванием на уровне класса
                    field_match = re.match(r'^\s*([A-Za-z0-9_]+)\s*=\s*.+', sub_line)
                    if field_match:
                        fields.append(field_match.group(1))
                    k += 1
            results.append({
                "type": "class",
                "name": class_name,
                "description": doc_string,
                "fields": fields,
                "methods": methods,
                "imports": []
            })
            i = j
            continue
        # Обнаружение функции на верхнем уровне
        func_match = re.match(PYTHON_FUNC_REGEX, stripped)
        if func_match:
            func_name = func_match.group(1)
            func_doc = ""
            j = i + 1
            if j < total_lines and (lines[j].strip().startswith('"""') or lines[j].strip().startswith("'''")):
                delimiter = lines[j].strip()[:3]
                doc_lines = []
                j += 1
                while j < total_lines and delimiter not in lines[j]:
                    doc_lines.append(lines[j].strip())
                    j += 1
                if j < total_lines:
                    last_line = lines[j].replace(delimiter, "").strip()
                    if last_line:
                        doc_lines.append(last_line)
                    j += 1
                func_doc = " ".join(doc_lines)
            results.append({
                "type": "def",
                "name": func_name,
                "description": func_doc,
                "imports": []
            })
            i = j
            continue
        i += 1
    if file_imports:
        results.append({
            "type": "file_imports",
            "name": os.path.basename(file_path),
            "imports": file_imports
        })
    return results

# ==============================
# Парсинг JavaScript
# ==============================
def parse_js_file(file_path, root_dir, project_files):
    """
    Парсит JS-файл: ищет объявления классов (с методами и полями) и функций.
    Для накопления комментариев учитываются как однострочные (//) так и многострочные (/* … */).
    Также собираются импорты.
    """
    results = []
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    file_imports = extract_imports_from_file(lines, "js", project_files)
    doc_buffer = []
    i = 0
    total_lines = len(lines)
    while i < total_lines:
        line = lines[i]
        stripped = line.strip()
        # Накопление однострочных комментариев
        if stripped.startswith("//"):
            doc_buffer.append(stripped[2:].strip())
            i += 1
            continue
        # Накопление многострочных комментариев
        if stripped.startswith("/*"):
            comment_content = stripped.lstrip("/*").strip()
            while i < total_lines and "*/" not in lines[i]:
                i += 1
                if i < total_lines:
                    comment_line = lines[i].strip()
                    if "*/" in comment_line:
                        comment_line = comment_line.split("*/")[0]
                    comment_content += " " + comment_line
            doc_buffer.append(comment_content.strip())
            i += 1
            continue
        # Обнаружение класса
        class_match = re.match(JS_CLASS_REGEX, stripped)
        if class_match:
            class_name = class_match.group(1)
            description = " ".join(doc_buffer) if doc_buffer else ""
            doc_buffer = []
            # Извлекаем тело класса (подсчёт фигурных скобок)
            body_lines = []
            brace_count = 0
            if "{" in line:
                brace_count += line.count("{") - line.count("}")
            j = i + 1
            while j < total_lines and brace_count > 0:
                body_line = lines[j]
                brace_count += body_line.count("{") - body_line.count("}")
                body_lines.append(body_line)
                j += 1
            methods = []
            fields = []
            for bl in body_lines:
                bl_stripped = bl.strip()
                m_method = re.match(JS_METHOD_REGEX, bl_stripped)
                if m_method:
                    methods.append(m_method.group(1))
                m_field = re.match(JS_FIELD_REGEX, bl_stripped)
                if m_field:
                    fields.append(m_field.group(1))
            results.append({
                "type": "class",
                "name": class_name,
                "description": description,
                "fields": fields,
                "methods": methods,
                "imports": []
            })
            i = j
            continue
        # Обнаружение функции (топ-левел)
        func_match = re.match(JS_FUNC_REGEX, stripped)
        if func_match:
            func_name = func_match.group(1)
            description = " ".join(doc_buffer) if doc_buffer else ""
            doc_buffer = []
            results.append({
                "type": "function",
                "name": func_name,
                "description": description,
                "imports": []
            })
            i += 1
            continue
        i += 1
    if file_imports:
        results.append({
            "type": "file_imports",
            "name": os.path.basename(file_path),
            "imports": file_imports
        })
    return results

# ==============================
# Парсинг HTML
# ==============================
def parse_html_file(file_path, root_dir, project_files):
    """
    Для HTML-файлов парсинг сводится к извлечению внешних подключений –
    тегов <script src="..."> и <link href="...">, которые являются ссылками на
    файлы проекта.
    """
    results = []
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    file_imports = extract_imports_from_file(lines, "html", project_files)
    results.append({
        "type": "html",
        "name": os.path.basename(file_path),
        "description": "HTML файл",
        "imports": file_imports
    })
    return results

# ==============================
# Основная функция
# ==============================
def main():
    root_dir = os.path.dirname(os.path.abspath(__file__))
    arch_file = os.path.join(root_dir, "ARCHITECTURE.md")
    structure_data = {}

    # Собираем множество файлов проекта (относительные пути)
    project_files = set()
    for current_path, dirs, files in os.walk(root_dir):
        # Убираем скрытые директории и игнорируем указанные
        dirs[:] = [d for d in dirs if not d.startswith('.') and d not in IGNORED_DIRS]
        rel_path = os.path.relpath(current_path, root_dir)
        if rel_path == ".":
            rel_path = "."
        for file_name in files:
            if file_name.startswith('.') or file_name in IGNORED_FILES:
                continue
            rel_file = os.path.join(rel_path, file_name)
            project_files.add(rel_file)

    # Второй обход для сбора подробной информации
    for current_path, dirs, files in os.walk(root_dir):
        dirs[:] = [d for d in dirs if not d.startswith('.') and d not in IGNORED_DIRS]
        rel_path = os.path.relpath(current_path, root_dir)
        if rel_path == ".":
            rel_path = "."
        if rel_path not in structure_data:
            structure_data[rel_path] = {
                "files": [],
                "details": []
            }
        for file_name in files:
            if file_name.startswith('.') or file_name in IGNORED_FILES:
                continue
            file_path = os.path.join(current_path, file_name)
            structure_data[rel_path]["files"].append(file_name)
            lower_name = file_name.lower()
            parsed = None
            if lower_name.endswith(".swift"):
                parsed = parse_swift_file(file_path, root_dir, project_files)
                lang = "swift"
            elif lower_name.endswith(".py"):
                parsed = parse_python_file(file_path, root_dir, project_files)
                lang = "python"
            elif lower_name.endswith(".js"):
                parsed = parse_js_file(file_path, root_dir, project_files)
                lang = "js"
            elif lower_name.endswith(".html"):
                parsed = parse_html_file(file_path, root_dir, project_files)
                lang = "html"
            if parsed:
                structure_data[rel_path]["details"].append({
                    "filename": file_name,
                    "lang": lang,
                    "elements": parsed
                })

    # Формируем содержимое ARCHITECTURE.md как список строк
    lines = []
    for path_key in sorted(structure_data.keys()):
        lines.append(f"### Папка: `{path_key}`")
        files_list = structure_data[path_key]["files"]
        details_list = structure_data[path_key]["details"]
        if files_list:
            lines.append("Содержимые файлы:")
            for fn in sorted(files_list):
                lines.append(f"- {fn}")
        else:
            lines.append("*(Нет файлов)*")
        if details_list:
            lines.append("\n**Детали по файлам:**")
            for detail in details_list:
                fname = detail["filename"]
                lang = detail["lang"]
                lines.append(f"- **Файл**: `{fname}` (язык: {lang})")
                for elem in detail["elements"]:
                    elem_type = elem.get("type", "")
                    elem_name = elem.get("name", "")
                    description = elem.get("description", "")
                    lines.append(f"  - {elem_type.capitalize()}: **{elem_name}**")
                    if description:
                        lines.append(f"    - *Описание:* {description}")
                    if elem.get("fields"):
                        lines.append(f"    - *Поля:* {', '.join(elem['fields'])}")
                    if elem.get("methods"):
                        lines.append(f"    - *Методы:* {', '.join(elem['methods'])}")
                    if elem.get("imports"):
                        lines.append(f"    - *Импорты:* {', '.join(elem['imports'])}")
        lines.append("")
    return lines

# ==============================
# Обновление ARCHITECTURE.md
# ==============================
def update_architecture_md(content_lines):
    """
    Обновляет файл ARCHITECTURE.md, вставляя сгенерированный контент между маркерами.
    Если маркеры отсутствуют, они добавляются в конец файла.
    """
    root_dir = os.path.dirname(os.path.abspath(__file__))
    arch_file = os.path.join(root_dir, "ARCHITECTURE.md")
    auto_gen_start = '<!-- AUTO-GENERATED-CONTENT:START -->'
    auto_gen_end = '<!-- AUTO-GENERATED-CONTENT:END -->'
    new_auto_content = "\n".join(content_lines)
    if os.path.exists(arch_file):
        with open(arch_file, "r", encoding="utf-8") as f:
            existing_content = f.read()
    else:
        existing_content = f"# ARCHITECTURE.md\n\n{auto_gen_start}\n{auto_gen_end}\n"
    pattern = re.compile(
        r'(?P<before>.*?){start_marker}.*?{end_marker}(?P<after>.*)'.format(
            start_marker=re.escape(auto_gen_start),
            end_marker=re.escape(auto_gen_end)
        ),
        re.DOTALL
    )
    match = pattern.match(existing_content)
    if match:
        updated_content = "{before}{start}\n{content}\n{end}{after}".format(
            before=match.group('before'),
            start=auto_gen_start,
            content=new_auto_content,
            end=auto_gen_end,
            after=match.group('after')
        )
    else:
        updated_content = existing_content + "\n{start}\n{content}\n{end}\n".format(
            start=auto_gen_start,
            content=new_auto_content,
            end=auto_gen_end
        )
    with open(arch_file, "w", encoding="utf-8") as f:
        f.write(updated_content)
    print(f"[OK] Файл ARCHITECTURE.md успешно обновлён в {arch_file}")

# ==============================
# Запуск скрипта
# ==============================
if __name__ == "__main__":
    lines = main()
    update_architecture_md(lines)
