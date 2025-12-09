// src/app/components/patients/patients.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
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
  // Add optional fields for new features
  last_activity?: string;
  created_at?: string;
  updated_at?: string;
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
  filterOption: string = 'all'; // New property
  
  page: number = 1;
  lastPage: number = 1;
  readonly pageSize: number = 10;
  totalItems: number = 0; // New property
  
  loading = false;
  errorMsg = '';

  constructor(
    private api: Api,
    private router: Router // Inject Router
  ) {}

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
        this.totalItems = data.count || list.length || 0; // Set total items
        this.lastPage = Math.max(1, Math.ceil((data.count || list.length || 1) / this.pageSize));

        // reapply search filter to new page
        this.applyFilterOption();
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
    this.applyFilterOption();
  }

  private applyFilter(): PatientListItem[] {
    const q = this.searchQuery.trim().toLowerCase();
    let filtered = this.patients;

    // Apply search filter
    if (q) {
      filtered = filtered.filter((p: PatientListItem) => {
        const name = (p.name || '').toLowerCase();
        const cond = (p.condition || '').toLowerCase();
        const town = (p.town || '').toLowerCase();
        return name.includes(q) || cond.includes(q) || town.includes(q);
      });
    }

    // Apply dropdown filter
    if (this.filterOption !== 'all') {
      switch (this.filterOption) {
        case 'chronic':
          filtered = filtered.filter(p => this.isChronic(p));
          break;
        case 'active':
          filtered = filtered.filter(p => this.isPatientActive(p));
          break;
        case 'recent':
          // Filter patients created in last 7 days
          const sevenDaysAgo = new Date();
          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
          filtered = filtered.filter(p => {
            if (!p.created_at) return false;
            const createdDate = new Date(p.created_at);
            return createdDate > sevenDaysAgo;
          });
          break;
      }
    }

    return filtered;
  }

  // New search methods
  clearSearch(): void {
    this.searchQuery = '';
    this.applyFilterOption();
  }

  // New filter methods
  applyFilterOption(): void {
    this.filteredPatients = this.applyFilter();
  }

  clearFilter(): void {
    this.filterOption = 'all';
    this.applyFilterOption();
  }

  clearAllFilters(): void {
    this.clearSearch();
    this.clearFilter();
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

  // New pagination methods
  getFirstItemNumber(): number {
    return ((this.page - 1) * this.pageSize) + 1;
  }

  getLastItemNumber(): number {
    return Math.min(this.page * this.pageSize, this.totalItems);
  }

  changePageSize(size: number): void {
    // Note: Since pageSize is readonly, you might need to adjust your API
    // For now, we'll just show/hide items based on size
    console.log('Page size would change to:', size);
    // In a real implementation, you would need to reload data with new pageSize
    alert('Page size change would require API modification. Currently using fixed pageSize of 10.');
  }

  // -------------------------
  // PATIENT STATUS & NAVIGATION
  // -------------------------
  isPatientActive(p: PatientListItem): boolean {
    // Check if patient has activity in the last 30 days
    if (p.last_activity) {
      const lastActivity = new Date(p.last_activity);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return lastActivity > thirtyDaysAgo;
    }
    
    // Fallback: check if patient has any appointments/prescriptions/careplans
    const hasActivity = (p.appointment_count || 0) > 0 ||
                       (p.prescription_count || 0) > 0 ||
                       (p.careplan_count || 0) > 0;
    
    // If we have a created date, check if created in last 30 days
    if (p.created_at && !hasActivity) {
      const createdDate = new Date(p.created_at);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return createdDate > thirtyDaysAgo;
    }
    
    return hasActivity;
  }

  navigateToPatient(p: PatientListItem): void {
    const patientId = this.getPatientId(p);
    this.router.navigate(['/gp/patients', patientId]);
  }

  retryLoading(): void {
    this.errorMsg = '';
    this.loadPage(this.page);
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

  // Date formatting helper
  getLastUpdated(p: PatientListItem): string {
    if (p.updated_at) {
      const date = new Date(p.updated_at);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    }
    
    if (p.created_at) {
      const date = new Date(p.created_at);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    }
    
    return 'N/A';
  }

  // simple "chronic" condition flag example
  isChronic(p: PatientListItem): boolean {
    const cond = (p.condition || '').toLowerCase();
    const chronicConditions = [
      'diabetes', 'cardiac', 'heart', 'copd', 'asthma', 'stroke',
      'hypertension', 'arthritis', 'chronic', 'kidney', 'liver',
      'parkinson', 'alzheimer', 'cancer', 'hiv', 'fibrosis'
    ];
    return chronicConditions.some(k => cond.includes(k));
  }
}