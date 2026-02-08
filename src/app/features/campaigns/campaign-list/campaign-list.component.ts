import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-campaign-list',
  standalone: true,
  imports: [CommonModule],
  template: `<div class="p-6"><h1 class="text-2xl font-bold">Lista de Campañas</h1></div>`
})
export class CampaignListComponent {}