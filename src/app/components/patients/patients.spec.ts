import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-patients',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './patients.component.html',
  styleUrl: './patients.component.css'
})
export class PatientsComponent {
  patients = [
    { name: 'Alice Johnson', age: 45, condition: 'Asthma' },
    { name: 'Bob Smith', age: 62, condition: 'Diabetes' },
    { name: 'Charlie Lee', age: 30, condition: 'Hypertension' }
  ];
}
