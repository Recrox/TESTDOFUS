import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ITEMS_BY_ID } from '../../data/items.mock';
import { RESOURCE_SPECS, ResourceSpec, TileKind, WORLD_MAP } from '../../data/world.mock';
import { BankService } from '../../services/bank.service';

const HALF_W = 32;
const HALF_H = 16;
const TOP_PAD = 60;
const STEP_MS = 200;
const ROWS = WORLD_MAP.rows.length;
const COLS = WORLD_MAP.rows[0].length;

interface Cell {
  r: number;
  c: number;
}

interface Tile extends Cell {
  key: string;
  kind: TileKind;
  x: number;
  y: number;
  points: string;
  resource?: ResourceSpec;
}

interface Entity {
  key: string;
  type: 'player' | 'sheep' | 'tree' | 'rock' | 'resource';
  depth: number;
  x: number;
  y: number;
  icon?: string;
  tile?: Tile;
  depleted?: boolean;
  remaining?: number;
}

interface FloatingText {
  id: number;
  x: number;
  y: number;
  text: string;
}

const DIRS: Cell[] = [
  { r: -1, c: 0 }, { r: 1, c: 0 }, { r: 0, c: -1 }, { r: 0, c: 1 },
  { r: -1, c: -1 }, { r: -1, c: 1 }, { r: 1, c: -1 }, { r: 1, c: 1 },
];

const KEY_DIRS: Record<string, Cell> = {
  ArrowUp: { r: -1, c: -1 }, z: { r: -1, c: -1 },
  ArrowDown: { r: 1, c: 1 }, s: { r: 1, c: 1 },
  ArrowLeft: { r: 1, c: -1 }, q: { r: 1, c: -1 },
  ArrowRight: { r: -1, c: 1 }, d: { r: -1, c: 1 },
};

function toScreen(r: number, c: number) {
  return { x: (c - r) * HALF_W + ROWS * HALF_W, y: (c + r) * HALF_H + TOP_PAD };
}

function parseKind(ch: string): TileKind {
  if (RESOURCE_SPECS[ch]) return 'resource';
  return ({ p: 'path', w: 'water', T: 'tree', R: 'rock' } as Record<string, TileKind>)[ch] ?? 'grass';
}

const TILES: Tile[][] = WORLD_MAP.rows.map((row, r) =>
  [...row].map((ch, c) => {
    const { x, y } = toScreen(r, c);
    return {
      r,
      c,
      key: `${r}-${c}`,
      kind: parseKind(ch),
      x,
      y,
      points: `${x},${y - HALF_H} ${x + HALF_W},${y} ${x},${y + HALF_H} ${x - HALF_W},${y}`,
      resource: RESOURCE_SPECS[ch],
    };
  }),
);

function tileAt(r: number, c: number): Tile | undefined {
  return TILES[r]?.[c];
}

function isWalkable(r: number, c: number): boolean {
  const kind = tileAt(r, c)?.kind;
  return kind === 'grass' || kind === 'path';
}

/** Voisins accessibles (8 directions, sans couper les coins). */
function neighbours(cell: Cell): Cell[] {
  return DIRS.map((d) => ({ r: cell.r + d.r, c: cell.c + d.c, diag: d.r !== 0 && d.c !== 0, d }))
    .filter((n) => isWalkable(n.r, n.c) && (!n.diag || (isWalkable(cell.r + n.d.r, cell.c) && isWalkable(cell.r, cell.c + n.d.c))))
    .map(({ r, c }) => ({ r, c }));
}

/** Dijkstra depuis `from` vers la case la plus proche parmi `targets`. */
function findPath(from: Cell, targets: Cell[]): Cell[] | null {
  const goal = new Set(targets.map((t) => `${t.r}-${t.c}`));
  const startKey = `${from.r}-${from.c}`;
  if (goal.has(startKey)) return [];

  const dist = new Map<string, number>([[startKey, 0]]);
  const prev = new Map<string, Cell>();
  const open: Cell[] = [from];

  while (open.length) {
    open.sort((a, b) => dist.get(`${a.r}-${a.c}`)! - dist.get(`${b.r}-${b.c}`)!);
    const cur = open.shift()!;
    const curKey = `${cur.r}-${cur.c}`;
    if (goal.has(curKey)) {
      const path: Cell[] = [];
      for (let k: Cell | undefined = cur; k && `${k.r}-${k.c}` !== startKey; k = prev.get(`${k.r}-${k.c}`)) path.unshift(k);
      return path;
    }
    for (const n of neighbours(cur)) {
      const nKey = `${n.r}-${n.c}`;
      const cost = dist.get(curKey)! + (n.r !== cur.r && n.c !== cur.c ? 1.41 : 1);
      if (cost < (dist.get(nKey) ?? Infinity)) {
        dist.set(nKey, cost);
        prev.set(nKey, cur);
        if (!open.some((o) => o.r === n.r && o.c === n.c)) open.push(n);
      }
    }
  }
  return null;
}

@Component({
  selector: 'app-world',
  imports: [RouterLink],
  templateUrl: './world.html',
  styleUrl: './world.scss',
  host: { '(window:keydown)': 'onKey($event)' },
})
export class World {
  private readonly bank = inject(BankService);

  protected readonly mapName = WORLD_MAP.name;
  protected readonly viewBox = `0 0 ${(ROWS + COLS) * HALF_W} ${(ROWS + COLS - 2) * HALF_H + TOP_PAD + 40}`;
  protected readonly tiles = TILES.flat();
  protected readonly resources = Object.values(RESOURCE_SPECS);

  /** Position animée (flottante) du personnage. */
  protected readonly pos = signal<Cell>({ ...WORLD_MAP.start });
  protected readonly facingLeft = signal(false);
  protected readonly moving = signal(false);
  protected readonly harvesting = signal(false);
  protected readonly hovered = signal<Tile | null>(null);
  protected readonly floating = signal<FloatingText[]>([]);
  protected readonly log = signal<string[]>([]);
  protected readonly sheep = signal<Cell[]>([{ r: 7, c: 1 }, { r: 10, c: 9 }]);

  private readonly respawnAt = signal<Record<string, number>>({});
  private readonly now = signal(Date.now());

  /** Case logique : celle où le personnage sera à la fin du pas en cours. */
  private tile: Cell = { ...WORLD_MAP.start };
  private queue: Cell[] = [];
  private onArrive?: () => void;
  private raf = 0;
  private floatId = 0;

  protected readonly coords = computed(() => `[${Math.round(this.pos().c)}, ${Math.round(this.pos().r)}]`);

  protected readonly preview = computed(() => {
    const t = this.hovered();
    if (!t || this.moving()) return [];
    const path = t.kind === 'resource' ? findPath(this.tile, neighbours(t)) : isWalkable(t.r, t.c) ? findPath(this.tile, [t]) : null;
    return (path ?? []).map((p) => toScreen(p.r, p.c));
  });

  protected readonly entities = computed<Entity[]>(() => {
    const now = this.now();
    const respawn = this.respawnAt();
    const list: Entity[] = [];

    for (const t of this.tiles) {
      if (t.kind === 'tree' || t.kind === 'rock') {
        list.push({ key: t.key, type: t.kind, depth: t.r + t.c, x: t.x, y: t.y, icon: t.kind === 'tree' ? '🌳' : '🪨' });
      } else if (t.resource) {
        const remaining = Math.max(0, (respawn[t.key] ?? 0) - now);
        list.push({ key: t.key, type: 'resource', depth: t.r + t.c, x: t.x, y: t.y, icon: t.resource.icon, tile: t, depleted: remaining > 0, remaining: Math.ceil(remaining / 1000) });
      }
    }

    this.sheep().forEach((s, i) => {
      const { x, y } = toScreen(s.r, s.c);
      list.push({ key: `sheep-${i}`, type: 'sheep', depth: s.r + s.c + 0.1, x, y, icon: '🐑' });
    });

    const p = this.pos();
    const { x, y } = toScreen(p.r, p.c);
    list.push({ key: 'player', type: 'player', depth: p.r + p.c + 0.2, x, y });

    return list.sort((a, b) => a.depth - b.depth);
  });

  protected readonly resourceStock = computed(() => {
    this.bank.stock();
    return this.resources.map((r) => ({ ...r, quantity: this.bank.quantityOf(r.itemId) }));
  });

  constructor() {
    const clock = setInterval(() => this.now.set(Date.now()), 500);
    const sheepTimer = setInterval(() => this.wanderSheep(), 2200);
    inject(DestroyRef).onDestroy(() => {
      clearInterval(clock);
      clearInterval(sheepTimer);
      cancelAnimationFrame(this.raf);
    });
  }

  protected onTileClick(t: Tile): void {
    if (this.harvesting()) return;

    if (t.resource) {
      const remaining = (this.respawnAt()[t.key] ?? 0) - Date.now();
      if (remaining > 0) {
        this.addLog(`${t.resource.icon} ${t.resource.label} repousse dans ${Math.ceil(remaining / 1000)}s`);
        return;
      }
      const path = findPath(this.tile, neighbours(t));
      if (path) this.walk(path, () => this.harvest(t));
      return;
    }

    if (isWalkable(t.r, t.c)) {
      const path = findPath(this.tile, [t]);
      if (path) this.walk(path);
    }
  }

  protected onKey(event: KeyboardEvent): void {
    const dir = KEY_DIRS[event.key.length === 1 ? event.key.toLowerCase() : event.key];
    if (!dir || this.harvesting()) return;
    event.preventDefault();
    const target = { r: this.tile.r + dir.r, c: this.tile.c + dir.c };
    if (neighbours(this.tile).some((n) => n.r === target.r && n.c === target.c)) this.walk([target]);
  }

  private walk(path: Cell[], onArrive?: () => void): void {
    this.queue = path;
    this.onArrive = onArrive;
    if (!this.moving()) this.nextStep();
  }

  private nextStep(): void {
    const next = this.queue.shift();
    if (!next) {
      this.moving.set(false);
      const cb = this.onArrive;
      this.onArrive = undefined;
      cb?.();
      return;
    }

    this.moving.set(true);
    const from = { ...this.pos() };
    const screenDx = next.c - next.r - (from.c - from.r);
    if (screenDx !== 0) this.facingLeft.set(screenDx < 0);
    this.tile = next;

    const start = performance.now();
    const tick = (time: number) => {
      const k = Math.min(1, (time - start) / STEP_MS);
      this.pos.set({ r: from.r + (next.r - from.r) * k, c: from.c + (next.c - from.c) * k });
      if (k < 1) this.raf = requestAnimationFrame(tick);
      else this.nextStep();
    };
    this.raf = requestAnimationFrame(tick);
  }

  private harvest(t: Tile): void {
    const spec = t.resource!;
    this.facingLeft.set(t.c - t.r < this.tile.c - this.tile.r);
    this.harvesting.set(true);

    setTimeout(() => {
      const qty = 1 + Math.floor(Math.random() * 3);
      this.bank.add(spec.itemId, qty);
      this.respawnAt.update((r) => ({ ...r, [t.key]: Date.now() + spec.respawnMs }));
      this.harvesting.set(false);
      this.spawnFloating(t.x, t.y - 30, `+${qty} ${spec.icon}`);
      this.addLog(`${spec.icon} +${qty} ${ITEMS_BY_ID[spec.itemId].name} → banque`);
    }, 900);
  }

  private wanderSheep(): void {
    this.sheep.update((all) =>
      all.map((s) => {
        if (Math.random() < 0.4) return s;
        const options = neighbours(s).filter((n) => n.r !== this.tile.r || n.c !== this.tile.c);
        return options[Math.floor(Math.random() * options.length)] ?? s;
      }),
    );
  }

  private spawnFloating(x: number, y: number, text: string): void {
    const id = ++this.floatId;
    this.floating.update((f) => [...f, { id, x, y, text }]);
    setTimeout(() => this.floating.update((f) => f.filter((e) => e.id !== id)), 1200);
  }

  private addLog(line: string): void {
    this.log.update((l) => [line, ...l].slice(0, 8));
  }
}
