import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: 'events', loadComponent: () => import('./sse.component').then((m) => m.SseComponent) },
  { path: '', redirectTo: '/events', pathMatch: 'full' },
  { path: '**', redirectTo: '/events' },
];
