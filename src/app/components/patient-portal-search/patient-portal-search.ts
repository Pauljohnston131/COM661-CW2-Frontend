import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Api } from '../../services/api';

@Component({
  selector: 'app-patient-portal-search',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './patient-portal-search.html',
  styleUrl: './patient-portal-search.css'
})
export class PatientPortalSearchComponent {

  searchQuery: string = "";
  patients: any[] = [];
  filteredPatients: any[] = [];

  constructor(private api: Api) {}

  ngOnInit() {
    // Load a large list for patient search
    this.api.getPatients(1, 500).subscribe(res => {
      this.patients = res.data.patients;
      this.filteredPatients = [];
    });
  }

  filterPatients() {
    const q = this.searchQuery.toLowerCase();

    // If empty input → clear results
    if (!q.trim()) {
      this.filteredPatients = [];
      return;
    }

    // Filter by name only
    this.filteredPatients = this.patients.filter(p =>
      p.name.toLowerCase().includes(q)
    );
  }
}

