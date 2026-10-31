import { Item, ItemCategory } from '../models/item.model';
import data from '../../../ressources.json';

/** Icône par type de ressource (ressources.json → `typeName`). */
const TYPE_ICONS: Record<string, string> = {
  'Pierre précieuse': '💎', 'Pierre brute': '🪨', Aile: '🪽', Alliage: '🔩', Minerai: '⛏️', Fruit: '🍎', Céréale: '🌾',
  Poil: '🧶', Poisson: '🐟', 'Poisson vidé': '🍣', Os: '🦴', Poudre: '🧂', "Matériel d'alchimie": '⚗️', Bois: '🪵',
  Bourgeon: '🌱', Gelée: '🍮', Plante: '🌿', Carapace: '🐚', Viande: '🍖', 'Viande conservée': '🥓', Légume: '🥕',
  Clefs: '🗝️', Fleur: '🌸', Coquille: '🐚', Cuir: '🟤', Peau: '🟫', Ecorce: '🪵', Etoffe: '🧵', 'Fantôme de Familier': '👻',
  Farine: '🥣', Graine: '🌰', Huile: '🫗', Laine: '🐑', Metaria: '🔮', Oeil: '👁️', Oeuf: '🥚', Oreille: '👂', Patte: '🐾',
  Peluche: '🧸', Planche: '📏', Plume: '🪶', 'Potion de forgemagie': '🧪', Queue: '〰️', Racine: '🫚', 'Rune de forgemagie': '🔣',
};

/** Types fabriqués à partir d'autres ressources. */
const INTERMEDIATE_TYPES = new Set(['Alliage', 'Planche', 'Farine', 'Etoffe', 'Huile']);

/** Toutes les ressources de ressources.json, identifiées par leur slug. */
const RESOURCES: Item[] = data.resources.map((r) => ({
  id: r.slug,
  name: r.name,
  icon: TYPE_ICONS[r.typeName] ?? '📦',
  category: (INTERMEDIATE_TYPES.has(r.typeName) ? 'Intermédiaire' : 'Ressource') satisfies ItemCategory,
  level: r.level,
  description: r.description,
  type: r.typeName,
  pods: r.pods,
}));

export const ITEMS: Item[] = [
  ...RESOURCES,

  // Intermédiaires
  { id: 'ferrite', name: 'Ferrite', icon: '🔩', category: 'Intermédiaire', level: 5, description: 'Un alliage de fer purifié.' },

  // Consommables
  { id: 'pain_incarnam', name: "Pain d'Incarnam", icon: '🍞', category: 'Consommable', level: 1, description: 'Rend 20 points de vie.' },
  { id: 'pain_orge', name: "Pain d'Orge", icon: '🥖', category: 'Consommable', level: 10, description: 'Rend 50 points de vie.' },
  { id: 'biere_bwork', name: 'Bière Bwork', icon: '🍺', category: 'Consommable', level: 20, description: 'Rend 80 points de vie. Et un peu de courage.' },
  { id: 'potion_soin', name: 'Potion de Soin', icon: '🧪', category: 'Consommable', level: 1, description: 'Rend 30 points de vie instantanément.' },
  { id: 'potion_rappel', name: 'Potion de Rappel', icon: '🌀', category: 'Consommable', level: 10, description: 'Vous téléporte à votre point de sauvegarde.' },
  { id: 'goujon_grille', name: 'Goujon Grillé', icon: '🍢', category: 'Consommable', level: 5, description: 'Rend 40 points de vie.' },
  { id: 'parchemin_sagesse', name: 'Parchemin de Sagesse', icon: '📜', category: 'Consommable', level: 1, description: '+1 en Sagesse de manière permanente.' },

  // Équipements
  { id: 'coiffe_bouftou', name: 'Coiffe du Bouftou', icon: '🎩', category: 'Équipement', level: 8, description: '+10 Vitalité, +5 Force.' },
  { id: 'cape_bouftou', name: 'Cape du Bouftou', icon: '🧣', category: 'Équipement', level: 10, description: '+15 Vitalité, +5 Sagesse.' },
  { id: 'amulette_bouftou', name: 'Amulette du Bouftou', icon: '📿', category: 'Équipement', level: 12, description: '+8 Force, +1 Initiative.' },
  { id: 'anneau_fer', name: 'Anneau de Fer', icon: '💍', category: 'Équipement', level: 5, description: '+5 Force.' },
  { id: 'anneau_arakne', name: 'Anneau Arakné', icon: '💍', category: 'Équipement', level: 18, description: '+10 Agilité, +5 Prospection.' },
  { id: 'bottes_tofu', name: 'Bottes du Tofu', icon: '👢', category: 'Équipement', level: 6, description: '+8 Agilité.' },

  // Armes
  { id: 'epee_boisaille', name: 'Épée de Boisaille', icon: '🗡️', category: 'Arme', level: 10, description: 'Dommages : 5 à 12 (neutre).' },
  { id: 'arc_frene', name: 'Arc de Frêne', icon: '🏹', category: 'Arme', level: 8, description: 'Dommages : 4 à 9 (air).' },
  { id: 'baton_chene', name: 'Bâton de Chêne', icon: '🪄', category: 'Arme', level: 30, description: 'Dommages : 8 à 16 (terre).' },
  { id: 'marteau_royal', name: 'Marteau du Bouftou Royal', icon: '🔨', category: 'Arme', level: 45, description: 'Dommages : 15 à 30 (terre). Légendaire !' },
];

export const ITEMS_BY_ID: Record<string, Item> = Object.fromEntries(ITEMS.map((i) => [i.id, i]));
