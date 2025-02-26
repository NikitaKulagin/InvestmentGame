// FinalResult.js

import React, { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import './FinalResult.css';

/**
 * FinalResult:
 * ------------
 * 1) Принимает:
 *    - roundNumber (номер раунда),
 *    - initialCapital (капитал в начале раунда),
 *    - simulationData (массив [{ assetId, data, impact }]),
 *    - allocation (объект { assetId: процент }),
 *    - onFinish: колбэк, когда пользователь завершает просмотр итогов и готов к новому раунду
 *
 * 2) Рассчитываем динамику портфеля на каждом шаге (складывая доли доходностей активов).
 *    Модель:
 *    - На каждом шаге (t) у каждого актива цена = simulationData[assetId].data[t].
 *    - Доля allocation[assetId]% от общего капитала означает, что если актив вырос, мы умножаем на соответствующий процент.
 *    - Суммируем вклад всех активов, получаем портфельную стоимость на шаге t.
 *
 * 3) Рисуем большой график красной линией (borderColor: 'red').
 * 4) Показываем конечное значение капитала. Если roundNumber > 1, значит initialCapital = итог предыдущего раунда.
 * 5) При нажатии кнопки "Закончить раунд" вызываем onFinish, передавая finalCapital,
 *    чтобы MainGamePage мог сохранить итог для следующего раунда.
 */

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function FinalResult({
  roundNumber,
  initialCapital,
  simulationData,
  allocation,
  onFinish
}) {
  const [portfolioPrices, setPortfolioPrices] = useState([]);

  useEffect(() => {
    if (!simulationData || simulationData.length === 0) {
      return;
    }

    // Преобразуем allocation (0..100) в доли (0..1)
    // Пример: allocation[assetId] = 20 => weight = 0.2
    const weights = {};
    Object.keys(allocation).forEach(assetId => {
      weights[assetId] = (allocation[assetId] || 0) / 100;
    });

    // Предположим, у нас 100 шагов. У каждого актива simulationData[i].data.length
    // посчитаем портфельную стоимость на каждом шаге (t)
    // Portfolio[t] = Σ (initialCapital * weight[assetId] * (currentPrice[assetId,t] / startPrice[assetId]))
    // где startPrice[assetId] = data[0].
    // То есть пропорционально росту цены актива в сравнении с начальной.

    // Для удобства найдём для каждого актива начальную цену
    const startPrices = {};
    simulationData.forEach(item => {
      const { assetId, data } = item;
      startPrices[assetId] = data[0] || 100;
    });

    // Допустим, у всех активов одинаковое число шагов. Берём его по первому
    const stepsCount = simulationData[0].data.length;
    const portfolioArray = [];

    for (let t = 0; t < stepsCount; t++) {
      let sumValue = 0;
      simulationData.forEach(item => {
        const { assetId, data } = item;
        const weight = weights[assetId] || 0; 
        const priceNow = data[t];
        const priceStart = startPrices[assetId];
        // Рост = priceNow / priceStart (мультипликативный индекс)
        const assetContribution = initialCapital * weight * (priceNow / priceStart);
        sumValue += assetContribution;
      });
      portfolioArray.push(Number(sumValue.toFixed(2)));
    }

    setPortfolioPrices(portfolioArray);
  }, [simulationData, allocation, initialCapital]);

  if (!simulationData || simulationData.length === 0) {
    return <div>Нет данных для итогового результата…</div>;
  }

  // Финальная стоимость портфеля
  const finalPortfolioValue = portfolioPrices.length > 0
    ? portfolioPrices[portfolioPrices.length - 1]
    : initialCapital;

  // Готовим данные для Line
  const labels = portfolioPrices.map((_, i) => i.toString());
  const chartData = {
    labels,
    datasets: [
      {
        label: `Портфель (Раунд ${roundNumber})`,
        data: portfolioPrices,
        borderColor: 'red',
        backgroundColor: 'rgba(255,0,0,0.1)',
        tension: 0.1,
        fill: false
      }
    ]
  };

  return (
    <div className="final-result-container">
      <h3>Итоги раунда {roundNumber}</h3>
      <div className="final-chart">
        <Line data={chartData} />
      </div>

      <p>
        Начальный капитал: {initialCapital} млн руб <br />
        Итоговый капитал: {finalPortfolioValue} млн руб
      </p>

      <button className="final-button" onClick={() => onFinish(finalPortfolioValue)}>
        Закончить раунд
      </button>
    </div>
  );
}

export default FinalResult;