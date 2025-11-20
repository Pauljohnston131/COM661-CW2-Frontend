// src/app/components/patient/patient.ts
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { GoogleMapsModule } from '@angular/google-maps';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
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
  loremText = 'Lorem ipsum dolor sit amet...';

  appointmentForm: any;

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
  }

  private loadPatient(id: string) {
    this.api.getPatient(id).subscribe(res => {
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
      this.loadPatient(id);  // reload to refresh appointments
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
  const appointmentId = appt._id; // FIXED – appointments use _id ONLY

  this.api.updateAppointment(patientId, appointmentId, { status: newStatus })
    .subscribe(() => this.loadPatient(patientId));
}

deleteAppointment(appt: any) {
  const patientId = this.route.snapshot.paramMap.get('id')!;
  const appointmentId = appt._id; // FIXED – appointments use _id ONLY

  this.api.deleteAppointment(patientId, appointmentId)
    .subscribe(() => this.loadPatient(patientId));
}

}
