// MultiAssetChart.js

import React from 'react';
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
import './MultiAssetChart.css';

// Регистрируем необходимые модули Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

/**
 * MultiAssetChart:
 * ----------------
 * - Для каждого элемента simulationData (массив {assetId, data, impact})
 *   строим отдельный Line-график.
 * - Если impact='positive', название (подставляем в <h4>) будет зелёным,
 *   если 'negative' – красным, иначе обычным.
 * - Сами линии на графиках делаем серыми (#888).
 */
function MultiAssetChart({ simulationData }) {
  if (!simulationData || simulationData.length === 0) {
    return <div>Нет данных для графиков</div>;
  }

  return (
    <div className="multi-chart-container">
      {simulationData.map(item => {
        const labels = item.data.map((_, i) => String(i));
        const chartTitle = `${item.assetId} (${item.impact})`;

        // Определяем класс для заголовка h4 в зависимости от impact
        let titleClass = '';
        if (item.impact === 'positive') {
          titleClass = 'chart-title-positive';
        } else if (item.impact === 'negative') {
          titleClass = 'chart-title-negative';
        }

        const chartData = {
          labels,
          datasets: [
            {
              label: chartTitle,
              data: item.data,
              // Линия — серая
              borderColor: '#888',
              // Полупрозрачная заливка тоже серая
              backgroundColor: 'rgba(136,136,136,0.2)',
              tension: 0.1,
              fill: false
            }
          ]
        };

        return (
          <div key={item.assetId} className="chart-item">
            <h4 className={titleClass}>{chartTitle}</h4>
            <Line data={chartData} />
          </div>
        );
      })}
    </div>
  );
}

export default MultiAssetChart;