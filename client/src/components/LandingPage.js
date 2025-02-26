import React from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

/**
 * LandingPage (для React Router v6):
 * Стартовая страница с кнопкой "Начать игру".
 * При клике используем useNavigate, чтобы перейти на "/game".
 */
function LandingPage() {
  const navigate = useNavigate();

  /**
   * handleStartGame:
   * При нажатии на кнопку отправляет пользователя на маршрут "/game".
   */
  const handleStartGame = () => {
    navigate('/game');
  };

  return (
    <div className="landing-container">
      <div className="landing-content">
        <h1 className="landing-title">Добро пожаловать в Инвестиционную Игру</h1>
        <p className="landing-subtitle">
          Проверьте свои навыки в аллокации активов. Готовы?
        </p>
        <button className="landing-button" onClick={handleStartGame}>
          Начать игру
        </button>
      </div>
    </div>
  );
}

export default LandingPage;