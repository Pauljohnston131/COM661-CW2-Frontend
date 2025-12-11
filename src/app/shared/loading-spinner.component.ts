import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadingService } from './loading.service';

/**
 * LoadingSpinnerComponent
 *
 * Displays a global loading spinner whenever the app
 * is waiting for an HTTP request to complete.
 *
 * This component listens to the LoadingService and
 * automatically shows or hides based on its state.
 */
@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './loading-spinner.component.html',
  styleUrls: ['./loading-spinner.component.css']
})
export class LoadingSpinnerComponent {

  constructor(private loadingService: LoadingService) {}

  /**
   * Observable used by the template to show or hide the spinner.
   */
  get loading$() {
    return this.loadingService.loading$;
  }
}
