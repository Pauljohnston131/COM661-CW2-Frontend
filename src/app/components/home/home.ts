// src/app/components/home/home.component.ts
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
import { Api } from '../../services/api';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, GoogleMapsModule],
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
  pendingRequests = 0;

  // === RECENT APPOINTMENTS (required by your HTML!) ===
  recentAppointments: any[] = [];   // ← THIS WAS MISSING!

  // === MAP ===
  mapMarkers: google.maps.LatLngLiteral[] = [];
  mapOptions: google.maps.MapOptions = {
    center: { lat: 53.35, lng: -8.0 },
    zoom: 7,
    mapTypeId: 'roadmap',
  };

  // === CHART ===
  private patientsByTown: { [town: string]: number } = {};
  private chart?: Chart;

  constructor(
    private api: Api,
    public router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  ngAfterViewInit(): void {
    if (Object.keys(this.patientsByTown).length > 0) {
      this.createChart();
    }
  }

  private loadData(): void {
    // 1. Pending requests
    this.api.getPendingRequests().subscribe((res: any) => {
      this.pendingRequests = res.data?.pending || 0;
    });

    // 2. Load patients for stats + map + chart
    this.api.getPatients(1, 200).subscribe((res: any) => {
      const patients = res.data?.patients || [];
      this.totalPatients = res.data?.count || patients.length;

      // Reset everything
      this.mapMarkers = [];
      this.patientsByTown = {};
      this.totalAppointments = this.totalPrescriptions = this.totalCareplans = 0;
      this.recentAppointments = [];   // ← reset recent appointments

      let hasRealLocation = false;

      patients.forEach((p: any) => {
        // Stats
        this.totalAppointments += p.appointment_count || 0;
        this.totalPrescriptions += p.prescription_count || 0;
        this.totalCareplans += p.careplan_count || 0;

        // Town chart
        const town = (p.town || 'Unknown').trim();
        this.patientsByTown[town] = (this.patientsByTown[town] || 0) + 1;

        // Real location (MongoDB GeoJSON)
        if (
          p.location?.coordinates &&
          Array.isArray(p.location.coordinates) &&
          p.location.coordinates.length === 2
        ) {
          const [lng, lat] = p.location.coordinates;
          this.mapMarkers.push({ lat, lng });
          hasRealLocation = true;
        }

        // Collect recent appointments (you can limit to last 5)
        if (p.appointments && Array.isArray(p.appointments)) {
          this.recentAppointments.push(
            ...p.appointments.map((appt: any) => ({
              _id: appt._id,
              date: new Date(appt.date).toLocaleDateString(),
              patientName: p.name,
              doctor: appt.doctor || 'GP',
              status: appt.status || 'scheduled',
            }))
          );
        }
      });

      // Sort recent appointments by date (newest first) and keep only 5
      this.recentAppointments
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .splice(5);

      // Demo markers if no real locations
      if (!hasRealLocation) {
        this.mapMarkers = [
          { lat: 53.3498, lng: -6.2603 }, // Dublin
          { lat: 51.8985, lng: -8.4756 }, // Cork
          { lat: 52.6647, lng: -8.6231 }, // Limerick
          { lat: 53.2734, lng: -7.7783 }, // Mullingar
          { lat: 54.2766, lng: -8.4756 }, // Sligo
        ];
      }

      // Final map settings
      this.mapOptions = {
        center: this.mapMarkers.length === 1 ? this.mapMarkers[0] : { lat: 53.35, lng: -8.0 },
        zoom: this.mapMarkers.length === 1 ? 12 : 7.5,
      };

      this.cdr.detectChanges();
      this.createChart();
    });
  }

  private createChart(): void {
    if (!this.chartCanvas) return;

    const ctx = this.chartCanvas.nativeElement;
    const labels = Object.keys(this.patientsByTown);
    const data = Object.values(this.patientsByTown);

    if (labels.length === 0) return;

    if (this.chart) this.chart.destroy();

    this.chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Patients',
          data,
          backgroundColor: 'rgba(59, 130, 246, 0.7)',
          borderColor: '#3b82f6',
          borderWidth: 1,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          title: { display: true, text: 'Patients by Town' },
        },
        scales: { y: { beginAtZero: true } },
      },
    });
  }
}