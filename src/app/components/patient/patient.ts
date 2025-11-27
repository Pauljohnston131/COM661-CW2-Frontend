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

interface MapMarker {
  position: google.maps.LatLngLiteral;
  title: string;
}

@Component({
  selector: 'app-patient',
  standalone: true,
  imports: [CommonModule, GoogleMapsModule, ReactiveFormsModule],
  templateUrl: './patient.html',
  styleUrls: ['./patient.css']
})
export class Patient implements OnInit {

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

  // editing state
  editingAppointmentId: string | null = null;
  editingPrescriptionId: string | null = null;
  editingCareplanId: string | null = null;

  // UI state
  loading = false;
  toastMessage = '';
  toastType: 'success' | 'danger' | '' = '';

  map_options: google.maps.MapOptions = {
    zoom: 12,
    center: { lat: 54.948, lng: -7.75 }
  };

  map_markers: MapMarker[] = [];

  constructor(
    private api: Api,
    private route: ActivatedRoute,
    private fb: FormBuilder
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.loadPatient(id);

    // ----------- FORMS -----------
    this.appointmentForm = this.fb.group({
      doctor: ['', Validators.required],
      date: ['', Validators.required],
      notes: [''],
      status: ['scheduled', Validators.required]
    });

    // Prescriptions must match backend: name, start, stop, status
    this.prescriptionForm = this.fb.group({
      name: ['', Validators.required],
      start: ['', Validators.required],
      stop: [''],
      status: ['active', Validators.required]
    });

    // Careplans must match backend: description + start required
    this.careplanForm = this.fb.group({
      description: ['', Validators.required],
      start: ['', Validators.required],
      stop: ['']
    });
  }

  // --------------------------
  // TOAST + HELPERS
  // --------------------------
  private showToast(message: string, type: 'success' | 'danger' = 'success') {
    this.toastMessage = message;
    this.toastType = type;
    window.setTimeout(() => {
      this.toastMessage = '';
      this.toastType = '';
    }, 3000);
  }

  private get patientId(): string | null {
    return this.patient?._id ?? this.patient?.id ?? null;
  }

  // --------------------------
  // LOAD PATIENT
  // --------------------------
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
            {
              position: { lat: this.patient_lat, lng: this.patient_lng },
              title: p.name
            }
          ];
        } else {
          this.map_markers = [];
        }
      },
      error: () => {
        this.showToast('Failed to load patient details.', 'danger');
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  // --------------------------
  // APPOINTMENTS
  // --------------------------
  startEditAppointment(a: any) {
    this.editingAppointmentId = a._id;
    this.appointmentForm.setValue({
      doctor: a.doctor || '',
      date: a.date ? a.date.substring(0, 10) : '',
      notes: a.notes || '',
      status: a.status || 'scheduled'
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
    if (this.appointmentForm.invalid || !this.patientId) return;
    const id = this.patientId;
    const payload = this.appointmentForm.value;

    // Update existing
    if (this.editingAppointmentId) {
      this.api.updateAppointment(id, this.editingAppointmentId, payload).subscribe({
        next: () => {
          this.showToast('Appointment updated successfully.');
          this.loadPatient(id);
          this.cancelEditAppointment();
        },
        error: () => this.showToast('Failed to update appointment.', 'danger')
      });
    } else {
      // Add new
      this.api.addAppointment(id, payload).subscribe({
        next: () => {
          this.showToast('Appointment added successfully.');
          this.loadPatient(id);
          this.appointmentForm.reset({
            doctor: '',
            date: '',
            notes: '',
            status: 'scheduled'
          });
        },
        error: () => this.showToast('Failed to add appointment.', 'danger')
      });
    }
  }

  updateAppointmentStatus(appt: any, status: string) {
    if (!this.patientId) return;
    const id = this.patientId;

    this.api.updateAppointment(id, appt._id, { status }).subscribe({
      next: () => {
        this.showToast('Appointment status updated.');
        this.loadPatient(id);
      },
      error: () => this.showToast('Failed to update status.', 'danger')
    });
  }

  deleteAppointment(appt: any) {
    if (!this.patientId) return;
    const id = this.patientId;

    this.api.deleteAppointment(id, appt._id).subscribe({
      next: () => {
        this.showToast('Appointment deleted.');
        // If we were editing this appointment, cancel
        if (this.editingAppointmentId === appt._id) {
          this.cancelEditAppointment();
        }
        this.loadPatient(id);
      },
      error: () => this.showToast('Failed to delete appointment.', 'danger')
    });
  }

  // --------------------------
  // PRESCRIPTIONS
  // --------------------------
  startEditPrescription(rx: any) {
    this.editingPrescriptionId = rx._id;
    this.prescriptionForm.setValue({
      name: rx.name || '',
      start: rx.start ? rx.start.substring(0, 10) : '',
      stop: rx.stop ? rx.stop.substring(0, 10) : '',
      status: rx.status || 'active'
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
    if (this.prescriptionForm.invalid || !this.patientId) return;

    const id = this.patientId;
    const payload = {
      name: this.prescriptionForm.value.name,
      start: this.prescriptionForm.value.start,
      stop: this.prescriptionForm.value.stop || null,
      status: this.prescriptionForm.value.status
    };

    if (this.editingPrescriptionId) {
      // Update
      this.api.updatePrescription(id, this.editingPrescriptionId, payload).subscribe({
        next: () => {
          this.showToast('Prescription updated successfully.');
          this.loadPatient(id);
          this.cancelEditPrescription();
        },
        error: () => this.showToast('Failed to update prescription.', 'danger')
      });
    } else {
      // Add
      this.api.addPrescription(id, payload).subscribe({
        next: () => {
          this.showToast('Prescription added successfully.');
          this.loadPatient(id);
          this.prescriptionForm.reset({
            name: '',
            start: '',
            stop: '',
            status: 'active'
          });
        },
        error: () => this.showToast('Failed to add prescription.', 'danger')
      });
    }
  }

  deletePrescription(rx: any) {
    if (!this.patientId) return;
    const id = this.patientId;

    this.api.deletePrescription(id, rx._id).subscribe({
      next: () => {
        this.showToast('Prescription deleted.');
        if (this.editingPrescriptionId === rx._id) {
          this.cancelEditPrescription();
        }
        this.loadPatient(id);
      },
      error: () => this.showToast('Failed to delete prescription.', 'danger')
    });
  }

  // --------------------------
  // CAREPLANS
  // --------------------------
  startEditCareplan(cp: any) {
    this.editingCareplanId = cp._id;
    this.careplanForm.setValue({
      description: cp.description || '',
      start: cp.start ? cp.start.substring(0, 10) : '',
      stop: cp.stop ? cp.stop.substring(0, 10) : ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
    if (this.careplanForm.invalid || !this.patientId) return;

    const id = this.patientId;
    const payload = {
      description: this.careplanForm.value.description,
      start: this.careplanForm.value.start,
      stop: this.careplanForm.value.stop || null
    };

    if (this.editingCareplanId) {
      this.api.updateCareplan(id, this.editingCareplanId, payload).subscribe({
        next: () => {
          this.showToast('Careplan updated successfully.');
          this.loadPatient(id);
          this.cancelEditCareplan();
        },
        error: () => this.showToast('Failed to update careplan.', 'danger')
      });
    } else {
      this.api.addCareplan(id, payload).subscribe({
        next: () => {
          this.showToast('Careplan added successfully.');
          this.loadPatient(id);
          this.careplanForm.reset({
            description: '',
            start: '',
            stop: ''
          });
        },
        error: () => this.showToast('Failed to add careplan.', 'danger')
      });
    }
  }

  deleteCareplan(cp: any) {
    if (!this.patientId) return;
    const id = this.patientId;

    this.api.deleteCareplan(id, cp._id).subscribe({
      next: () => {
        this.showToast('Careplan deleted.');
        if (this.editingCareplanId === cp._id) {
          this.cancelEditCareplan();
        }
        this.loadPatient(id);
      },
      error: () => this.showToast('Failed to delete careplan.', 'danger')
    });
  }

  // --------------------------
  // HELPERS
  // --------------------------
  fmt(date: string): string {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('en-UK', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
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
