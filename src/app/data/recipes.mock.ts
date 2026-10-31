import { Recipe } from '../models/item.model';

export const RECIPES: Recipe[] = [
  // Boulanger
  { id: 'r_pain_incarnam', resultId: 'pain_incarnam', quantity: 1, profession: 'Boulanger', level: 1, ingredients: [{ itemId: 'ble', quantity: 4 }, { itemId: 'eau', quantity: 1 }] },
  { id: 'r_pain_orge', resultId: 'pain_orge', quantity: 1, profession: 'Boulanger', level: 10, ingredients: [{ itemId: 'orge', quantity: 4 }, { itemId: 'eau', quantity: 1 }, { itemId: 'sel', quantity: 1 }] },
  { id: 'r_biere_bwork', resultId: 'biere_bwork', quantity: 1, profession: 'Boulanger', level: 20, ingredients: [{ itemId: 'houblon', quantity: 3 }, { itemId: 'orge', quantity: 2 }, { itemId: 'eau', quantity: 1 }] },

  // Alchimiste
  { id: 'r_potion_soin', resultId: 'potion_soin', quantity: 2, profession: 'Alchimiste', level: 1, ingredients: [{ itemId: 'ortie', quantity: 2 }, { itemId: 'eau', quantity: 1 }] },
  { id: 'r_potion_rappel', resultId: 'potion_rappel', quantity: 1, profession: 'Alchimiste', level: 10, ingredients: [{ itemId: 'sauge', quantity: 2 }, { itemId: 'trefle', quantity: 1 }, { itemId: 'eau', quantity: 1 }] },

  // Poissonnier
  { id: 'r_goujon_grille', resultId: 'goujon_grille', quantity: 1, profession: 'Poissonnier', level: 5, ingredients: [{ itemId: 'goujon', quantity: 2 }, { itemId: 'sel', quantity: 1 }] },

  // Bûcheron / Mineur (intermédiaires)
  { id: 'r_planche_frene', resultId: 'planche_frene', quantity: 1, profession: 'Bûcheron', level: 1, ingredients: [{ itemId: 'frene', quantity: 5 }] },
  { id: 'r_ferrite', resultId: 'ferrite', quantity: 1, profession: 'Mineur', level: 5, ingredients: [{ itemId: 'fer', quantity: 4 }] },
  { id: 'r_bronze', resultId: 'bronze', quantity: 1, profession: 'Mineur', level: 20, ingredients: [{ itemId: 'cuivre', quantity: 2 }, { itemId: 'fer', quantity: 2 }] },

  // Tailleur
  { id: 'r_coiffe_bouftou', resultId: 'coiffe_bouftou', quantity: 1, profession: 'Tailleur', level: 8, ingredients: [{ itemId: 'laine_bouftou', quantity: 5 }, { itemId: 'cuir_bouftou', quantity: 2 }, { itemId: 'plume_tofu', quantity: 1 }] },
  { id: 'r_cape_bouftou', resultId: 'cape_bouftou', quantity: 1, profession: 'Tailleur', level: 10, ingredients: [{ itemId: 'laine_bouftou', quantity: 6 }, { itemId: 'cuir_bouftou', quantity: 4 }, { itemId: 'gelee_fraise', quantity: 2 }] },

  // Bijoutier
  { id: 'r_amulette_bouftou', resultId: 'amulette_bouftou', quantity: 1, profession: 'Bijoutier', level: 12, ingredients: [{ itemId: 'laine_bouftou', quantity: 3 }, { itemId: 'fer', quantity: 2 }, { itemId: 'trefle', quantity: 1 }] },
  { id: 'r_anneau_fer', resultId: 'anneau_fer', quantity: 1, profession: 'Bijoutier', level: 5, ingredients: [{ itemId: 'fer', quantity: 3 }, { itemId: 'cuivre', quantity: 1 }] },
  { id: 'r_anneau_arakne', resultId: 'anneau_arakne', quantity: 1, profession: 'Bijoutier', level: 18, ingredients: [{ itemId: 'patte_arakne', quantity: 4 }, { itemId: 'bronze', quantity: 1 }] },

  // Cordonnier
  { id: 'r_bottes_tofu', resultId: 'bottes_tofu', quantity: 1, profession: 'Cordonnier', level: 6, ingredients: [{ itemId: 'plume_tofu', quantity: 4 }, { itemId: 'cuir_bouftou', quantity: 2 }] },

  // Armes
  { id: 'r_epee_boisaille', resultId: 'epee_boisaille', quantity: 1, profession: "Forgeur d'Épées", level: 10, ingredients: [{ itemId: 'planche_frene', quantity: 2 }, { itemId: 'ferrite', quantity: 3 }] },
  { id: 'r_arc_frene', resultId: 'arc_frene', quantity: 1, profession: "Sculpteur d'Arcs", level: 8, ingredients: [{ itemId: 'planche_frene', quantity: 3 }, { itemId: 'plume_tofu', quantity: 2 }] },
  { id: 'r_baton_chene', resultId: 'baton_chene', quantity: 1, profession: 'Sculpteur de Bâtons', level: 30, ingredients: [{ itemId: 'chene', quantity: 6 }, { itemId: 'gelee_fraise', quantity: 2 }] },
  { id: 'r_marteau_royal', resultId: 'marteau_royal', quantity: 1, profession: "Forgeur d'Épées", level: 45, ingredients: [{ itemId: 'laine_royale', quantity: 3 }, { itemId: 'bronze', quantity: 2 }, { itemId: 'chene', quantity: 4 }] },
];

export const RECIPES_BY_ID: Record<string, Recipe> = Object.fromEntries(RECIPES.map((r) => [r.id, r]));

export const RECIPE_BY_RESULT: Record<string, Recipe> = Object.fromEntries(RECIPES.map((r) => [r.resultId, r]));
