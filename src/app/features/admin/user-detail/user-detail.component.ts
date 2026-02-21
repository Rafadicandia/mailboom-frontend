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
    <div class="max-w-5xl mx-auto py-8 px-6">
      <!-- Header estilo Notion limpio -->
      <div class="flex items-center gap-3 mb-10">
        <button (click)="goBack()" class="p-1.5 rounded-lg transition-colors hover:bg-[#F7F6F3]">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="color: #787774;">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
          </svg>
        </button>
        <div>
          <h1 class="text-3xl font-semibold" style="color: #37352F;">Detalle de Usuario</h1>
          <p class="text-base mt-1" style="color: #787774;">Gestiona la información del usuario</p>
        </div>
      </div>

      <!-- Error/Success Messages -->
      @if (message()) {
        <div class="mb-6 p-4 rounded-lg flex items-center gap-3"
             [style.background-color]="isError() ? 'rgba(224, 62, 62, 0.1)' : 'rgba(15, 123, 108, 0.1)'">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" [style.color]="isError() ? '#E03E3E' : '#0F7B6C'">
            @if (isError()) {
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            } @else {
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            }
          </svg>
          <span class="text-sm" [style.color]="isError() ? '#E03E3E' : '#0F7B6C'">{{ message() }}</span>
        </div>
      }

      <!-- Tabs estilo Notion sin líneas -->
      <div class="mb-6">
        <div class="flex gap-6 mb-6">
          <button 
            (click)="activeTab.set('info')"
            class="text-sm font-medium transition-colors pb-1"
            [style.color]="activeTab() === 'info' ? '#37352F' : '#787774'"
            [style.border-bottom]="activeTab() === 'info' ? '2px solid #37352F' : '2px solid transparent'">
            Información
          </button>
          <button 
            (click)="onTabChange('campaigns')"
            class="text-sm font-medium transition-colors pb-1"
            [style.color]="activeTab() === 'campaigns' ? '#37352F' : '#787774'"
            [style.border-bottom]="activeTab() === 'campaigns' ? '2px solid #37352F' : '2px solid transparent'">
            Campañas
          </button>
          <button 
            (click)="onTabChange('lists')"
            class="text-sm font-medium transition-colors pb-1"
            [style.color]="activeTab() === 'lists' ? '#37352F' : '#787774'"
            [style.border-bottom]="activeTab() === 'lists' ? '2px solid #37352F' : '2px solid transparent'">
            Listas de Contactos
          </button>
        </div>

        <!-- Info Tab -->
        @if (activeTab() === 'info') {
          <div>
            @if (isLoading()) {
              <div class="flex items-center justify-center py-8">
                <div class="animate-spin rounded-full h-5 w-5" style="border: 2px solid #E9E9E7; border-top-color: #37352F;"></div>
              </div>
            } @else if (isEditing()) {
              <!-- Formulario de edición estilo Notion -->
              <form [formGroup]="userForm" class="space-y-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label class="block text-sm font-medium mb-2" style="color: #37352F;">Nombre</label>
                    <input type="text" formControlName="name"
                           class="w-full px-3 py-2 rounded-lg text-sm focus:outline-none"
                           style="background-color: #F7F6F3; color: #37352F;">
                  </div>
                  <div>
                    <label class="block text-sm font-medium mb-2" style="color: #37352F;">Email</label>
                    <input type="email" formControlName="email"
                           class="w-full px-3 py-2 rounded-lg text-sm focus:outline-none"
                           style="background-color: #F7F6F3; color: #37352F;">
                  </div>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label class="block text-sm font-medium mb-2" style="color: #37352F;">Plan</label>
                    <select formControlName="plan"
                            class="w-full px-3 py-2 rounded-lg text-sm focus:outline-none"
                            style="background-color: #F7F6F3; color: #37352F;">
                      <option value="FREE">Free</option>
                      <option value="BASIC">Basic</option>
                      <option value="PRO">Pro</option>
                    </select>
                  </div>
                  <div>
                    <label class="block text-sm font-medium mb-2" style="color: #37352F;">Nueva Contraseña (opcional)</label>
                    <input type="password" formControlName="password" placeholder="Dejar en blanco para no cambiar"
                           class="w-full px-3 py-2 rounded-lg text-sm focus:outline-none"
                           style="background-color: #F7F6F3; color: #37352F;">
                  </div>
                </div>
                <div class="flex justify-end gap-3 pt-4">
                  <button type="button" (click)="cancelEdit()"
                          class="px-4 py-2 rounded-lg text-sm transition-colors hover:bg-[#F7F6F3]"
                          style="color: #787774;">
                    Cancelar
                  </button>
                  <button type="button" (click)="saveUser()"
                          [disabled]="!userForm.valid || isSaving()"
                          class="px-4 py-2 rounded-lg text-sm text-white transition-colors disabled:opacity-50"
                          style="background-color: #37352F;">
                    @if (isSaving()) {
                      <span class="flex items-center gap-2">
                        <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Guardando...
                      </span>
                    } @else {
                      Guardar cambios
                    }
                  </button>
                </div>
              </form>
            } @else if (user()) {
              <!-- Vista de datos estilo Notion -->
              <div class="flex items-start justify-between mb-8">
                <div class="flex items-center gap-4">
                  <div class="w-14 h-14 rounded-full flex items-center justify-center text-xl font-semibold text-white" style="background-color: #9065B0;">
                    {{ getInitials() }}
                  </div>
                  <div>
                    <h3 class="text-xl font-semibold" style="color: #37352F;">{{ user()?.name }}</h3>
                    <p class="text-sm" style="color: #787774;">{{ user()?.email }}</p>
                  </div>
                </div>
                <button (click)="startEdit()"
                        class="px-4 py-2 rounded-lg text-sm text-white transition-colors hover:opacity-90"
                        style="background-color: #37352F;">
                  Editar
                </button>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div class="p-4 rounded-lg" style="background-color: #F7F6F3;">
                  <p class="text-xs mb-1" style="color: #9B9A97;">Plan</p>
                  <p class="text-base font-medium" style="color: #37352F;">{{ user()?.plan }}</p>
                </div>
                <div class="p-4 rounded-lg" style="background-color: #F7F6F3;">
                  <p class="text-xs mb-1" style="color: #9B9A97;">Emails Enviados</p>
                  <p class="text-base font-medium" style="color: #37352F;">{{ user()?.emailsSent || 0 }}</p>
                </div>
                <div class="p-4 rounded-lg" style="background-color: #F7F6F3;">
                  <p class="text-xs mb-1" style="color: #9B9A97;">Rol</p>
                  <span class="text-xs px-2 py-0.5 rounded"
                        [style.background-color]="user()?.role === 'ADMIN' ? 'rgba(144, 101, 176, 0.15)' : '#F7F6F3'"
                        [style.color]="user()?.role === 'ADMIN' ? '#9065B0' : '#787774'">
                    {{ user()?.role }}
                  </span>
                </div>
              </div>
            }
          </div>
        }

        <!-- Campaigns Tab -->
        @if (activeTab() === 'campaigns') {
          <div>
            @if (loadingCampaigns()) {
              <div class="flex justify-center py-8">
                <div class="animate-spin rounded-full h-5 w-5" style="border: 2px solid #E9E9E7; border-top-color: #37352F;"></div>
              </div>
            } @else if (campaigns().length === 0) {
              <div class="text-center py-8">
                <svg class="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="color: #9B9A97;">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <p class="text-sm" style="color: #9B9A97;">No hay campañas para este usuario</p>
              </div>
            } @else {
              <div class="space-y-1">
                @for (campaign of campaigns(); track campaign.id) {
                  <div class="flex items-center justify-between py-3 px-2 rounded-lg transition-colors hover:bg-[#F7F6F3]">
                    <div class="flex-1 min-w-0">
                      <p class="text-sm font-medium truncate" style="color: #37352F;">{{ campaign.subject }}</p>
                      <p class="text-xs" style="color: #9B9A97;">{{ campaign.sender || 'Sin remitente' }}</p>
                    </div>
                    <div class="flex items-center gap-4">
                      <span class="text-xs px-2 py-0.5 rounded"
                            [style.background-color]="campaign.status === 'SENT' ? 'rgba(15, 123, 108, 0.15)' : campaign.status === 'DRAFT' ? 'rgba(223, 171, 1, 0.15)' : campaign.status === 'SENDING' ? 'rgba(82, 156, 202, 0.15)' : '#F7F6F3'"
                            [style.color]="campaign.status === 'SENT' ? '#0F7B6C' : campaign.status === 'DRAFT' ? '#DFAB01' : campaign.status === 'SENDING' ? '#529CCA' : '#787774'">
                        {{ getStatusText(campaign.status) }}
                      </span>
                      <span class="text-xs" style="color: #9B9A97;">{{ campaign.createdAt | date:'dd/MM/yyyy' }}</span>
                      <button (click)="deleteCampaign(campaign.id)" class="text-xs hover:underline" style="color: #E03E3E;">
                        Eliminar
                      </button>
                    </div>
                  </div>
                }
              </div>
            }
          </div>
        }

        <!-- Contact Lists Tab -->
        @if (activeTab() === 'lists') {
          <div>
            @if (loadingLists()) {
              <div class="flex justify-center py-8">
                <div class="animate-spin rounded-full h-5 w-5" style="border: 2px solid #E9E9E7; border-top-color: #37352F;"></div>
              </div>
            } @else if (contactLists().length === 0) {
              <div class="text-center py-8">
                <svg class="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="color: #9B9A97;">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <p class="text-sm" style="color: #9B9A97;">No hay listas de contactos para este usuario</p>
              </div>
            } @else {
              <div class="space-y-1">
                @for (list of contactLists(); track list.id) {
                  <div class="flex items-center justify-between py-3 px-2 rounded-lg transition-colors hover:bg-[#F7F6F3]">
                    <div class="flex items-center gap-3">
                      <div class="w-8 h-8 rounded-lg flex items-center justify-center" style="background-color: #F7F6F3;">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="color: #787774;">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <div>
                        <p class="text-sm font-medium" style="color: #37352F;">{{ list.name }}</p>
                        <p class="text-xs" style="color: #9B9A97;">{{ list.totalContacts }} contactos</p>
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
    if (!name) return '?';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
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
