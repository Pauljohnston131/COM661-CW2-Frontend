import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';

/**
 * AuthGuard
 *
 * Stops users accessing protected routes unless they are logged in.
 * If no valid token is found, the user is sent back to the login page.
 */
@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {

  constructor(private auth: AuthService, private router: Router) {}

  /**
   * Runs before a route is activated.
   * Returns true if the user is logged in, otherwise redirects to /login.
   */
  canActivate(): boolean {
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/login']);
      return false;
    }
    return true;
  }
}
