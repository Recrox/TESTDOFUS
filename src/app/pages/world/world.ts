import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ITEMS_BY_ID } from '../../data/items.mock';
import { DIRECTIONS, DIR_DELTA, Direction, EXIT_CELLS, MAP_SIZE, OPPOSITE, RESOURCE_SPECS } from '../../data/world.mock';
import { BankService } from '../../services/bank.service';
import { PlayerService } from '../../services/player.service';
import { Cell, HALF_H, HALF_W, TOP_PAD, Tile, buildLevel, toScreen } from './level';

const STEP_MS = 200;

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

const KEY_DIRS: Record<string, Cell> = {
  ArrowUp: { r: -1, c: -1 }, z: { r: -1, c: -1 },
  ArrowDown: { r: 1, c: 1 }, s: { r: 1, c: 1 },
  ArrowLeft: { r: 1, c: -1 }, q: { r: 1, c: -1 },
  ArrowRight: { r: -1, c: 1 }, d: { r: -1, c: 1 },
};

const DIR_LABELS: Record<Direction, string> = { nord: '⬆ Nord', est: '➡ Est', sud: '⬇ Sud', ouest: '⬅ Ouest' };

@Component({
  selector: 'app-world',
  imports: [RouterLink],
  templateUrl: './world.html',
  styleUrl: './world.scss',
  host: { '(window:keydown)': 'onKey($event)' },
})
export class World {
  private readonly bank = inject(BankService);
  private readonly player = inject(PlayerService);

  protected readonly level = computed(() => buildLevel(this.player.position().x, this.player.position().y));
  protected readonly viewBox = `0 0 ${2 * MAP_SIZE * HALF_W} ${(2 * MAP_SIZE - 2) * HALF_H + TOP_PAD + 40}`;
  protected readonly resources = Object.values(RESOURCE_SPECS);
  protected readonly directions = DIRECTIONS.map((d) => ({ dir: d, label: DIR_LABELS[d] }));

  /** Position animée (flottante) du personnage. */
  protected readonly pos = signal<Cell>({ r: 0, c: 0 });
  protected readonly facingLeft = signal(false);
  protected readonly moving = signal(false);
  protected readonly harvesting = signal(false);
  protected readonly hovered = signal<Tile | null>(null);
  protected readonly floating = signal<FloatingText[]>([]);
  protected readonly log = signal<string[]>([]);
  protected readonly sheep = signal<Cell[]>([]);

  private readonly respawnAt = signal<Record<string, number>>({});
  private readonly now = signal(Date.now());

  /** Case logique : celle où le personnage sera à la fin du pas en cours. */
  private tile: Cell = { r: 0, c: 0 };
  private queue: Cell[] = [];
  private onArrive?: () => void;
  private raf = 0;
  private floatId = 0;

  protected readonly coords = computed(() => `[${this.level().x}, ${this.level().y}]`);

  protected readonly preview = computed(() => {
    const t = this.hovered();
    const level = this.level();
    if (!t || this.moving()) return [];
    const path = t.kind === 'resource' ? level.findPath(this.tile, level.neighbours(t)) : level.isWalkable(t.r, t.c) ? level.findPath(this.tile, [t]) : null;
    return (path ?? []).map((p) => toScreen(p.r, p.c));
  });

  protected readonly entities = computed<Entity[]>(() => {
    const level = this.level();
    const now = this.now();
    const respawn = this.respawnAt();
    const list: Entity[] = [];

    for (const t of level.flat) {
      if (t.kind === 'tree' || t.kind === 'rock') {
        list.push({ key: t.key, type: t.kind, depth: t.r + t.c, x: t.x, y: t.y, icon: t.kind === 'tree' ? '🌳' : '🪨' });
      } else if (t.resource) {
        const remaining = Math.max(0, (respawn[`${level.id}:${t.key}`] ?? 0) - now);
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
    this.enterLevel();
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
    const level = this.level();

    if (t.resource) {
      const remaining = (this.respawnAt()[`${level.id}:${t.key}`] ?? 0) - Date.now();
      if (remaining > 0) {
        this.addLog(`${t.resource.icon} ${t.resource.label} repousse dans ${Math.ceil(remaining / 1000)}s`);
        return;
      }
      const path = level.findPath(this.tile, level.neighbours(t));
      if (path) this.walk(path, () => this.harvest(t));
      return;
    }

    if (level.isWalkable(t.r, t.c)) {
      const path = level.findPath(this.tile, [t]);
      if (path) this.walk(path);
    }
  }

  protected onKey(event: KeyboardEvent): void {
    if (event.target instanceof HTMLInputElement) return;
    const dir = KEY_DIRS[event.key.length === 1 ? event.key.toLowerCase() : event.key];
    if (!dir || this.harvesting()) return;
    event.preventDefault();

    const level = this.level();
    const target = { r: this.tile.r + dir.r, c: this.tile.c + dir.c };
    const exit = level.tileAt(this.tile.r, this.tile.c)?.exit;
    if (!level.tileAt(target.r, target.c) && exit && !this.moving()) {
      this.changeMap(exit);
    } else if (level.neighbours(this.tile).some((n) => n.r === target.r && n.c === target.c)) {
      this.walk([target]);
    }
  }

  protected changeMap(dir: Direction): void {
    if (!this.level().exits.includes(dir) || this.harvesting()) return;
    const { x, y } = this.player.position();
    this.player.travel(x + DIR_DELTA[dir].x, y + DIR_DELTA[dir].y);
    this.enterLevel(OPPOSITE[dir]);
    this.addLog(`🧭 ${this.level().zone.name} ${this.coords()}`);
  }

  /** Place le personnage sur la carte courante (au centre, ou à la sortie d'arrivée). */
  private enterLevel(from?: Direction): void {
    cancelAnimationFrame(this.raf);
    this.queue = [];
    this.onArrive = undefined;
    this.moving.set(false);
    this.hovered.set(null);

    const spawn = from ? EXIT_CELLS[from] : { r: MAP_SIZE >> 1, c: MAP_SIZE >> 1 };
    this.tile = { ...spawn };
    this.pos.set({ ...spawn });
    this.sheep.set(this.level().initialSheep());
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
      if (cb) cb();
      else {
        const exit = this.level().tileAt(this.tile.r, this.tile.c)?.exit;
        if (exit) this.changeMap(exit);
      }
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
    const levelId = this.level().id;
    this.facingLeft.set(t.c - t.r < this.tile.c - this.tile.r);
    this.harvesting.set(true);

    setTimeout(() => {
      const qty = 1 + Math.floor(Math.random() * 3);
      this.bank.add(spec.itemId, qty);
      this.respawnAt.update((r) => ({ ...r, [`${levelId}:${t.key}`]: Date.now() + spec.respawnMs }));
      this.harvesting.set(false);
      this.spawnFloating(t.x, t.y - 30, `+${qty} ${spec.icon}`);
      this.addLog(`${spec.icon} +${qty} ${ITEMS_BY_ID[spec.itemId].name} → banque`);
    }, 900);
  }

  private wanderSheep(): void {
    const level = this.level();
    this.sheep.update((all) =>
      all.map((s) => {
        if (Math.random() < 0.4) return s;
        const options = level.neighbours(s).filter((n) => !level.tileAt(n.r, n.c)?.exit && (n.r !== this.tile.r || n.c !== this.tile.c));
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
