// src/app/components/add-patient/add-patient.component.ts
import { Component, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Api } from '../../services/api';

/**
 * AddPatientComponent
 *
 * Used by GPs to manually add a new patient into the system.
 * Handles:
 * - Basic form validation
 * - API submission
 * - Success + error handling
 * - Auto redirect after successful creation
 */
@Component({
  selector: 'app-add-patient',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './add-patient.html',
  styleUrls: ['./add-patient.css']
})
export class AddPatientComponent implements OnInit {

  /**
   * Local model used to bind to the add-patient form.
   */
  newPatient = {
    name: '',
    age: '',
    gender: 'Male',
    condition: '',
    image_url: ''
  };

  /** Error message shown if submission fails */
  addPatientError = '';

  /** Flag used to show success feedback */
  addPatientSuccess = false;

  /** Disables the submit button while saving */
  isSubmitting = false;

  constructor(
    private api: Api,
    private router: Router
  ) {}

  /**
   * Runs when the component is initialised.
   */
  ngOnInit(): void {}

  /**
   * Submits a new patient to the backend.
   * Includes:
   * - Form validation
   * - Payload mapping
   * - API call
   * - Success redirect
   *
   * @param form Angular form reference
   */
  submitNewPatient(form: NgForm): void {
    if (form.invalid) {
      this.addPatientError = 'Please fill in all required fields correctly.';
      return;
    }

    if (!this.newPatient.name.trim() || !this.newPatient.age || !this.newPatient.condition.trim()) {
      this.addPatientError = 'Please fill in all required fields.';
      return;
    }

    this.isSubmitting = true;
    this.addPatientError = '';
    this.addPatientSuccess = false;

    const payload = {
      name: this.newPatient.name.trim(),
      age: parseInt(this.newPatient.age),
      gender: this.newPatient.gender,
      condition: this.newPatient.condition.trim(),
      image_url: this.newPatient.image_url.trim() || undefined
    };

    this.api.addPatient(payload).subscribe({
      next: (res) => {
        if (res.success) {
          this.addPatientSuccess = true;
          this.isSubmitting = false;

          // Auto redirect back to GP dashboard after 2 seconds
          setTimeout(() => {
            this.router.navigate(['/gp/home']);
          }, 2000);
        } else {
          this.addPatientError = res.message || 'Failed to add patient.';
          this.isSubmitting = false;
        }
      },
      error: (err) => {
        this.addPatientError = err.error?.message || 'Failed to add patient. Please try again.';
        this.isSubmitting = false;
      }
    });
  }
}
