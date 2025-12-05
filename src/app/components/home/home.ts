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

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    GoogleMapsModule,
    HomeCalendarComponent
  ],
  templateUrl: './home.html',
  styleUrls: ['./home.css'],
})
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {

  today = new Date();

  // Dashboard Stats
  totalPatients = 0;
  totalAppointments = 0;
  totalPrescriptions = 0;
  totalCareplans = 0;

  // Pending & Checklist
  pendingRequests = 0;
  gpChecklist: any[] = [];

  // Patient Data
  allPatients: any[] = [];
  recentAppointments: any[] = [];

  // Calendar events
  events: EventInput[] = [];

  // Map
  mapCenter: google.maps.LatLngLiteral = { lat: 54.95, lng: -7.75 };
  mapZoom = 12;
  mapMarkers: google.maps.LatLngLiteral[] = [];
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

  // === DASHBOARD DATA LOADING ===
  private loadDashboard(): void {
    this.api.getPendingRequests().subscribe((res) => {
      this.pendingRequests = res.data?.pending || 0;
    });

    this.api.getPatientSummary().subscribe((res) => {
      const list = res.data?.patients || [];
      this.processSummary(list);
    });
  }

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

      // Add map marker
      if (p.location?.coordinates) {
        const [lng, lat] = p.location.coordinates;
        this.mapMarkers.push({ lat, lng });
      }

      // Recent appointments
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

    // Build calendar events (FullCalendar)
    this.events = this.recentAppointments.map(a => ({
      title: a.patient,
      date: a.date,
      backgroundColor: this.statusColor(a.status),
      borderColor: this.statusColor(a.status)
    }));

    this.cdr.detectChanges();
  }

  private statusColor(status: string): string {
    switch (status.toLowerCase()) {
      case 'completed': return '#198754';
      case 'scheduled': return '#0d6efd';
      case 'requested': return '#ffc107';
      case 'cancelled': return '#6c757d';
      default: return '#0d6efd';
    }
  }

  goToFirstPending() {
    const first = this.gpChecklist.find((i) => i.type === 'Appointment Request');
    if (first) this.router.navigate(first.link);
    else this.router.navigate(['/gp/patients']);
  }
}
