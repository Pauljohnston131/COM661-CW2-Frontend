import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';

/**
 * GpGuard
 *
 * Used to protect GP-only routes like:
 * - GP dashboard
 * - Patient management
 * - Appointment approvals
 *
 * Only users marked as "admin" in the JWT are allowed through.
 */
@Injectable({ providedIn: 'root' })
export class GpGuard implements CanActivate {

  constructor(private auth: AuthService, private router: Router) {}

  /**
   * Allows access only if the user is a GP.
   * Otherwise redirects back to the login page.
   */
  canActivate(): boolean {
    if (this.auth.isGP()) return true;

    this.router.navigate(['/login']);
    return false;
  }
}
