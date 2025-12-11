import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Api } from '../../services/api';

/**
 * Lightweight interface used for searching patients before deletion.
 */
interface PatientSearchItem {
  _id?: string;
  id?: string;
  name: string;
  condition?: string;
  town?: string;
}

/**
 * DeletePatientComponent
 *
 * Allows GPs to safely delete a patient record.
 * Features:
 * - Search by name
 * - Manual ID entry
 * - ID format validation
 * - Confirmation prompt
 * - Success redirect
 */
@Component({
  selector: 'app-delete-patient',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './delete-patient.html',
  styleUrls: ['./delete-patient.css']
})
export class DeletePatientComponent {

  /** Search input used to find patients by name */
  searchQuery = '';

  /** List of patients returned from search */
  searchResults: PatientSearchItem[] = [];

  /** Controls loading spinner for patient search */
  isSearching = false;

  /** Manual patient ID input */
  patientId = '';

  /** Error message shown when delete fails */
  deleteError = '';

  /** Success flag shown after a successful delete */
  deleteSuccess = false;

  /** Disables submit while deleting */
  isSubmitting = false;

  /** Regex used to validate MongoDB ObjectId format */
  private objectIdRegex = /^[0-9a-fA-F]{24}$/;

  constructor(
    private api: Api,
    private router: Router
  ) {}

  /**
   * Searches patients by name to help quickly find the correct ID.
   */
  searchPatients() {
    if (!this.searchQuery.trim()) {
      this.searchResults = [];
      return;
    }

    this.isSearching = true;

    this.api.getPatients(1, 10, this.searchQuery).subscribe({
      next: (res: any) => {
        this.searchResults = res?.data?.patients || [];
        this.isSearching = false;
      },
      error: () => {
        this.searchResults = [];
        this.isSearching = false;
      }
    });
  }

  /**
   * Copies the selected patient's ID into the input field.
   *
   * @param p Selected patient from search results
   */
  selectPatient(p: PatientSearchItem) {
    this.patientId = (p.id || p._id || '') as string;
    this.searchResults = [];
  }

  /**
   * Validates whether a string matches MongoDB ObjectId format.
   *
   * @param id Patient ID
   */
  private isValidObjectId(id: string): boolean {
    return this.objectIdRegex.test(id);
  }

  /**
   * Submits the delete request to the backend.
   * Includes:
   * - ID validation
   * - Safety confirmation
   * - API delete call
   * - Redirect on success
   *
   * @param form Angular form reference
   */
  submitDeletePatient(form: NgForm): void {
    this.deleteError = '';
    const id = this.patientId.trim();

    if (!id) {
      this.deleteError = 'Patient ID is required.';
      return;
    }

    if (!this.isValidObjectId(id)) {
      this.deleteError = 'Invalid Patient ID format (24-character hex string required).';
      return;
    }

    const confirmed = confirm(
      'Are you sure you want to permanently delete this patient?\n\nThis action CANNOT be undone.'
    );

    if (!confirmed) return;

    this.isSubmitting = true;
    this.deleteSuccess = false;

    this.api.deletePatient(id).subscribe({
      next: () => {
        this.deleteSuccess = true;
        this.isSubmitting = false;

        setTimeout(() => {
          this.router.navigate(['/gp/patients']);
        }, 2000);
      },
      error: (err: any) => {
        const msg = err.error?.message || '';

        if (msg.includes('Invalid ID')) {
          this.deleteError = 'Invalid Patient ID format.';
        } else if (msg.includes('not found')) {
          this.deleteError = 'Patient not found. It may have already been deleted.';
        } else {
          this.deleteError = msg || 'Failed to delete patient.';
        }

        this.isSubmitting = false;
      }
    });
  }
}
