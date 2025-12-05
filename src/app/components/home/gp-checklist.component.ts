// src/app/components/home/gp-checklist.component.ts
import { CommonModule, DatePipe } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';

export interface GpChecklistItem {
  type: string;
  patient: string;
  date: string;
  action: string;
  link: any[];
  key?: string;
}

@Component({
  selector: 'app-gp-checklist',
  standalone: true,
  imports: [CommonModule, RouterModule, DatePipe],
  template: `
    <div class="card shadow-sm h-100">
      <div class="card-body">
        <div class="d-flex justify-content-between align-items-center mb-2">
          <h5 class="mb-0">GP checklist</h5>
          <span class="badge"
                [ngClass]="items.length ? 'bg-primary' : 'bg-light text-dark'">
            {{ items.length }} item{{ items.length === 1 ? '' : 's' }}
          </span>
        </div>

        <p *ngIf="pendingCount !== null"
           class="small text-muted mb-2">
          Pending appointment requests: <strong>{{ pendingCount }}</strong>
        </p>

        <p *ngIf="items.length === 0"
           class="text-muted small mb-0">
          No outstanding actions. You’re up to date.
        </p>

        <ul *ngIf="items.length" class="list-group list-group-flush">
          <li *ngFor="let item of items"
              class="list-group-item px-0 hover-list"
              [routerLink]="item.link">
            <div class="d-flex justify-content-between align-items-start">
              <div>
                <div class="small text-uppercase text-muted fw-semibold">
                  {{ item.type }}
                </div>
                <div class="fw-semibold">
                  {{ item.patient }}
                </div>
                <div class="small text-muted">
                  {{ item.action }} · {{ item.date | date:'mediumDate' }}
                </div>
              </div>
              <span class="badge bg-outline">View</span>
            </div>
          </li>
        </ul>
      </div>
    </div>
  `,
  styles: [`
    .hover-list {
      cursor: pointer;
      transition: background-color 0.15s ease;
    }
    .hover-list:hover {
      background-color: rgba(0, 0, 0, 0.03);
    }
    .bg-outline {
      background-color: transparent;
      border: 1px solid rgba(0, 0, 0, 0.15);
      color: #0d6efd;
    }
  `]
})
export class GpChecklistComponent {
  @Input() items: GpChecklistItem[] = [];
  @Input() pendingCount: number | null = null;
}
