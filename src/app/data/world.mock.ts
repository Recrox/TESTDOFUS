import { ITEMS_BY_ID } from './items.mock';
import { Biome } from './zones.mock';

export type TileKind = 'grass' | 'path' | 'water' | 'tree' | 'rock' | 'resource';
export type Direction = 'nord' | 'sud' | 'est' | 'ouest';

export interface ResourceSpec {
  itemId: string;
  icon: string;
  label: string;
  /** Temps de repousse en millisecondes. */
  respawnMs: number;
}

/** Récolte d'une ressource de ressources.json ; le temps de repousse croît avec son niveau. */
function harvest(itemId: string, icon: string, baseMs: number): ResourceSpec {
  const item = ITEMS_BY_ID[itemId];
  return { itemId, icon, label: item.name, respawnMs: baseMs + item.level * 200 };
}

/** Ressources récoltables, indexées par leur caractère dans la carte. */
export const RESOURCE_SPECS: Record<string, ResourceSpec> = {
  // Paysan
  b: harvest('ble', '🌾', 8000),
  g: harvest('orge', '🌾', 8000),
  h: harvest('houblon', '🌿', 8000),
  l: harvest('lin', '💠', 8000),
  // Bûcheron
  f: harvest('bois-de-frene', '🌲', 12000),
  c: harvest('bois-de-chataignier', '🌳', 12000),
  k: harvest('bois-de-noyer', '🌳', 12000),
  q: harvest('bois-de-chene', '🌳', 12000),
  // Mineur
  o: harvest('fer', '⛏️', 15000),
  u: harvest('cuivre', '🟠', 15000),
  z: harvest('bronze', '🟤', 15000),
  e: harvest('etain', '⚪', 15000),
  // Alchimiste
  n: harvest('orties', '🌱', 6000),
  t: harvest('trefle-a-5-feuilles', '🍀', 6000),
  m: harvest('feuille-de-menthe-sauvage', '🍃', 6000),
};

export const MAP_SIZE = 14;
const MID = MAP_SIZE >> 1;

export const DIRECTIONS: Direction[] = ['nord', 'est', 'sud', 'ouest'];
export const DIR_DELTA: Record<Direction, { x: number; y: number }> = {
  nord: { x: 0, y: -1 },
  sud: { x: 0, y: 1 },
  est: { x: 1, y: 0 },
  ouest: { x: -1, y: 0 },
};
export const OPPOSITE: Record<Direction, Direction> = { nord: 'sud', sud: 'nord', est: 'ouest', ouest: 'est' };
/** Case de sortie (bord de carte) pour chaque direction. */
export const EXIT_CELLS: Record<Direction, { r: number; c: number }> = {
  nord: { r: 0, c: MID },
  sud: { r: MAP_SIZE - 1, c: MID },
  ouest: { r: MID, c: 0 },
  est: { r: MID, c: MAP_SIZE - 1 },
};

interface BiomeConfig {
  tree: number;
  rock: number;
  ponds: number;
  resources: Record<string, number>;
}

const BIOMES: Record<Biome, BiomeConfig> = {
  village: { tree: 0.02, rock: 0.01, ponds: 0, resources: { b: 0.02 } },
  plaine: { tree: 0.04, rock: 0.02, ponds: 1, resources: { b: 0.05, g: 0.03, h: 0.015, n: 0.02 } },
  foret: { tree: 0.2, rock: 0.02, ponds: 0, resources: { f: 0.04, c: 0.025, k: 0.015, q: 0.01, n: 0.02 } },
  marais: { tree: 0.05, rock: 0.01, ponds: 4, resources: { n: 0.05, t: 0.02, m: 0.02 } },
  mine: { tree: 0.01, rock: 0.16, ponds: 0, resources: { o: 0.04, u: 0.025, z: 0.015 } },
  cote: { tree: 0.02, rock: 0.04, ponds: 2, resources: { n: 0.02, b: 0.02, l: 0.02 } },
  desert: { tree: 0.01, rock: 0.08, ponds: 0, resources: { o: 0.02, e: 0.01 } },
  neige: { tree: 0.12, rock: 0.04, ponds: 2, resources: { f: 0.03, q: 0.02 } },
  lave: { tree: 0, rock: 0.18, ponds: 0, resources: { o: 0.04, u: 0.03, e: 0.02 } },
};

export function biomeResources(biome: Biome): ResourceSpec[] {
  return Object.keys(BIOMES[biome].resources).map((k) => RESOURCE_SPECS[k]);
}

/** Générateur pseudo-aléatoire déterministe. */
export function createRng(x: number, y: number): () => number {
  let seed = (x * 73856093) ^ (y * 19349663) ^ 0x5bd1e995;
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Génère la carte locale d'une coordonnée du monde.
 * Légende : `.` herbe · `p` chemin · `w` eau · `T` arbre · `R` rocher · autres lettres : ressources (voir RESOURCE_SPECS)
 */
export function generateRows(x: number, y: number, biome: Biome, exits: Direction[]): string[] {
  const rng = createRng(x, y);
  const cfg = BIOMES[biome];
  const g = Array.from({ length: MAP_SIZE }, () => Array<string>(MAP_SIZE).fill('.'));

  for (let i = 0; i < cfg.ponds; i++) {
    const cr = rng() * MAP_SIZE;
    const cc = rng() * MAP_SIZE;
    const radius = 1.2 + rng() * 1.8;
    for (let r = 0; r < MAP_SIZE; r++) for (let c = 0; c < MAP_SIZE; c++) if (Math.hypot(r - cr, c - cc) < radius) g[r][c] = 'w';
  }
  if (biome === 'cote') {
    for (let r = MAP_SIZE - 3; r < MAP_SIZE; r++) g[r].fill('w');
  }

  for (let r = 0; r < MAP_SIZE; r++) {
    for (let c = 0; c < MAP_SIZE; c++) {
      if (g[r][c] !== '.') continue;
      let roll = rng();
      if (roll < cfg.tree) g[r][c] = 'T';
      else if (roll < cfg.tree + cfg.rock) g[r][c] = 'R';
      else {
        roll -= cfg.tree + cfg.rock;
        for (const [key, p] of Object.entries(cfg.resources)) {
          if (roll < p) {
            g[r][c] = key;
            break;
          }
          roll -= p;
        }
      }
    }
  }

  // Chemins : du centre vers chaque sortie.
  const center = biome === 'village' ? 1 : 0;
  for (let r = MID - center; r <= MID + center; r++) for (let c = MID - center; c <= MID + center; c++) g[r][c] = 'p';
  for (const dir of exits) {
    const end = EXIT_CELLS[dir];
    const steps = Math.max(Math.abs(end.r - MID), Math.abs(end.c - MID));
    for (let i = 0; i <= steps; i++) {
      g[MID + Math.sign(end.r - MID) * i][MID + Math.sign(end.c - MID) * i] = 'p';
    }
  }

  return g.map((row) => row.join(''));
}
