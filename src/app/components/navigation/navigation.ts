import { Component } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../auth/auth.service';

/**
 * NavigationComponent
 *
 * Provides the main navigation bar for the application.
 * Handles authentication state, role-based navigation
 * visibility, and logout functionality.
 */
@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './navigation.html',
  styleUrls: ['./navigation.css']
})
export class NavigationComponent {

  /**
   * Creates an instance of the navigation component.
   *
   * @param auth Authentication service for user state
   * @param router Angular router for page navigation
   */
  constructor(
    public auth: AuthService,
    private router: Router
  ) {}

  /**
   * Returns the username of the currently logged-in user.
   *
   * @returns Username string or null if not logged in
   */
  get username(): string | null {
    return this.auth.getUsername();
  }

  /**
   * Checks whether the logged-in user is a GP.
   *
   * @returns True if the user has GP role
   */
  get isGP(): boolean {
    return this.auth.isGP();
  }

  /**
   * Determines whether the current route is the GP home page.
   *
   * @returns True if user is on GP home dashboard
   */
  get isOnGpHome(): boolean {
    return this.router.url === '/';
  }

  /**
   * Checks whether the logged-in user is a patient.
   *
   * @returns True if the user has patient role
   */
  get isPatient(): boolean {
    return this.auth.isPatient();
  }

  /**
   * Logs the user out of the application and
   * redirects them to the login screen.
   */
  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
