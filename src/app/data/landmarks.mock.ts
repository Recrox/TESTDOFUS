export type LandmarkType = 'donjon' | 'zaap' | 'atelier' | 'hdv';

export interface Landmark {
  type: LandmarkType;
  name: string;
  x: number;
  y: number;
}

export const LANDMARK_TYPES: Record<LandmarkType, { label: string; icon: string }> = {
  donjon: { label: 'Donjons', icon: '💀' },
  zaap: { label: 'Zaaps', icon: '🌀' },
  atelier: { label: 'Ateliers', icon: '⚒️' },
  hdv: { label: 'HDV', icon: '⚖️' },
};

export const LANDMARKS: Landmark[] = [
  { type: 'zaap', name: 'Zaap des Remparts', x: 0, y: 0 },
  { type: 'zaap', name: 'Zaap de la Citadelle', x: -18, y: -14 },
  { type: 'zaap', name: 'Zaap de la Forteresse', x: -14, y: 20 },
  { type: 'zaap', name: 'Zaap du Campement', x: -7, y: -8 },
  { type: 'zaap', name: 'Zaap des Champs', x: -13, y: -10 },
  { type: 'zaap', name: 'Zaap du Désert', x: -7, y: 3 },
  { type: 'zaap', name: 'Zaap de la Vallée', x: -8, y: 9 },
  { type: 'zaap', name: 'Zaap des Dunes', x: 2, y: 12 },
  { type: 'zaap', name: 'Zaap de l’Arbre-Monde', x: -27, y: 12 },
  { type: 'zaap', name: 'Zaap des Collines', x: 11, y: -8 },

  { type: 'donjon', name: 'Labyrinthe Ancien', x: -3, y: 14 },
  { type: 'donjon', name: 'Ruines Calcinées', x: -7, y: -16 },
  { type: 'donjon', name: 'Gouffre des Rocs', x: -13, y: -3 },
  { type: 'donjon', name: 'Antre de Lave', x: -8, y: 18 },
  { type: 'donjon', name: 'Bourbier Noir', x: -7, y: 22 },
  { type: 'donjon', name: 'Sapin Gelé', x: -33, y: -31 },
  { type: 'donjon', name: 'Arène du Taureau', x: -22, y: 1 },
  { type: 'donjon', name: 'Croissant de Lune', x: 14, y: 10 },
  { type: 'donjon', name: 'Tanière de la Griffe', x: 10, y: 5 },

  { type: 'atelier', name: 'Atelier des Tailleurs', x: 1, y: 0 },
  { type: 'atelier', name: 'Forge de la Citadelle', x: -17, y: -14 },
  { type: 'atelier', name: 'Fonderie Ardente', x: -13, y: 21 },
  { type: 'atelier', name: 'Scierie de l’Arbre-Monde', x: -26, y: 13 },
  { type: 'atelier', name: 'Taillerie des Rocs', x: -10, y: -4 },
  { type: 'atelier', name: 'Poissonnerie', x: 4, y: 16 },

  { type: 'hdv', name: 'Hôtel de Vente des Ressources', x: -1, y: 1 },
  { type: 'hdv', name: 'Hôtel de Vente des Équipements', x: 1, y: 1 },
  { type: 'hdv', name: 'Hôtel de Vente de la Citadelle', x: -19, y: -13 },
];
