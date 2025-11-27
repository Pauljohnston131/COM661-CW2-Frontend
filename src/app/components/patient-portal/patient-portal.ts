// src/app/components/patient-portal/patient-portal.ts
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
  styleUrl: './patient-portal.css'
})
export class PatientPortalComponent {

  patient: any = null;

  showAllAppointments = false;
  showAllPrescriptions = false;
  showAllCareplans = false;


  requestDate = '';
  requestSymptoms = '';
  submitted = false;

  prescriptions: any[] = [];
  careplans: any[] = [];

  constructor(
    private api: Api,
    private auth: AuthService
  ) {}

  ngOnInit() {
    const pid = this.auth.getPatientId();
    if (!pid) {
      console.error("No patient_id found in token.");
      return;
    }
    this.loadPatient(pid);
  }

  private loadPatient(id: string) {
    this.api.getPatient(id).subscribe({
      next: (res) => {
        const p = res.data;
        this.patient = p;

        // All embedded data comes from GET /patients/:id
        this.patient.appointments = p.appointments || [];
        this.prescriptions = p.prescriptions || [];
        this.careplans = p.careplans || [];
      },
      error: (err) => {
        console.error('Failed to load patient:', err);
      }
    });
  }

  submitRequest() {
  if (!this.requestDate || !this.requestSymptoms.trim()) return;

  const payload = {
    date: this.requestDate,
    notes: this.requestSymptoms
  };

  const pid = this.patient._id || this.patient.id;

  this.api.requestAppointment(pid, payload).subscribe({
    next: () => {
      this.submitted = true;

      // Refresh patient to show new requested appointment
      this.loadPatient(pid);

      // Reset form
      this.requestDate = '';
      this.requestSymptoms = '';
    },
    error: (err) => {
      console.error('Failed to submit appointment request:', err);
    }
  });
}
}
  
