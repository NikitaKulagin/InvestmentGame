// Ниже вариант, который почти всегда работает на GitHub Pages:
// 1) Использовать HashRouter в App.js (или где настроена маршрутизация).
// 2) В package.json настройка "homepage".
// 3) Перепроверьте путь импорта и папки (events.json, data и т.д. могут ломать сборку).

// Пример App.js (React v6+):
import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import MainGamePage from './components/MainGamePage';

/**
 * App.js с HashRouter
 * -------------------
 * Избегает проблем с прямым доступом к маршрутам на GitHub Pages.
 * Итоговый маршрут будет выглядеть как 
 * https://yourname.github.io/yourrepo/#/game
 */
function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/game" element={<MainGamePage />} />
      </Routes>
    </HashRouter>
  );
}

export default App;