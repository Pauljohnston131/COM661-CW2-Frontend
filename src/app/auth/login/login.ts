import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { ToastService } from '../../shared/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {

  username = '';
  password = '';
  error = '';

  constructor(
    private auth: AuthService,
    private router: Router,
    private toast: ToastService
  ) {}

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

          this.auth.storeToken(token);

          if (this.auth.isGP()) {
            this.toast.success('Logged in as GP.', 'Welcome');
            this.router.navigate(['/gp/patients']);
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
