import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PatientDataService } from '../../services/patient-data';

@Component({
  selector: 'app-patients',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './patients.html',
  styleUrl: './patients.css',
  providers: [PatientDataService]
})
export class PatientsComponent {
  patients: any[] = [];          // Full list for this page
  filteredPatients: any[] = [];  // Search results
  searchQuery: string = "";

  page: number = 1;

  constructor(protected patientData: PatientDataService) {}

  ngOnInit() {
    // Load first page
    this.patients = this.patientData.getPatientsPage(this.page);
    this.filteredPatients = this.patients;
  }

  // FILTER FUNCTION
  filterPatients() {
    const query = this.searchQuery.toLowerCase();

    this.filteredPatients = this.patients.filter(p =>
      p.name.toLowerCase().includes(query) ||
      p.condition.toLowerCase().includes(query) ||
      (p.town && p.town.toLowerCase().includes(query))
    );
  }

  nextPage() {
    if (this.page < this.patientData.getLastPageNumber()) {
      this.page++;
      this.patients = this.patientData.getPatientsPage(this.page);
      this.filterPatients();
      sessionStorage['patient_page'] = this.page;
    }
  }

  previousPage() {
    if (this.page > 1) {
      this.page--;
      this.patients = this.patientData.getPatientsPage(this.page);
      this.filterPatients();
      sessionStorage['patient_page'] = this.page;
    }
  }
}
