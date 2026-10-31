import { Component, computed, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ITEMS_BY_ID } from '../../data/items.mock';
import { ItemCategory } from '../../models/item.model';
import { BankService } from '../../services/bank.service';
import { CraftService } from '../../services/craft.service';

const MIN_SLOTS = 56;

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

  protected readonly filtered = computed(() => {
    const cat = this.category();
    const q = this.search().trim().toLowerCase();
    return this.bank
      .entries()
      .filter((e) => (cat === 'Tous' || e.item.category === cat) && (!q || e.item.name.toLowerCase().includes(q)));
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
