import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="min-h-screen bg-notion-bg-secondary flex items-center justify-center py-12 px-4">
      <div class="max-w-md w-full">
        <div class="text-center mb-8">
          <div class="mx-auto h-12 w-12 bg-notion-text rounded-lg flex items-center justify-center mb-4">
            <span class="text-white text-xl font-semibold">M</span>
          </div>
          <h2 class="text-2xl font-semibold text-notion-text">Crea tu cuenta en Mailboom</h2>
          <p class="text-sm text-notion-text-secondary mt-2">
            ¿Ya tienes cuenta? 
            <a routerLink="/login" class="text-primary-500 hover:underline">Inicia sesión</a>
          </p>
        </div>

        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" 
              class="bg-white border border-notion-border rounded-notion shadow-notion p-8">
          <div class="space-y-5">
            <div>
              <label class="block text-sm font-medium text-notion-text mb-1.5">Nombre completo</label>
              <input type="text" formControlName="name"
                     class="w-full px-3 py-2.5 border border-notion-border rounded-notion focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                     placeholder="Juan Pérez">
            </div>
            <div>
              <label class="block text-sm font-medium text-notion-text mb-1.5">Email</label>
              <input type="email" formControlName="email"
                     class="w-full px-3 py-2.5 border border-notion-border rounded-notion focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                     placeholder="tu@email.com">
            </div>
            <div>
              <label class="block text-sm font-medium text-notion-text mb-1.5">Contraseña</label>
              <input type="password" formControlName="password"
                     class="w-full px-3 py-2.5 border border-notion-border rounded-notion focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                     placeholder="••••••••">
              <p class="text-xs text-notion-text-tertiary mt-1">Mínimo 6 caracteres</p>
            </div>
            <div class="flex items-center gap-2">
              <input type="checkbox" formControlName="isAdmin" 
                     class="w-4 h-4 text-primary-500 border-notion-border rounded focus:ring-primary-100">
              <label class="text-sm text-notion-text">
                Registrar como Administrador
              </label>
            </div>
          </div>

          <button type="submit" [disabled]="registerForm.invalid"
                  class="w-full mt-6 py-2.5 bg-notion-text text-white rounded-notion font-medium hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            Crear Cuenta
          </button>
        </form>
      </div>
    </div>
  `
})
export class RegisterComponent {
  registerForm: FormGroup;

  constructor(private fb: FormBuilder, private authService: AuthService) {
    this.registerForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      isAdmin: [false]
    });
  }

  onSubmit() {
    if (this.registerForm.valid) {
      const { isAdmin, ...userData } = this.registerForm.value;
      if (isAdmin) {
        this.authService.registerAdmin(userData);
      } else {
        this.authService.register(userData);
      }
    }
  }
}
