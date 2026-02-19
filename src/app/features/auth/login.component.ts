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
    <div class="min-h-screen bg-notion-bg-secondary flex items-center justify-center py-12 px-4">
      <div class="max-w-md w-full">
        <div class="text-center mb-8">
          <div class="mx-auto h-12 w-12 bg-notion-text rounded-lg flex items-center justify-center mb-4">
            <span class="text-white text-xl font-semibold">M</span>
          </div>
          <h2 class="text-2xl font-semibold text-notion-text">Inicia sesión en Mailboom</h2>
        </div>

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" 
              class="bg-white border border-notion-border rounded-notion shadow-notion p-8">
          <div class="space-y-5">
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
            </div>
          </div>

          <button type="submit" [disabled]="loginForm.invalid"
                  class="w-full mt-6 py-2.5 bg-notion-text text-white rounded-notion font-medium hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            Iniciar Sesión
          </button>
          
          <p class="text-center text-sm text-notion-text-secondary mt-5">
            ¿No tienes cuenta? 
            <a routerLink="/register" class="text-primary-500 hover:underline">Regístrate</a>
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
