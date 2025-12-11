import { CommonModule, DatePipe } from '@angular/common';
import { Component, Input } from '@angular/core';

export interface RecentAppointmentItem {
  _id: string;
  patient: string;
  date: string;
  doctor: string;
  status: string;
}

@Component({
  selector: 'app-recent-appointments',
  standalone: true,
  imports: [CommonModule, DatePipe],
  template: `
    <div class="card shadow-sm h-100">
      <div class="card-body">
        <div class="d-flex justify-content-between align-items-center mb-2">
          <h5 class="mb-0">Recent appointments</h5>
          <span class="badge bg-light text-dark">
            {{ appointments.length }} shown
          </span>
        </div>

        <p *ngIf="appointments.length === 0"
           class="text-muted small mb-0">
          No recent appointments recorded.
        </p>

        <ul *ngIf="appointments.length"
            class="list-group list-group-flush">
          <li *ngFor="let a of appointments"
              class="list-group-item px-0">
            <div class="d-flex justify-content-between align-items-start">
              <div>
                <div class="fw-semibold">{{ a.patient }}</div>
                <div class="small text-muted">
                  {{ a.doctor }} · {{ a.date | date:'mediumDate' }}
                </div>
              </div>

              <span class="badge" [ngClass]="statusBadgeClass(a.status)">
                {{ a.status }}
              </span>
            </div>
          </li>
        </ul>
      </div>
    </div>
  `
})
export class RecentAppointmentsComponent {
  @Input() appointments: RecentAppointmentItem[] = [];

  statusBadgeClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'completed': return 'bg-success';
      case 'cancelled': return 'bg-danger';
      case 'requested': return 'bg-warning text-dark';
      default: return 'bg-primary';
    }
  }
}
