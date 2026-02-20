import { Component, Input, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'info' | 'warning' | 'danger';
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (isOpen) {
      <div class="fixed inset-0 z-50 flex items-center justify-center">
        <!-- Backdrop -->
        <div 
          class="absolute inset-0 bg-black/50 transition-opacity"
          (click)="onCancel()"
        ></div>
        
        <!-- Dialog -->
        <div class="relative bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          <!-- Header -->
          <div class="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
            @switch (dialogData.type) {
              @case ('warning') {
                <div class="flex-shrink-0 w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                  <svg class="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
              }
              @case ('danger') {
                <div class="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                  <svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              }
              @default {
                <div class="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              }
            }
            <h3 class="text-lg font-semibold text-gray-900">{{ dialogData.title }}</h3>
          </div>
          
          <!-- Body -->
          <div class="px-6 py-4">
            <p class="text-gray-600">{{ dialogData.message }}</p>
          </div>
          
          <!-- Footer -->
          <div class="px-6 py-4 bg-gray-50 flex items-center justify-end gap-3">
            <button 
              (click)="onCancel()"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-colors"
            >
              {{ dialogData.cancelText || 'Cancelar' }}
            </button>
            <button 
              (click)="onConfirm()"
              class="px-4 py-2 text-sm font-medium text-white rounded-lg focus:outline-none focus:ring-2 transition-colors
                @switch (dialogData.type) {
                  @case ('warning') {
                    bg-amber-500 hover:bg-amber-600 focus:ring-amber-500
                  }
                  @case ('danger') {
                    bg-red-500 hover:bg-red-600 focus:ring-red-500
                  }
                  @default {
                    bg-blue-600 hover:bg-blue-700 focus:ring-blue-500
                  }
                }"
            >
              {{ dialogData.confirmText || 'Confirmar' }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    @keyframes fade-in {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes zoom-in-95 {
      from { transform: scale(0.95); }
      to { transform: scale(1); }
    }
    .animate-in {
      animation: fade-in 0.2s ease-out, zoom-in-95 0.2s ease-out;
    }
  `]
})
export class ConfirmDialogComponent {
  @Input() dialogData: ConfirmDialogData = {
    title: 'Confirmar acción',
    message: '¿Estás seguro de continuar?',
    type: 'info'
  };
  
  @Input() isOpen = false;
  
  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();
  @Output() dialogClose = new EventEmitter<void>();
  
  protected onConfirm() {
    this.confirm.emit();
    this.close();
  }
  
  protected onCancel() {
    this.cancel.emit();
    this.close();
  }
  
  private close() {
    this.isOpen = false;
    this.dialogClose.emit();
  }
}
