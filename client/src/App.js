import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import MainGamePage from './components/MainGamePage';

/**
 * Файл App.js
 * Настраивает маршруты с помощью react-router-dom (v6).
 * Вместо Switch используем <Routes>, а вместо component= используем element=.
 */
function App() {
  return (
    <Router>
      <Routes>
        {/* Стартовая страница по адресу "/" */}
        <Route path="/" element={<LandingPage />} />
        {/* Основная страница игры по адресу "/game" */}
        <Route path="/game" element={<MainGamePage />} />
      </Routes>
    </Router>
  );
}

export default App;