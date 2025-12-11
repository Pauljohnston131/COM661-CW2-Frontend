import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Api } from '../../services/api';

/**
 * Interface representing a single patient item displayed in the patient list.
 */
interface PatientListItem {
  _id?: string;
  id?: string;
  name: string;
  age?: number;
  condition?: string;
  town?: string;
  appointment_count?: number;
  prescription_count?: number;
  careplan_count?: number;
  last_activity?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * PatientsComponent
 *
 * This component is responsible for:
 * - Displaying a paginated list of patients
 * - Searching patients by name, condition, or town
 * - Filtering patients by status (chronic, active, recent)
 * - Handling navigation to individual patient records
 *
 * It acts as the main GP-facing patient management interface.
 */
@Component({
  selector: 'app-patients',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './patients.html',
  styleUrl: './patients.css'
})
export class PatientsComponent implements OnInit {

  /** Full list of patients returned from the API */
  patients: PatientListItem[] = [];

  /** Filtered list of patients used for UI display */
  filteredPatients: PatientListItem[] = [];

  /** Search query entered by the user */
  searchQuery = '';

  /** Currently selected filter option */
  filterOption = 'all';

  /** Current pagination page */
  page = 1;

  /** Last available pagination page */
  lastPage = 1;

  /** Number of records per page */
  readonly pageSize = 10;

  /** Total number of patient records */
  totalItems = 0;

  /** Controls loading spinner visibility */
  loading = false;

  /** Error message displayed to the user */
  errorMsg = '';

  /**
   * Creates an instance of PatientsComponent
   * @param api API service used for backend communication
   * @param router Angular router for navigation
   */
  constructor(private api: Api, private router: Router) {}

  /**
   * Lifecycle hook that runs on initialisation.
   * Loads the first page of patients.
   */
  ngOnInit() {
    this.loadPage(1);
  }

  /**
   * Loads a specific page of patient data from the backend.
   * Handles pagination, error states and filtered rendering.
   *
   * @param page Page number to be loaded
   */
  loadPage(page: number) {
    this.loading = true;
    this.errorMsg = '';

    this.api.getPatients(page, this.pageSize, this.searchQuery).subscribe({
      next: (res: any) => {
        const data = res?.data || {};
        this.patients = data.patients || [];
        this.page = data.page || page;
        this.totalItems = data.count || 0;
        this.lastPage = Math.max(1, Math.ceil(this.totalItems / this.pageSize));
        this.applyFilterOption();
      },
      error: () => {
        this.errorMsg = 'Unable to load patients.';
        this.filteredPatients = [];
        this.loading = false;
      },
      complete: () => this.loading = false
    });
  }

  /**
   * Resets pagination and reloads patient list based on the current search query.
   */
  filterPatients() {
    this.page = 1;
    this.loadPage(1);
  }

  /**
   * Applies the currently selected filter option to the patient list.
   */
  applyFilterOption() {
    this.filteredPatients = this.applyFilter();
  }

  /**
   * Applies all search and filter logic to the patient list.
   *
   * @returns Filtered patient list
   */
  private applyFilter(): PatientListItem[] {
    let list = [...this.patients];
    const q = this.searchQuery.trim().toLowerCase();

    if (q) {
      list = list.filter(p =>
        (p.name || '').toLowerCase().includes(q) ||
        (p.condition || '').toLowerCase().includes(q) ||
        (p.town || '').toLowerCase().includes(q)
      );
    }

    if (this.filterOption === 'chronic') {
      list = list.filter(p => this.isChronic(p));
    } else if (this.filterOption === 'active') {
      list = list.filter(p => this.isPatientActive(p));
    } else if (this.filterOption === 'recent') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      list = list.filter(p => p.created_at && new Date(p.created_at) > weekAgo);
    }

    return list;
  }

  /** Clears the search field and refreshes the list */
  clearSearch() { this.searchQuery = ''; this.applyFilterOption(); }

  /** Clears the selected filter option */
  clearFilter() { this.filterOption = 'all'; this.applyFilterOption(); }

  /** Clears both search and filter options */
  clearAllFilters() { this.clearSearch(); this.clearFilter(); }

  /** Navigates to the next page of results */
  nextPage() { if (this.page < this.lastPage) this.loadPage(this.page + 1); }

  /** Navigates to the previous page of results */
  previousPage() { if (this.page > 1) this.loadPage(this.page - 1); }

  /**
   * Calculates the first record number on the current page.
   */
  getFirstItemNumber() { return (this.page - 1) * this.pageSize + 1; }

  /**
   * Calculates the last record number on the current page.
   */
  getLastItemNumber() { return Math.min(this.page * this.pageSize, this.totalItems); }

  /**
   * Determines if a patient is considered "active"
   * based on their clinical record activity.
   *
   * @param p Patient record
   */
  isPatientActive(p: PatientListItem) {
    return (p.appointment_count || 0) > 0 ||
           (p.prescription_count || 0) > 0 ||
           (p.careplan_count || 0) > 0;
  }

  /**
   * Navigates to the selected patient's full record view.
   *
   * @param p Selected patient
   */
  navigateToPatient(p: PatientListItem) {
    this.router.navigate(['/gp/patients', this.getPatientId(p)]);
  }

  /**
   * Safely resolves the patient identifier from multiple possible sources.
   *
   * @param p Patient record
   */
  getPatientId(p: PatientListItem): string {
    return (p.id || p._id || '') as string;
  }

  /**
   * Determines if a patient condition is classified as chronic.
   *
   * @param p Patient record
   */
  isChronic(p: PatientListItem): boolean {
    if (!p.condition) return false;
    const cond = p.condition.toLowerCase().trim();

    const chronicKeywords = [
      'diabetes', 'hypertension', 'copd', 'asthma', 'cardiac',
      'heart disease', 'heart failure', 'chf', 'stroke',
      'chronic kidney', 'ckd', 'cancer', 'hiv', 'aids',
      'parkinson', 'alzheimer', 'dementia', 'rheumatoid',
      'arthritis', 'multiple sclerosis', 'ms', 'epilepsy',
      'liver disease', 'cirrhosis', 'hepatitis'
    ];

    return chronicKeywords.some(keyword => cond.includes(keyword));
  }

  /**
   * Copies a patient ID to the clipboard and provides visual feedback.
   *
   * @param id Patient identifier
   * @param event Mouse event triggered by button click
   */
  copyPatientId(id: string, event: MouseEvent) {
    navigator.clipboard.writeText(id);
    const btn = event.currentTarget as HTMLElement;
    const original = btn.innerHTML;
    btn.innerHTML = '<i class="bi bi-check text-success"></i>';
    setTimeout(() => btn.innerHTML = original, 1200);
    event.stopPropagation();
  }

  /** Returns the number of appointments for a patient */
  getAppointmentsCount(p: PatientListItem) { return p.appointment_count ?? 0; }

  /** Returns the number of prescriptions for a patient */
  getPrescriptionsCount(p: PatientListItem) { return p.prescription_count ?? 0; }

  /** Returns the number of careplans for a patient */
  getCareplansCount(p: PatientListItem) { return p.careplan_count ?? 0; }

  /**
   * Retries the current page load if an error occurs.
   */
  retryLoading() { this.loadPage(this.page); }
}
