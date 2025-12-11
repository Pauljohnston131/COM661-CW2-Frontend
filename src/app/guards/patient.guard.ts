import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';

/**
 * PatientGuard
 *
 * Protects patient-only routes such as:
 * - Patient portal
 * - Appointment requests
 * - Viewing prescriptions and care plans
 *
 * Only standard (non-admin) users can access these routes.
 */
@Injectable({ providedIn: 'root' })
export class PatientGuard implements CanActivate {

  constructor(private auth: AuthService, private router: Router) {}

  /**
   * Allows access only if the logged-in user is a patient.
   * Otherwise redirects back to the login screen.
   */
  canActivate(): boolean {
    if (this.auth.isPatient()) return true;

    this.router.navigate(['/login']);
    return false;
  }
}
