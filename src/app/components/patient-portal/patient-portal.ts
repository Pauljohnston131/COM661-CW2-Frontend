import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Api } from '../../services/api';
import { AuthService } from '../../auth/auth.service';
import { Router } from '@angular/router';

/**
 * PatientPortalComponent
 *
 * Provides a secure self-service portal for patients to:
 * - View confirmed and pending appointments (triage-based)
 * - View prescriptions
 * - View care plans
 * - Submit new appointment requests via triage
 * - See dismissible approval notifications when a GP confirms their request
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

  /** Prescription list */
  prescriptions: any[] = [];

  /** Careplan list */
  careplans: any[] = [];

  // ── Triage-based appointment state ───────────────────────────────

  /** All triage appointments for this patient */
  allTriageAppointments: any[] = [];

  /** Pending (requested, awaiting GP) triage appointments */
  pendingRequests: any[] = [];

  /** Confirmed / rescheduled / declined appointments */
  confirmedAppointments: any[] = [];

  /**
   * Appointments that have been actioned by the GP but the patient
   * hasn't seen the notification yet.
   */
  unseenApprovals: any[] = [];

  /** Controls whether the approval notification banner is visible */
  showApprovalBanner = false;

  constructor(
    private api: Api,
    private auth: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    const pid = this.auth.getPatientId();
    if (!pid) {
      this.showToast('Session expired — please log in again.', 'error');
      return;
    }
    this.loadPatient(pid);
    this.loadTriageAppointments(pid);
  }

  // ─────────────────────────────────────────────────────────────────
  // NAVIGATION
  // ─────────────────────────────────────────────────────────────────

  startTriage() {
    this.router.navigate(['/patient/triage']);
  }

  // ─────────────────────────────────────────────────────────────────
  // TOAST & LOADING HELPERS
  // ─────────────────────────────────────────────────────────────────

  private showToast(msg: string, type: 'success' | 'error' = 'success') {
    this.toastMessage = msg;
    this.toastType = type;
    setTimeout(() => (this.toastMessage = ''), 4000);
  }

  private startLoading() { this.loading = true; }
  private stopLoading()  { this.loading = false; }

  // ─────────────────────────────────────────────────────────────────
  // LOAD PATIENT PROFILE (prescriptions / careplans only now)
  // ─────────────────────────────────────────────────────────────────

  private loadPatient(id: string) {
    this.startLoading();

    this.api.getPatient(id).subscribe({
      next: (res) => {
        const p = res.data;
        this.patient = p;
        this.prescriptions = p.prescriptions || [];
        this.careplans     = p.careplans     || [];
      },
      error: () => {
        this.showToast('Failed to load your profile. Please try again.', 'error');
      },
      complete: () => this.stopLoading()
    });
  }

  // ─────────────────────────────────────────────────────────────────
  // LOAD TRIAGE-BASED APPOINTMENTS
  // ─────────────────────────────────────────────────────────────────

  private loadTriageAppointments(patientId: string) {
    this.api.getPatientTriageAppointments(patientId).subscribe({
      next: (res: any) => {
        const data = res.data || {};

        this.allTriageAppointments = data.appointments || [];
        this.pendingRequests       = data.pending       || [];
        this.unseenApprovals       = data.unseen_approvals || [];

        // Confirmed = everything that is not "requested"
        this.confirmedAppointments = (data.confirmed || []).sort((a: any, b: any) => {
          return new Date(a.datetime).getTime() - new Date(b.datetime).getTime();
        });

        // Show the approval banner if there are unseen approvals
        this.showApprovalBanner = this.unseenApprovals.length > 0;
      },
      error: () => {
        // Non-fatal — portal still usable without triage data
        console.warn('Could not load triage appointments');
      }
    });
  }

  // ─────────────────────────────────────────────────────────────────
  // APPROVAL NOTIFICATION BANNER
  // ─────────────────────────────────────────────────────────────────

  /**
   * Dismiss a single approval notification.
   * Calls the API to persist seen_by_patient = true, then removes it from the list.
   */
  dismissApproval(appointment: any) {
    const id = appointment._id;

    this.api.markAppointmentSeen(id).subscribe({
      next: () => {
        this.unseenApprovals = this.unseenApprovals.filter(a => a._id !== id);
        this.showApprovalBanner = this.unseenApprovals.length > 0;
      },
      error: () => {
        // Dismiss locally even if the API call fails
        this.unseenApprovals = this.unseenApprovals.filter(a => a._id !== id);
        this.showApprovalBanner = this.unseenApprovals.length > 0;
      }
    });
  }

  /** Dismiss ALL unseen approval notifications at once */
  dismissAllApprovals() {
    this.unseenApprovals.forEach(a => {
      this.api.markAppointmentSeen(a._id).subscribe();
    });
    this.unseenApprovals = [];
    this.showApprovalBanner = false;
  }

  // ─────────────────────────────────────────────────────────────────
  // HELPERS
  // ─────────────────────────────────────────────────────────────────

  /**
   * Formats a date value for display.
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
   * Formats a datetime (includes time) for triage appointment display.
   */
  fmtDateTime(date: string | Date): string {
    if (!date) return '—';
    return new Date(date).toLocaleString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Returns the Bootstrap badge class for appointment status.
   */
  badge(status: string): string {
    switch (status?.toLowerCase()) {
      case 'requested':   return 'bg-warning text-dark';
      case 'confirmed':   return 'bg-success';
      case 'rescheduled': return 'bg-info';
      case 'declined':    return 'bg-danger';
      case 'completed':   return 'bg-secondary';
      default:            return 'bg-secondary';
    }
  }

  /**
   * Human-friendly label for triage urgency level.
   */
  urgencyLabel(urgency: string): string {
    switch (urgency?.toLowerCase()) {
      case 'emergency': return 'Emergency';
      case 'urgent':    return 'Urgent';
      case 'routine':   return 'Routine';
      case 'low':       return 'Low';
      default:          return 'Standard';
    }
  }

  /**
   * CSS class for triage urgency badge.
   */
  urgencyClass(urgency: string): string {
    switch (urgency?.toLowerCase()) {
      case 'emergency': return 'urgency-emergency';
      case 'urgent':    return 'urgency-urgent';
      case 'routine':   return 'urgency-routine';
      case 'low':       return 'urgency-low';
      default:          return 'urgency-routine';
    }
  }

  /**
   * Icon for approval notification based on status.
   */
  approvalIcon(status: string): string {
    switch (status?.toLowerCase()) {
      case 'confirmed':   return 'bi-check-circle-fill';
      case 'rescheduled': return 'bi-calendar2-check-fill';
      case 'declined':    return 'bi-x-circle-fill';
      default:            return 'bi-bell-fill';
    }
  }

  /**
   * CSS modifier for approval notification card.
   */
  approvalCardClass(status: string): string {
    switch (status?.toLowerCase()) {
      case 'confirmed':   return 'approval-confirmed';
      case 'rescheduled': return 'approval-rescheduled';
      case 'declined':    return 'approval-declined';
      default:            return 'approval-confirmed';
    }
  }

  /**
   * Human-readable message for the approval notification.
   */
  approvalMessage(appt: any): string {
    const date = this.fmtDateTime(appt.datetime);
    switch (appt.status?.toLowerCase()) {
      case 'confirmed':
        return `Your appointment on ${date} has been confirmed by your GP.`;
      case 'rescheduled':
        return `Your appointment has been rescheduled to ${date}.`;
      case 'declined':
        return `Your appointment request for ${date} could not be accommodated. Please contact the clinic.`;
      default:
        return `Your appointment on ${date} has been updated.`;
    }
  }

  /**
   * Returns Bootstrap class for prescription status.
   */
  getPrescriptionStatusClass(p: any): string {
    const s = p.status?.toLowerCase();
    if (!s) return 'bg-secondary';
    if (['active', 'ongoing'].includes(s))       return 'bg-success';
    if (['completed', 'finished'].includes(s))   return 'bg-primary';
    if (['stopped', 'cancelled'].includes(s))    return 'bg-danger';
    if (['pending', 'requested'].includes(s))    return 'bg-warning text-dark';
    if (s === 'expired')                          return 'bg-secondary';
    return 'bg-info';
  }
}