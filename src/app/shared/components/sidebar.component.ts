import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <aside [class]="getSidebarClass()">
      <div class="p-6 border-b" [class.border-indigo-800]="!isAdmin()" [class.border-slate-700]="isAdmin()">
        <h1 class="text-2xl font-bold flex items-center gap-2">
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          {{ isAdmin() ? 'Mailboom Admin' : 'Mailboom' }}
        </h1>
      </div>

      <nav class="flex-1 p-4 space-y-1">
        @if (isAdmin()) {
          <a routerLink="/admin" routerLinkActive="bg-slate-700"
             class="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-700 transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" /></svg>
            Panel Admin
          </a>
        }
        <a routerLink="/dashboard" [routerLinkActive]="isAdmin() ? 'bg-slate-700' : 'bg-indigo-800'"
           class="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors"
           [class]="isAdmin() ? 'hover:bg-slate-700' : 'hover:bg-indigo-800'">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
          Dashboard
        </a>
        <a routerLink="/campaigns" [routerLinkActive]="isAdmin() ? 'bg-slate-700' : 'bg-indigo-800'"
           class="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors"
           [class]="isAdmin() ? 'hover:bg-slate-700' : 'hover:bg-indigo-800'">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
          Campañas
        </a>
        <a routerLink="/audiences" [routerLinkActive]="isAdmin() ? 'bg-slate-700' : 'bg-indigo-800'"
           class="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors"
           [class]="isAdmin() ? 'hover:bg-slate-700' : 'hover:bg-indigo-800'">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
          Audiencias
        </a>
        <a routerLink="/profile" [routerLinkActive]="isAdmin() ? 'bg-slate-700' : 'bg-indigo-800'"
           class="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors"
           [class]="isAdmin() ? 'hover:bg-slate-700' : 'hover:bg-indigo-800'">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
          Perfil
        </a>
      </nav>

      <div class="p-4 border-t" [class.border-indigo-800]="!isAdmin()" [class.border-slate-700]="isAdmin()">
        <div class="px-4 py-2 mb-2">
          <p class="text-sm font-medium">{{ authService.currentUser()?.name }}</p>
          <p class="text-xs" [class.text-indigo-300]="!isAdmin()" [class.text-slate-400]="isAdmin()">{{ authService.currentUser()?.email }}</p>
        </div>
        <button (click)="logout()"
                class="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left"
                [class]="isAdmin() ? 'hover:bg-slate-700' : 'hover:bg-indigo-800'">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
          Cerrar Sesión
        </button>
      </div>
    </aside>
  `
})
export class SidebarComponent {
  constructor(public authService: AuthService, private router: Router) {}

  isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  getSidebarClass(): string {
    return this.isAdmin()
      ? 'h-full bg-slate-900 text-white flex flex-col'
      : 'h-full bg-indigo-900 text-white flex flex-col';
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}