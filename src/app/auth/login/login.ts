import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';

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
    private router: Router
  ) {}

  onSubmit() {
    this.error = '';

    if (!this.username || !this.password) {
      this.error = 'Please enter username and password.';
      return;
    }

    this.auth.login(this.username, this.password)
      .subscribe({
        next: (res) => {
          const token = res.data?.token;

if (!token) {
  this.error = 'No token returned from API.';
  return;
}

this.auth.storeToken(token);

          if (this.auth.isGP()) {
            this.router.navigate(['/gp/patients']);
          } else if (this.auth.isPatient()) {
            this.router.navigate(['/patient-portal']);
          } else {
            this.error = 'Unknown role in token.';
          }
        },
        error: (err) => {
          console.error(err);
          this.error = 'Login failed. Check your credentials.';
        }
      });
  }
}
