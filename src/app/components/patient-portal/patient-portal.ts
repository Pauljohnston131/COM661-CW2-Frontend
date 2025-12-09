// src/app/components/patient-portal/patient-portal.component.ts

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

  // Data arrays
  prescriptions: any[] = [];
  careplans: any[] = [];
  pendingRequests: any[] = [];
  confirmedAppointments: any[] = [];  // Fixed: pre-computed, reliable

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
  // TOAST & LOADING HELPERS
  // -------------------------------------------------
  private showToast(msg: string, type: 'success' | 'error' = 'success') {
    this.toastMessage = msg;
    this.toastType = type;
    setTimeout(() => this.toastMessage = '', 4000);
  }

  private startLoading() { this.loading = true; }
  private stopLoading() { this.loading = false; }

  // -------------------------------------------------
  // LOAD PATIENT DATA
  // -------------------------------------------------
  private loadPatient(id: string) {
    this.startLoading();

    this.api.getPatient(id).subscribe({
      next: (res) => {
        const p = res.data;
        this.patient = p;

        // Ensure arrays exist
        const appointments = p.appointments || [];
        this.prescriptions = p.prescriptions || [];
        this.careplans = p.careplans || [];

        // Separate pending requests from confirmed/scheduled appointments
        this.pendingRequests = appointments.filter((a: any) => 
          a.status === 'requested'
        );

        this.confirmedAppointments = appointments.filter((a: any) =>
          a.status && a.status !== 'requested'
        );

        // Optional: sort confirmed appointments (newest first)
        this.confirmedAppointments.sort((a: any, b: any) => {
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        });
      },
      error: () => {
        this.showToast("Failed to load your profile. Please try again.", "error");
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

    if (!this.requestSymptoms.trim() || this.requestSymptoms.trim().length < 6) {
      this.showToast("Please describe your symptoms in more detail.", "error");
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
        this.showToast("Appointment request sent successfully!", "success");
        this.submitted = true;

        // Reload fresh data
        this.loadPatient(pid);

        // Reset form
        this.requestDate = '';
        this.requestSymptoms = '';
      },
      error: () => {
        this.showToast("Failed to send request. Please try again.", "error");
      },
      complete: () => this.stopLoading()
    });
  }

  // -------------------------------------------------
  // HELPER: Date formatting
  // -------------------------------------------------
  fmt(date: string | Date): string {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }

  // -------------------------------------------------
  // BADGE STYLING
  // -------------------------------------------------
  badge(status: string): string {
    switch (status?.toLowerCase()) {
      case 'requested':  return 'bg-warning text-dark';
      case 'scheduled':  return 'bg-primary';
      case 'confirmed':  return 'bg-info';
      case 'completed':  return 'bg-success';
      case 'cancelled':  return 'bg-danger';
      default:           return 'bg-secondary';
    }
  }

  getPrescriptionStatusClass(p: any): string {
    const s = p.status?.toLowerCase();
    if (!s) return 'bg-secondary';

    if (['active', 'ongoing'].includes(s)) return 'bg-success';
    if (['completed', 'finished'].includes(s)) return 'bg-primary';
    if (['stopped', 'cancelled'].includes(s)) return 'bg-danger';
    if (['pending', 'requested'].includes(s)) return 'bg-warning text-dark';
    if (s === 'expired') return 'bg-secondary';
    return 'bg-info';
  }

  // -------------------------------------------------
  // FORM HELPERS
  // -------------------------------------------------
  getTodayDate(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}