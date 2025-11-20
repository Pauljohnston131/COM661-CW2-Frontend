import { Routes } from '@angular/router';

import { Home } from './components/home/home';
import { PatientsComponent } from './components/patients/patients';
import { Patient } from './components/patient/patient';

// PATIENT PORTAL (note the class names!)
import { PatientPortalSearchComponent } from './components/patient-portal-search/patient-portal-search';
import { PatientPortalComponent } from './components/patient-portal/patient-portal';

export const routes: Routes = [
  { path: '', component: Home },

  // GP Portal routes
  { path: 'patients', component: PatientsComponent },
  { path: 'patients/:id', component: Patient },

  // Patient Portal routes
  { path: 'patient-portal', component: PatientPortalSearchComponent },
  { path: 'patient-portal/:id', component: PatientPortalComponent }
];
