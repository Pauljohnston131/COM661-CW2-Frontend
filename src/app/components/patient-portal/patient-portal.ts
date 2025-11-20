// src/app/components/patient-portal/patient-portal.ts
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Api } from '../../services/api';

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

  requestDate = '';
  requestSeverity = 1;
  requestSymptoms = '';
  symptomScore = 5;
  submitted = false;

  prescriptions: any[] = [];
  careplans: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private api: Api
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.loadPatient(id);
  }

  private loadPatient(id: string) {
    this.api.getPatient(id).subscribe(res => {
      const p = res.data;
      this.patient = p;
      this.prescriptions = p.prescriptions || [];
      this.careplans = p.careplans || [];
    });
  }

  submitRequest() {
    if (!this.requestDate || !this.requestSymptoms.trim()) return;

    const payload = {
      date: this.requestDate,
      notes: this.requestSymptoms,
      status: 'requested',
      severity: this.requestSeverity,
      score: this.symptomScore
    };

    this.api.addAppointment(this.patient.id, payload).subscribe(() => {
      this.submitted = true;

      // Refresh patient data so new appointment appears
      this.loadPatient(this.patient.id);

      // Reset form
      this.requestDate = '';
      this.requestSeverity = 1;
      this.requestSymptoms = '';
      this.symptomScore = 5;
    });
  }
}
