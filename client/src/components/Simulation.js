import React, { useEffect } from 'react';
import MultiAssetChart from './MultiAssetChart';

/**
 * Simulation:
 * -----------
 * Получает simulationData (массив [{ assetId, data, impact }]),
 * и просто показывает его с помощью MultiAssetChart.
 * Никаких new randomWalk внутри — чтобы не перегенерировать при "Далее".
 */
function Simulation({ simulationData, onSimulationComplete }) {

  useEffect(() => {
    // Когда компонент отобразился, можем вызвать колбэк
    if (onSimulationComplete) {
      onSimulationComplete();
    }
  }, [onSimulationComplete]);

  if (!simulationData) {
    return <div>Нет данных для симуляции (ещё не сгенерированы)</div>;
  }

  return (
    <div>
      <h3>Результаты симуляции</h3>
      <MultiAssetChart simulationData={simulationData} />
    </div>
  );
}

export default Simulation;