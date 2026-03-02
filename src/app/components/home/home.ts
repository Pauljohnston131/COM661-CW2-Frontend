import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { GoogleMapsModule } from '@angular/google-maps';
import { Api } from '../../services/api';
import { EventInput } from '@fullcalendar/core';
import { HomeCalendarComponent } from './calendar/home-calendar.component';

/**
 * Home dashboard component for GP users.
 * Displays key system statistics, recent appointments, pending requests,
 * interactive maps, a calendar overview, and daily notes/reminders.
 */
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    GoogleMapsModule,
    HomeCalendarComponent,
  ],
  templateUrl: './home.html',
  styleUrls: ['./home.css'],
})
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {

  /** Current date used for dashboard display */
  today = new Date();

  /** Total number of registered patients */
  totalPatients = 0;

  /** Total number of appointments across all patients */
  totalAppointments = 0;

  /** Total number of prescriptions issued */
  totalPrescriptions = 0;

  /** Total number of care plans assigned */
  totalCareplans = 0;

  /** Total number of pending appointment requests */
  pendingRequests = 0;

  /** Pending appointment requests awaiting GP review */
  pendingAppointmentsList: any[] = [];

  /** Total number of confirmed appointments */
  confirmedAppointmentsCount = 0;

  /** Today's appointments */
  todayAppointments: any[] = [];

  /** Array of all patient records */
  allPatients: any[] = [];

  /** List of recent appointments displayed on the dashboard */
  recentAppointments: any[] = [];

  /** Calendar event list derived from confirmed appointments */
  events: EventInput[] = [];

  /** Default map centre location */
  mapCenter: google.maps.LatLngLiteral = { lat: 54.95, lng: -7.75 };

  /** Default map zoom level */
  mapZoom = 12;

  /** Map marker locations for patient addresses */
  mapMarkers: google.maps.LatLngLiteral[] = [];

  /** Triage Queue */
  triageQueue: any[] = [];

  /** Map configuration options */
  mapOptions: google.maps.MapOptions = {
    mapTypeId: 'terrain',
    fullscreenControl: false,
    mapTypeControl: false,
  };

  // UI State
  hoveredStat: string | null = null;
  hoveredSection: string | null = null;

  // ── Daily Notes ──────────────────────────────────────────
  /** Current text in the daily notes textarea */
  dailyNote = '';

  /** Timestamp of the last save */
  noteLastSaved: Date | null = null;

  /** Transient "Saved!" feedback flag */
  noteSaved = false;

  private noteSaveTimer: any;
  private readonly NOTES_KEY = 'gp_daily_note';

  // ── Reminders ────────────────────────────────────────────
  reminders: { text: string; done: boolean; priority: 'high' | 'medium' | 'low' }[] = [];
  newReminderText = '';
  private readonly REMINDERS_KEY = 'gp_reminders';

  get completedReminders(): number {
    return this.reminders.filter(r => r.done).length;
  }

  constructor(
    private api: Api,
    public router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadDashboard();
    this.loadNotes();
    this.loadReminders();
  }

  ngAfterViewInit(): void {}

  ngOnDestroy(): void {
    if (this.noteSaveTimer) clearTimeout(this.noteSaveTimer);
  }

  // ─────────────────────────────────────────────────────────
  // DAILY NOTES
  // ─────────────────────────────────────────────────────────

  /** Load today's note from localStorage (keyed by date) */
  private loadNotes(): void {
    const key = `${this.NOTES_KEY}_${this.todayKey()}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      const parsed = JSON.parse(saved);
      this.dailyNote = parsed.text || '';
      this.noteLastSaved = parsed.savedAt ? new Date(parsed.savedAt) : null;
    }
  }

  /** Save the current note to localStorage */
  saveNote(): void {
    const key = `${this.NOTES_KEY}_${this.todayKey()}`;
    const payload = { text: this.dailyNote, savedAt: new Date().toISOString() };
    localStorage.setItem(key, JSON.stringify(payload));
    this.noteLastSaved = new Date();
    this.noteSaved = true;
    if (this.noteSaveTimer) clearTimeout(this.noteSaveTimer);
    this.noteSaveTimer = setTimeout(() => {
      this.noteSaved = false;
      this.cdr.detectChanges();
    }, 2500);
  }

  // ─────────────────────────────────────────────────────────
  // REMINDERS
  // ─────────────────────────────────────────────────────────

  /** Load today's reminders from localStorage */
  private loadReminders(): void {
    const key = `${this.REMINDERS_KEY}_${this.todayKey()}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      this.reminders = JSON.parse(saved);
    } else {
      // Seed with a couple of default reminders on first visit
      this.reminders = [
        { text: 'Review triage inbox', done: false, priority: 'high' }
      ];
      this.persistReminders();
    }
  }

  /** Toggle a reminder's done state */
  toggleReminder(index: number): void {
    this.reminders[index].done = !this.reminders[index].done;
    this.persistReminders();
  }

  /** Add a new reminder from the input field */
  addReminder(): void {
    const text = this.newReminderText.trim();
    if (!text) return;
    this.reminders.push({ text, done: false, priority: 'medium' });
    this.newReminderText = '';
    this.persistReminders();
  }

  /** Persist reminders to localStorage */
  private persistReminders(): void {
    const key = `${this.REMINDERS_KEY}_${this.todayKey()}`;
    localStorage.setItem(key, JSON.stringify(this.reminders));
  }

  /** Returns a YYYY-MM-DD string for today, used as part of storage keys */
  private todayKey(): string {
    return this.today.toISOString().slice(0, 10);
  }

  // ─────────────────────────────────────────────────────────
  // DASHBOARD DATA
  // ─────────────────────────────────────────────────────────

  /**
   * Loads all main dashboard data
   */
  private loadDashboard(): void {
    // 1. GP triage inbox (unreviewed cases)
    this.api.getGpTriageQueue().subscribe((res) => {
      this.triageQueue = res.data?.cases || [];
    });

    // 2. Pending appointment requests from triage system
    this.api.getPendingAppointments().subscribe((res) => {

      const pending = res.data?.appointments || [];

      // Add computed age from DOB
      pending.forEach((appt: any) => {
        appt.patient_age = appt.patient_age || appt.age || '?';
      });

      // Sort by highest score first (clinical priority)
      this.pendingAppointmentsList = pending.sort((a: any, b: any) => {
        return (b.score || 0) - (a.score || 0);
      });

      this.pendingRequests = this.pendingAppointmentsList.length;
    });

    // 3. Patient summary for stats and map only
    this.api.getPatientSummary().subscribe((res) => {
      this.processSummary(res.data?.patients || []);
    });

    // 4. Load confirmed appointments for calendar
    this.api.getGpCalendar().subscribe((res) => {
      const confirmed = res.data?.appointments || [];
      this.confirmedAppointmentsCount = confirmed.length;

      // Filter today's appointments
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      this.todayAppointments = confirmed.filter((appt: any) => {
        const apptDate = new Date(appt.datetime);
        return apptDate >= today && apptDate < tomorrow;
      }).sort((a: any, b: any) => {
        return new Date(a.datetime).getTime() - new Date(b.datetime).getTime();
      });

      // Map to FullCalendar event format
      this.events = confirmed.map((appt: any) => ({
        title: appt.patient_name || 'Patient',
        start: appt.datetime,
        backgroundColor: this.getAppointmentColor(appt.status),
        borderColor: this.getAppointmentColor(appt.status),
        extendedProps: {
          appointmentId: appt._id,
          triageId: appt.triage_id,
          status: appt.status
        }
      }));
    });
  }

  /**
   * Handle calendar event clicks
   */
  onCalendarEventClick(props: any): void {
    if (props?.appointmentId) {
      this.router.navigate(['/gp/appointment-review', props.appointmentId]);
    }
  }

  /**
   * Get appointment color based on status
   */
  private getAppointmentColor(status: string): string {
    switch (status?.toLowerCase()) {
      case 'confirmed': return '#10b981';
      case 'rescheduled': return '#f59e0b';
      case 'requested': return '#3b82f6';
      default: return '#6b7280';
    }
  }

  /**
   * Returns a CSS class string based on urgency level and triage score.
   */
  getUrgencyClass(appt: any): string {
    const urgency = appt.urgency?.toLowerCase();
    const score = appt.score || 0;

    if (urgency === 'urgent' || urgency === 'high' || score >= 7) {
      return 'urgency-high';
    } else if (urgency === 'moderate' || urgency === 'medium' || score >= 4) {
      return 'urgency-moderate';
    } else {
      return 'urgency-routine';
    }
  }

  /**
   * Returns a human-readable urgency label for display in the badge.
   */
  getUrgencyLabel(appt: any): string {
    const urgency = appt.urgency?.toLowerCase();
    const score = appt.score || 0;

    if (urgency === 'urgent' || urgency === 'high' || score >= 7) {
      return 'Urgent';
    } else if (urgency === 'moderate' || urgency === 'medium' || score >= 4) {
      return 'Moderate';
    } else {
      return 'Routine';
    }
  }

  /**
   * Returns a human-readable waiting time string from a submitted_at timestamp.
   */
  getWaitingTime(appt: any): string {
    const submitted = appt.submitted_at || appt.created_at || appt.datetime;
    if (!submitted) return '';

    const now = new Date();
    const then = new Date(submitted);
    const diffMs = now.getTime() - then.getTime();

    const minutes = Math.floor(diffMs / (1000 * 60));
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (minutes < 5) return 'Just now';
    if (minutes < 60) return `${minutes} min ago`;
    if (hours < 24) return `${hours} hr${hours > 1 ? 's' : ''} ago`;
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }

  /**
   * Returns a CSS class for the waiting time label.
   */
  getWaitingTimeClass(appt: any): string {
    const submitted = appt.submitted_at || appt.created_at || appt.datetime;
    if (!submitted) return '';

    const diffMs = new Date().getTime() - new Date(submitted).getTime();
    const hours = diffMs / (1000 * 60 * 60);

    if (hours >= 48) return 'wait-overdue';
    if (hours >= 24) return 'wait-warning';
    return 'wait-normal';
  }

  /**
   * Processes patient summary data and calculates dashboard statistics
   */
  private processSummary(list: any[]): void {
    this.allPatients = list;
    this.mapMarkers = [];
    this.recentAppointments = [];

    this.totalPatients = list.length;
    this.totalAppointments = 0;
    this.totalPrescriptions = 0;
    this.totalCareplans = 0;

    list.forEach((p) => {
      this.totalAppointments += p.appointments?.length || 0;
      this.totalCareplans += p.careplans?.length || 0;
      this.totalPrescriptions += p.prescriptions_count || 0;

      if (p.location?.coordinates) {
        const [lng, lat] = p.location.coordinates;
        this.mapMarkers.push({ lat, lng });
      }

      p.appointments?.forEach((a: any) => {
        if (!a.date) return;
        this.recentAppointments.push({
          _id: a.id,
          patient: p.name,
          date: new Date(a.date).toISOString(),
          doctor: a.doctor || 'GP',
          status: a.status || 'scheduled',
        });
      });
    });

    this.finishDashboard();
  }

  /**
   * Finalises dashboard setup
   */
  private finishDashboard(): void {
    this.recentAppointments.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    this.recentAppointments = this.recentAppointments.slice(0, 5);

    if (this.mapMarkers.length === 1) {
      this.mapCenter = this.mapMarkers[0];
      this.mapZoom = 14;
    }

    this.cdr.detectChanges();
  }

  /**
   * Navigates to the first pending appointment request
   */
  goToFirstPending() {
    if (this.pendingAppointmentsList.length > 0) {
      this.router.navigate(['/gp/appointment-review', this.pendingAppointmentsList[0]._id]);
    }
  }

  /**
   * Navigate to a specific appointment
   */
  navigateToAppointment(appointmentId: string): void {
    this.router.navigate(['/gp/appointment-review', appointmentId]);
  }

  // Helper methods for UI enhancements
  setHoveredStat(stat: string | null) {
    this.hoveredStat = stat;
  }

  setHoveredSection(section: string | null) {
    this.hoveredSection = section;
  }
}