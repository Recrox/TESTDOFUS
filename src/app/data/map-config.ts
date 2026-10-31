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

/**
 * Carte du monde tirée de `maps/carte-monde.jpg` :
 *   npm run tiles -- maps/carte-monde.jpg public/map-tiles webp
 *   npm run land-mask -- maps/carte-monde.jpg 80 60 3685 2296
 * La case [0, 0] est la Cité des Remparts, au centre-est du continent.
 */
export const MAP_CONFIG: MapConfig = {
  tileUrl: 'map-tiles/{z}/{x}/{y}.webp',
  width: 5359,
  height: 3869,
  maxNativeZoom: 5,
  cell: { width: 80, height: 60 },
  origin: { x: 3685, y: 2296 },
  bounds: WORLD_BOUNDS,
};
