import { Injectable, computed, effect, signal } from '@angular/core';
import { BANK_MOCK, KAMAS_MOCK } from '../data/bank.mock';
import { ITEMS_BY_ID } from '../data/items.mock';
import { BankEntry } from '../models/item.model';

export type Stock = Record<string, number>;

const STORAGE_KEY = 'dofus-retro-bank-v1';

function loadStock(): Stock {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Stock;
  } catch {
    // stockage indisponible : on retombe sur le mock
  }
  return { ...BANK_MOCK };
}

@Injectable({ providedIn: 'root' })
export class BankService {
  private readonly _stock = signal<Stock>(loadStock());

  readonly stock = this._stock.asReadonly();
  readonly kamas = signal(KAMAS_MOCK);

  readonly entries = computed<BankEntry[]>(() =>
    Object.entries(this._stock())
      .filter(([id, qty]) => qty > 0 && ITEMS_BY_ID[id])
      .map(([id, quantity]) => ({ item: ITEMS_BY_ID[id], quantity }))
      .sort((a, b) => a.item.category.localeCompare(b.item.category) || a.item.name.localeCompare(b.item.name)),
  );

  readonly totalItems = computed(() => this.entries().reduce((sum, e) => sum + e.quantity, 0));

  constructor() {
    effect(() => {
      const stock = this._stock();
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(stock));
      } catch {
        // ignoré
      }
    });
  }

  quantityOf(itemId: string): number {
    return this._stock()[itemId] ?? 0;
  }

  add(itemId: string, amount: number): void {
    this._stock.update((s) => ({ ...s, [itemId]: Math.max(0, (s[itemId] ?? 0) + amount) }));
  }

  replace(stock: Stock): void {
    this._stock.set({ ...stock });
  }

  reset(): void {
    this._stock.set({ ...BANK_MOCK });
  }
}
