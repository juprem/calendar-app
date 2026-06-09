export const HOUR_HEIGHT = 80;
export const QUARTER_HEIGHT = HOUR_HEIGHT / 4; // 20px per 15 min
export const START_HOUR = 0;
export const END_HOUR = 24;
export const HOURS = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => START_HOUR + i);
/** Quarter offsets within an hour: 15 min, 30 min, 45 min */
export const QUARTERS = [1, 2, 3] as const;
export const DAY_NAMES = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
