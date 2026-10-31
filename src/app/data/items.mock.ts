import { Item } from '../models/item.model';

export const ITEMS: Item[] = [
  // Ressources
  { id: 'ble', name: 'Blé', icon: '🌾', category: 'Ressource', level: 1, description: 'Une céréale dorée récoltée par les paysans d’Astrub.' },
  { id: 'orge', name: 'Orge', icon: '🌾', category: 'Ressource', level: 10, description: 'Céréale robuste, idéale pour le pain et la bière.' },
  { id: 'houblon', name: 'Houblon', icon: '🌿', category: 'Ressource', level: 20, description: 'Plante grimpante appréciée des Bworks brasseurs.' },
  { id: 'eau', name: 'Eau Potable', icon: '💧', category: 'Ressource', level: 1, description: 'Une eau limpide puisée au puits du village.' },
  { id: 'sel', name: 'Sel', icon: '🧂', category: 'Ressource', level: 5, description: 'Récupéré sur les côtes de l’île de Moon.' },
  { id: 'frene', name: 'Bois de Frêne', icon: '🪵', category: 'Ressource', level: 1, description: 'Un bois souple et léger.' },
  { id: 'chene', name: 'Bois de Chêne', icon: '🪵', category: 'Ressource', level: 30, description: 'Un bois dur et noble.' },
  { id: 'fer', name: 'Minerai de Fer', icon: '⛏️', category: 'Ressource', level: 1, description: 'Le minerai le plus commun des mines d’Amakna.' },
  { id: 'cuivre', name: 'Minerai de Cuivre', icon: '🟠', category: 'Ressource', level: 20, description: 'Un minerai rougeâtre et malléable.' },
  { id: 'laine_bouftou', name: 'Laine de Bouftou', icon: '🐑', category: 'Ressource', level: 1, description: 'Une laine épaisse et bouclée.' },
  { id: 'cuir_bouftou', name: 'Cuir de Bouftou', icon: '🟤', category: 'Ressource', level: 5, description: 'Un cuir résistant, prisé des tailleurs.' },
  { id: 'laine_royale', name: 'Laine du Bouftou Royal', icon: '👑', category: 'Ressource', level: 40, description: 'Une laine rarissime, digne d’un roi.' },
  { id: 'plume_tofu', name: 'Plume de Tofu', icon: '🪶', category: 'Ressource', level: 1, description: 'Légère comme l’air, jaune comme le soleil.' },
  { id: 'gelee_fraise', name: 'Gelée Fraise', icon: '🍓', category: 'Ressource', level: 15, description: 'Un résidu sucré et collant.' },
  { id: 'ortie', name: 'Ortie', icon: '🌱', category: 'Ressource', level: 1, description: 'Pique un peu, soigne beaucoup.' },
  { id: 'sauge', name: 'Sauge', icon: '🍃', category: 'Ressource', level: 10, description: 'Une herbe aux vertus apaisantes.' },
  { id: 'trefle', name: 'Trèfle à 5 Feuilles', icon: '🍀', category: 'Ressource', level: 20, description: 'Porte bonheur, paraît-il.' },
  { id: 'goujon', name: 'Goujon', icon: '🐟', category: 'Ressource', level: 1, description: 'Petit poisson des rivières.' },
  { id: 'patte_arakne', name: "Patte d'Arakne", icon: '🕷️', category: 'Ressource', level: 5, description: 'Encore un peu gigotante...' },

  // Intermédiaires
  { id: 'planche_frene', name: 'Planche de Frêne', icon: '📏', category: 'Intermédiaire', level: 1, description: 'Une planche bien rabotée.' },
  { id: 'ferrite', name: 'Ferrite', icon: '🔩', category: 'Intermédiaire', level: 5, description: 'Un alliage de fer purifié.' },
  { id: 'bronze', name: 'Bronze', icon: '🥉', category: 'Intermédiaire', level: 20, description: 'Alliage brillant de cuivre et de fer.' },

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
