import { Routes } from '@angular/router';

import { HomeComponent } from './components/home/home';
import { PatientsComponent } from './components/patients/patients';
import { Patient } from './components/patient/patient';

import { PatientPortalComponent } from './components/patient-portal/patient-portal';

import { LoginComponent } from './auth/login/login';
import { AuthGuard } from './guards/auth.guard';
import { GpGuard } from './guards/gp.guard';
import { PatientGuard } from './guards/patient.guard';
import { AddPatientComponent } from './components/add-patient/add-patient';

export const routes: Routes = [

  // GP DASHBOARD
  {
    path: '',
    canActivate: [AuthGuard, GpGuard],
    component: HomeComponent
  },

  // LOGIN
  { path: 'login', component: LoginComponent },

  // GP PORTAL
  {
    path: 'gp',
    canActivate: [AuthGuard, GpGuard],
    children: [
      { path: 'patients', component: PatientsComponent },
      { path: 'patients/:id', component: Patient },
      { path: 'add-patient', component: AddPatientComponent }   // ← MOVED HERE
    ]
  },

  // PATIENT PORTAL
  {
    path: 'patient-portal',
    canActivate: [AuthGuard, PatientGuard],
    component: PatientPortalComponent
  },

  // FALLBACK — MUST ALWAYS BE LAST
  { path: '**', redirectTo: '' }
];
