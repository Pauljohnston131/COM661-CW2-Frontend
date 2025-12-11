import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { ToastService } from '../../shared/toast.service';

/**
 * LoginComponent
 *
 * Handles user login for both:
 * - GP users
 * - Patient users
 *
 * Uses JWT-based authentication via the AuthService.
 * Displays feedback using toast notifications.
 */
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {

  /** Username entered in the login form */
  username = '';

  /** Password entered in the login form */
  password = '';

  /** Error message shown on the UI if login fails */
  error = '';

  constructor(
    private auth: AuthService,
    private router: Router,
    private toast: ToastService
  ) {}

  /**
   * Runs when the login form is submitted.
   * Validates input, sends login request, stores token,
   * and redirects based on user role.
   */
  onSubmit() {
    this.error = '';

    if (!this.username || !this.password) {
      this.error = 'Please enter username and password.';
      this.toast.warning(this.error, 'Missing details');
      return;
    }

    this.auth.login(this.username, this.password)
      .subscribe({
        next: (res) => {
          const token = res.data?.token;

          if (!token) {
            this.error = 'No token returned from API.';
            this.toast.error(this.error, 'Login error');
            return;
          }

          // Store JWT for later use
          this.auth.storeToken(token);

          // Redirect based on role
          if (this.auth.isGP()) {
            this.toast.success('Logged in as GP.', 'Welcome');
            this.router.navigate(['/']);
          } else if (this.auth.isPatient()) {
            this.toast.success('Logged in as patient.', 'Welcome');
            this.router.navigate(['/patient-portal']);
          } else {
            this.error = 'Unknown role in token.';
            this.toast.error(this.error, 'Login error');
          }
        },
        error: () => {
          this.error = 'Login failed. Check your credentials.';
          this.toast.error(this.error, 'Login failed');
        }
      });
  }
}
