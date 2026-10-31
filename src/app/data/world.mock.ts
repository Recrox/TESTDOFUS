export type TileKind = 'grass' | 'path' | 'water' | 'tree' | 'rock' | 'resource';

export interface ResourceSpec {
  itemId: string;
  icon: string;
  label: string;
  /** Temps de repousse en millisecondes. */
  respawnMs: number;
}

/** Ressources récoltables, indexées par leur caractère dans la carte. */
export const RESOURCE_SPECS: Record<string, ResourceSpec> = {
  b: { itemId: 'ble', icon: '🌾', label: 'Blé', respawnMs: 8000 },
  f: { itemId: 'frene', icon: '🌲', label: 'Frêne', respawnMs: 12000 },
  o: { itemId: 'fer', icon: '⛏️', label: 'Fer', respawnMs: 15000 },
  n: { itemId: 'ortie', icon: '🌱', label: 'Ortie', respawnMs: 6000 },
};

/**
 * Légende : `.` herbe · `p` chemin · `w` eau · `T` arbre · `R` rocher
 * Ressources : `b` blé · `f` frêne · `o` fer · `n` ortie
 */
export const WORLD_MAP = {
  name: 'Plaine des Cultivateurs',
  start: { r: 4, c: 4 },
  rows: [
    'TT....bb...wwT',
    'T..pp.bb...wwT',
    '...p.....f.ww.',
    '.n.p..R...ww..',
    '...pppppp.w..o',
    '.f......p....o',
    '..T..n..p..R..',
    '....bb..pppp..',
    '.R..bb.....p..',
    '..f......f.p.n',
    'T.....o....p..',
    'TT..n...R..p..',
    'TTT.......pp.f',
    'TTTT.o..ppp..T',
  ],
};
