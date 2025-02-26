// RoundExplanation.js

import React from 'react';
import eventsData from '../data/events.json';

/**
 * RoundExplanation:
 * -----------------
 * 1. Принимает currentRound, чтобы найти нужное событие в events.json (где id совпадает с currentRound).
 * 2. Из этого события берёт explanation (friendly-пояснение).
 * 3. Также получает simulationData (массив [{ assetId, data, impact }]),
 *    и allocation (в процентах).
 * 4. Показываем аналитику только для активов, где allocation > 5%.
 */
function RoundExplanation({ currentRound, simulationData, allocation, eventImpact }) {
  // Без данных симуляции смысла нет
  if (!simulationData) {
    return <div>Нет данных симуляции</div>;
  }

  // Находим нужное событие (id === currentRound)
  const eventObj = eventsData.events.find(evt => evt.id === currentRound);

  // Если событие не найдено, выводим запасное сообщение
  const eventExplanation = eventObj?.explanation 
    ? eventObj.explanation 
    : 'Не найдены пояснения для этого события.';

  // Фильтруем simulationData по условию: allocation[assetId] > 5
  const filteredData = simulationData.filter(item => {
    const userAlloc = allocation[item.assetId] || 0;
    return userAlloc > 5;
  });

  return (
    <div>
      <h3>Пояснения по результатам</h3>

      {/* Общие пояснения из events.json */}
      <p style={{ marginBottom: '15px' }}>
        <strong>Общее пояснение события:</strong> {eventExplanation}
      </p>

      {filteredData.length === 0 && (
        <p>У вас нет активов с долей более 5%, либо событие не затронуло ваши активы.</p>
      )}

      {filteredData.length > 0 && (
        <div>
          {filteredData.map(item => {
            const { assetId, data, impact } = item;
            const userAlloc = allocation[assetId] ?? 0;
            const startPrice = data[0];
            const endPrice = data[data.length - 1];
            const changePct = ((endPrice - startPrice) / startPrice) * 100;

            let impactDesc = 'нейтрально';
            if (impact === 'positive') impactDesc = 'позитивно';
            if (impact === 'negative') impactDesc = 'негативно';

            return (
              <div key={assetId} style={{ marginBottom: '10px' }}>
                <strong>{assetId}</strong> ({impactDesc}):
                <br />
                Начальная цена: {startPrice} → Конечная цена: {endPrice} 
                <br />
                Изменение: {changePct.toFixed(2)}%
                <br />
                Ваша аллокация: {userAlloc}%
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default RoundExplanation;