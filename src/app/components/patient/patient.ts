import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { GoogleMapsModule } from '@angular/google-maps';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { HighlightUrgentDirective } from '../../directives/highlight-urgent.directive';

import { Api } from '../../services/api';

import { Patient } from '../../models/patient.model';
import { Appointment } from '../../models/appointment.model';
import { Prescription } from '../../models/prescription.model';
import { Careplan } from '../../models/careplan.model';

/**
 * PatientComponent
 *
 * Displays a single patient profile including:
 * - Appointments
 * - Prescriptions
 * - Careplans
 * - Patient location on Google Maps
 *
 * Supports full CRUD operations for all related entities.
 */
@Component({
  selector: 'app-patient',
  standalone: true,
  imports: [CommonModule, GoogleMapsModule, ReactiveFormsModule, HighlightUrgentDirective],
  templateUrl: './patient.html',
  styleUrls: ['./patient.css']
})
export class PatientComponent implements OnInit {

  /** Toast notification message */
  toastMessage: string | null = null;

  /** Toast message type */
  toastType: 'success' | 'error' = 'success';

  /** Global loading indicator */
  loading = false;

  /** Tracks appointment being edited */
  editingAppointmentId: string | null = null;

  /** Tracks prescription being edited */
  editingPrescriptionId: string | null = null;

  /** Tracks careplan being edited */
  editingCareplanId: string | null = null;

  /** Selected patient record */
  patient: Patient | null = null;

  /** Appointment list */
  appointments: Appointment[] = [];

  /** Prescription list */
  prescriptions: Prescription[] = [];

  /** Careplan list */
  careplans: Careplan[] = [];

  /** Patient latitude */
  patient_lat = 0;

  /** Patient longitude */
  patient_lng = 0;

  /** Google map configuration */
  map_options: google.maps.MapOptions = {
    zoom: 12,
    center: { lat: 54.948, lng: -7.75 }
  };

  /** Google map markers */
  map_markers: google.maps.LatLngLiteral[] = [];

  /** Toggle appointment visibility */
  showAllAppointments = false;

  /** Toggle prescription visibility */
  showAllPrescriptions = false;

  /** Toggle careplan visibility */
  showAllCareplans = false;

  /** Appointment reactive form */
  appointmentForm!: FormGroup;

  /** Prescription reactive form */
  prescriptionForm!: FormGroup;

  /** Careplan reactive form */
  careplanForm!: FormGroup;

  /**
   * Creates instance of PatientComponent
   *
   * @param api API service
   * @param route Activated route for patient ID
   * @param fb Angular form builder
   */
  constructor(
    private api: Api,
    private route: ActivatedRoute,
    private fb: FormBuilder
  ) {}

  /**
   * Component lifecycle hook.
   * Loads patient and initialises all forms.
   */
  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.loadPatient(id);

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

  /**
   * Loads patient data and related collections.
   *
   * @param id Patient ID
   */
  private loadPatient(id: string) {
    this.loading = true;

    this.api.getPatient(id).subscribe({
      next: (res) => {
        this.patient = res.data as Patient;

        this.appointments = (this.patient.appointments || []).sort((a, b) => {
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        });

        this.prescriptions = this.patient.prescriptions || [];
        this.careplans = this.patient.careplans || [];

        const coords = this.patient.location?.coordinates;
        if (coords) {
          this.patient_lng = coords[0];
          this.patient_lat = coords[1];

          this.map_options = {
            center: { lat: this.patient_lat, lng: this.patient_lng },
            zoom: 13
          };

          this.map_markers = [{ lat: this.patient_lat, lng: this.patient_lng }];
        }
      },
      error: () => this.showToast('Failed to load patient', 'error'),
      complete: () => this.loading = false
    });
  }

  /**
   * Displays a toast notification.
   *
   * @param msg Toast message
   * @param type Notification type
   */
  showToast(msg: string, type: 'success' | 'error' = 'success') {
    this.toastMessage = msg;
    this.toastType = type;
    setTimeout(() => this.toastMessage = null, 2500);
  }

  /**
   * Puts appointment into edit mode.
   */
  startEditAppointment(a: Appointment) {
    this.editingAppointmentId = a._id || null;
    this.appointmentForm.patchValue(a);
  }

  /**
   * Cancels appointment editing.
   */
  cancelEditAppointment() {
    this.editingAppointmentId = null;
    this.appointmentForm.reset({
      doctor: '',
      date: '',
      notes: '',
      status: 'scheduled'
    });
  }

  /**
   * Creates or updates an appointment.
   */
  saveAppointment() {
    if (!this.patient) return;
    const pid = this.patient._id ?? this.patient.id;

    this.loading = true;

    if (this.editingAppointmentId) {
      this.api.updateAppointment(pid!, this.editingAppointmentId, this.appointmentForm.value)
        .subscribe({
          next: () => {
            this.showToast('Appointment updated!', 'success');
            this.loadPatient(pid!);
            this.cancelEditAppointment();
          },
          error: () => this.showToast('Failed to update appointment', 'error'),
          complete: () => this.loading = false
        });
      return;
    }

    this.api.addAppointment(pid!, this.appointmentForm.value).subscribe({
      next: () => {
        this.showToast('Appointment added!', 'success');
        this.loadPatient(pid!);
        this.cancelEditAppointment();
      },
      error: () => this.showToast('Failed to add appointment', 'error'),
      complete: () => this.loading = false
    });
  }

  /**
   * Updates appointment status.
   */
  updateAppointmentStatus(a: Appointment, status: string) {
    if (!this.patient || !a._id) return;
    const pid = this.patient._id ?? this.patient.id;

    this.loading = true;

    this.api.updateAppointment(pid!, a._id, { status })
      .subscribe({
        next: () => {
          this.showToast(`Appointment marked ${status}`, 'success');
          this.loadPatient(pid!);
        },
        error: () => this.showToast('Failed to update status', 'error'),
        complete: () => this.loading = false
      });
  }

  /**
   * Deletes an appointment.
   */
  deleteAppointment(a: Appointment) {
    if (!confirm('Delete this appointment?')) return;

    const pid = this.patient?._id ?? this.patient?.id;
    this.api.deleteAppointment(pid!, a._id!)
      .subscribe(() => this.loadPatient(pid!));
  }

  /**
   * Starts prescription edit.
   */
  startEditPrescription(rx: Prescription) {
    this.editingPrescriptionId = rx._id || null;
    this.prescriptionForm.patchValue(rx);
  }

  /**
   * Cancels prescription edit.
   */
  cancelEditPrescription() {
    this.editingPrescriptionId = null;
    this.prescriptionForm.reset({
      name: '',
      start: '',
      stop: '',
      status: 'active'
    });
  }

  /**
   * Creates or updates prescription.
   */
  savePrescription() {
    if (!this.patient) return;
    const pid = this.patient._id ?? this.patient.id;

    this.loading = true;

    if (this.editingPrescriptionId) {
      this.api.updatePrescription(pid!, this.editingPrescriptionId, this.prescriptionForm.value)
        .subscribe({
          next: () => {
            this.showToast('Prescription updated!', 'success');
            this.loadPatient(pid!);
            this.cancelEditPrescription();
          },
          error: () => this.showToast('Failed to update prescription', 'error'),
          complete: () => this.loading = false
        });
      return;
    }

    this.api.addPrescription(pid!, this.prescriptionForm.value)
      .subscribe({
        next: () => {
          this.showToast('Prescription added!', 'success');
          this.loadPatient(pid!);
          this.cancelEditPrescription();
        },
        error: () => this.showToast('Failed to add prescription', 'error'),
        complete: () => this.loading = false
      });
  }

  /**
   * Deletes a prescription.
   */
  deletePrescription(rx: Prescription) {
    if (!confirm('Delete this prescription?')) return;

    const pid = this.patient?._id ?? this.patient?.id;
    this.api.deletePrescription(pid!, rx._id!)
      .subscribe(() => this.loadPatient(pid!));
  }

  /**
   * Begins editing a careplan.
   */
  startEditCareplan(c: Careplan) {
    this.editingCareplanId = c._id || null;
    this.careplanForm.patchValue(c);
  }

  /**
   * Cancels careplan editing.
   */
  cancelEditCareplan() {
    this.editingCareplanId = null;
    this.careplanForm.reset({
      description: '',
      start: '',
      stop: ''
    });
  }

  /**
   * Creates or updates a careplan.
   */
  saveCareplan() {
    if (!this.patient) return;
    const pid = this.patient._id ?? this.patient.id;

    this.loading = true;

    if (this.editingCareplanId) {
      this.api.updateCareplan(pid!, this.editingCareplanId, this.careplanForm.value)
        .subscribe({
          next: () => {
            this.showToast('Careplan updated!', 'success');
            this.loadPatient(pid!);
            this.cancelEditCareplan();
          },
          error: () => this.showToast('Failed to update careplan', 'error'),
          complete: () => this.loading = false
        });
      return;
    }

    this.api.addCareplan(pid!, this.careplanForm.value)
      .subscribe({
        next: () => {
          this.showToast('Careplan added!', 'success');
          this.loadPatient(pid!);
          this.cancelEditCareplan();
        },
        error: () => this.showToast('Failed to add careplan', 'error'),
        complete: () => this.loading = false
      });
  }

  /**
   * Deletes a careplan.
   */
  deleteCareplan(c: Careplan) {
    if (!confirm('Delete this careplan?')) return;

    const pid = this.patient?._id ?? this.patient?.id;
    this.api.deleteCareplan(pid!, c._id!)
      .subscribe(() => this.loadPatient(pid!));
  }

  /**
   * Formats a date for display.
   */
  fmt(date?: string): string {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('en-UK', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }

  /**
   * Returns Bootstrap badge class for appointment status.
   */
  badge(status: string): string {
    switch (status) {
      case 'scheduled': return 'bg-primary';
      case 'completed': return 'bg-success';
      case 'cancelled': return 'bg-danger';
      default: return 'bg-secondary';
    }
  }
}
