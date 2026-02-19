import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterOutlet, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterOutlet],
  template: `
    <div class="min-h-screen bg-notion-bg flex">
      <!-- Sidebar -->
      <aside class="w-60 bg-notion-bg-secondary flex flex-col flex-shrink-0 border-r border-notion-border">
        <!-- Logo -->
        <div class="p-4 border-b border-notion-border">
          <h1 class="text-lg font-semibold text-notion-text flex items-center gap-2">
            <span class="w-6 h-6 bg-notion-text text-white rounded flex items-center justify-center text-sm">M</span>
            {{ isAdmin() ? 'Mailboom Admin' : 'Mailboom' }}
          </h1>
        </div>

        <!-- Navigation -->
        <nav class="flex-1 p-2 space-y-0.5">
          @if (isAdmin()) {
            <a routerLink="/admin" 
               routerLinkActive="bg-notion-bg-hover text-notion-text"
               class="flex items-center gap-2 px-3 py-2 rounded text-sm text-notion-text-secondary hover:bg-notion-bg-hover transition-colors">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
              </svg>
              Panel Admin
            </a>
          }
          
          <a routerLink="/dashboard" 
             routerLinkActive="bg-notion-bg-hover text-notion-text"
             class="flex items-center gap-2 px-3 py-2 rounded text-sm text-notion-text-secondary hover:bg-notion-bg-hover transition-colors">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            Dashboard
          </a>
          
          <a routerLink="/campaigns" 
             routerLinkActive="bg-notion-bg-hover text-notion-text"
             class="flex items-center gap-2 px-3 py-2 rounded text-sm text-notion-text-secondary hover:bg-notion-bg-hover transition-colors">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Campañas
          </a>
          
          <a routerLink="/audiences" 
             routerLinkActive="bg-notion-bg-hover text-notion-text"
             class="flex items-center gap-2 px-3 py-2 rounded text-sm text-notion-text-secondary hover:bg-notion-bg-hover transition-colors">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Audiencias
          </a>
          
          <a routerLink="/profile" 
             routerLinkActive="bg-notion-bg-hover text-notion-text"
             class="flex items-center gap-2 px-3 py-2 rounded text-sm text-notion-text-secondary hover:bg-notion-bg-hover transition-colors">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Perfil
          </a>
        </nav>

        <!-- User Info & Logout -->
        <div class="p-3 border-t border-notion-border">
          <div class="flex items-center gap-2 px-2 py-1.5 mb-2">
            <div class="w-7 h-7 bg-notion-purple rounded text-white flex items-center justify-center text-sm font-medium">
              {{ getUserInitials() }}
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-notion-text truncate">{{ authService.currentUser()?.name || 'Usuario' }}</p>
              <p class="text-xs text-notion-text-tertiary truncate">{{ authService.currentUser()?.email }}</p>
            </div>
          </div>
          <button (click)="logout()"
                  class="w-full flex items-center gap-2 px-3 py-2 rounded text-sm text-notion-text-secondary hover:bg-notion-bg-hover transition-colors text-left">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Cerrar Sesión
          </button>
        </div>
      </aside>

      <!-- Main Content -->
      <div class="flex-1 flex flex-col min-w-0">
        <!-- Header -->
        <header class="bg-white border-b border-notion-border px-6 py-4">
          <h2 class="text-xl font-semibold text-notion-text">{{ isAdmin() ? 'Panel de Administración' : 'Panel de Control' }}</h2>
        </header>

        <!-- Page Content -->
        <main class="flex-1 overflow-y-auto p-6 page-enter">
          <router-outlet />
        </main>
      </div>
    </div>
  `
})
export class MainLayoutComponent {
  constructor(public authService: AuthService, private router: Router) {}

  isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  getUserInitials(): string {
    const name = this.authService.currentUser()?.name || '';
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
