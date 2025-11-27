// src/app/components/patient/patient.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { GoogleMapsModule } from '@angular/google-maps';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Api } from '../../services/api';

interface PatientRecord {
  _id?: string;
  id?: string;
  name: string;
  age: number;
  town?: string;
  condition?: string;
  age_group?: string;
  appointments?: any[];
  prescriptions?: any[];
  careplans?: any[];
  location?: {
    coordinates: [number, number];
  };
}

@Component({
  selector: 'app-patient',
  standalone: true,
  imports: [CommonModule, GoogleMapsModule, ReactiveFormsModule],
  templateUrl: './patient.html',
  styleUrls: ['./patient.css']
})
export class Patient implements OnInit {

  // Toast + Loading
  toastMessage: string | null = null;
  toastType: 'success' | 'error' = 'success';
  loading = false;

  // Editing states (required by your HTML)
  editingAppointmentId: string | null = null;
  editingPrescriptionId: string | null = null;
  editingCareplanId: string | null = null;

  patient: PatientRecord | null = null;

  appointments: any[] = [];
  prescriptions: any[] = [];
  careplans: any[] = [];

  patient_lat = 0;
  patient_lng = 0;

  showAllAppointments = false;
  showAllPrescriptions = false;
  showAllCareplans = false;

  appointmentForm!: FormGroup;
  prescriptionForm!: FormGroup;
  careplanForm!: FormGroup;

  map_options: google.maps.MapOptions = {
    zoom: 12,
    center: { lat: 54.948, lng: -7.75 }
  };

  map_markers: any[] = [];

  constructor(
    private api: Api,
    private route: ActivatedRoute,
    private fb: FormBuilder
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.loadPatient(id);

    // FORMS
    this.appointmentForm = this.fb.group({
      doctor: ['', Validators.required],
      date: ['', Validators.required],
      notes: [''],
      status: ['scheduled', Validators.required]
    });

    this.prescriptionForm = this.fb.group({
      name: ['', Validators.required],
      start: ['', Validators.required],
      stop: [''],
      status: ['active', Validators.required]
    });

    this.careplanForm = this.fb.group({
      description: ['', Validators.required],
      start: ['', Validators.required],
      stop: ['']
    });
  }

  //---------------------------------------------------
  // LOAD PATIENT
  //---------------------------------------------------
  private loadPatient(id: string) {
    this.loading = true;

    this.api.getPatient(id).subscribe({
      next: (res: any) => {
        const p: PatientRecord = res.data;
        this.patient = p;

        this.appointments = p.appointments || [];
        this.prescriptions = p.prescriptions || [];
        this.careplans = p.careplans || [];

        if (p.location?.coordinates) {
          this.patient_lng = p.location.coordinates[0];
          this.patient_lat = p.location.coordinates[1];

          this.map_options = {
            center: { lat: this.patient_lat, lng: this.patient_lng },
            zoom: 13
          };

          this.map_markers = [
            { position: { lat: this.patient_lat, lng: this.patient_lng }, title: p.name }
          ];
        }
      },
      error: () => this.showToast("Failed to load patient", "error"),
      complete: () => this.loading = false
    });
  }

  //---------------------------------------------------
  // TOAST
  //---------------------------------------------------
  showToast(msg: string, type: 'success' | 'error' = 'success') {
    this.toastMessage = msg;
    this.toastType = type;
    setTimeout(() => this.toastMessage = null, 2500);
  }

  //---------------------------------------------------
  // APPOINTMENT — EDIT + SAVE
  //---------------------------------------------------
  startEditAppointment(a: any) {
    this.editingAppointmentId = a._id;
    this.appointmentForm.patchValue(a);
  }

  cancelEditAppointment() {
    this.editingAppointmentId = null;
    this.appointmentForm.reset({
      doctor: '',
      date: '',
      notes: '',
      status: 'scheduled'
    });
  }

  saveAppointment() {
    if (!this.patient) return;
    const id = this.patient._id ?? this.patient.id;

    this.loading = true;

    // EDITING
    if (this.editingAppointmentId) {
      this.api.updateAppointment(id!, this.editingAppointmentId, this.appointmentForm.value)
        .subscribe({
          next: () => {
            this.showToast("Appointment updated!", "success");
            this.loadPatient(id!);
            this.cancelEditAppointment();
          },
          error: () => this.showToast("Failed to update appointment", "error"),
          complete: () => this.loading = false
        });
      return;
    }

    // ADDING
    this.api.addAppointment(id!, this.appointmentForm.value).subscribe({
      next: () => {
        this.showToast("Appointment added!", "success");
        this.loadPatient(id!);
        this.appointmentForm.reset({
          doctor: '', date: '', notes: '', status: 'scheduled'
        });
      },
      error: () => this.showToast("Error adding appointment", "error"),
      complete: () => this.loading = false
    });
  }

  //---------------------------------------------------
// APPOINTMENT STATUS UPDATE (needed by HTML)
//---------------------------------------------------
updateAppointmentStatus(appt: any, status: string) {
  if (!this.patient) return;
  const id = this.patient._id ?? this.patient.id;
  const apptId = appt._id;

  this.loading = true;

  this.api.updateAppointment(id!, apptId, { status }).subscribe({
    next: () => {
      this.showToast(`Appointment marked ${status}`, "success");
      this.loadPatient(id!);
    },
    error: () => this.showToast("Failed to update appointment status", "error"),
    complete: () => this.loading = false
  });
}


  //---------------------------------------------------
  // PRESCRIPTION — EDIT + SAVE
  //---------------------------------------------------
  startEditPrescription(rx: any) {
    this.editingPrescriptionId = rx._id;
    this.prescriptionForm.patchValue(rx);
  }

  cancelEditPrescription() {
    this.editingPrescriptionId = null;
    this.prescriptionForm.reset({
      name: '',
      start: '',
      stop: '',
      status: 'active'
    });
  }

  savePrescription() {
    if (!this.patient) return;
    const id = this.patient._id ?? this.patient.id;

    this.loading = true;

    if (this.editingPrescriptionId) {
      this.api.updatePrescription(id!, this.editingPrescriptionId, this.prescriptionForm.value)
        .subscribe({
          next: () => {
            this.showToast("Prescription updated!", "success");
            this.loadPatient(id!);
            this.cancelEditPrescription();
          },
          error: () => this.showToast("Failed to update prescription", "error"),
          complete: () => this.loading = false
        });
      return;
    }

    this.api.addPrescription(id!, this.prescriptionForm.value).subscribe({
      next: () => {
        this.showToast("Prescription added!", "success");
        this.loadPatient(id!);
        this.cancelEditPrescription();
      },
      error: () => this.showToast("Failed to add prescription", "error"),
      complete: () => this.loading = false
    });
  }

  //---------------------------------------------------
  // CAREPLAN — EDIT + SAVE
  //---------------------------------------------------
  startEditCareplan(c: any) {
    this.editingCareplanId = c._id;
    this.careplanForm.patchValue(c);
  }

  cancelEditCareplan() {
    this.editingCareplanId = null;
    this.careplanForm.reset({
      description: '',
      start: '',
      stop: ''
    });
  }

  saveCareplan() {
    if (!this.patient) return;
    const id = this.patient._id ?? this.patient.id;

    this.loading = true;

    if (this.editingCareplanId) {
      this.api.updateCareplan(id!, this.editingCareplanId, this.careplanForm.value)
        .subscribe({
          next: () => {
            this.showToast("Careplan updated!", "success");
            this.loadPatient(id!);
            this.cancelEditCareplan();
          },
          error: () => this.showToast("Failed to update careplan", "error"),
          complete: () => this.loading = false
        });
      return;
    }

    this.api.addCareplan(id!, this.careplanForm.value).subscribe({
      next: () => {
        this.showToast("Careplan added!", "success");
        this.loadPatient(id!);
        this.cancelEditCareplan();
      },
      error: () => this.showToast("Failed to add careplan", "error"),
      complete: () => this.loading = false
    });
  }

  //---------------------------------------------------
  // DELETE HELPERS
  //---------------------------------------------------
  deleteAppointment(a: any) {
    const id = this.patient?._id ?? this.patient?.id;
    this.api.deleteAppointment(id!, a._id).subscribe(() => this.loadPatient(id!));
  }

  deletePrescription(rx: any) {
    const id = this.patient?._id ?? this.patient?.id;
    this.api.deletePrescription(id!, rx._id).subscribe(() => this.loadPatient(id!));
  }

  deleteCareplan(c: any) {
    const id = this.patient?._id ?? this.patient?.id;
    this.api.deleteCareplan(id!, c._id).subscribe(() => this.loadPatient(id!));
  }

  //---------------------------------------------------
  // HELPERS
  //---------------------------------------------------
  fmt(date: string): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-UK', {
      month: 'short', day: 'numeric', year: 'numeric'
    });
  }

  badge(status: string): string {
    switch (status) {
      case 'scheduled': return 'bg-primary';
      case 'completed': return 'bg-success';
      case 'cancelled': return 'bg-danger';
      default: return 'bg-secondary';
    }
  }
}
