import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Api } from '../../services/api';
import { AuthService } from '../../auth/auth.service';

/**
 * PatientPortalComponent
 *
 * Provides a secure self-service portal for patients to:
 * - View confirmed and pending appointments
 * - View prescriptions
 * - View care plans
 * - Submit new appointment requests
 *
 * All data is loaded using the authenticated patient ID.
 */
@Component({
  selector: 'app-patient-portal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './patient-portal.html',
  styleUrls: ['./patient-portal.css']
})
export class PatientPortalComponent {

  /** Logged-in patient record */
  patient: any = null;

  /** Global loading indicator */
  loading = false;

  /** Toast notification message */
  toastMessage: string = '';

  /** Toast message type */
  toastType: 'success' | 'error' = 'success';

  /** Toggle all appointments visibility */
  showAllAppointments = false;

  /** Toggle all prescriptions visibility */
  showAllPrescriptions = false;

  /** Toggle all careplans visibility */
  showAllCareplans = false;

  /** Requested appointment date */
  requestDate = '';

  /** Patient symptom description */
  requestSymptoms = '';

  /** Indicates successful submission */
  submitted = false;

  /** Prescription list */
  prescriptions: any[] = [];

  /** Careplan list */
  careplans: any[] = [];

  /** Pending appointment requests */
  pendingRequests: any[] = [];

  /** Confirmed and non-pending appointments */
  confirmedAppointments: any[] = [];

  /**
   * Creates instance of PatientPortalComponent
   *
   * @param api API service
   * @param auth Authentication service
   */
  constructor(
    private api: Api,
    private auth: AuthService
  ) {}

  /**
   * Angular lifecycle hook.
   * Loads the authenticated patient profile.
   */
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

  /**
   * Displays a notification message.
   *
   * @param msg Message text
   * @param type Message type
   */
  private showToast(msg: string, type: 'success' | 'error' = 'success') {
    this.toastMessage = msg;
    this.toastType = type;
    setTimeout(() => this.toastMessage = '', 4000);
  }

  /** Enables the global loading spinner */
  private startLoading() { this.loading = true; }

  /** Disables the global loading spinner */
  private stopLoading() { this.loading = false; }

  // -------------------------------------------------
  // LOAD PATIENT DATA
  // -------------------------------------------------

  /**
   * Loads patient record and associated data.
   *
   * @param id Patient ID
   */
  private loadPatient(id: string) {
    this.startLoading();

    this.api.getPatient(id).subscribe({
      next: (res) => {
        const p = res.data;
        this.patient = p;

        const appointments = p.appointments || [];
        this.prescriptions = p.prescriptions || [];
        this.careplans = p.careplans || [];

        this.pendingRequests = appointments.filter((a: any) => 
          a.status === 'requested'
        );

        this.confirmedAppointments = appointments.filter((a: any) =>
          a.status && a.status !== 'requested'
        );

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

  /**
   * Sends an appointment request to the GP.
   */
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

        this.loadPatient(pid);

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
  // HELPERS
  // -------------------------------------------------

  /**
   * Formats a date value for display.
   *
   * @param date Date input
   * @returns Formatted date string
   */
  fmt(date: string | Date): string {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }

  /**
   * Returns the Bootstrap badge class for appointment status.
   */
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

  /**
   * Returns Bootstrap class for prescription status.
   */
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

  /**
   * Returns today's date in yyyy-mm-dd format.
   */
  getTodayDate(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
