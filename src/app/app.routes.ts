import { Routes } from '@angular/router';

import { Home } from './components/home/home';
import { PatientsComponent } from './components/patients/patients';
import { Patient } from './components/patient/patient';

import { PatientPortalSearchComponent } from './components/patient-portal-search/patient-portal-search';
import { PatientPortalComponent } from './components/patient-portal/patient-portal';

import { LoginComponent } from './auth/login/login';
import { AuthGuard } from './guards/auth.guard';
import { GpGuard } from './guards/gp.guard';
import { PatientGuard } from './guards/patient.guard';

export const routes: Routes = [
  { path: '', component: Home },

  // LOGIN
  { path: 'login', component: LoginComponent },

  // GP PORTAL (must be logged in + GP)
  {
    path: 'gp',
    canActivate: [AuthGuard, GpGuard],
    children: [
      { path: 'patients', component: PatientsComponent },
      { path: 'patients/:id', component: Patient }
    ]
  },

  // PATIENT PORTAL (must be logged in + patient)
  {
    path: 'patient-portal',
    canActivate: [AuthGuard, PatientGuard],
    children: [
      { path: '', component: PatientPortalSearchComponent },
      { path: ':id', component: PatientPortalComponent }
    ]
  },

  // fallback
  { path: '**', redirectTo: '' }
];
