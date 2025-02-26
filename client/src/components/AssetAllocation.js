import React from 'react';
import './AssetAllocation.css';

/**
 * AssetAllocation (контролируемый, с ограничением суммы = 100%)
 * --------------------------------------------------------------
 * 1) Получает:
 *    - assetsList: список активов
 *    - allocation: объект { assetId: number }, текущие проценты
 *    - onAllocationChange: колбэк, которому отдаём новую allocation после любого изменения
 *
 * 2) При изменении ползунка вызывается handleSliderChange, где:
 *    - копируем текущий allocation
 *    - ставим новое значение для changedId
 *    - проверяем сумму:
 *      • если > 100: пропорционально "срезаем" другие активы
 *      • если < 100: добавляем остаток в rubleCash (если есть)
 *    - результат отдаём onAllocationChange(updatedAlloc)
 *
 * 3) Ни в каком месте нет useState – значения берутся из props.allocation,
 *    а результат изменений мы возвращаем наверх, чтобы родитель MainGamePage хранил их в своём состоянии.
 */
function AssetAllocation({ assetsList, allocation, onAllocationChange }) {

  /**
   * handleSliderChange(changedId, newValueStr):
   * Все перерасчёты производим в «контролируемом» стиле,
   * а в конце вызываем onAllocationChange(updated).
   */
  const handleSliderChange = (changedId, newValueStr) => {
    const newValue = Number(newValueStr);

    // 1) Создаём копию текущего allocation
    const updated = { ...allocation };

    // 2) Ставим новое значение
    updated[changedId] = newValue;

    // 3) Считаем сумму
    let sum = Object.values(updated).reduce((acc, val) => acc + val, 0);

    // Если сумма > 100, "срезаем" пропорционально
    if (sum > 100) {
      let overshoot = sum - 100;

      // Собираем остальные активы, кроме changedId
      const otherIds = Object.keys(updated).filter(id => id !== changedId);

      let continueLoop = true;
      while (overshoot > 0 && continueLoop) {
        continueLoop = false;

        // Сумма всех "остальных" активов
        let otherSum = 0;
        otherIds.forEach((id) => {
          otherSum += updated[id];
        });

        if (otherSum > 0) {
          continueLoop = true;
          for (let i = 0; i < otherIds.length; i++) {
            const assetId = otherIds[i];
            const currentVal = updated[assetId];
            if (currentVal <= 0) continue;

            // Доля актива в общем объёме остальных
            const ratio = currentVal / otherSum;
            // Сколько нужно "срезать" здесь
            let cutAmount = overshoot * ratio;

            if (cutAmount >= currentVal) {
              overshoot -= currentVal;
              updated[assetId] = 0;
            } else {
              updated[assetId] = currentVal - cutAmount;
              overshoot -= cutAmount;
            }
            if (overshoot <= 0) break;
          }
        } else {
          // Если все остальные = 0, уменьшаем сам changedId
          const currVal = updated[changedId];
          if (overshoot >= currVal) {
            updated[changedId] = 0;
            overshoot -= currVal;
          } else {
            updated[changedId] = currVal - overshoot;
            overshoot = 0;
          }
        }

        sum = Object.values(updated).reduce((acc, val) => acc + val, 0);
        if (sum > 100) {
          overshoot = sum - 100;
        } else {
          overshoot = 0;
        }
      }
    }
    // Если сумма < 100, добавляем leftover в rubleCash (если есть)
    else if (sum < 100) {
      const leftover = 100 - sum;
      if (updated.hasOwnProperty('rubleCash')) {
        updated['rubleCash'] = updated['rubleCash'] + leftover;
      } else {
        console.warn('rubleCash не найден среди активов (сумма < 100).');
      }
    }

    // Вызываем родительский колбэк, чтобы сохранить в state наверху
    if (onAllocationChange) {
      onAllocationChange(updated);
    }
  };

  if (!assetsList || assetsList.length === 0) {
    return <div>Нет активов для отображения</div>;
  }

  return (
    <div className="asset-allocation-container">
      <h3>Распределение активов (сумма = 100%)</h3>
      {assetsList.map(asset => {
        const val = allocation[asset.id] || 0; // Если вдруг undefined, ставим 0
        return (
          <div key={asset.id} className="asset-row">
            <span className="asset-name">{asset.name}</span>
            <input
              type="range"
              min="0"
              max="100"
              value={val}
              onChange={(e) => handleSliderChange(asset.id, e.target.value)}
              className="allocation-slider"
            />
            <span className="allocation-value">
              {Math.round(val)}%
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default AssetAllocation;