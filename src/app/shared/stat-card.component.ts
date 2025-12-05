// src/app/shared/stat-card.component.ts
import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card shadow-sm stat-card h-100">
      <div class="card-body d-flex flex-column justify-content-between">
        <div class="d-flex justify-content-between align-items-start mb-2">
          <div>
            <p class="text-muted text-uppercase small mb-1">
              {{ label }}
            </p>
            <h3 class="fw-semibold mb-0">
              {{ value }}
            </h3>
          </div>

          <div *ngIf="icon" class="stat-icon rounded-circle d-flex align-items-center justify-content-center">
            <span class="fs-5" aria-hidden="true">
              {{ resolveIcon(icon) }}
            </span>
          </div>
        </div>

        <p *ngIf="hint" class="text-muted small mb-0">
          {{ hint }}
        </p>
      </div>
    </div>
  `,
  styleUrls: ['./stat-card.component.css']
})
export class StatCardComponent {
  @Input() label = '';
  @Input() value: number | string = '';
  @Input() icon?: string;
  @Input() hint?: string;

  resolveIcon(iconKey: string): string {
    switch (iconKey) {
      case 'patients': return '👥';
      case 'appointments': return '📅';
      case 'prescriptions': return '💊';
      case 'careplans': return '📝';
      default: return '📊';
    }
  }
}
