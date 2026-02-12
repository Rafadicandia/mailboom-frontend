import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../core/models/auth.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="max-w-4xl mx-auto space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-2xl font-bold text-gray-900">Perfil de Usuario</h2>
          <p class="text-gray-600">Gestiona tu información personal y configuración</p>
        </div>
      </div>

      <!-- Información Personal -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div class="p-4 border-b border-gray-200 bg-gray-50">
          <div class="flex items-center gap-3">
            <svg class="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
            </svg>
            <h3 class="text-lg font-semibold text-gray-900">Datos Personales</h3>
          </div>
        </div>
        
        <div class="p-6">
          @if (isEditing()) {
            <!-- Formulario de edición -->
            <form [formGroup]="personalForm" class="space-y-4">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                  <input type="text" formControlName="name"
                         class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input type="email" formControlName="email"
                         class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                         [class.bg-gray-100]="true">
                </div>
              </div>
              <div class="flex justify-end gap-3 pt-4">
                <button type="button" (click)="cancelEdit()"
                        class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                  Cancelar
                </button>
                <button type="button" (click)="savePersonalData()"
                        [disabled]="!personalForm.valid || isSaving()"
                        class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-300 flex items-center gap-2 transition-colors">
                  @if (isSaving()) {
                    <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  }
                  {{ isSaving() ? 'Guardando...' : 'Guardar cambios' }}
                </button>
              </div>
            </form>
          } @else {
            <!-- Vista de datos -->
            <div class="flex items-start justify-between">
              <div class="flex items-center gap-4">
                <div class="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center">
                  <span class="text-2xl font-bold text-indigo-600">{{ getInitials() }}</span>
                </div>
                <div>
                  <h4 class="text-lg font-medium text-gray-900">{{ currentUser()?.name }}</h4>
                  <p class="text-gray-500">{{ currentUser()?.email }}</p>
                  <p class="text-sm text-gray-400 mt-1">Rol: {{ currentUser()?.role || 'Usuario' }}</p>
                </div>
              </div>
              <button (click)="startEdit()"
                      class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center gap-2 transition-colors">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                </svg>
                Editar
              </button>
            </div>
          }
        </div>
      </div>

      <!-- Información General de la Cuenta -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div class="p-4 border-b border-gray-200 bg-gray-50">
          <div class="flex items-center gap-3">
            <svg class="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <h3 class="text-lg font-semibold text-gray-900">Información General</h3>
          </div>
        </div>
        
        <div class="p-6 space-y-4">
          <div class="flex items-center justify-between py-3 border-b border-gray-100">
            <div class="flex items-center gap-3">
              <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
              </svg>
              <div>
                <p class="font-medium text-gray-900">Email de la cuenta</p>
                <p class="text-sm text-gray-500">{{ currentUser()?.email }}</p>
              </div>
            </div>
            <span class="px-3 py-1 bg-green-100 text-green-800 text-xs rounded-full">Verificado</span>
          </div>
          
          <div class="flex items-center justify-between py-3 border-b border-gray-100">
            <div class="flex items-center gap-3">
              <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
              </svg>
              <div>
                <p class="font-medium text-gray-900">Contraseña</p>
                <p class="text-sm text-gray-500">••••••••••••</p>
              </div>
            </div>
            <button class="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
              Cambiar contraseña
            </button>
          </div>
          
          <div class="flex items-center justify-between py-3">
            <div class="flex items-center gap-3">
              <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
              </svg>
              <div>
                <p class="font-medium text-gray-900">Miembro desde</p>
                <p class="text-sm text-gray-500">Febrero 2025</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Preferencias -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div class="p-4 border-b border-gray-200 bg-gray-50">
          <div class="flex items-center gap-3">
            <svg class="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
            <h3 class="text-lg font-semibold text-gray-900">Preferencias</h3>
          </div>
        </div>
        
        <div class="p-6 space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="font-medium text-gray-900">Notificaciones por email</p>
              <p class="text-sm text-gray-500">Recibe actualizaciones sobre tus campañas</p>
            </div>
            <button class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
                    [class.bg-indigo-600]="emailNotifications()"
                    [class.bg-gray-200]="!emailNotifications()"
                    (click)="toggleEmailNotifications()">
              <span class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                    [class.translate-x-6]="emailNotifications()"
                    [class.translate-x-1]="!emailNotifications()"></span>
            </button>
          </div>
          
          <div class="flex items-center justify-between">
            <div>
              <p class="font-medium text-gray-900">Newsletter</p>
              <p class="text-sm text-gray-500">Consejos y mejores prácticas de email marketing</p>
            </div>
            <button class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
                    [class.bg-indigo-600]="newsletter()"
                    [class.bg-gray-200]="!newsletter()"
                    (click)="toggleNewsletter()">
              <span class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                    [class.translate-x-6]="newsletter()"
                    [class.translate-x-1]="!newsletter()"></span>
            </button>
          </div>
        </div>
      </div>

      <!-- Zona de peligro -->
      <div class="bg-white rounded-xl shadow-sm border border-red-200 overflow-hidden">
        <div class="p-4 border-b border-red-200 bg-red-50">
          <div class="flex items-center gap-3">
            <svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
            </svg>
            <h3 class="text-lg font-semibold text-red-900">Zona de Peligro</h3>
          </div>
        </div>
        
        <div class="p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="font-medium text-gray-900">Eliminar cuenta</p>
              <p class="text-sm text-gray-500\">Esta acción es irreversible</p>
            </div>
            <button class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
              Eliminar cuenta
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ProfileComponent implements OnInit {
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);

  currentUser = this.authService.currentUser;
  isEditing = signal(false);
  isSaving = signal(false);
  emailNotifications = signal(true);
  newsletter = signal(false);

  personalForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]]
  });

  ngOnInit() {
    this.loadUserData();
  }

  loadUserData() {
    const user = this.currentUser();
    if (user) {
      this.personalForm.patchValue({
        name: user.name,
        email: user.email
      });
    }
  }

  getInitials(): string {
    const name = this.currentUser()?.name || '';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  startEdit() {
    this.loadUserData();
    this.isEditing.set(true);
  }

  cancelEdit() {
    this.isEditing.set(false);
    this.loadUserData();
  }

  savePersonalData() {
    if (!this.personalForm.valid) return;

    this.isSaving.set(true);
    // Aquí se implementaría la llamada al servicio para actualizar los datos
    setTimeout(() => {
      this.isSaving.set(false);
      this.isEditing.set(false);
      alert('Datos actualizados correctamente');
    }, 1000);
  }

  toggleEmailNotifications() {
    this.emailNotifications.update(v => !v);
  }

  toggleNewsletter() {
    this.newsletter.update(v => !v);
  }
}
