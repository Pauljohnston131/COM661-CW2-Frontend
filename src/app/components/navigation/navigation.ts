import { Component } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../auth/auth.service'; // adjust path if needed
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './navigation.html',
  styleUrl: './navigation.css'
})
export class NavigationComponent {

  constructor(
    public auth: AuthService,
    private router: Router
  ) {}

  logout() {
    this.auth.logoutApi().subscribe(() => {
      this.auth.logout();
      this.router.navigate(['/login']);
    }, () => {
      // even if logout fails, remove token
      this.auth.logout();
      this.router.navigate(['/login']);
    });
  }
}
