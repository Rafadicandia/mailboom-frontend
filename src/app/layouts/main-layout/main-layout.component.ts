import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterOutlet],
  template: `
    <div class="min-h-screen bg-gray-50 flex">
      <!-- Sidebar -->
      <aside class="w-64 bg-indigo-900 text-white flex flex-col flex-shrink-0">
        <!-- Logo -->
        <div class="p-6 border-b border-indigo-800">
          <h1 class="text-2xl font-bold flex items-center gap-2">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Mailboom
          </h1>
        </div>

        <!-- Navigation -->
        <nav class="flex-1 p-4 space-y-1">
          <a routerLink="/dashboard" 
             routerLinkActive="bg-indigo-800"
             class="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-indigo-800 transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            Dashboard
          </a>
          
          <a routerLink="/campaigns" 
             routerLinkActive="bg-indigo-800"
             class="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-indigo-800 transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Campañas
          </a>
          
          <a routerLink="/audiences" 
             routerLinkActive="bg-indigo-800"
             class="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-indigo-800 transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Audiencias
          </a>
        </nav>

        <!-- User Info & Logout -->
        <div class="p-4 border-t border-indigo-800">
          <div class="px-4 py-2 mb-2">
            <p class="text-sm font-medium truncate">{{ authService.currentUser()?.name || 'Usuario' }}</p>
            <p class="text-xs text-indigo-300 truncate">{{ authService.currentUser()?.email }}</p>
          </div>
          <button (click)="authService.logout()"
                  class="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-indigo-800 transition-colors text-left text-sm">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Cerrar Sesión
          </button>
        </div>
      </aside>

      <!-- Main Content -->
      <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
        <!-- Header -->
        <header class="bg-white border-b border-gray-200 px-6 py-4">
          <h2 class="text-xl font-semibold text-gray-900">Panel de Control</h2>
        </header>

        <!-- Page Content -->
        <main class="flex-1 overflow-y-auto p-6">
          <router-outlet />
        </main>
      </div>
    </div>
  `
})
export class MainLayoutComponent {
  constructor(public authService: AuthService) {}
}