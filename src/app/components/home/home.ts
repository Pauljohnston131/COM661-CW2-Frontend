// src/app/components/home/home.ts
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { GoogleMapsModule } from '@angular/google-maps';
import { Api } from '../../services/api';
import { EventInput } from '@fullcalendar/core';
import { HomeCalendarComponent } from './calendar/home-calendar.component';
import { HighlightUrgentDirective } from '../../directives/highlight-urgent.directive';

/**
 * Home dashboard component for GP users.
 * Displays key system statistics, recent appointments, pending requests,
 * interactive maps, and a calendar overview.
 */
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    GoogleMapsModule,
    HomeCalendarComponent,
    HighlightUrgentDirective
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

  /** GP checklist items for outstanding actions */
  gpChecklist: any[] = [];

  /** Array of all patient records */
  allPatients: any[] = [];

  /** List of recent appointments displayed on the dashboard */
  recentAppointments: any[] = [];

  /** Calendar event list derived from recent appointments */
  events: EventInput[] = [];

  /** Default map centre location */
  mapCenter: google.maps.LatLngLiteral = { lat: 54.95, lng: -7.75 };

  /** Default map zoom level */
  mapZoom = 12;

  /** Map marker locations for patient addresses */
  mapMarkers: google.maps.LatLngLiteral[] = [];

  /** Map configuration options */
  mapOptions: google.maps.MapOptions = {
    mapTypeId: 'terrain',
    fullscreenControl: false,
    mapTypeControl: false,
  };

  constructor(
    private api: Api,
    public router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  /**
   * Lifecycle hook that runs on component initialisation.
   * Loads all dashboard statistics and data.
   */
  ngOnInit(): void {
    this.loadDashboard();
  }

  /**
   * Lifecycle hook that runs after the view has fully initialised.
   */
  ngAfterViewInit(): void {}

  /**
   * Lifecycle hook that runs when the component is destroyed.
   */
  ngOnDestroy(): void {}

  /**
   * Loads all main dashboard data including:
   * - Pending appointment request count
   * - Patient summary data
   */
  private loadDashboard(): void {
    this.api.getPendingRequests().subscribe((res) => {
      this.pendingRequests = res.data?.pending || 0;
    });

    this.api.getPatientSummary().subscribe((res) => {
      const list = res.data?.patients || [];
      this.processSummary(list);
    });
  }

  /**
   * Processes patient summary data and calculates all dashboard statistics.
   * Also prepares recent appointment data, map markers, and checklist items.
   *
   * @param list Array of patient summary objects
   */
  private processSummary(list: any[]): void {
    this.allPatients = list;
    this.mapMarkers = [];
    this.recentAppointments = [];
    this.gpChecklist = [];

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

      this.addChecklistItems(p);
    });

    this.finishDashboard();
  }

  /**
   * Adds checklist items for any patients with pending appointment requests.
   *
   * @param patient Patient object containing appointment data
   */
  private addChecklistItems(patient: any): void {
    (patient.appointments || []).forEach((a: any) => {
      if (a.status === 'requested') {
        this.gpChecklist.push({
          type: 'Appointment Request',
          patient: patient.name,
          date: a.date || new Date().toISOString(),
          action: 'Review request',
          link: ['/gp/patients', patient.id],
        });
      }
    });
  }

  /**
   * Finalises dashboard setup including:
   * - Sorting recent appointments
   * - Limiting results to 5 entries
   * - Adjusting map zoom
   * - Preparing calendar events
   */
  private finishDashboard(): void {
    this.recentAppointments.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    this.recentAppointments = this.recentAppointments.slice(0, 5);

    this.gpChecklist.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    if (this.mapMarkers.length === 1) {
      this.mapCenter = this.mapMarkers[0];
      this.mapZoom = 14;
    }

    this.events = this.recentAppointments.map(a => ({
      title: a.patient,
      date: a.date,
      backgroundColor: this.statusColor(a.status),
      borderColor: this.statusColor(a.status)
    }));

    this.cdr.detectChanges();
  }

  /**
   * Returns the correct display colour for an appointment status.
   *
   * @param status Appointment status
   * @returns Hex colour code
   */
  private statusColor(status: string): string {
    switch (status.toLowerCase()) {
      case 'completed': return '#198754';
      case 'scheduled': return '#0d6efd';
      case 'requested': return '#ffc107';
      case 'cancelled': return '#6c757d';
      default: return '#0d6efd';
    }
  }

  /**
   * Navigates the GP to the first pending appointment request.
   * If none exist, redirects to the patient list view.
   */
  goToFirstPending() {
    const first = this.gpChecklist.find((i) => i.type === 'Appointment Request');
    if (first) this.router.navigate(first.link);
    else this.router.navigate(['/gp/patients']);
  }
}
