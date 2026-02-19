//src/app/components/home/home.ts
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

  constructor(
    private api: Api,
    public router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadDashboard();
  }

  ngAfterViewInit(): void {}

  ngOnDestroy(): void {}

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
      this.pendingRequests = pending.length;
      this.pendingAppointmentsList = pending.sort((a: any, b: any) => {
        return new Date(a.datetime).getTime() - new Date(b.datetime).getTime();
      });
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
}