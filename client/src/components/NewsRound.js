import React, { useState, useEffect } from 'react';
import eventsData from '../data/events.json';
import './NewsRound.css';
import '../styles/GameButton.css';

/**
 * NewsRound:
 * ----------
 * При загрузке находит событие по currentRound из events.json,
 * кроме title/description также берём impact, чтобы передать родителю.
 */
function NewsRound({ currentRound, onNextRound, onGotImpact, showNextButton }) {
  const [eventInfo, setEventInfo] = useState(null);

  useEffect(() => {
    const foundEvent = eventsData.events.find(evt => evt.id === currentRound);
    setEventInfo(foundEvent);

    if (foundEvent && onGotImpact) {
      onGotImpact(foundEvent.impact);
    }
  }, [currentRound, onGotImpact]);

  if (!eventInfo) {
    return <div>Загружаем новость...</div>;
  }

  return (
    <div className="news-round-container">
      <h2 className="news-round-title">{eventInfo.title}</h2>
      <p className="news-round-description">{eventInfo.description}</p>

      {showNextButton && (
        <button className="game-button" onClick={onNextRound}>
          Далее
        </button>
      )}
    </div>
  );
}

export default NewsRound;