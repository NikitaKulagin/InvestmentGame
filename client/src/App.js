import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import MainGamePage from './components/MainGamePage';

function App() {
  return (
    // Заменяем BrowserRouter на HashRouter
    <HashRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/game" element={<MainGamePage />} />
      </Routes>
    </HashRouter>
  );
}

export default App;