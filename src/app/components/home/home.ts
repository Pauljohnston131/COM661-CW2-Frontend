import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { GoogleMapsModule } from '@angular/google-maps';
import { PatientDataService } from '../../services/patient-data';
import Chart from 'chart.js/auto';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, GoogleMapsModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
  providers: [PatientDataService]
})
export class Home implements AfterViewInit {

  @ViewChild('patientsByTownChart') patientsByTownChartRef!: ElementRef<HTMLCanvasElement>;

  allPatients: any[] = [];

  totalPatients: number = 0;
  totalAppointments: number = 0;
  totalPrescriptions: number = 0;
  totalCareplans: number = 0;

  recentAppointments: any[] = [];

  // Google Maps
  mapOptions: google.maps.MapOptions = {};
  mapMarkers: any[] = [];

  private patientsByTownData: { [town: string]: number } = {};
  private chartInstance?: Chart;

  constructor(private patientData: PatientDataService) {}

  ngOnInit() {
    this.allPatients = this.patientData.getAllPatients() || [];
    this.totalPatients = this.allPatients.length;

    const allAppointments: any[] = [];
    const allPrescriptions: any[] = [];
    const allCareplans: any[] = [];

    // Aggregate stats + map markers + town counts
    this.allPatients.forEach(p => {
      const appts = p.appointments || [];
      const rx = p.prescriptions || [];
      const cps = p.careplans || [];

      this.totalAppointments += appts.length;
      this.totalPrescriptions += rx.length;
      this.totalCareplans += cps.length;

      // Flatten appointments for recent list
      appts.forEach((a: any) => {
  allAppointments.push({
    ...a,
    patientName: p.name
  });
});


      // Town counts
      const town = p.town || 'Unknown';
      this.patientsByTownData[town] = (this.patientsByTownData[town] || 0) + 1;

      // Map markers
      if (p.location && p.location.coordinates) {
        const lng = p.location.coordinates[0];
        const lat = p.location.coordinates[1];
        this.mapMarkers.push({
          position: { lat, lng },
          title: p.name
        });
      }
    });

    // Sort and take last 5 appointments (most recent)
    allAppointments.sort((a, b) => {
      const da = new Date(a.date).getTime();
      const db = new Date(b.date).getTime();
      return db - da; // descending
    });
    this.recentAppointments = allAppointments.slice(0, 5);

    // Map center: first marker or default Donegal-ish
    if (this.mapMarkers.length > 0) {
      this.mapOptions = {
        center: this.mapMarkers[0].position,
        zoom: 8
      };
    } else {
      this.mapOptions = {
        center: { lat: 54.95, lng: -7.75 },
        zoom: 8
      };
    }
  }

  ngAfterViewInit() {
    this.createPatientsByTownChart();
  }

  private createPatientsByTownChart() {
    const ctx = this.patientsByTownChartRef?.nativeElement;
    if (!ctx) return;

    const labels = Object.keys(this.patientsByTownData);
    const counts = labels.map(town => this.patientsByTownData[town]);

    if (this.chartInstance) {
      this.chartInstance.destroy();
    }

    this.chartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Patients per Town',
          data: counts
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false }
        },
        scales: {
          x: { title: { display: true, text: 'Town' } },
          y: { title: { display: true, text: 'Patients' }, beginAtZero: true }
        }
      }
    });
  }
}
