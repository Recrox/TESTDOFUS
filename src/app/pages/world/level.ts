import { DIRECTIONS, DIR_DELTA, Direction, EXIT_CELLS, MAP_SIZE, RESOURCE_SPECS, ResourceSpec, TileKind, createRng, generateRows } from '../../data/world.mock';
import { Zone, ZONES, zoneAt } from '../../data/zones.mock';

export const HALF_W = 32;
export const HALF_H = 16;
export const TOP_PAD = 60;

export interface Cell {
  r: number;
  c: number;
}

export interface Tile extends Cell {
  key: string;
  kind: TileKind;
  x: number;
  y: number;
  points: string;
  resource?: ResourceSpec;
  exit?: Direction;
}

const DIRS: Cell[] = [
  { r: -1, c: 0 }, { r: 1, c: 0 }, { r: 0, c: -1 }, { r: 0, c: 1 },
  { r: -1, c: -1 }, { r: -1, c: 1 }, { r: 1, c: -1 }, { r: 1, c: 1 },
];

export function toScreen(r: number, c: number) {
  return { x: (c - r) * HALF_W + MAP_SIZE * HALF_W, y: (c + r) * HALF_H + TOP_PAD };
}

function parseKind(ch: string): TileKind {
  if (RESOURCE_SPECS[ch]) return 'resource';
  return ({ p: 'path', w: 'water', T: 'tree', R: 'rock' } as Record<string, TileKind>)[ch] ?? 'grass';
}

/** Une carte locale : tuiles, sorties et recherche de chemin. */
export class Level {
  readonly id: string;
  readonly tiles: Tile[][];
  readonly flat: Tile[];

  constructor(
    readonly x: number,
    readonly y: number,
    readonly zone: Zone,
    readonly exits: Direction[],
    rows: string[],
  ) {
    this.id = `${x},${y}`;
    this.tiles = rows.map((row, r) =>
      [...row].map((ch, c) => {
        const { x: sx, y: sy } = toScreen(r, c);
        return {
          r,
          c,
          key: `${r}-${c}`,
          kind: parseKind(ch),
          x: sx,
          y: sy,
          points: `${sx},${sy - HALF_H} ${sx + HALF_W},${sy} ${sx},${sy + HALF_H} ${sx - HALF_W},${sy}`,
          resource: RESOURCE_SPECS[ch],
        };
      }),
    );
    for (const dir of exits) {
      const { r, c } = EXIT_CELLS[dir];
      this.tiles[r][c].exit = dir;
    }
    this.flat = this.tiles.flat();
  }

  tileAt(r: number, c: number): Tile | undefined {
    return this.tiles[r]?.[c];
  }

  isWalkable(r: number, c: number): boolean {
    const kind = this.tileAt(r, c)?.kind;
    return kind === 'grass' || kind === 'path';
  }

  /** Voisins accessibles (8 directions, sans couper les coins). */
  neighbours(cell: Cell): Cell[] {
    return DIRS.filter((d) => {
      const r = cell.r + d.r;
      const c = cell.c + d.c;
      if (!this.isWalkable(r, c)) return false;
      return d.r === 0 || d.c === 0 || (this.isWalkable(cell.r + d.r, cell.c) && this.isWalkable(cell.r, cell.c + d.c));
    }).map((d) => ({ r: cell.r + d.r, c: cell.c + d.c }));
  }

  /** Dijkstra depuis `from` vers la case la plus proche parmi `targets`. */
  findPath(from: Cell, targets: Cell[]): Cell[] | null {
    const k = (cell: Cell) => `${cell.r}-${cell.c}`;
    const goal = new Set(targets.map(k));
    const startKey = k(from);
    if (goal.has(startKey)) return [];

    const dist = new Map<string, number>([[startKey, 0]]);
    const prev = new Map<string, Cell>();
    const open: Cell[] = [from];

    while (open.length) {
      open.sort((a, b) => dist.get(k(a))! - dist.get(k(b))!);
      const cur = open.shift()!;
      if (goal.has(k(cur))) {
        const path: Cell[] = [];
        for (let n: Cell | undefined = cur; n && k(n) !== startKey; n = prev.get(k(n))) path.unshift(n);
        return path;
      }
      for (const n of this.neighbours(cur)) {
        const cost = dist.get(k(cur))! + (n.r !== cur.r && n.c !== cur.c ? 1.41 : 1);
        if (cost < (dist.get(k(n)) ?? Infinity)) {
          dist.set(k(n), cost);
          prev.set(k(n), cur);
          if (!open.some((o) => o.r === n.r && o.c === n.c)) open.push(n);
        }
      }
    }
    return null;
  }

  /** Positions de départ des moutons (déterministes pour cette carte). */
  initialSheep(count = 2): Cell[] {
    const rng = createRng(this.x + 1000, this.y - 1000);
    const free = this.flat.filter((t) => t.kind === 'grass');
    return Array.from({ length: Math.min(count, free.length) }, () => {
      const t = free[Math.floor(rng() * free.length)];
      return { r: t.r, c: t.c };
    });
  }
}

export function buildLevel(x: number, y: number): Level {
  const zone = zoneAt(x, y) ?? ZONES[0];
  const exits = DIRECTIONS.filter((d) => zoneAt(x + DIR_DELTA[d].x, y + DIR_DELTA[d].y));
  return new Level(x, y, zone, exits, generateRows(x, y, zone.biome, exits));
}
