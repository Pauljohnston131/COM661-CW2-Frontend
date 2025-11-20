import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PatientsComponent } from './components/patients/patients';
import { NavigationComponent } from './components/navigation/navigation';


@Component({
  selector: 'app-root',
  standalone: true, // ensure this is included!
  imports: [RouterOutlet, NavigationComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('COM661-CW2-Frontend');
}
