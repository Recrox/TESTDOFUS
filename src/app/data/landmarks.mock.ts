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
  { type: 'zaap', name: 'Zaap du Bourg', x: 0, y: 0 },
  { type: 'zaap', name: 'Zaap des Champs', x: -6, y: 4 },
  { type: 'zaap', name: 'Zaap de la Forêt', x: -12, y: -3 },
  { type: 'zaap', name: 'Zaap des Monts', x: 2, y: -10 },
  { type: 'zaap', name: 'Zaap du Marais', x: 10, y: 6 },
  { type: 'zaap', name: 'Zaap du Port', x: 9, y: -4 },

  { type: 'donjon', name: 'Bergerie Maudite', x: 4, y: 5 },
  { type: 'donjon', name: 'Terrier des Ronces', x: -14, y: -8 },
  { type: 'donjon', name: 'Galerie Rouillée', x: 6, y: -13 },
  { type: 'donjon', name: 'Antre Vaseux', x: 13, y: 10 },
  { type: 'donjon', name: 'Épave Hantée', x: 11, y: -8 },

  { type: 'atelier', name: 'Atelier des Tailleurs', x: 1, y: -1 },
  { type: 'atelier', name: 'Scierie', x: -10, y: 1 },
  { type: 'atelier', name: 'Forge des Monts', x: 0, y: -8 },
  { type: 'atelier', name: 'Poissonnerie', x: 2, y: 9 },

  { type: 'hdv', name: 'Hôtel de Vente des Ressources', x: -1, y: 1 },
  { type: 'hdv', name: 'Hôtel de Vente des Équipements', x: 1, y: 1 },
];
