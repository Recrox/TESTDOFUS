import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', title: 'Accueil · Dofus Rétro', loadComponent: () => import('./pages/home/home').then((m) => m.Home) },
  { path: 'banque', title: 'Banque · Dofus Rétro', loadComponent: () => import('./pages/bank/bank').then((m) => m.Bank) },
  { path: 'atelier', title: 'Atelier · Dofus Rétro', loadComponent: () => import('./pages/workshop/workshop').then((m) => m.Workshop) },
  { path: 'carte', title: 'Carte · Dofus Rétro', loadComponent: () => import('./pages/world/world').then((m) => m.World) },
  { path: '**', redirectTo: '' },
];
