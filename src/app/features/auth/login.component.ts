import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div class="max-w-md w-full space-y-8">
        <div class="text-center">
          <div class="mx-auto h-12 w-12 bg-indigo-600 rounded-xl flex items-center justify-center">
            <svg class="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 class="mt-6 text-3xl font-bold text-gray-900">Inicia sesión en Mailboom</h2>
        </div>

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="mt-8 space-y-6 bg-white p-8 rounded-xl shadow-sm border border-gray-200">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">Email</label>
              <input type="email" formControlName="email" 
                     class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                     placeholder="tu@email.com">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Contraseña</label>
              <input type="password" formControlName="password"
                     class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                     placeholder="••••••••">
            </div>
          </div>

          <button type="submit" [disabled]="loginForm.invalid"
                  class="w-full py-3 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed">
            Iniciar Sesión
          </button>
          
          <p class="text-center text-sm text-gray-600">
            ¿No tienes cuenta? 
            <a routerLink="/register" class="text-indigo-600 hover:text-indigo-500">Regístrate</a>
          </p>
        </form>
      </div>
    </div>
  `
})
export class LoginComponent {
  loginForm: FormGroup;

  constructor(private fb: FormBuilder, private authService: AuthService) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      console.log('Enviando login:', this.loginForm.value);
      this.authService.login(this.loginForm.value);
    }
  }
}