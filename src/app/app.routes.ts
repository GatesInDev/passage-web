import { Routes } from '@angular/router';

import { authGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    title: 'Entrar · Passage',
    loadComponent: () => import('./pages/login/login').then(m => m.Login)
  },
  {
    path: 'painel',
    title: 'Painel · Passage',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/painel/painel').then(m => m.Painel)
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'painel'
  },
  {
    path: '**',
    redirectTo: 'painel'
  }
];
