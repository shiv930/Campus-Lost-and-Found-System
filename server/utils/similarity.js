/**
 * Text similarity helpers for lost/found matching (0–1 scale).
 */

function normalize(str) {
  return String(str || "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function bigrams(s) {
  const n = s.length;
  if (n < 2) return new Map([[s, 1]]);
  const map = new Map();
  for (let i = 0; i < n - 1; i++) {
    const bg = s.slice(i, i + 2);
    map.set(bg, (map.get(bg) || 0) + 1);
  }
  return map;
}

/** Sørensen–Dice coefficient on character bigrams */
export function diceCoefficient(a, b) {
  const x = normalize(a);
  const y = normalize(b);
  if (!x && !y) return 1;
  if (!x || !y) return 0;
  if (x === y) return 1;

  const bx = bigrams(x);
  const by = bigrams(y);
  let intersection = 0;
  for (const [k, v] of bx) {
    if (by.has(k)) intersection += Math.min(v, by.get(k));
  }
  return (2 * intersection) / (x.length - 1 + (y.length - 1));
}

export function combinedMatchScore(lost, found) {
  const nameSim = diceCoefficient(lost.itemName, found.itemName);
  const locSim = diceCoefficient(lost.locationLost, found.locationFound);
  const catMatch = normalize(lost.category) === normalize(found.category) ? 1 : 0;

  // Weighted score: name and category matter most
  const score = nameSim * 0.45 + catMatch * 0.35 + locSim * 0.2;
  return { score, nameSim, locSim, catMatch };
}

export function isLikelyMatch(lost, found, thresholds = {}) {
  const { minScore = 0.42, minName = 0.28, requireCategory = true } = thresholds;
  const { score, nameSim, catMatch } = combinedMatchScore(lost, found);
  if (requireCategory && catMatch < 1) return { match: false, score, nameSim, catMatch };
  if (nameSim < minName) return { match: false, score, nameSim, catMatch };
  if (score < minScore) return { match: false, score, nameSim, catMatch };
  return { match: true, score, nameSim, catMatch };
}
