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
    <div class="max-w-3xl mx-auto space-y-4">
      <h2 class="text-2xl font-semibold text-notion-text">Perfil</h2>

      @if (message()) {
        <div [class]="isError() ? 'bg-notion-red bg-opacity-10 text-notion-red' : 'bg-notion-green bg-opacity-10 text-notion-green'" 
             class="p-3 rounded-notion text-sm">
          {{ message() }}
        </div>
      }

      <!-- Perfil -->
      <div class="bg-white rounded-notion shadow-notion border border-notion-border p-5">
        @if (isLoading()) {
          <div class="flex justify-center py-4">
            <svg class="w-5 h-5 animate-spin text-notion-text-secondary" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        } @else if (isEditing()) {
          <form [formGroup]="personalForm" class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs text-notion-text-secondary mb-1">Nombre</label>
                <input type="text" formControlName="name" class="w-full px-3 py-2 border border-notion-border rounded-notion text-sm">
              </div>
              <div>
                <label class="block text-xs text-notion-text-secondary mb-1">Email</label>
                <input type="email" formControlName="email" class="w-full px-3 py-2 border border-notion-border rounded-notion text-sm">
              </div>
            </div>
            <div>
              <label class="block text-xs text-notion-text-secondary mb-1">Contraseña</label>
              <input type="password" formControlName="password" placeholder="Nueva contraseña" class="w-full px-3 py-2 border border-notion-border rounded-notion text-sm">
            </div>
            <div class="flex justify-end gap-2">
              <button type="button" (click)="cancelEdit()" class="px-3 py-1.5 border border-notion-border rounded-notion text-sm hover:bg-notion-bg-hover">Cancelar</button>
              <button type="button" (click)="savePersonalData()" [disabled]="!personalForm.valid || isSaving()" class="px-3 py-1.5 bg-notion-text text-white rounded-notion text-sm hover:bg-opacity-90">{{ isSaving() ? 'Guardando...' : 'Guardar' }}</button>
            </div>
          </form>
        } @else {
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 bg-notion-purple bg-opacity-10 rounded-full flex items-center justify-center">
                <span class="text-base font-semibold text-notion-purple">{{ getInitials() }}</span>
              </div>
              <div>
                <h4 class="font-medium text-notion-text">{{ currentUser()?.name }}</h4>
                <p class="text-sm text-notion-text-secondary">{{ currentUser()?.email }}</p>
              </div>
            </div>
            <button (click)="startEdit()" class="px-3 py-1.5 border border-notion-border rounded-notion text-sm hover:bg-notion-bg-hover">Editar</button>
          </div>
        }
      </div>

      <!-- Información de la cuenta -->
      <div class="bg-white rounded-notion shadow-notion border border-notion-border p-5">
        <div class="grid grid-cols-4 gap-4 py-2">
          <div>
            <p class="text-xs text-notion-text-secondary">Email</p>
            <p class="text-sm text-notion-text">{{ currentUser()?.email }}</p>
          </div>
          <div>
            <p class="text-xs text-notion-text-secondary">Rol</p>
            <p class="text-sm text-notion-text">{{ currentUser()?.role || 'USER' }}</p>
          </div>
          <div>
            <p class="text-xs text-notion-text-secondary">Plan</p>
            <p class="text-sm text-notion-text">{{ currentUser()?.plan || 'FREE' }}</p>
          </div>
          <div>
            <p class="text-xs text-notion-text-secondary">Emails enviados</p>
            <p class="text-sm text-notion-text">{{ currentUser()?.emailsSent || 0 }}</p>
          </div>
        </div>
      </div>

      <!-- Preferencias -->
      <div class="bg-white rounded-notion shadow-notion border border-notion-border p-5">
        <div class="flex items-center justify-between py-2">
          <p class="text-sm text-notion-text">Notificaciones</p>
          <button class="relative inline-flex h-5 w-9 rounded-full transition-colors" [class.bg-notion-text]="emailNotifications()" [class.bg-notion-border]="!emailNotifications()" (click)="toggleEmailNotifications()">
            <span class="inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform" [class.translate-x-4]="emailNotifications()" [class.translate-x-0.5]="!emailNotifications()"></span>
          </button>
        </div>
        <div class="flex items-center justify-between py-2 border-t border-notion-border">
          <p class="text-sm text-notion-text">Newsletter</p>
          <button class="relative inline-flex h-5 w-9 rounded-full transition-colors" [class.bg-notion-text]="newsletter()" [class.bg-notion-border]="!newsletter()" (click)="toggleNewsletter()">
            <span class="inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform" [class.translate-x-4]="newsletter()" [class.translate-x-0.5]="!newsletter()"></span>
          </button>
        </div>
      </div>

      <!-- Administrar Cuenta -->
      <div class="bg-white rounded-notion shadow-notion border border-notion-border p-5">
        <div class="flex items-center justify-between py-2">
          <div>
            <p class="text-sm text-notion-text">Eliminar cuenta</p>
            <p class="text-xs text-notion-text-secondary">Acción irreversible</p>
          </div>
          <button (click)="confirmDeleteAccount()" [disabled]="isDeleting()" class="px-3 py-1.5 border border-notion-border rounded-notion text-sm hover:bg-notion-bg-hover">{{ isDeleting() ? 'Eliminando...' : 'Eliminar' }}</button>
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
