import { Component, DestroyRef, ElementRef, afterNextRender, computed, effect, inject, signal, viewChild } from '@angular/core';
import { Router } from '@angular/router';
import * as L from 'leaflet';
import { LANDMARKS, LANDMARK_TYPES, LandmarkType } from '../../data/landmarks.mock';
import { MAP_CONFIG as CFG } from '../../data/map-config';
import { biomeResources } from '../../data/world.mock';
import { ZONES, Zone, zoneAt } from '../../data/zones.mock';
import { PlayerService } from '../../services/player.service';

interface Coord {
  x: number;
  y: number;
}

const LANDMARK_KEYS = Object.keys(LANDMARK_TYPES) as LandmarkType[];

function cellToPx(x: number, y: number) {
  return { px: CFG.origin.x + x * CFG.cell.width, py: CFG.origin.y + y * CFG.cell.height };
}

function pxToCell(px: number, py: number): Coord {
  return { x: Math.floor((px - CFG.origin.x) / CFG.cell.width), y: Math.floor((py - CFG.origin.y) / CFG.cell.height) };
}

function inBounds({ x, y }: Coord): boolean {
  return x >= CFG.bounds.minX && x <= CFG.bounds.maxX && y >= CFG.bounds.minY && y <= CFG.bounds.maxY;
}

@Component({
  selector: 'app-world-map',
  templateUrl: './world-map.html',
  styleUrl: './world-map.scss',
})
export class WorldMap {
  private readonly router = inject(Router);
  protected readonly player = inject(PlayerService);
  private readonly mapEl = viewChild.required<ElementRef<HTMLDivElement>>('mapEl');

  protected readonly zones = ZONES;
  protected readonly usesTiles = !!CFG.tileUrl;
  protected readonly landmarkIcons = LANDMARK_TYPES;
  protected readonly landmarkTypes = LANDMARK_KEYS.map((type) => ({
    type,
    ...LANDMARK_TYPES[type],
    count: LANDMARKS.filter((l) => l.type === type).length,
  }));

  protected readonly showGrid = signal(true);
  protected readonly activeLayers = signal<Set<LandmarkType>>(new Set(['donjon', 'zaap']));
  protected readonly hovered = signal<Coord | null>(null);
  protected readonly selected = signal<Coord | null>(null);
  protected readonly searchError = signal(false);

  protected readonly activeSummary = computed(() =>
    this.landmarkTypes
      .filter((t) => this.activeLayers().has(t.type))
      .map((t) => `${t.label} (${t.count})`)
      .join(' · '),
  );

  protected readonly hoveredZone = computed(() => {
    const h = this.hovered();
    return h ? zoneAt(h.x, h.y) : undefined;
  });

  protected readonly selectedInfo = computed(() => {
    const cell = this.selected();
    if (!cell) return null;
    const zone = zoneAt(cell.x, cell.y);
    const pos = this.player.position();
    return {
      ...cell,
      zone,
      resources: zone ? biomeResources(zone.biome) : [],
      landmarks: LANDMARKS.filter((l) => l.x === cell.x && l.y === cell.y),
      isHere: pos.x === cell.x && pos.y === cell.y,
      distance: Math.abs(pos.x - cell.x) + Math.abs(pos.y - cell.y),
    };
  });

  private readonly ready = signal(false);
  private map!: L.Map;
  private gridLayer = L.layerGroup();
  private landmarkLayers = Object.fromEntries(LANDMARK_KEYS.map((t) => [t, L.layerGroup()])) as Record<LandmarkType, L.LayerGroup>;
  private playerMarker?: L.Marker;
  private selectionRect?: L.Rectangle;

  constructor() {
    afterNextRender(() => this.init());
    inject(DestroyRef).onDestroy(() => this.map?.remove());

    effect(() => {
      if (!this.ready()) return;
      this.toggleLayer(this.gridLayer, this.showGrid());
      const active = this.activeLayers();
      for (const type of LANDMARK_KEYS) this.toggleLayer(this.landmarkLayers[type], active.has(type));
    });

    effect(() => {
      if (!this.ready()) return;
      const { x, y } = this.player.position();
      this.playerMarker?.setLatLng(this.cellCenter(x, y));
    });

    effect(() => {
      if (!this.ready()) return;
      const cell = this.selected();
      this.selectionRect?.remove();
      this.selectionRect = cell ? L.rectangle(this.cellBounds(cell.x, cell.y), { className: 'selection-rect', interactive: false }).addTo(this.map) : undefined;
    });
  }

  protected toggleLandmark(type: LandmarkType): void {
    this.activeLayers.update((set) => {
      const next = new Set(set);
      if (!next.delete(type)) next.add(type);
      return next;
    });
  }

  protected reset(): void {
    this.selected.set(null);
    this.searchError.set(false);
    this.map.fitBounds(this.imageBounds());
  }

  protected search(value: string): void {
    const match = value.match(/^\s*\[?\s*(-?\d+)\s*[,; ]\s*(-?\d+)\s*\]?\s*$/);
    const landmark = !match && value.trim() ? LANDMARKS.find((l) => l.name.toLowerCase().includes(value.trim().toLowerCase())) : undefined;
    const cell = match ? { x: +match[1], y: +match[2] } : landmark;
    const valid = !!cell && inBounds(cell);
    this.searchError.set(!valid);
    if (valid) this.focus(cell!.x, cell!.y);
  }

  protected centerOnPlayer(): void {
    const { x, y } = this.player.position();
    this.focus(x, y);
  }

  protected travel(x: number, y: number): void {
    if (this.player.travel(x, y)) this.router.navigate(['/carte']);
  }

  private focus(x: number, y: number): void {
    this.selected.set({ x, y });
    this.map.flyTo(this.cellCenter(x, y), CFG.maxNativeZoom, { duration: 0.6 });
  }

  // --- Leaflet -------------------------------------------------------------

  private init(): void {
    this.map = L.map(this.mapEl().nativeElement, {
      crs: L.CRS.Simple,
      minZoom: 0,
      maxZoom: CFG.maxNativeZoom + 2,
      zoomSnap: 0.25,
      preferCanvas: true,
      attributionControl: false,
    });

    const bounds = this.imageBounds();
    this.map.setMaxBounds(bounds.pad(0.25));

    if (CFG.tileUrl) {
      L.tileLayer(CFG.tileUrl, { bounds, noWrap: true, maxNativeZoom: CFG.maxNativeZoom, minZoom: 0 }).addTo(this.map);
    } else {
      this.drawMockWorld();
    }

    this.drawGrid();
    this.drawLandmarks();

    this.playerMarker = L.marker([0, 0], {
      icon: L.divIcon({ className: 'player-pin', html: '<span></span>', iconSize: [18, 18] }),
      interactive: false,
      zIndexOffset: 1000,
    }).addTo(this.map);

    this.map.on('mousemove', (e: L.LeafletMouseEvent) => {
      const cell = this.latLngToCell(e.latlng);
      const prev = this.hovered();
      if (!inBounds(cell)) this.hovered.set(null);
      else if (!prev || prev.x !== cell.x || prev.y !== cell.y) this.hovered.set(cell);
    });
    this.map.on('mouseout', () => this.hovered.set(null));
    this.map.on('click', (e: L.LeafletMouseEvent) => {
      const cell = this.latLngToCell(e.latlng);
      this.selected.set(inBounds(cell) ? cell : null);
    });

    this.map.fitBounds(bounds);
    const { x, y } = this.player.position();
    this.map.setView(this.cellCenter(x, y), 1.5);
    this.ready.set(true);
  }

  private drawMockWorld(): void {
    const { minX, maxX, minY, maxY } = CFG.bounds;
    for (let y = minY; y <= maxY; y++) {
      for (let x = minX; x <= maxX; x++) {
        const zone = zoneAt(x, y);
        if (zone) {
          L.rectangle(this.cellBounds(x, y), { stroke: false, fillColor: zone.color, fillOpacity: 1, interactive: false }).addTo(this.map);
        }
      }
    }
    for (const zone of ZONES) {
      const [x1, y1, x2, y2] = zone.rects[0];
      L.marker(this.cellCenter((x1 + x2) / 2, (y1 + y2) / 2), {
        icon: L.divIcon({ className: 'zone-label', html: zone.name, iconSize: [160, 20] }),
        interactive: false,
      }).addTo(this.map);
    }
  }

  private drawGrid(): void {
    const { minX, maxX, minY, maxY } = CFG.bounds;
    const style: L.PolylineOptions = { color: '#24180c', weight: 1, opacity: 0.25, interactive: false };
    for (let x = minX; x <= maxX + 1; x++) {
      L.polyline([this.pxToLatLng(cellToPx(x, minY)), this.pxToLatLng(cellToPx(x, maxY + 1))], style).addTo(this.gridLayer);
    }
    for (let y = minY; y <= maxY + 1; y++) {
      L.polyline([this.pxToLatLng(cellToPx(minX, y)), this.pxToLatLng(cellToPx(maxX + 1, y))], style).addTo(this.gridLayer);
    }
  }

  private drawLandmarks(): void {
    for (const l of LANDMARKS) {
      L.marker(this.cellCenter(l.x, l.y), {
        icon: L.divIcon({ className: `landmark landmark-${l.type}`, html: LANDMARK_TYPES[l.type].icon, iconSize: [26, 26] }),
      })
        .bindTooltip(`${l.name} [${l.x}, ${l.y}]`, { direction: 'top', offset: [0, -12] })
        .on('click', () => this.selected.set({ x: l.x, y: l.y }))
        .addTo(this.landmarkLayers[l.type]);
    }
  }

  private toggleLayer(layer: L.Layer, visible: boolean): void {
    if (visible && !this.map.hasLayer(layer)) layer.addTo(this.map);
    if (!visible && this.map.hasLayer(layer)) layer.remove();
  }

  private pxToLatLng({ px, py }: { px: number; py: number }): L.LatLng {
    return this.map.unproject([px, py], CFG.maxNativeZoom);
  }

  private latLngToCell(latlng: L.LatLng): Coord {
    const p = this.map.project(latlng, CFG.maxNativeZoom);
    return pxToCell(p.x, p.y);
  }

  private cellCenter(x: number, y: number): L.LatLng {
    const { px, py } = cellToPx(x, y);
    return this.pxToLatLng({ px: px + CFG.cell.width / 2, py: py + CFG.cell.height / 2 });
  }

  private cellBounds(x: number, y: number): L.LatLngBounds {
    return L.latLngBounds(this.pxToLatLng(cellToPx(x, y)), this.pxToLatLng(cellToPx(x + 1, y + 1)));
  }

  private imageBounds(): L.LatLngBounds {
    return L.latLngBounds(this.pxToLatLng({ px: 0, py: CFG.height }), this.pxToLatLng({ px: CFG.width, py: 0 }));
  }
}
