# ARCHITECTURE.md

Данный файл описывает структуру проекта, файлы, а также краткие описания
(docstrings/комментарии) для классов, структур и функций.


## 1. Структура каталогов и список файлов

<!-- AUTO-GENERATED-CONTENT:START -->
### Папка: `.`
Содержимые файлы:
- ARCHITECTURE.md
- Plan.docx
- Plan.pdf
- README.md
- package-lock.json
- package.json
- update_architecture.py
- ~$Plan.docx

**Детали по файлам:**
- **Файл**: `update_architecture.py` (язык: python)
  - Def: **parse_args**
  - Def: **extract_imports_from_file**
    - *Описание:* Извлекает строки импортов/подключений из переданных строк файла для указанного языка. Фильтрует только те импорты, которые, по эвристике, относятся к файлам проекта.
  - Def: **parse_swift_file**
    - *Описание:* Парсит Swift-файл: ищет классы/структуры, для каждого извлекает описание, а также список полей (var/let) и методов (func). Дополнительно собирает строки импортов (если они относятся к локальным файлам).
  - Def: **parse_python_file**
    - *Описание:* Парсит Python-файл: ищет классы и функции, для классов дополнительно извлекает поля (присваивания) и методы, а также пытается вычленить docstring. Также собирает строки импортов.
  - Def: **parse_js_file**
    - *Описание:* Парсит JS-файл: ищет объявления классов (с методами и полями) и функций. Для накопления комментариев учитываются как однострочные (//) так и многострочные (/* … */). Также собираются импорты.
  - Def: **parse_html_file**
    - *Описание:* Для HTML-файлов парсинг сводится к извлечению внешних подключений – тегов <script src="..."> и <link href="...">, которые являются ссылками на файлы проекта.
  - Def: **main**
  - Def: **update_architecture_md**
    - *Описание:* Обновляет файл ARCHITECTURE.md, вставляя сгенерированный контент между маркерами. Если маркеры отсутствуют, они добавляются в конец файла.
  - File_imports: **update_architecture.py**
    - *Импорты:* re

### Папка: `build`
Содержимые файлы:
- asset-manifest.json
- favicon.ico
- index.html
- logo192.png
- logo512.png
- manifest.json
- robots.txt

**Детали по файлам:**
- **Файл**: `index.html` (язык: html)
  - Html: **index.html**
    - *Описание:* HTML файл
    - *Импорты:* /SCB-Research-Portal/static/js/main.551e4674.js, /SCB-Research-Portal/favicon.ico

### Папка: `build/pdfs`
Содержимые файлы:
- Макромонитор 2025.02.03.pdf
- Рынок пшеницы 2025.02.01.pdf
- Рынок стали 2025.01.01.pdf

### Папка: `build/static`
*(Нет файлов)*

### Папка: `build/static/css`
Содержимые файлы:
- main.630bb695.css
- main.630bb695.css.map

### Папка: `build/static/js`
Содержимые файлы:
- 488.3cdc2af1.chunk.js
- 488.3cdc2af1.chunk.js.map
- main.551e4674.js
- main.551e4674.js.LICENSE.txt
- main.551e4674.js.map

### Папка: `build/thumbnails`
Содержимые файлы:
- Макромонитор 2025.02.03.png
- Рынок пшеницы 2025.02.01.png
- Рынок стали 2025.01.01.png

### Папка: `public`
Содержимые файлы:
- favicon.ico
- index.html
- logo192.png
- logo512.png
- manifest.json
- robots.txt

**Детали по файлам:**
- **Файл**: `index.html` (язык: html)
  - Html: **index.html**
    - *Описание:* HTML файл
    - *Импорты:* %PUBLIC_URL%/favicon.ico, %PUBLIC_URL%/manifest.json, %PUBLIC_URL%/logo192.png

### Папка: `public/pdfs`
Содержимые файлы:
- Макромонитор 2025.02.03.pdf
- Рынок пшеницы 2025.02.01.pdf
- Рынок стали 2025.01.01.pdf

### Папка: `public/thumbnails`
Содержимые файлы:
- Макромонитор 2025.02.03.png
- Рынок пшеницы 2025.02.01.png
- Рынок стали 2025.01.01.png

### Папка: `src`
Содержимые файлы:
- Admin.css
- AdminDashboard.js
- AdminRoute.js
- App.css
- App.js
- App.test.js
- AuthContext.js
- Home.js
- Login.js
- NotFound.js
- PrivateRoute.js
- Register.js
- Research.css
- Research.js
- ResearchDetail.css
- ResearchDetail.js
- data.js
- index.css
- index.js
- initData.js
- logo.svg
- reportWebVitals.js
- setupTests.js

**Детали по файлам:**
- **Файл**: `NotFound.js` (язык: js)
  - Function: **NotFound**
  - File_imports: **NotFound.js**
    - *Импорты:* ./components/Layout
- **Файл**: `Research.js` (язык: js)
  - Function: **Research**
  - Function: **getUniqueValues**
    - *Описание:* Загружаем данные исследований из Local Storage Извлекаем уникальные темы и периодичности
  - File_imports: **Research.js**
    - *Импорты:* ./components/Layout
- **Файл**: `AdminDashboard.js` (язык: js)
  - Function: **AdminDashboard**
  - File_imports: **AdminDashboard.js**
    - *Импорты:* ./components/AdminLayout
- **Файл**: `index.js` (язык: js)
  - File_imports: **index.js**
    - *Импорты:* ./App, ./reportWebVitals, ./AuthContext
- **Файл**: `Register.js` (язык: js)
  - Function: **Register**
  - File_imports: **Register.js**
    - *Импорты:* ./components/Layout
- **Файл**: `Home.js` (язык: js)
  - Function: **Home**
  - File_imports: **Home.js**
    - *Импорты:* ./components/Layout
- **Файл**: `ResearchDetail.js` (язык: js)
  - Function: **ResearchDetail**
  - File_imports: **ResearchDetail.js**
    - *Импорты:* ./components/Layout
- **Файл**: `Login.js` (язык: js)
  - Function: **Login**
  - File_imports: **Login.js**
    - *Импорты:* ./components/Layout, ./AuthContext
- **Файл**: `App.test.js` (язык: js)
  - File_imports: **App.test.js**
    - *Импорты:* ./App
- **Файл**: `PrivateRoute.js` (язык: js)
  - Function: **PrivateRoute**
  - File_imports: **PrivateRoute.js**
    - *Импорты:* ./AuthContext
- **Файл**: `AdminRoute.js` (язык: js)
  - Function: **AdminRoute**
    - *Описание:* AdminRoute.js
  - File_imports: **AdminRoute.js**
    - *Импорты:* ./AuthContext
- **Файл**: `App.js` (язык: js)
  - Function: **App**
  - File_imports: **App.js**
    - *Импорты:* ./AdminRoute, ./Login, ./NotFound, ./initData, ./PrivateRoute, ./Home, ./Register, ./Research, ./ResearchDetail, ./AdminDashboard

### Папка: `src/components`
Содержимые файлы:
- AdminFooter.js
- AdminHeader.js
- AdminLayout.js
- Footer.js
- Header.js
- Layout.js

**Детали по файлам:**
- **Файл**: `AdminLayout.js` (язык: js)
  - Function: **AdminLayout**
  - File_imports: **AdminLayout.js**
    - *Импорты:* ./AdminHeader, ./AdminFooter
- **Файл**: `Layout.js` (язык: js)
  - Function: **Layout**
  - File_imports: **Layout.js**
    - *Импорты:* ./Footer, ./Header
- **Файл**: `Header.js` (язык: js)
  - Function: **Header**
  - File_imports: **Header.js**
    - *Импорты:* ../AuthContext
- **Файл**: `AdminHeader.js` (язык: js)
  - Function: **AdminHeader**
  - File_imports: **AdminHeader.js**
    - *Импорты:* ../AuthContext
- **Файл**: `AdminFooter.js` (язык: js)
  - Function: **AdminFooter**
- **Файл**: `Footer.js` (язык: js)
  - Function: **Footer**

<!-- AUTO-GENERATED-CONTENT:END -->

## 2. MVP Features

1. **Главная страница (Landing Page):**  
   - Общее описание сайта, информация о проекте, навигация для перехода к регистрации, входу и просмотру исследований.

2. **Регистрация пользователей:**  
   - Форма регистрации с полями (например, имя, email, пароль).  
   - При первой регистрации выводится сообщение: «Спасибо за регистрацию, с вами скоро свяжутся менеджеры!».

3. **Авторизация (вход) пользователей:**  
   - Форма входа для зарегистрированных пользователей.  
   - Проверка введённых данных (сравнение с данными, сохранёнными в Local Storage или другом временном хранилище).  
   - Доступ к защищённым разделам сайта только после успешного входа.

4. **Защищённые маршруты (Protected Routes):**  
   - Реализация механизма, который позволяет авторизованным пользователям просматривать закрытые страницы, а неавторизованным – перенаправляет на страницу входа.

5. **Страница со списком исследований:**  
   - Вывод перечня исследований, где каждое исследование представлено в виде PDF-файла.  
   - Фильтрация исследований по темам (например, рынок пшеницы, рынок стали, макрорепорт и т.д.) и по периодичности (ежеквартально, ежемесячно, еженедельно, ежедневно, разовое).

6. **Страница детального просмотра исследования:**  
   - Подробный просмотр выбранного исследования с возможностью открыть PDF-файл (например, через встроенный iframe или ссылку).

7. **Административная панель:**  
   - Защищённый раздел для администратора (доступ только авторизованному администратору).  
   - Форма для загрузки новых исследований, где админ может прикрепить PDF-файл и задать параметры исследования (название, тема, периодичность).  
   - Возможность редактирования и удаления ранее загруженных исследований.

8. **Локальное хранение данных:**  
   - Использование Local Storage (или другого простого механизма) для временного хранения данных пользователей и исследований, что позволяет обойтись без полноценного backend‑решения на этапе MVP.

9. **Современный и отзывчивый дизайн:**  
   - Применение CSS‑фреймворка (например, Bootstrap или Material‑UI) для создания привлекательного и адаптивного интерфейса.  
   - Обеспечение корректного отображения на различных устройствах (ПК, планшет, смартфон).

10. **Уведомления и модальные окна:**  
    - Вывод информационных сообщений (например, об успешной регистрации, ошибках входа, подтверждении загрузки/удаления отчётов) с использованием модальных окон или всплывающих уведомлений.