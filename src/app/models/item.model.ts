export type ItemCategory = 'Ressource' | 'Intermédiaire' | 'Consommable' | 'Équipement' | 'Arme';

export type Profession =
  | 'Boulanger'
  | 'Alchimiste'
  | 'Bûcheron'
  | 'Mineur'
  | 'Poissonnier'
  | 'Tailleur'
  | 'Bijoutier'
  | 'Cordonnier'
  | "Forgeur d'Épées"
  | "Sculpteur d'Arcs"
  | 'Sculpteur de Bâtons';

export interface Item {
  id: string;
  name: string;
  icon: string;
  category: ItemCategory;
  level: number;
  description: string;
  /** Type précis (ex. « Céréale », « Minerai »), pour les ressources de ressources.json. */
  type?: string;
  pods?: number;
}

export interface Ingredient {
  itemId: string;
  quantity: number;
}

export interface Recipe {
  id: string;
  resultId: string;
  /** Nombre d'objets produits par fabrication. */
  quantity: number;
  profession: Profession;
  level: number;
  ingredients: Ingredient[];
}

export interface BankEntry {
  item: Item;
  quantity: number;
}
