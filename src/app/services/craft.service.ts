import { Injectable, computed, inject, signal } from '@angular/core';
import { ITEMS_BY_ID } from '../data/items.mock';
import { RECIPES, RECIPES_BY_ID, RECIPE_BY_RESULT } from '../data/recipes.mock';
import { Item, Recipe } from '../models/item.model';
import { BankService, Stock } from './bank.service';

const MAX_DEPTH = 4;
const MAX_CRAFTS = 999;

export interface IngredientStatus {
  item: Item;
  required: number;
  owned: number;
  /** Manque en banque, mais peut être fabriqué à partir d'autres ressources. */
  craftable: boolean;
}

export interface RecipeStatus {
  recipe: Recipe;
  result: Item;
  ingredients: IngredientStatus[];
  /** Nombre de fabrications possibles avec la banque actuelle. */
  maxCrafts: number;
  /** Part des ingrédients directs déjà possédés (0 → 1). */
  completion: number;
  /** Nombre total d'unités manquantes (ingrédients directs). */
  missing: number;
}

/**
 * Simule une fabrication en consommant `stock` (muté).
 * Si `useIntermediates`, les ingrédients manquants sont fabriqués récursivement.
 */
function simulateCraft(recipe: Recipe, stock: Stock, useIntermediates: boolean, depth = 0): boolean {
  for (const ing of recipe.ingredients) {
    const owned = stock[ing.itemId] ?? 0;
    if (owned >= ing.quantity) {
      stock[ing.itemId] = owned - ing.quantity;
      continue;
    }
    const sub = RECIPE_BY_RESULT[ing.itemId];
    if (!useIntermediates || !sub || depth >= MAX_DEPTH) return false;

    const runs = Math.ceil((ing.quantity - owned) / sub.quantity);
    for (let i = 0; i < runs; i++) {
      if (!simulateCraft(sub, stock, true, depth + 1)) return false;
      stock[ing.itemId] = (stock[ing.itemId] ?? 0) + sub.quantity;
    }
    stock[ing.itemId] -= ing.quantity;
  }
  return true;
}

/** Fabrique la recette au plus `limit` fois ; renvoie le nombre réussi et le stock restant. */
function craftMany(recipe: Recipe, stock: Stock, useIntermediates: boolean, limit = MAX_CRAFTS) {
  let current = { ...stock };
  let count = 0;
  while (count < limit) {
    const trial = { ...current };
    if (!simulateCraft(recipe, trial, useIntermediates)) break;
    current = trial;
    count++;
  }
  return { count, stock: current };
}

@Injectable({ providedIn: 'root' })
export class CraftService {
  private readonly bank = inject(BankService);

  readonly useIntermediates = signal(true);

  readonly statuses = computed<RecipeStatus[]>(() => {
    const stock = this.bank.stock();
    const useInter = this.useIntermediates();

    return RECIPES.map((recipe) => {
      let have = 0;
      let need = 0;
      const ingredients = recipe.ingredients.map((ing) => {
        const owned = stock[ing.itemId] ?? 0;
        have += Math.min(owned, ing.quantity);
        need += ing.quantity;
        const sub = RECIPE_BY_RESULT[ing.itemId];
        const craftable = owned < ing.quantity && !!sub && craftMany(sub, stock, true, 1).count > 0;
        return { item: ITEMS_BY_ID[ing.itemId], required: ing.quantity, owned, craftable };
      });

      return {
        recipe,
        result: ITEMS_BY_ID[recipe.resultId],
        ingredients,
        maxCrafts: craftMany(recipe, stock, useInter).count,
        completion: need ? have / need : 0,
        missing: need - have,
      };
    });
  });

  readonly craftable = computed(() =>
    this.statuses()
      .filter((s) => s.maxCrafts > 0)
      .sort((a, b) => b.recipe.level - a.recipe.level),
  );

  readonly almost = computed(() =>
    this.statuses()
      .filter((s) => s.maxCrafts === 0 && s.completion >= 0.5)
      .sort((a, b) => b.completion - a.completion),
  );

  /** Recettes qui utilisent cet objet comme ingrédient. */
  usedIn(itemId: string): Recipe[] {
    return RECIPES.filter((r) => r.ingredients.some((i) => i.itemId === itemId));
  }

  producedBy(itemId: string): Recipe | undefined {
    return RECIPE_BY_RESULT[itemId];
  }

  /** Fabrique `times` fois et met à jour la banque. Renvoie le nombre réellement fabriqué. */
  craft(recipeId: string, times: number): number {
    const recipe = RECIPES_BY_ID[recipeId];
    const { count, stock } = craftMany(recipe, this.bank.stock(), this.useIntermediates(), times);
    if (count > 0) {
      stock[recipe.resultId] = (stock[recipe.resultId] ?? 0) + count * recipe.quantity;
      this.bank.replace(stock);
    }
    return count;
  }
}
