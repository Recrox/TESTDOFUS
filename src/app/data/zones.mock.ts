import { LAND_BOUNDS, LAND_MASK } from './land.mask';

export type Biome = 'village' | 'plaine' | 'foret' | 'marais' | 'mine' | 'cote' | 'desert' | 'neige' | 'lave';

export interface Zone {
  id: string;
  name: string;
  biome: Biome;
  color: string;
  /** Rectangles de cases [x1, y1, x2, y2] (inclus). */
  rects: [number, number, number, number][];
}

/** Régions de la carte du monde (maps/carte-monde.jpg). Ordre = priorité en cas de chevauchement. */
export const ZONES: Zone[] = [
  // Continent
  { id: 'bourg', name: 'Cité des Remparts', biome: 'village', color: '#d8b86a', rects: [[-2, -1, 3, 2]] },
  { id: 'campement', name: 'Campement des Tentes Rouges', biome: 'village', color: '#c9472b', rects: [[-8, -9, -5, -7]] },
  { id: 'bosquet', name: 'Bosquet des Pins', biome: 'foret', color: '#7f9a2a', rects: [[-12, -3, -9, -1]] },
  { id: 'marais-vert', name: 'Mare aux Joncs', biome: 'marais', color: '#2f5a4a', rects: [[-8, 13, -6, 15]] },
  { id: 'labyrinthe', name: 'Labyrinthe Ancien', biome: 'desert', color: '#a07a50', rects: [[-5, 13, -1, 16]] },
  { id: 'cite-nord', name: 'Citadelle du Nord', biome: 'village', color: '#b98b55', rects: [[-21, -17, -14, -12]] },
  { id: 'calcine', name: 'Ruines Calcinées', biome: 'mine', color: '#3b3330', rects: [[-9, -17, -5, -14]] },
  { id: 'cite-sud', name: 'Forteresse Ardente', biome: 'village', color: '#e08a2a', rects: [[-18, 18, -11, 24]] },
  { id: 'lave', name: 'Coulées de Lave', biome: 'lave', color: '#a8401c', rects: [[-10, 16, -5, 19]] },
  { id: 'marais-noir', name: 'Marais Noirs', biome: 'marais', color: '#3a2e2c', rects: [[-10, 20, -5, 24]] },
  { id: 'champs', name: 'Champs Dorés', biome: 'plaine', color: '#e0c040', rects: [[-17, -12, -10, -8]] },
  { id: 'plaines-nord', name: 'Prairies du Nord', biome: 'plaine', color: '#a9c94f', rects: [[-14, -17, -3, -10]] },
  { id: 'rocs', name: 'Massifs Rocheux', biome: 'mine', color: '#6b5444', rects: [[-15, -6, -5, 1]] },
  { id: 'desert', name: 'Grand Désert', biome: 'desert', color: '#b08a5a', rects: [[-9, 0, -1, 4]] },
  { id: 'foret', name: 'Vallée Brumeuse', biome: 'foret', color: '#7a8a4a', rects: [[-13, 2, -3, 12]] },
  { id: 'sud', name: 'Landes du Sud', biome: 'plaine', color: '#c4a090', rects: [[-17, 13, -8, 17]] },
  { id: 'ouest', name: 'Côte Ouest', biome: 'cote', color: '#d9c0a8', rects: [[-22, -11, -14, 17]] },
  { id: 'plateau', name: 'Plateau des Sables', biome: 'desert', color: '#d4b07a', rects: [[-4, -9, 6, 4]] },
  { id: 'dunes', name: 'Côte des Dunes', biome: 'cote', color: '#ecdcb0', rects: [[-4, 5, 8, 22]] },
  // Îles
  { id: 'glace', name: 'Île Glacée', biome: 'neige', color: '#cfe4f2', rects: [[-37, -33, -30, -28]] },
  { id: 'arbre', name: 'Île de l’Arbre-Monde', biome: 'foret', color: '#4f7f2a', rects: [[-32, 6, -23, 18], [-34, 3, -28, 5]] },
  { id: 'taureau', name: 'Îlot du Taureau', biome: 'mine', color: '#8a7a6a', rects: [[-23, 0, -21, 2]] },
  { id: 'palmiers', name: 'Îlot aux Palmiers', biome: 'cote', color: '#d9cf9c', rects: [[-25, 5, -21, 8]] },
  { id: 'collines', name: 'Île des Collines', biome: 'mine', color: '#a07850', rects: [[6, -16, 17, 0]] },
  { id: 'griffe', name: 'Îlot de la Griffe', biome: 'village', color: '#efe6d4', rects: [[8, 2, 13, 7]] },
  { id: 'lune', name: 'Île de la Lune', biome: 'foret', color: '#e8d8a8', rects: [[12, 8, 18, 13]] },
  { id: 'archipel', name: 'Archipel du Levant', biome: 'cote', color: '#c8b088', rects: [[3, 15, 9, 19]] },
];

/** Région par défaut des cases de terre hors de toute zone nommée. */
export const WILDS: Zone = { id: 'sauvage', name: 'Terres Sauvages', biome: 'plaine', color: '#e3cabc', rects: [] };

export const WORLD_BOUNDS = LAND_BOUNDS;

export function isLand(x: number, y: number): boolean {
  return LAND_MASK[y - LAND_BOUNDS.minY]?.[x - LAND_BOUNDS.minX] === '#';
}

/** Zone d'une case, ou `undefined` en mer. */
export function zoneAt(x: number, y: number): Zone | undefined {
  if (!isLand(x, y)) return undefined;
  return ZONES.find((z) => z.rects.some(([x1, y1, x2, y2]) => x >= x1 && x <= x2 && y >= y1 && y <= y2)) ?? WILDS;
}
