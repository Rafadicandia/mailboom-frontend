import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <aside class="h-full bg-indigo-900 text-white flex flex-col">
      <div class="p-6 border-b border-indigo-800">
        <h1 class="text-2xl font-bold flex items-center gap-2">
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          Mailboom
        </h1>
      </div>

      <nav class="flex-1 p-4 space-y-1">
        <a routerLink="/dashboard" routerLinkActive="bg-indigo-800"
           class="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-indigo-800 transition-colors">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
          Dashboard
        </a>
        <a routerLink="/campaigns" routerLinkActive="bg-indigo-800"
           class="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-indigo-800 transition-colors">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
          Campañas
        </a>
        <a routerLink="/audiences" routerLinkActive="bg-indigo-800"
           class="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-indigo-800 transition-colors">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
          Audiencias
        </a>
      </nav>

      <div class="p-4 border-t border-indigo-800">
        <div class="px-4 py-2 mb-2">
          <p class="text-sm font-medium">{{ authService.currentUser()?.name }}</p>
          <p class="text-xs text-indigo-300">{{ authService.currentUser()?.email }}</p>
        </div>
        <button (click)="authService.logout()"
                class="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-indigo-800 transition-colors text-left">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
          Cerrar Sesión
        </button>
      </div>
    </aside>
  `
})
export class SidebarComponent {
  constructor(public authService: AuthService) {}
}