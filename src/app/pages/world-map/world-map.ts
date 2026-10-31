import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { biomeResources } from '../../data/world.mock';
import { WORLD_BOUNDS, ZONES, Zone, zoneAt } from '../../data/zones.mock';
import { PlayerService } from '../../services/player.service';

const CELL = 24;
const COLS = WORLD_BOUNDS.maxX - WORLD_BOUNDS.minX + 1;
const ROWS = WORLD_BOUNDS.maxY - WORLD_BOUNDS.minY + 1;
const WIDTH = COLS * CELL;
const HEIGHT = ROWS * CELL;
const DRAG_THRESHOLD = 4;

interface MapCell {
  x: number;
  y: number;
  zone: Zone;
  px: number;
  py: number;
}

interface View {
  x: number;
  y: number;
  w: number;
}

function toPx(x: number, y: number) {
  return { px: (x - WORLD_BOUNDS.minX) * CELL, py: (y - WORLD_BOUNDS.minY) * CELL };
}

const CELLS: MapCell[] = [];
for (let y = WORLD_BOUNDS.minY; y <= WORLD_BOUNDS.maxY; y++) {
  for (let x = WORLD_BOUNDS.minX; x <= WORLD_BOUNDS.maxX; x++) {
    const zone = zoneAt(x, y);
    if (zone) CELLS.push({ x, y, zone, ...toPx(x, y) });
  }
}

const ZONE_LABELS = ZONES.map((zone) => {
  const cells = CELLS.filter((c) => c.zone === zone);
  return {
    zone,
    px: cells.reduce((s, c) => s + c.px, 0) / cells.length + CELL / 2,
    py: cells.reduce((s, c) => s + c.py, 0) / cells.length + CELL / 2,
  };
});

@Component({
  selector: 'app-world-map',
  templateUrl: './world-map.html',
  styleUrl: './world-map.scss',
})
export class WorldMap {
  private readonly router = inject(Router);
  protected readonly player = inject(PlayerService);

  protected readonly cell = CELL;
  protected readonly cells = CELLS;
  protected readonly zoneLabels = ZONE_LABELS;
  protected readonly aspect = `${WIDTH} / ${HEIGHT}`;

  protected readonly view = signal<View>({ x: 0, y: 0, w: WIDTH });
  protected readonly hovered = signal<MapCell | null>(null);
  protected readonly selected = signal<MapCell | null>(null);
  protected readonly searchError = signal(false);

  protected readonly viewBox = computed(() => {
    const v = this.view();
    return `${v.x} ${v.y} ${v.w} ${(v.w * HEIGHT) / WIDTH}`;
  });

  protected readonly zoomLevel = computed(() => Math.round((WIDTH / this.view().w) * 100));

  protected readonly playerPx = computed(() => {
    const { x, y } = this.player.position();
    const { px, py } = toPx(x, y);
    return { px: px + CELL / 2, py: py + CELL / 2 };
  });

  protected readonly selectedInfo = computed(() => {
    const cell = this.selected();
    if (!cell) return null;
    const pos = this.player.position();
    return {
      ...cell,
      resources: biomeResources(cell.zone.biome),
      isHere: pos.x === cell.x && pos.y === cell.y,
      distance: Math.abs(pos.x - cell.x) + Math.abs(pos.y - cell.y),
    };
  });

  private drag: { startX: number; startY: number; view: View; moved: boolean } | null = null;
  private suppressClick = false;

  constructor() {
    this.centerOnPlayer(2);
  }

  protected onWheel(event: WheelEvent): void {
    event.preventDefault();
    const rect = (event.currentTarget as SVGSVGElement).getBoundingClientRect();
    this.zoom(event.deltaY > 0 ? 1.15 : 1 / 1.15, (event.clientX - rect.left) / rect.width, (event.clientY - rect.top) / rect.height);
  }

  protected zoom(factor: number, fx = 0.5, fy = 0.5): void {
    const v = this.view();
    const h = (v.w * HEIGHT) / WIDTH;
    const w = Math.min(WIDTH * 1.2, Math.max(WIDTH / 8, v.w * factor));
    const mx = v.x + fx * v.w;
    const my = v.y + fy * h;
    this.view.set({ x: mx - fx * w, y: my - fy * ((w * HEIGHT) / WIDTH), w });
  }

  protected onPointerDown(event: PointerEvent): void {
    if (event.button !== 0) return;
    this.drag = { startX: event.clientX, startY: event.clientY, view: this.view(), moved: false };
  }

  protected onPointerMove(event: PointerEvent): void {
    if (!this.drag) return;
    const dx = event.clientX - this.drag.startX;
    const dy = event.clientY - this.drag.startY;
    if (!this.drag.moved && Math.hypot(dx, dy) < DRAG_THRESHOLD) return;
    if (!this.drag.moved) (event.currentTarget as SVGSVGElement).setPointerCapture(event.pointerId);
    this.drag.moved = true;
    const rect = (event.currentTarget as SVGSVGElement).getBoundingClientRect();
    const scale = this.drag.view.w / rect.width;
    this.view.set({ ...this.drag.view, x: this.drag.view.x - dx * scale, y: this.drag.view.y - dy * scale });
  }

  protected onPointerUp(): void {
    this.suppressClick = !!this.drag?.moved;
    this.drag = null;
  }

  protected onCellClick(cell: MapCell): void {
    if (this.suppressClick) {
      this.suppressClick = false;
      return;
    }
    this.selected.set(cell);
  }

  protected search(value: string): void {
    const match = value.match(/^\s*\[?\s*(-?\d+)\s*[,; ]\s*(-?\d+)\s*\]?\s*$/);
    const cell = match && CELLS.find((c) => c.x === +match[1] && c.y === +match[2]);
    this.searchError.set(!cell);
    if (cell) {
      this.selected.set(cell);
      this.centerOn(cell.px + CELL / 2, cell.py + CELL / 2, 3);
    }
  }

  protected focusZone(zone: Zone): void {
    const label = ZONE_LABELS.find((l) => l.zone === zone)!;
    this.centerOn(label.px, label.py, 1.6);
  }

  protected centerOnPlayer(zoom = this.zoomLevel() / 100): void {
    const { px, py } = this.playerPx();
    this.centerOn(px, py, zoom);
  }

  protected resetView(): void {
    this.view.set({ x: 0, y: 0, w: WIDTH });
  }

  protected travel(cell: MapCell): void {
    if (this.player.travel(cell.x, cell.y)) this.router.navigate(['/carte']);
  }

  private centerOn(px: number, py: number, zoom: number): void {
    const w = WIDTH / zoom;
    this.view.set({ x: px - w / 2, y: py - (w * HEIGHT) / WIDTH / 2, w });
  }
}
