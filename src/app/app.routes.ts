import { Routes } from '@angular/router';
import { authGuard, adminGuard } from './core/guards/auth.guard';

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
        path: 'admin',
        children: [
          {
            path: '',
            loadComponent: () => import('./features/admin/admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent),
            canActivate: [adminGuard]
          },
          {
            path: 'user/:id',
            loadComponent: () => import('./features/admin/user-detail/user-detail.component').then(m => m.UserDetailComponent),
            canActivate: [adminGuard]
          },
          {
            path: 'contacts/:id',
            loadComponent: () => import('./features/admin/list-contacts/list-contacts.component').then(m => m.ListContactsComponent),
            canActivate: [adminGuard]
          }
        ]
      },
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
      {
        path: 'profile',
        loadComponent: () => import('./features/profile/profile.component').then(m => m.ProfileComponent)
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  }
];