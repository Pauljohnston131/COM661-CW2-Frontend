// src/app/components/patient-portal/patient-portal.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Api } from '../../services/api';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-patient-portal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './patient-portal.html',
  styleUrls: ['./patient-portal.css']
})
export class PatientPortalComponent {

  patient: any = null;

  loading = false;

  toastMessage: string = '';
  toastType: 'success' | 'error' = 'success';

  showAllAppointments = false;
  showAllPrescriptions = false;
  showAllCareplans = false;

  requestDate = '';
  requestSymptoms = '';
  submitted = false;

  prescriptions: any[] = [];
  careplans: any[] = [];
  pendingRequests: any[] = [];   // NEW

  constructor(
    private api: Api,
    private auth: AuthService
  ) {}

  ngOnInit() {
    const pid = this.auth.getPatientId();
    if (!pid) {
      this.showToast("Session expired — please log in again.", "error");
      return;
    }
    this.loadPatient(pid);
  }

  // -------------------------------------------------
  // LOADING + TOAST HELPERS
  // -------------------------------------------------
  private showToast(msg: string, type: 'success' | 'error' = 'success') {
    this.toastMessage = msg;
    this.toastType = type;

    setTimeout(() => {
      this.toastMessage = '';
    }, 3500);
  }

  private startLoading() { this.loading = true; }
  private stopLoading() { this.loading = false; }

  // -------------------------------------------------
  // LOAD PATIENT
  // -------------------------------------------------
  private loadPatient(id: string) {
    this.startLoading();

    this.api.getPatient(id).subscribe({
      next: (res) => {
        const p = res.data;
        this.patient = p;

        this.patient.appointments = p.appointments || [];
        this.prescriptions = p.prescriptions || [];
        this.careplans = p.careplans || [];

        // Extract pending appointment requests (no doctor assigned yet)
        this.pendingRequests = this.patient.appointments.filter(
          (a: any) => a.status === 'requested'
        );
      },
      error: () => {
        this.showToast("Failed to load your profile.", "error");
      },
      complete: () => this.stopLoading()
    });
  }

  // -------------------------------------------------
  // SUBMIT APPOINTMENT REQUEST
  // -------------------------------------------------
  submitRequest() {
    if (!this.requestDate) {
      this.showToast("Please select a date.", "error");
      return;
    }

    if (!this.requestSymptoms.trim() || this.requestSymptoms.length < 6) {
      this.showToast("Please provide more details about your symptoms.", "error");
      return;
    }

    const pid = this.patient._id || this.patient.id;

    const payload = {
      date: this.requestDate,
      notes: this.requestSymptoms,
      status: 'requested'
    };

    this.startLoading();

    this.api.requestAppointment(pid, payload).subscribe({
      next: () => {
        this.showToast("Appointment request sent!", "success");
        this.submitted = true;

        this.loadPatient(pid);

        this.requestDate = '';
        this.requestSymptoms = '';
      },
      error: () => {
        this.showToast("Failed to submit request. Please try again.", "error");
      },
      complete: () => this.stopLoading()
    });
  }

  // -------------------------------------------------
  // FORMATTER
  // -------------------------------------------------
  fmt(date: string): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-UK', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }

  // -------------------------------------------------
  // BADGE COLORS
  // -------------------------------------------------
  badge(status: string): string {
    switch (status) {
      case 'requested': return 'bg-warning text-dark';
      case 'scheduled': return 'bg-primary';
      case 'completed': return 'bg-success';
      case 'cancelled': return 'bg-danger';
      default: return 'bg-secondary';
    }
  }
}
