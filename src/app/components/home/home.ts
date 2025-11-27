// src/app/components/home/home.ts
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { GoogleMapsModule } from '@angular/google-maps';
import { FormsModule } from '@angular/forms';
import { Api } from '../../services/api';
import Chart from 'chart.js/auto';

interface PatientListItem {
  _id?: string;
  id?: string;
  name: string;
  town?: string;
  location?: {
    coordinates: [number, number];
  };
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, GoogleMapsModule, FormsModule],
  templateUrl: './home.html',
  styleUrls: ['./home.css'],
})
export class HomeComponent implements OnInit, AfterViewInit {
  @ViewChild('patientsByTownChart', { static: false })
  chartCanvas!: ElementRef<HTMLCanvasElement>;

  // === DASHBOARD STATS ===
  totalPatients = 0;
  totalAppointments = 0;
  totalPrescriptions = 0;
  totalCareplans = 0;

  // === PENDING + CHECKLIST ===
  pendingRequests = 0;
  gpChecklist: any[] = [];

  // === PATIENTS ===
  allPatients: any[] = [];
  recentAppointments: any[] = [];

  // === MAP ===
  mapMarkers: google.maps.LatLngLiteral[] = [];
  mapOptions: google.maps.MapOptions = {
    center: { lat: 54.95, lng: -7.75 }, // Letterkenny Practice Coordinates
    zoom: 12,
    mapTypeId: 'roadmap',
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

  // -------------------------------------------------------------
  // LOAD DASHBOARD (LIST → HYDRATE EACH PATIENT)
  // -------------------------------------------------------------
  private loadDashboard(): void {
    // 1. Load pending requests (fast)
    this.api.getPendingRequests().subscribe(res => {
      this.pendingRequests = res.data?.pending || 0;
    });

    // 2. Load main patient list
    this.api.getPatients(1, 500).subscribe((res: any) => {
      const list: PatientListItem[] = res.data.patients || [];
      this.totalPatients = res.data.count || list.length;

      // hydrate each patient record
      this.hydratePatients(list);
    });
  }

  // -------------------------------------------------------------
  // LOAD FULL PATIENT DATA (appointments, careplans, etc.)
  // -------------------------------------------------------------
  private hydratePatients(list: PatientListItem[]): void {
    this.allPatients = [];
    this.recentAppointments = [];
    this.mapMarkers = [];
    this.totalAppointments = 0;
    this.totalPrescriptions = 0;
    this.totalCareplans = 0;

    let loaded = 0;

    list.forEach((p: PatientListItem) => {
      const id: string = (p._id ?? p.id)!;

      this.api.getPatient(id).subscribe((full: any) => {
        const patient = full.data;
        this.allPatients.push(patient);

        // ---- STATS ----
        this.totalAppointments += patient.appointments?.length || 0;
        this.totalPrescriptions += patient.prescriptions?.length || 0;
        this.totalCareplans += patient.careplans?.length || 0;

        // ---- MAP ----
        if (patient.location?.coordinates) {
          const [lng, lat] = patient.location.coordinates;
          this.mapMarkers.push({ lat, lng });
        }

        // ---- RECENT APPOINTMENTS ----
        if (Array.isArray(patient.appointments)) {
          patient.appointments.forEach((a: any) => {
            this.recentAppointments.push({
              _id: a._id,
              patient: patient.name,
              date: new Date(a.date).toISOString(),
              doctor: a.doctor || 'GP',
              status: a.status || 'scheduled',
            });
          });
        }

        // ---- CHECKLIST ITEMS ----
        this.addChecklistItems(patient);

        // Wait until all are loaded
        loaded++;
        if (loaded === list.length) {
          this.finishDashboard();
        }
      });
    });
  }

  // -------------------------------------------------------------
  // BUILD CHECKLIST
  // -------------------------------------------------------------
  private addChecklistItems(patient: any): void {
    // Appointment Requests
    (patient.appointments || []).forEach((a: any) => {
      if (a.status === 'requested') {
        this.gpChecklist.push({
          type: 'Appointment Request',
          patient: patient.name,
          date: a.date,
          action: 'Review & approve',
          link: `/gp/patients/${patient._id}`,
        });
      }
    });

    // Careplans needing review (example rule)
    (patient.careplans || []).forEach((c: any) => {
      if (c.status === 'active' && c.goal?.length < 10) {
        this.gpChecklist.push({
          type: 'Careplan Review',
          patient: patient.name,
          date: new Date().toISOString(),
          action: 'Update goals',
          link: `/gp/patients/${patient._id}`,
        });
      }
    });
  }

  // -------------------------------------------------------------
  // FINAL SORTING & PROCESSING
  // -------------------------------------------------------------
  private finishDashboard(): void {
    // sort recent appointments
    this.recentAppointments.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    this.recentAppointments = this.recentAppointments.slice(0, 5);

    // sort checklist newest → oldest
    this.gpChecklist.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    // adjust map if only 1 patient
    if (this.mapMarkers.length === 1) {
      this.mapOptions = {
        center: this.mapMarkers[0],
        zoom: 13,
      };
    }

    this.cdr.detectChanges();
  }

  // -------------------------------------------------------------
  // NAVIGATION
  // -------------------------------------------------------------
  goToPatient(id: string) {
    this.router.navigate(['/gp/patients', id]);
  }
}
