import { Component, computed, inject, input, linkedSignal, signal } from '@angular/core';
import { PercentPipe } from '@angular/common';
import { Profession } from '../../models/item.model';
import { CraftService, RecipeStatus } from '../../services/craft.service';

type Mode = 'craftable' | 'almost' | 'all';

@Component({
  selector: 'app-workshop',
  imports: [PercentPipe],
  templateUrl: './workshop.html',
  styleUrl: './workshop.scss',
})
export class Workshop {
  protected readonly craft = inject(CraftService);

  /** Query param ?q= (ex. depuis la banque). */
  readonly q = input<string>();

  protected readonly search = linkedSignal(() => this.q() ?? '');
  protected readonly mode = linkedSignal<Mode>(() => (this.q() ? 'all' : 'craftable'));
  protected readonly profession = signal<Profession | 'Tous'>('Tous');
  protected readonly toast = signal<string | null>(null);
  private toastTimer?: ReturnType<typeof setTimeout>;

  protected readonly professions = computed(() => [
    'Tous' as const,
    ...new Set(this.craft.statuses().map((s) => s.recipe.profession)),
  ]);

  protected readonly visible = computed<RecipeStatus[]>(() => {
    const source = {
      craftable: this.craft.craftable(),
      almost: this.craft.almost(),
      all: [...this.craft.statuses()].sort((a, b) => b.maxCrafts - a.maxCrafts || b.completion - a.completion),
    }[this.mode()];
    const prof = this.profession();
    const q = this.search().trim().toLowerCase();
    return source.filter(
      (s) =>
        (prof === 'Tous' || s.recipe.profession === prof) &&
        (!q || s.result.name.toLowerCase().includes(q) || s.ingredients.some((i) => i.item.name.toLowerCase().includes(q))),
    );
  });

  protected doCraft(status: RecipeStatus, times: number): void {
    const made = this.craft.craft(status.recipe.id, times);
    const total = made * status.recipe.quantity;
    this.showToast(made ? `✨ ${total} × ${status.result.name} fabriqué${total > 1 ? 's' : ''} !` : 'Ingrédients insuffisants.');
  }

  private showToast(message: string): void {
    this.toast.set(message);
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => this.toast.set(null), 2500);
  }
}
