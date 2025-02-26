import assetClasses from '../data/assetClasses.json';

/**
 * randomWalk(assetId, impact, steps = 10)
 * ---------------------------------------
 * Мультипликативная модель: на каждом шаге
 *   price[t+1] = price[t] * (1 + drift + sigma * rand)
 *
 * drift и sigma берём из assetClasses.json. drift = 0.3 => 0.3% => 0.003 в десятичном виде.
 * rand ~ [-1..1].
 *
 * Возвращаем массив из steps чисел.
 */

export default function randomWalk(assetId, impact = 'neutral', steps = 10) {
  const asset = assetClasses.assets.find(a => a.id === assetId);
  if (!asset) {
    console.warn(`Не найден актив ${assetId} в assetClasses.json`);
    return Array(steps).fill(100);
  }

  const { drift } = asset;
  if (!drift) {
    console.warn(`У актива ${assetId} нет параметра drift`);
    return Array(steps).fill(100);
  }

  // Выбираем meanDrift в зависимости от impact
  let meanDriftPercent = 0; // в процентах, например 0.3 => 0.003
  switch (impact) {
    case 'positive': meanDriftPercent = drift.positive ?? 0; break;
    case 'negative': meanDriftPercent = drift.negative ?? 0; break;
    case 'neutral':
    default:
      meanDriftPercent = drift.neutral ?? 0;
      break;
  }

  // Превращаем в десятичное (0.3 => 0.003)
  const meanDrift = meanDriftPercent / 100;

  // Волатильность тоже интерпретируем как проценты
  const sigma = (drift.sigma ?? 1) / 100; 

  let basePrice = 100;
  const prices = [basePrice];

  for (let i = 1; i < steps; i++) {
    const rand = Math.random() * 2 - 1; // диапазон [-1..1]
    // Прирост = meanDrift + sigma*rand
    // Итоговое изменение: basePrice *= (1 + прирост)
    const changeRate = meanDrift + sigma * rand;
    
    basePrice = basePrice * (1 + changeRate);
    if (basePrice < 0) {
      basePrice = 0;
    }

    prices.push(Number(basePrice.toFixed(2)));
  }

  return prices;
}