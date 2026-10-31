import { WORLD_BOUNDS } from './zones.mock';

export interface MapConfig {
  /**
   * Modèle d'URL des tuiles (`{z}/{x}/{y}`), ou `null` pour dessiner les zones mock.
   * Ex. après `npm run tiles -- mon-image.png` : `'map-tiles/{z}/{x}/{y}.png'`.
   */
  tileUrl: string | null;
  /** Taille de l'image source en pixels. */
  width: number;
  height: number;
  /** Zoom auquel l'image est affichée à 100 % (donné par le script de tuilage). */
  maxNativeZoom: number;
  /** Taille d'une case de coordonnées en pixels. */
  cell: { width: number; height: number };
  /** Position en pixels du coin haut-gauche de la case [0, 0]. */
  origin: { x: number; y: number };
  /** Coordonnées couvertes par la grille. */
  bounds: { minX: number; maxX: number; minY: number; maxY: number };
}

const MOCK_CELL = 64;

/** Configuration par défaut : monde mock dessiné en vectoriel, sans image. */
export const MAP_CONFIG: MapConfig = {
  tileUrl: null,
  width: (WORLD_BOUNDS.maxX - WORLD_BOUNDS.minX + 1) * MOCK_CELL,
  height: (WORLD_BOUNDS.maxY - WORLD_BOUNDS.minY + 1) * MOCK_CELL,
  maxNativeZoom: 3,
  cell: { width: MOCK_CELL, height: MOCK_CELL },
  origin: { x: -WORLD_BOUNDS.minX * MOCK_CELL, y: -WORLD_BOUNDS.minY * MOCK_CELL },
  bounds: WORLD_BOUNDS,
};
