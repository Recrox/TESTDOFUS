export type Biome = 'village' | 'plaine' | 'foret' | 'marais' | 'mine' | 'cote';

export interface Zone {
  id: string;
  name: string;
  biome: Biome;
  color: string;
  /** Rectangles de cases [x1, y1, x2, y2] (inclus). */
  rects: [number, number, number, number][];
}

/** Ordre = priorité en cas de chevauchement. */
export const ZONES: Zone[] = [
  { id: 'bourg', name: 'Bourg de Départ', biome: 'village', color: '#d8b86a', rects: [[-2, -2, 2, 2]] },
  { id: 'plaine', name: 'Plaine des Cultivateurs', biome: 'plaine', color: '#a9c94f', rects: [[-8, -6, 6, 7]] },
  { id: 'foret', name: 'Forêt des Murmures', biome: 'foret', color: '#4f7f2a', rects: [[-16, -10, -9, 4], [-12, 5, -6, 10]] },
  { id: 'monts', name: 'Monts de Rouille', biome: 'mine', color: '#9a7b5a', rects: [[-4, -14, 8, -7]] },
  { id: 'marais', name: 'Marais Brumeux', biome: 'marais', color: '#6c7d4a', rects: [[7, 2, 14, 11]] },
  { id: 'cote', name: 'Côte Salée', biome: 'cote', color: '#d9cf9c', rects: [[7, -9, 12, 1], [-6, 8, 6, 11]] },
];

export const WORLD_BOUNDS = { minX: -16, maxX: 14, minY: -14, maxY: 11 };

export function zoneAt(x: number, y: number): Zone | undefined {
  return ZONES.find((z) => z.rects.some(([x1, y1, x2, y2]) => x >= x1 && x <= x2 && y >= y1 && y <= y2));
}
