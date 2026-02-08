import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register.component').then(m => m.RegisterComponent)
  },
  {
    path: '',
    loadComponent: () => import('./layouts/main-layout/main-layout.component').then(m => m.MainLayoutComponent),
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'campaigns',
        children: [
          {
            path: '',
            loadComponent: () => import('./features/campaigns/campaign-list/campaign-list.component').then(m => m.CampaignListComponent)
          },
          {
            path: 'new',
            loadComponent: () => import('./features/campaigns/campaign-wizard/campaign-wizard.component').then(m => m.CampaignWizardComponent)
          }
        ]
      },
      {
        path: 'audiences',
        loadComponent: () => import('./features/audiences/contact-list.component').then(m => m.ContactListComponent)
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  }
];