// src/app/components/patients/patients.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Api } from '../../services/api';

interface PatientListItem {
  _id?: string;
  id?: string;
  name: string;
  age?: number;
  condition?: string;
  town?: string;
  // aggregated counts from /patients list (if present)
  appointment_count?: number;
  prescription_count?: number;
  careplan_count?: number;
}

@Component({
  selector: 'app-patients',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './patients.html',
  styleUrl: './patients.css'
})
export class PatientsComponent implements OnInit {

  patients: PatientListItem[] = [];
  filteredPatients: PatientListItem[] = [];

  searchQuery: string = '';

  page: number = 1;
  lastPage: number = 1;
  readonly pageSize: number = 10;

  loading = false;
  errorMsg = '';

  constructor(private api: Api) {}

  ngOnInit() {
    this.loadPage(this.page);
  }

  // -------------------------
  // LOAD PAGED PATIENT LIST
  // -------------------------
  loadPage(page: number) {
    this.loading = true;
    this.errorMsg = '';

    this.api.getPatients(page, this.pageSize).subscribe({
      next: (res: any) => {
        const data = res?.data || {};
        const list: PatientListItem[] = data.patients || [];

        this.patients = list;
        this.page = data.page || page;
        this.lastPage = Math.max(1, Math.ceil((data.count || list.length || 1) / this.pageSize));

        // reapply search filter to new page
        this.filteredPatients = this.applyFilter(this.searchQuery);
      },
      error: (err) => {
        console.error('Failed to load patients', err);
        this.errorMsg = 'Unable to load patients. Please try again.';
        this.filteredPatients = [];
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  // -------------------------
  // SEARCH & FILTER
  // -------------------------
  filterPatients() {
    this.filteredPatients = this.applyFilter(this.searchQuery);
  }

  private applyFilter(query: string): PatientListItem[] {
    const q = query.trim().toLowerCase();
    if (!q) {
      return this.patients;
    }

    return this.patients.filter((p: PatientListItem) => {
      const name = (p.name || '').toLowerCase();
      const cond = (p.condition || '').toLowerCase();
      const town = (p.town || '').toLowerCase();
      return name.includes(q) || cond.includes(q) || town.includes(q);
    });
  }

  // -------------------------
  // PAGINATION
  // -------------------------
  nextPage() {
    if (this.page < this.lastPage) {
      this.loadPage(this.page + 1);
    }
  }

  previousPage() {
    if (this.page > 1) {
      this.loadPage(this.page - 1);
    }
  }

  // -------------------------
  // HELPERS
  // -------------------------
  getPatientId(p: PatientListItem): string {
    // we assume backend always returns either _id or id
    return (p._id ?? p.id) as string;
  }

  getAppointmentsCount(p: PatientListItem): number {
    return p.appointment_count ?? 0;
  }

  getPrescriptionsCount(p: PatientListItem): number {
    return p.prescription_count ?? 0;
  }

  getCareplansCount(p: PatientListItem): number {
    return p.careplan_count ?? 0;
  }

  // simple "chronic" condition flag example
  isChronic(p: PatientListItem): boolean {
    const cond = (p.condition || '').toLowerCase();
    return ['diabetes', 'cardiac', 'heart', 'copd', 'asthma', 'stroke'].some(k => cond.includes(k));
  }
}
