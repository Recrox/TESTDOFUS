import { Injectable, effect, signal } from '@angular/core';
import { zoneAt } from '../data/zones.mock';

export interface WorldPos {
  x: number;
  y: number;
}

const STORAGE_KEY = 'dofus-retro-player-v1';

function loadPosition(): WorldPos {
  try {
    const pos = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null') as WorldPos | null;
    if (pos && zoneAt(pos.x, pos.y)) return pos;
  } catch {
    // stockage indisponible
  }
  return { x: 0, y: 0 };
}

@Injectable({ providedIn: 'root' })
export class PlayerService {
  private readonly _position = signal<WorldPos>(loadPosition());
  readonly position = this._position.asReadonly();

  constructor() {
    effect(() => {
      const pos = this._position();
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(pos));
      } catch {
        // ignoré
      }
    });
  }

  travel(x: number, y: number): boolean {
    if (!zoneAt(x, y)) return false;
    this._position.set({ x, y });
    return true;
  }
}
