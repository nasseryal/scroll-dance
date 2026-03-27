// ── Game Logic ──────────────────────────────────────────────────────────────

export const DIRECTIONS = ['up', 'down', 'left', 'right'];

export const ARROW_COLORS = {
  up:    '#00eeff',
  down:  '#ff33cc',
  left:  '#ffaa00',
  right: '#33ff88',
};

// Speed levels: [minScore, maxScore, intervalMs]
const SPEED_LEVELS = [
  { minScore: 0,   maxScore: 49,  interval: 1200 },
  { minScore: 50,  maxScore: 149, interval: 950  },
  { minScore: 150, maxScore: 299, interval: 750  },
  { minScore: 300, maxScore: 499, interval: 580  },
  { minScore: 500, maxScore: Infinity, interval: 420 },
];

export function getIntervalForScore(score) {
  // Find the target level
  const level = SPEED_LEVELS.find(l => score >= l.minScore && score <= l.maxScore)
    || SPEED_LEVELS[SPEED_LEVELS.length - 1];

  // Progressive transition: every 10 pts within the level we reduce 30ms
  const ptsIntoLevel = score - level.minScore;
  const stepsIn = Math.floor(ptsIntoLevel / 10);
  const reduction = stepsIn * 30;

  return Math.max(420, level.interval - reduction);
}

export function getSpeedLabel(score) {
  if (score >= 500) return 'SPEED x5';
  if (score >= 300) return 'SPEED x4';
  if (score >= 150) return 'SPEED x3';
  if (score >= 50)  return 'SPEED x2';
  return null;
}

export function getNextDirection(lastDirection) {
  const others = DIRECTIONS.filter(d => d !== lastDirection);
  return others[Math.floor(Math.random() * others.length)];
}

export function calcScore(currentScore, combo) {
  const base = 10;
  const comboBonus = combo > 2 ? combo * 3 : 0;
  return currentScore + base + comboBonus;
}

// Combo text messages
export const COMBO_MESSAGES = [
  { minCombo: 20, text: 'GOD MODE!!!!!', color: 'rainbow', size: 50 },
  { minCombo: 12, text: 'PERFECT!!!!',   color: '#cc44ff', size: 54 },
  { minCombo: 8,  text: 'AWESOME!!!',    color: 'rainbow', size: 48 },
  { minCombo: 5,  text: 'GREAT!!',       color: '#ffee00', size: 52 },
  { minCombo: 3,  text: 'NICE!',         color: '#00eeff', size: 46 },
];

export function getComboMessage(combo) {
  return COMBO_MESSAGES.find(m => combo >= m.minCombo) || null;
}

// Musical notes for good taps (note index = clamped combo)
export const NOTE_FREQUENCIES = [
  261.63, // C4
  293.66, // D4
  329.63, // E4
  349.23, // F4
  392.00, // G4
  440.00, // A4
  493.88, // B4
  523.25, // C5
];

export function getNoteForCombo(combo) {
  const idx = Math.min(combo, NOTE_FREQUENCIES.length - 1);
  return NOTE_FREQUENCIES[idx];
}
