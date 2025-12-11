// src/app/app.ts
import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavigationComponent } from './components/navigation/navigation';
import { LoadingSpinnerComponent } from './shared/loading-spinner.component';
import { CommonModule } from '@angular/common';

/**
 * App (Root Component)
 *
 * This is the main root component for the application.
 * It:
 * Holds the main router outlet
 * Displays the top navigation
 * Displays the global loading spinner
 *
 * Every other page in the app is rendered inside this component.
 */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    NavigationComponent,
    LoadingSpinnerComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {

  /**
   * Main app title used for display and identification.
   * Stored as a signal for simple reactive updates if needed later.
   */
  protected readonly title = signal('COM661-CW2-Frontend');
}
