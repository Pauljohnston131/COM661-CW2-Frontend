// src/app/components/patient/patient.ts
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { GoogleMapsModule } from '@angular/google-maps';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Api } from '../../services/api';

@Component({
  selector: 'app-patient',
  standalone: true,
  imports: [CommonModule, GoogleMapsModule, ReactiveFormsModule],
  templateUrl: './patient.html',
  styleUrl: './patient.css'
})
export class Patient {

  patient_list: any[] = [];
  appointments: any[] = [];
  prescriptions: any[] = [];
  careplans: any[] = [];

  age_group = '';
  town = '';

  patient_lat = 0;
  patient_lng = 0;

  showAllAppointments = false;
  showAllPrescriptions = false;
  showAllCareplans = false;

  loremText = 'Lorem ipsum dolor sit amet...';

  appointmentForm!: FormGroup;
  prescriptionForm!: FormGroup;
  careplanForm!: FormGroup;

  map_options: google.maps.MapOptions = {};
  map_markers: any[] = [];

  constructor(
    private api: Api,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.loadPatient(id);

    this.appointmentForm = this.formBuilder.group({
      doctor: ['', Validators.required],
      date: ['', Validators.required],
      notes: [''],
      status: ['scheduled', Validators.required]
    });

    this.prescriptionForm = this.formBuilder.group({
      medication: ['', Validators.required],
      dosage: ['', Validators.required],
      status: ['active', Validators.required]
    });

    this.careplanForm = this.formBuilder.group({
      name: ['', Validators.required],
      goal: ['', Validators.required],
      status: ['active', Validators.required]
    });
  }

  private loadPatient(id: string) {
    this.api.getPatient(id).subscribe((res: any) => {
      const p = res.data;

      this.patient_list = [p];
      this.appointments = p.appointments || [];
      this.prescriptions = p.prescriptions || [];
      this.careplans = p.careplans || [];

      this.age_group = p.age_group || '';
      this.town = p.town || '';

      if (p.location?.coordinates) {
        this.patient_lng = p.location.coordinates[0];
        this.patient_lat = p.location.coordinates[1];

        this.map_options = {
          center: {
            lat: this.patient_lat,
            lng: this.patient_lng
          },
          zoom: 13
        };

        this.map_markers = [{
          position: {
            lat: this.patient_lat,
            lng: this.patient_lng
          },
          title: p.name
        }];
      }
    });
  }

  // --------------------------
  // APPOINTMENTS
  // --------------------------
  isInvalid(control: string) {
    return this.appointmentForm.controls[control].invalid &&
           this.appointmentForm.controls[control].touched;
  }

  isIncomplete() {
    return this.appointmentForm.invalid;
  }

  onSubmit() {
    if (this.isIncomplete()) return;

    const id = this.route.snapshot.paramMap.get('id')!;

    this.api.addAppointment(id, this.appointmentForm.value).subscribe(() => {
      this.loadPatient(id);
      this.appointmentForm.reset({
        doctor: '',
        date: '',
        notes: '',
        status: 'scheduled'
      });
    });
  }

  updateAppointmentStatus(appt: any, newStatus: string) {
    const patientId = this.route.snapshot.paramMap.get('id')!;
    const appointmentId = appt._id; // appointments use _id

    this.api.updateAppointment(patientId, appointmentId, { status: newStatus })
      .subscribe(() => this.loadPatient(patientId));
  }

  deleteAppointment(appt: any) {
    const patientId = this.route.snapshot.paramMap.get('id')!;
    const appointmentId = appt._id;

    this.api.deleteAppointment(patientId, appointmentId)
      .subscribe(() => this.loadPatient(patientId));
  }

  // --------------------------
  // PRESCRIPTIONS
  // --------------------------
  addPrescription() {
    if (this.prescriptionForm.invalid) return;

    const patientId = this.route.snapshot.paramMap.get('id')!;

    this.api.addPrescription(patientId, this.prescriptionForm.value)
      .subscribe(() => {
        this.loadPatient(patientId);
        this.prescriptionForm.reset({
          medication: '',
          dosage: '',
          status: 'active'
        });
      });
  }

  deletePrescription(rx: any) {
    const patientId = this.route.snapshot.paramMap.get('id')!;
    const prescriptionId = rx._id;

    this.api.deletePrescription(patientId, prescriptionId)
      .subscribe(() => this.loadPatient(patientId));
  }

  // --------------------------
  // CAREPLANS
  // --------------------------
  addCareplan() {
    if (this.careplanForm.invalid) return;

    const patientId = this.route.snapshot.paramMap.get('id')!;

    this.api.addCareplan(patientId, this.careplanForm.value)
      .subscribe(() => {
        this.loadPatient(patientId);
        this.careplanForm.reset({
          name: '',
          goal: '',
          status: 'active'
        });
      });
  }

  deleteCareplan(c: any) {
    const patientId = this.route.snapshot.paramMap.get('id')!;
    const careplanId = c._id;

    this.api.deleteCareplan(patientId, careplanId)
      .subscribe(() => this.loadPatient(patientId));
  }
}
