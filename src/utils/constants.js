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
  EASY: { name: 'EASY', duration: 2 * 60, speedMult: 1, freqMult: 1 },
  MEDIUM: { name: 'MEDIUM', duration: 2 * 60, speedMult: 0.83, freqMult: 1.2 }, // +20% Speed (1/1.2 approx), +20% Freq
  HARD: { name: 'HARD', duration: 4 * 60, speedMult: 0.69, freqMult: 1.44 }, // +20% Speed on Medium (1/1.44 approx), +20% Freq on Medium
};
