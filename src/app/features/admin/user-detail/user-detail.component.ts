import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AdminService } from '../../../core/services/admin.service';
import { User } from '../../../core/models/auth.model';
import { Campaign } from '../../../core/models/campaign.model';
import { ContactList } from '../../../core/models/contact.model';

@Component({
  selector: 'app-user-detail',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <button (click)="goBack()" class="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
            </svg>
          </button>
          <div>
            <h1 class="text-2xl font-bold text-gray-900">Detalle de Usuario</h1>
            <p class="text-gray-600">Gestiona la información del usuario</p>
          </div>
        </div>
        <span class="px-3 py-1 rounded-full text-sm font-medium"
              [class.bg-purple-100]="user()?.role === 'ADMIN'"
              [class.text-purple-800]="user()?.role === 'ADMIN'"
              [class.bg-gray-100]="user()?.role === 'USER'"
              [class.text-gray-800]="user()?.role === 'USER'">
          {{ user()?.role }}
        </span>
      </div>

      <!-- Error/Success Messages -->
      @if (message()) {
        <div [class]="isError() ? 'bg-red-50 border border-red-200 text-red-700' : 'bg-green-50 border border-green-200 text-green-700'" 
             class="p-4 rounded-lg flex items-center gap-3">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            @if (isError()) {
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            } @else {
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            }
          </svg>
          {{ message() }}
        </div>
      }

      <!-- Tabs -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200">
        <div class="border-b border-gray-200">
          <nav class="flex space-x-8 px-6" aria-label="Tabs">
            <button 
              (click)="activeTab.set('info')"
              class="py-4 px-1 border-b-2 font-medium text-sm transition-colors"
              [class.border-indigo-600]="activeTab() === 'info'"
              [class.text-indigo-600]="activeTab() === 'info'"
              [class.border-transparent]="activeTab() !== 'info'"
              [class.text-gray-500]="activeTab() !== 'info'">
              Información
            </button>
            <button 
              (click)="onTabChange('campaigns')"
              class="py-4 px-1 border-b-2 font-medium text-sm transition-colors"
              [class.border-indigo-600]="activeTab() === 'campaigns'"
              [class.text-indigo-600]="activeTab() === 'campaigns'"
              [class.border-transparent]="activeTab() !== 'campaigns'"
              [class.text-gray-500]="activeTab() !== 'campaigns'">
              Campañas
            </button>
            <button 
              (click)="onTabChange('lists')"
              class="py-4 px-1 border-b-2 font-medium text-sm transition-colors"
              [class.border-indigo-600]="activeTab() === 'lists'"
              [class.text-indigo-600]="activeTab() === 'lists'"
              [class.border-transparent]="activeTab() !== 'lists'"
              [class.text-gray-500]="activeTab() !== 'lists'">
              Listas de Contactos
            </button>
          </nav>
        </div>

        <!-- Info Tab -->
        @if (activeTab() === 'info') {
          <div class="p-6">
            @if (isLoading()) {
              <div class="flex items-center justify-center py-8">
                <svg class="w-8 h-8 animate-spin text-indigo-600" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            } @else if (isEditing()) {
              <!-- Formulario de edición -->
              <form [formGroup]="userForm" class="space-y-4">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                    <input type="text" formControlName="name"
                           class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input type="email" formControlName="email"
                           class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                  </div>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Plan</label>
                    <select formControlName="plan"
                            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                      <option value="FREE">Free</option>
                      <option value="BASIC">Basic</option>
                      <option value="PRO">Pro</option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Nueva Contraseña (opcional)</label>
                    <input type="password" formControlName="password" placeholder="Dejar en blanco para no cambiar"
                           class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                  </div>
                </div>
                <div class="flex justify-end gap-3 pt-4">
                  <button type="button" (click)="cancelEdit()"
                          class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                    Cancelar
                  </button>
                  <button type="button" (click)="saveUser()"
                          [disabled]="!userForm.valid || isSaving()"
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
            } @else if (user()) {
              <!-- Vista de datos -->
              <div class="flex items-start justify-between">
                <div class="flex items-center gap-4">
                  <div class="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center">
                    <span class="text-2xl font-bold text-indigo-600">{{ getInitials() }}</span>
                  </div>
                  <div>
                    <h3 class="text-xl font-semibold text-gray-900">{{ user()?.name }}</h3>
                    <p class="text-gray-600">{{ user()?.email }}</p>
                  </div>
                </div>
                <button (click)="startEdit()"
                        class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                  Editar
                </button>
              </div>

              <div class="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="p-4 bg-gray-50 rounded-lg">
                  <p class="text-sm text-gray-600">Plan</p>
                  <p class="text-lg font-semibold text-gray-900">{{ user()?.plan }}</p>
                </div>
                <div class="p-4 bg-gray-50 rounded-lg">
                  <p class="text-sm text-gray-600">Emails Enviados</p>
                  <p class="text-lg font-semibold text-gray-900">{{ user()?.emailsSent || 0 }}</p>
                </div>
                <div class="p-4 bg-gray-50 rounded-lg">
                  <p class="text-sm text-gray-600">Rol</p>
                  <p class="text-lg font-semibold text-gray-900">{{ user()?.role }}</p>
                </div>
              </div>
            }
          </div>
        }

        <!-- Campaigns Tab -->
        @if (activeTab() === 'campaigns') {
          <div class="p-6">
            @if (loadingCampaigns()) {
              <div class="flex justify-center py-8">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              </div>
            } @else if (campaigns().length === 0) {
              <div class="text-center py-8">
                <svg class="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <p class="text-gray-600">No hay campañas para este usuario</p>
              </div>
            } @else {
              <div class="overflow-x-auto">
                <table class="w-full">
                  <thead>
                    <tr class="border-b border-gray-200">
                      <th class="text-left py-3 px-4 text-sm font-medium text-gray-600">Asunto</th>
                      <th class="text-left py-3 px-4 text-sm font-medium text-gray-600">Remitente</th>
                      <th class="text-left py-3 px-4 text-sm font-medium text-gray-600">Estado</th>
                      <th class="text-left py-3 px-4 text-sm font-medium text-gray-600">Fecha</th>
                      <th class="text-left py-3 px-4 text-sm font-medium text-gray-600">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (campaign of campaigns(); track campaign.id) {
                      <tr class="border-b border-gray-100 hover:bg-gray-50">
                        <td class="py-3 px-4 text-sm text-gray-900">{{ campaign.subject }}</td>
                        <td class="py-3 px-4 text-sm text-gray-600">{{ campaign.sender || 'N/A' }}</td>
                        <td class="py-3 px-4 text-sm">
                          <span class="px-2 py-1 rounded text-xs font-medium"
                                [class.bg-green-100]="campaign.status === 'SENT'"
                                [class.text-green-800]="campaign.status === 'SENT'"
                                [class.bg-yellow-100]="campaign.status === 'DRAFT'"
                                [class.text-yellow-800]="campaign.status === 'DRAFT'"
                                [class.bg-blue-100]="campaign.status === 'SENDING'"
                                [class.text-blue-800]="campaign.status === 'SENDING'">
                            {{ getStatusText(campaign.status) }}
                          </span>
                        </td>
                        <td class="py-3 px-4 text-sm text-gray-600">
                          {{ campaign.createdAt | date:'dd/MM/yyyy HH:mm' }}
                        </td>
                        <td class="py-3 px-4">
                          <button (click)="deleteCampaign(campaign.id)" class="text-red-600 hover:text-red-800 text-sm font-medium">
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            }
          </div>
        }

        <!-- Contact Lists Tab -->
        @if (activeTab() === 'lists') {
          <div class="p-6">
            @if (loadingLists()) {
              <div class="flex justify-center py-8">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              </div>
            } @else if (contactLists().length === 0) {
              <div class="text-center py-8">
                <svg class="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <p class="text-gray-600">No hay listas de contactos para este usuario</p>
              </div>
            } @else {
              <div class="space-y-3">
                @for (list of contactLists(); track list.id) {
                  <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div class="flex items-center gap-3">
                      <div class="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                        <svg class="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <div>
                        <p class="font-medium text-gray-900">{{ list.name }}</p>
                        <p class="text-sm text-gray-500">{{ list.totalContacts }} contactos</p>
                      </div>
                    </div>
                  </div>
                }
              </div>
            }
          </div>
        }
      </div>
    </div>
  `
})
export class UserDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private adminService = inject(AdminService);
  private fb = inject(FormBuilder);

  // Signals
  user = signal<User | null>(null);
  campaigns = signal<Campaign[]>([]);
  contactLists = signal<ContactList[]>([]);
  activeTab = signal<'info' | 'campaigns' | 'lists'>('info');
  isLoading = signal(false);
  isSaving = signal(false);
  loadingCampaigns = signal(false);
  loadingLists = signal(false);
  message = signal('');
  isError = signal(false);
  isEditing = signal(false);

  userForm!: FormGroup;

  ngOnInit() {
    this.userForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      plan: ['FREE', Validators.required],
      password: ['']
    });

    const userId = this.route.snapshot.paramMap.get('id');
    if (userId) {
      this.loadUser(userId);
    } else {
      this.router.navigate(['/admin']);
    }
  }

  loadUser(id: string) {
    this.isLoading.set(true);
    this.adminService.getUserById(id).subscribe({
      next: (user) => {
        this.user.set(user);
        this.userForm.patchValue({
          name: user.name,
          email: user.email,
          plan: user.plan || 'FREE'
        });
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading user:', err);
        this.message.set('Error al cargar el usuario');
        this.isError.set(true);
        this.isLoading.set(false);
      }
    });
  }

  loadCampaigns() {
    const userId = this.user()?.id;
    if (!userId) return;

    this.loadingCampaigns.set(true);
    // Get all campaigns and filter by owner
    this.adminService.getCampaigns(0, 100).subscribe({
      next: (response) => {
        const userCampaigns = response.content.filter(c => c.ownerId === userId);
        this.campaigns.set(userCampaigns);
        this.loadingCampaigns.set(false);
      },
      error: () => {
        this.loadingCampaigns.set(false);
      }
    });
  }

  loadContactLists() {
    const userId = this.user()?.id;
    if (!userId) return;

    this.loadingLists.set(true);
    // Get all contact lists and filter by owner
    this.adminService.getContactLists(0, 100).subscribe({
      next: (response) => {
        const userLists = response.content.filter(l => l.ownerId === userId);
        this.contactLists.set(userLists);
        this.loadingLists.set(false);
      },
      error: () => {
        this.loadingLists.set(false);
      }
    });
  }

  deleteCampaign(campaignId: string) {
    if (confirm('¿Estás seguro de que deseas eliminar esta campaña?')) {
      this.adminService.deleteCampaign(campaignId).subscribe({
        next: () => {
          this.message.set('Campaña eliminada correctamente');
          this.isError.set(false);
          this.loadCampaigns();
        },
        error: (err) => {
          console.error('Error deleting campaign:', err);
          this.message.set('Error al eliminar la campaña');
          this.isError.set(true);
        }
      });
    }
  }

  deleteContactList(listId: string) {
    if (confirm('¿Estás seguro de que deseas eliminar esta lista de contactos?')) {
      this.adminService.deleteContactList(listId).subscribe({
        next: () => {
          this.message.set('Lista de contactos eliminada correctamente');
          this.isError.set(false);
          this.loadContactLists();
        },
        error: (err) => {
          console.error('Error deleting contact list:', err);
          this.message.set('Error al eliminar la lista de contactos');
          this.isError.set(true);
        }
      });
    }
  }

  startEdit() {
    this.isEditing.set(true);
  }

  cancelEdit() {
    this.isEditing.set(false);
    if (this.user()) {
      this.userForm.patchValue({
        name: this.user()?.name,
        email: this.user()?.email,
        plan: this.user()?.plan || 'FREE'
      });
      this.userForm.get('password')?.setValue('');
    }
  }

  saveUser() {
    if (!this.userForm.valid || !this.user()) return;

    this.isSaving.set(true);
    const userId = this.user()!.id;
    const formValue = this.userForm.value;

    const updateData: any = {
      name: formValue.name,
      email: formValue.email
    };

    if (formValue.plan) {
      updateData.plan = formValue.plan;
    }

    if (formValue.password) {
      updateData.password = formValue.password;
    }

    this.adminService.updateUser(userId, updateData).subscribe({
      next: (updatedUser) => {
        this.user.set(updatedUser);
        this.isSaving.set(false);
        this.isEditing.set(false);
        this.message.set('Usuario actualizado correctamente');
        this.isError.set(false);
      },
      error: (err) => {
        console.error('Error updating user:', err);
        this.message.set('Error al actualizar el usuario');
        this.isError.set(true);
        this.isSaving.set(false);
      }
    });
  }

  goBack() {
    this.router.navigate(['/admin']);
  }

  getInitials(): string {
    const name = this.user()?.name || '';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  getStatusText(status: string): string {
    const statusMap: Record<string, string> = {
      'DRAFT': 'Borrador',
      'SENDING': 'Enviando',
      'SENT': 'Enviada',
      'CANCELLED': 'Cancelada'
    };
    return statusMap[status] || status;
  }

  onTabChange(tab: 'info' | 'campaigns' | 'lists') {
    this.activeTab.set(tab);
    if (tab === 'campaigns') {
      this.loadCampaigns();
    } else if (tab === 'lists') {
      this.loadContactLists();
    }
  }
}
