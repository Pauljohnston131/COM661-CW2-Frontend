import { Routes } from '@angular/router';

import { HomeComponent } from './components/home/home';        // ← FIXED HERE
import { PatientsComponent } from './components/patients/patients';
import { Patient } from './components/patient/patient';

import { PatientPortalComponent } from './components/patient-portal/patient-portal';

import { LoginComponent } from './auth/login/login';
import { AuthGuard } from './guards/auth.guard';
import { GpGuard } from './guards/gp.guard';
import { PatientGuard } from './guards/patient.guard';

export const routes: Routes = [

  // GP DASHBOARD (Home)
  {
    path: '',
    canActivate: [AuthGuard, GpGuard],
    component: HomeComponent                                 // ← also update here
  },

  // LOGIN (Public)
  { path: 'login', component: LoginComponent },

  // GP PORTAL
  {
    path: 'gp',
    canActivate: [AuthGuard, GpGuard],
    children: [
      { path: 'patients', component: PatientsComponent },
      { path: 'patients/:id', component: Patient }
    ]
  },

  // PATIENT PORTAL
  {
    path: 'patient-portal',
    canActivate: [AuthGuard, PatientGuard],
    component: PatientPortalComponent
  },

  // Fallback
  { path: '**', redirectTo: '' }
];