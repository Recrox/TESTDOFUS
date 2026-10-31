import { Component, computed, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ITEMS, ITEMS_BY_ID } from '../../data/items.mock';
import { ItemCategory } from '../../models/item.model';
import { BankService } from '../../services/bank.service';
import { CraftService } from '../../services/craft.service';

const MIN_SLOTS = 56;

/** Catalogue complet, trié comme la banque (catégorie puis nom). */
const CATALOG = [...ITEMS].sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name));

@Component({
  selector: 'app-bank',
  imports: [RouterLink, DecimalPipe],
  templateUrl: './bank.html',
  styleUrl: './bank.scss',
})
export class Bank {
  protected readonly bank = inject(BankService);
  protected readonly craft = inject(CraftService);

  protected readonly categories: (ItemCategory | 'Tous')[] = ['Tous', 'Ressource', 'Intermédiaire', 'Consommable', 'Équipement', 'Arme'];
  protected readonly category = signal<ItemCategory | 'Tous'>('Tous');
  protected readonly search = signal('');
  protected readonly selectedId = signal<string | null>(null);

  /** `true` : tout le catalogue (ressources.json comprises), sinon uniquement les objets en banque. */
  protected readonly showAll = signal(false);
  protected readonly type = signal('');
  protected readonly catalogSize = ITEMS.length;
  protected readonly types = [...new Set(ITEMS.map((i) => i.type).filter((t) => !!t))].sort((a, b) => a!.localeCompare(b!)) as string[];

  protected readonly filtered = computed(() => {
    const cat = this.category();
    const type = this.type();
    const q = this.search().trim().toLowerCase();
    const entries = this.showAll()
      ? CATALOG.map((item) => ({ item, quantity: this.bank.quantityOf(item.id) }))
      : this.bank.entries();
    return entries.filter(
      (e) =>
        (cat === 'Tous' || e.item.category === cat) &&
        (!type || e.item.type === type) &&
        (!q || e.item.name.toLowerCase().includes(q)),
    );
  });

  protected readonly emptySlots = computed(() => Array.from({ length: Math.max(0, MIN_SLOTS - this.filtered().length) }));

  protected readonly selected = computed(() => {
    const id = this.selectedId();
    if (!id) return null;
    return { item: ITEMS_BY_ID[id], quantity: this.bank.quantityOf(id) };
  });

  protected readonly usedIn = computed(() => {
    const id = this.selectedId();
    return id ? this.craft.usedIn(id).map((r) => ITEMS_BY_ID[r.resultId]) : [];
  });

  protected readonly producedBy = computed(() => {
    const id = this.selectedId();
    return id ? this.craft.producedBy(id) : undefined;
  });

  protected itemName(id: string): string {
    return ITEMS_BY_ID[id]?.name ?? id;
  }

  protected adjust(amount: number): void {
    const id = this.selectedId();
    if (id) this.bank.add(id, amount);
  }

  protected reset(): void {
    this.bank.reset();
    this.selectedId.set(null);
  }
}
