import { Component } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './navigation.html',
  styleUrls: ['./navigation.css']
})
export class NavigationComponent {

  constructor(
    public auth: AuthService,
    private router: Router
  ) {}

  get username(): string | null {
    return this.auth.getUsername();
  }

  get isGP(): boolean {
    return this.auth.isGP();
  }

  get isPatient(): boolean {
    return this.auth.isPatient();
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
