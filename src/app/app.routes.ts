import { Routes } from '@angular/router';

import { Home } from './components/home/home';
import { PatientsComponent } from './components/patients/patients';
import { Patient } from './components/patient/patient';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'patients', component: PatientsComponent },
  { path: 'patients/:id', component: Patient }
];
