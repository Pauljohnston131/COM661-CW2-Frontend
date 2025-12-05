// src/app/components/add-patient/add-patient.component.ts
import { Component, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Api } from '../../services/api';

@Component({
  selector: 'app-add-patient',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './add-patient.html',
  styleUrls: ['./add-patient.css']
})
export class AddPatientComponent implements OnInit {
  newPatient = {
    name: '',
    age: '',
    gender: 'Male',
    condition: '',
    image_url: ''
  };
  addPatientError = '';
  addPatientSuccess = false;
  isSubmitting = false;

  constructor(
    private api: Api,
    private router: Router
  ) {}

  ngOnInit(): void {}

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
          // Auto-redirect to dashboard after 2 seconds
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