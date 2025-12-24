export const SHAPES = ['circle', 'square', 'triangle'];
export const COLORS = ['red', 'blue', 'green', 'yellow', 'purple'];
export const DIRECTIONS = { CLOCKWISE: 1, COUNTER_CLOCKWISE: -1 };

export const INITIAL_SETTINGS = {
  scoreWindows: {
    excellent: { time: 1000, points: 20 },
    good: { time: 2000, points: 10 },
  },
  baseSpeed: 1000, // ms per step
  changeFrequency: 0.3, // 30% chance per step
};

export const LEVELS = {
  EASY: { name: 'EASY', duration: 4 * 60, speedMult: 1, freqMult: 1 },
  MEDIUM: { name: 'MEDIUM', duration: 8 * 60, speedMult: 0.7, freqMult: 1.5 }, // Faster speed (lower interval), higher freq
  HARD: { name: 'HARD', duration: 12 * 60, speedMult: 0.4, freqMult: 2.0 },
};
