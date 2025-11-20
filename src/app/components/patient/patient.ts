import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { GoogleMapsModule } from '@angular/google-maps';
import { PatientDataService } from '../../services/patient-data';

@Component({
  selector: 'app-patient',
  standalone: true,
  imports: [CommonModule, GoogleMapsModule],
  providers: [PatientDataService],
  templateUrl: './patient.html',
  styleUrl: './patient.css'
})
export class Patient {

  patient_list: any[] = [];

  age_group: string = '';
  town: string = '';
  appointments: any[] = [];
  prescriptions: any[] = [];
  careplans: any[] = [];

  patient_lat: number = 0;
  patient_lng: number = 0;
  showAllAppointments: boolean = false;


  // Google Maps
  map_options: google.maps.MapOptions = {};
  map_markers: any[] = [];

  // FE14 placeholder summary
  loremText: string = "";

  constructor(
    private patientData: PatientDataService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    this.patient_list = this.patientData.getPatient(id);

    const p = this.patient_list[0];

    this.age_group = p.age_group || '';
    this.town = p.town || '';

    this.appointments = p.appointments || [];
    this.prescriptions = p.prescriptions || [];
    this.careplans = p.careplans || [];

    if (p.location && p.location.coordinates) {
      this.patient_lng = p.location.coordinates[0];
      this.patient_lat = p.location.coordinates[1];
    }

    // GOOGLE MAP INITIALISATION
    this.map_options = {
      center: {
        lat: this.patient_lat,
        lng: this.patient_lng
      },
      zoom: 13
    };

    this.map_markers.push({
      position: {
        lat: this.patient_lat,
        lng: this.patient_lng
      },
      title: p.name
    });

    // Placeholder text for FE14
    this.loremText =
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. " +
      "Et harum quidem rerum facilis est et expedita distinctio.";
  }
}
