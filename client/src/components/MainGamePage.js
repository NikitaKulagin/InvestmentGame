// MainGamePage.js

import React, { useState } from 'react';
import NewsRound from './NewsRound';
import AssetAllocation from './AssetAllocation';
import Simulation from './Simulation';
import RoundExplanation from './RoundExplanation';
import FinalResult from './FinalResult'; // <-- Подключаем компонент итогов
import assetsData from '../data/assetClasses.json';
import './MainGamePage.css';
import '../styles/GameButton.css';
import randomWalk from '../utils/randomWalk';

/**
 * MainGamePage:
 * -------------
 * 1. currentRound (номер раунда)
 * 2. phase (1..5)
 * 3. allocation (распределение активов)
 * 4. currentEventImpact (объект { gold: "positive", ... })
 * 5. simulationData ( [{ assetId, data: [...], impact } ])
 * 6. currentCapital: Высота капитала (в млн руб). 
 *    - Раунд 1: 100 млн.
 *    - Во 2+ раундах = итог предыдущего раунда.
 */

function MainGamePage() {
  const [currentRound, setCurrentRound] = useState(1);
  const [phase, setPhase] = useState(1);

  // Текущий капитал игрока (в млн руб)
  // Первый раунд: 100 млн
  const [currentCapital, setCurrentCapital] = useState(100);

  // Текущее распределение активов (изначально всё в rubleCash)
  const [allocation, setAllocation] = useState(() => {
    const initAlloc = {};
    assetsData.assets.forEach(a => {
      initAlloc[a.id] = a.id === 'rubleCash' ? 100 : 0;
    });
    return initAlloc;
  });

  // Информация о событии (impact)
  const [currentEventImpact, setCurrentEventImpact] = useState(null);

  // Итоговые данные симуляции ( [{ assetId, data, impact }] )
  const [simulationData, setSimulationData] = useState(null);

  // Переключение фаз
  const handleNextPhase = () => {
    setPhase(prev => prev + 1);
  };

  // По завершении чтения новости
  const handleNewsNext = () => {
    if (phase === 1) {
      handleNextPhase();
    }
  };

  // Получаем impact из NewsRound
  const handleGotImpact = (impactObj) => {
    setCurrentEventImpact(impactObj);
  };

  // Меняем аллокацию при движении ползунков
  const handleAllocationChange = (updated) => {
    setAllocation(updated);
  };

  // Переходим к симуляции: генерируем (если нет) и двигаем фазу
  const handleGoToSimulation = () => {
    if (!simulationData && currentEventImpact) {
      const steps = 100;
      const result = [];
      Object.keys(currentEventImpact).forEach(assetId => {
        const impact = currentEventImpact[assetId];
        const prices = randomWalk(assetId, impact, steps);
        result.push({ assetId, data: prices, impact });
      });
      setSimulationData(result);
    }
    handleNextPhase();
  };

  // Когда симуляция отображена
  const handleSimulationComplete = () => {
    console.log('Симуляция отобразилась и зафиксирована.');
  };

  // Обработка завершения раунда в FinalResult,
  // чтобы перенести finalValue в следующий раунд
  const handleFinishRound = (finalValue) => {
    // finalValue — итоговый капитал игрока (млн руб)
    setCurrentCapital(finalValue);
    setCurrentRound(prev => prev + 1);
    setPhase(1);
    setCurrentEventImpact(null);
    setSimulationData(null);

    // Заново аллокация: всё в рублёвый кэш
    const initAlloc = {};
    assetsData.assets.forEach(a => {
      initAlloc[a.id] = a.id === 'rubleCash' ? 100 : 0;
    });
    setAllocation(initAlloc);
  };

  return (
    <div className="main-game-container">
      <h2 className="main-game-title">Раунд {currentRound}</h2>

      {/* ФАЗА 1: Новость */}
      {phase >= 1 && (
        <div style={{ marginBottom: '20px' }}>
          <NewsRound
            currentRound={currentRound}
            onGotImpact={handleGotImpact}
            onNextRound={handleNewsNext}
            showNextButton={phase === 1}
          />
        </div>
      )}

      {/* ФАЗА 2: Распределение активов */}
      {phase >= 2 && (
        <div style={{ marginBottom: '20px' }}>
          <AssetAllocation
            assetsList={assetsData.assets}
            allocation={allocation}
            onAllocationChange={handleAllocationChange}
          />
          {phase === 2 && (
            <button className="game-button" onClick={handleGoToSimulation}>
              Далее (к симуляции)
            </button>
          )}
        </div>
      )}

      {/* ФАЗА 3: Симуляция */}
      {phase >= 3 && (
        <div style={{ marginBottom: '20px' }}>
          <Simulation
            simulationData={simulationData}
            onSimulationComplete={handleSimulationComplete}
          />
          {phase === 3 && (
            <button className="game-button" onClick={handleNextPhase}>
              Далее (к пояснениям)
            </button>
          )}
        </div>
      )}

      {/* ФАЗА 4: Пояснения */}
      {phase >= 4 && (
        <div style={{ marginBottom: '20px' }}>
          <RoundExplanation
            currentRound={currentRound}
            simulationData={simulationData}
            allocation={allocation}
            eventImpact={currentEventImpact}
          />
          {phase === 4 && (
            <button className="game-button" onClick={handleNextPhase}>
              Завершить раунд
            </button>
          )}
        </div>
      )}

      {/* ФАЗА 5: Итоги раунда - большой красный график */}
      {phase >= 5 && (
        <FinalResult
          roundNumber={currentRound}
          initialCapital={currentCapital}
          simulationData={simulationData}
          allocation={allocation}
          onFinish={handleFinishRound}
        />
      )}
    </div>
  );
}

export default MainGamePage;