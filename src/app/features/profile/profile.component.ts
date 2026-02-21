import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { UserService, UpdateUserRequest } from '../../core/services/user.service';
import { User } from '../../core/models/auth.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="max-w-5xl mx-auto py-8 px-6">
      <!-- Header estilo Notion limpio -->
      <div class="mb-10">
        <div class="flex items-center gap-3 mb-1">
          <h1 class="text-3xl font-semibold" style="color: #37352F;">Perfil</h1>
        </div>
        <p class="text-base" style="color: #787774;">Gestiona tu información personal y preferencias</p>
      </div>

      @if (message()) {
        <div class="mb-6 p-4 rounded-lg" 
             [style.background-color]="isError() ? 'rgba(224, 62, 62, 0.1)' : 'rgba(15, 123, 108, 0.1)'">
          <p class="text-sm" [style.color]="isError() ? '#E03E3E' : '#0F7B6C'">{{ message() }}</p>
        </div>
      }

      <!-- Stats Grid estilo Notion sin bordes -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
        <div class="group cursor-default">
          <div class="flex items-center gap-3 mb-2">
            <div class="w-9 h-9 rounded-lg flex items-center justify-center" style="background-color: #F7F6F3;">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="color: #787774;">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
              </svg>
            </div>
            <span class="text-sm" style="color: #787774;">Rol</span>
          </div>
          <p class="text-2xl font-semibold" style="color: #37352F;">{{ currentUser()?.role || 'USER' }}</p>
        </div>

        <div class="group cursor-default">
          <div class="flex items-center gap-3 mb-2">
            <div class="w-9 h-9 rounded-lg flex items-center justify-center" style="background-color: #F7F6F3;">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="color: #787774;">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <span class="text-sm" style="color: #787774;">Plan</span>
          </div>
          <p class="text-2xl font-semibold" style="color: #9065B0;">{{ currentUser()?.plan || 'FREE' }}</p>
        </div>

        <div class="group cursor-default">
          <div class="flex items-center gap-3 mb-2">
            <div class="w-9 h-9 rounded-lg flex items-center justify-center" style="background-color: #F7F6F3;">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="color: #787774;">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
              </svg>
            </div>
            <span class="text-sm" style="color: #787774;">Emails</span>
          </div>
          <p class="text-2xl font-semibold" style="color: #0F7B6C;">{{ currentUser()?.emailsSent || 0 }}</p>
        </div>

        <div class="group cursor-default">
          <div class="flex items-center gap-3 mb-2">
            <div class="w-9 h-9 rounded-lg flex items-center justify-center" style="background-color: #F7F6F3;">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="color: #787774;">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
            </div>
            <span class="text-sm" style="color: #787774;">Desde</span>
          </div>
          <p class="text-2xl font-semibold" style="color: #37352F;">{{ getMemberSince() }}</p>
        </div>
      </div>

      <!-- Información Personal -->
      <div class="mb-6">
        <h2 class="text-lg font-medium mb-4" style="color: #37352F;">Información Personal</h2>
        
        @if (isLoading()) {
          <div class="flex justify-center py-8">
            <div class="animate-spin rounded-full h-5 w-5" style="border: 2px solid #E9E9E7; border-top-color: #37352F;"></div>
          </div>
        } @else if (isEditing()) {
          <div class="p-4 rounded-lg" style="background-color: #F7F6F3;">
            <form [formGroup]="personalForm" class="space-y-4">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium mb-1" style="color: #37352F;">Nombre</label>
                  <input type="text" formControlName="name" 
                         class="w-full px-4 py-2 text-sm rounded-lg focus:outline-none"
                         style="border: 1px solid #E9E9E7; color: #37352F; background-color: white;">
                </div>
                <div>
                  <label class="block text-sm font-medium mb-1" style="color: #37352F;">Email</label>
                  <input type="email" formControlName="email" 
                         class="w-full px-4 py-2 text-sm rounded-lg focus:outline-none"
                         style="border: 1px solid #E9E9E7; color: #37352F; background-color: white;">
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium mb-1" style="color: #37352F;">Nueva Contraseña</label>
                <input type="password" formControlName="password" placeholder="Dejar vacío para mantener la actual" 
                       class="w-full px-4 py-2 text-sm rounded-lg focus:outline-none"
                       style="border: 1px solid #E9E9E7; color: #37352F; background-color: white;">
              </div>
              <div class="flex justify-end gap-2 pt-2">
                <button type="button" (click)="cancelEdit()" 
                        class="px-4 py-2 rounded text-sm transition-colors hover:bg-[#EBEBEA]"
                        style="color: #37352F;">
                  Cancelar
                </button>
                <button type="button" (click)="savePersonalData()" [disabled]="!personalForm.valid || isSaving()" 
                        class="px-4 py-2 rounded text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        style="background-color: #37352F; color: white;">
                  @if (isSaving()) {
                    <span class="inline-flex items-center">
                      <svg class="w-4 h-4 animate-spin mr-2" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Guardando...
                    </span>
                  } @else {
                    Guardar
                  }
                </button>
              </div>
            </form>
          </div>
        } @else {
          <div class="space-y-1">
            <div class="flex items-center justify-between py-3 px-2 rounded-lg transition-colors hover:bg-[#F7F6F3]">
              <div class="flex items-center gap-3 flex-1 min-w-0">
                <div class="w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium text-white" style="background-color: #9065B0;">
                  {{ getInitials() }}
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium truncate" style="color: #37352F;">{{ currentUser()?.name }}</p>
                  <p class="text-xs truncate" style="color: #9B9A97;">{{ currentUser()?.email }}</p>
                </div>
              </div>
              <button (click)="startEdit()" class="text-xs hover:underline" style="color: #529CCA;">
                Editar
              </button>
            </div>
          </div>
        }
      </div>

      <!-- Preferencias -->
      <div class="mb-6">
        <h2 class="text-lg font-medium mb-4" style="color: #37352F;">Preferencias</h2>
        
        <div class="space-y-1">
          <div class="flex items-center justify-between py-3 px-2 rounded-lg transition-colors hover:bg-[#F7F6F3]">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-lg flex items-center justify-center" style="background-color: #F7F6F3;">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="color: #787774;">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
                </svg>
              </div>
              <div>
                <p class="text-sm font-medium" style="color: #37352F;">Notificaciones por email</p>
                <p class="text-xs" style="color: #9B9A97;">Recibe actualizaciones sobre tus campañas</p>
              </div>
            </div>
            <button class="relative inline-flex h-5 w-9 rounded-full transition-colors" 
                    [style.background-color]="emailNotifications() ? '#37352F' : '#E9E9E7'" 
                    (click)="toggleEmailNotifications()">
              <span class="inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform shadow-sm" 
                    [class.translate-x-4]="emailNotifications()" 
                    [class.translate-x-0.5]="!emailNotifications()"
                    style="margin-top: 3px;"></span>
            </button>
          </div>

          <div class="flex items-center justify-between py-3 px-2 rounded-lg transition-colors hover:bg-[#F7F6F3]">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-lg flex items-center justify-center" style="background-color: #F7F6F3;">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="color: #787774;">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"/>
                </svg>
              </div>
              <div>
                <p class="text-sm font-medium" style="color: #37352F;">Newsletter</p>
                <p class="text-xs" style="color: #9B9A97;">Consejos y novedades de email marketing</p>
              </div>
            </div>
            <button class="relative inline-flex h-5 w-9 rounded-full transition-colors" 
                    [style.background-color]="newsletter() ? '#37352F' : '#E9E9E7'" 
                    (click)="toggleNewsletter()">
              <span class="inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform shadow-sm" 
                    [class.translate-x-4]="newsletter()" 
                    [class.translate-x-0.5]="!newsletter()"
                    style="margin-top: 3px;"></span>
            </button>
          </div>
        </div>
      </div>

      <!-- Zona de Peligro -->
      <div class="mb-6">
        <h2 class="text-lg font-medium mb-4" style="color: #37352F;">Administrar Cuenta</h2>
        
        <div class="p-4 rounded-lg" style="background-color: rgba(224, 62, 62, 0.05); border: 1px solid rgba(224, 62, 62, 0.2);">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-lg flex items-center justify-center" style="background-color: rgba(224, 62, 62, 0.1);">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="color: #E03E3E;">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                </svg>
              </div>
              <div>
                <p class="text-sm font-medium" style="color: #37352F;">Eliminar cuenta</p>
                <p class="text-xs" style="color: #787774;">Esta acción es irreversible y eliminará todos tus datos</p>
              </div>
            </div>
            <button (click)="confirmDeleteAccount()" [disabled]="isDeleting()" 
                    class="px-4 py-2 rounded text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    style="background-color: #E03E3E; color: white;">
              @if (isDeleting()) {
                <span class="inline-flex items-center">
                  <svg class="w-4 h-4 animate-spin mr-2" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Eliminando...
                </span>
              } @else {
                Eliminar cuenta
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ProfileComponent implements OnInit {
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  currentUser = this.authService.currentUser;
  isEditing = signal(false);
  isSaving = signal(false);
  isLoading = signal(false);
  isDeleting = signal(false);
  isError = signal(false);
  message = signal('');
  emailNotifications = signal(true);
  newsletter = signal(false);

  personalForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.minLength(6)]]
  });

  ngOnInit() {
    this.loadUserData();
  }

  loadUserData() {
    const user = this.currentUser();
    if (user) {
      this.personalForm.patchValue({
        name: user.name,
        email: user.email,
        password: ''
      });
      this.isLoading.set(true);
      this.userService.getUser(user.id).subscribe({
        next: (updatedUser) => {
          this.isLoading.set(false);
          this.authService.updateUser(updatedUser);
          this.personalForm.patchValue({
            name: updatedUser.name,
            email: updatedUser.email
          });
        },
        error: (err) => {
          this.isLoading.set(false);
          console.error('Error cargando usuario:', err);
        }
      });
    }
  }

  getInitials(): string {
    const name = this.currentUser()?.name || '';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  getMemberSince(): string {
    // This could be enhanced to show actual member since date
    return '2024';
  }

  startEdit() {
    this.loadUserData();
    this.isEditing.set(true);
    this.message.set('');
  }

  cancelEdit() {
    this.isEditing.set(false);
    this.loadUserData();
  }

  savePersonalData() {
    if (!this.personalForm.valid) return;

    const user = this.currentUser();
    if (!user) return;

    this.isSaving.set(true);
    this.message.set('');

    const formValue = this.personalForm.value;
    const updateData: UpdateUserRequest = {
      name: formValue.name,
      email: formValue.email
    };

    if (formValue.password && formValue.password.length >= 6) {
      updateData.password = formValue.password;
    }

    this.userService.updateUser(user.id, updateData).subscribe({
      next: (updatedUser) => {
        this.isSaving.set(false);
        this.isEditing.set(false);
        this.authService.updateUser(updatedUser);
        this.message.set('Datos actualizados correctamente');
        this.isError.set(false);
        setTimeout(() => this.message.set(''), 3000);
      },
      error: (err) => {
        this.isSaving.set(false);
        console.error('Error actualizando usuario:', err);
        this.message.set('Error al actualizar: ' + (err.error?.message || err.message));
        this.isError.set(true);
      }
    });
  }

  confirmDeleteAccount() {
    if (confirm('¿Estás seguro de que quieres eliminar tu cuenta? Esta acción es irreversible.')) {
      this.deleteAccount();
    }
  }

  deleteAccount() {
    const user = this.currentUser();
    if (!user) return;

    this.isDeleting.set(true);
    this.message.set('');

    this.userService.deleteUser(user.id).subscribe({
      next: () => {
        this.isDeleting.set(false);
        this.authService.logout();
      },
      error: (err) => {
        this.isDeleting.set(false);
        console.error('Error eliminando cuenta:', err);
        this.message.set('Error al eliminar cuenta: ' + (err.error?.message || err.message));
        this.isError.set(true);
      }
    });
  }

  toggleEmailNotifications() {
    this.emailNotifications.update(v => !v);
  }

  toggleNewsletter() {
    this.newsletter.update(v => !v);
  }
}
