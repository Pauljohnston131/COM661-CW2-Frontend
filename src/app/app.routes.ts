import { Routes } from '@angular/router';
import { TestApiComponent } from './components/test-api/test-api';

import { HomeComponent } from './components/home/home';
import { PatientsComponent } from './components/patients/patients';
import { PatientComponent } from './components/patient/patient';
import { PatientPortalComponent } from './components/patient-portal/patient-portal';

import { LoginComponent } from './auth/login/login';
import { AuthGuard } from './guards/auth.guard';
import { GpGuard } from './guards/gp.guard';
import { PatientGuard } from './guards/patient.guard';
import { AddPatientComponent } from './components/add-patient/add-patient';
import { DeletePatientComponent } from './components/delete-patient/delete-patient.component';

/**
 * Main application routes.
 *
 * Routes are split into:
 * - Public routes (login, test)
 * - GP-only routes (/ and /gp/**)
 * - Patient-only routes (/patient-portal)
 *
 * All protected routes use AuthGuard + role-based guards.
 */
export const routes: Routes = [

  /**
   * API testing page (dev/testing use only)
   */
  { path: 'test', component: TestApiComponent },

  /**
   * GP Dashboard
   * This is the default landing page when a GP logs in.
   */
  {
    path: '',
    canActivate: [AuthGuard, GpGuard],
    component: HomeComponent
  },

  /**
   * Login page (public)
   */
  { path: 'login', component: LoginComponent },

  /**
   * GP Section
   * All patient management routes live under /gp
   */
  {
    path: 'gp',
    canActivate: [AuthGuard, GpGuard],
    children: [
      { path: 'patients', component: PatientsComponent },
      { path: 'patients/:id', component: PatientComponent },
      { path: 'add-patient', component: AddPatientComponent },
      { path: 'delete-patient', component: DeletePatientComponent },

      /**
       * Optional redirect so /gp automatically goes to /gp/patients
       */
      { path: '', redirectTo: 'patients', pathMatch: 'full' }
    ]
  },

  /**
   * Patient Portal
   * Only accessible to logged-in patient users
   */
  {
    path: 'patient-portal',
    canActivate: [AuthGuard, PatientGuard],
    component: PatientPortalComponent
  },

  /**
   * Fallback route
   * Redirects any unknown URLs back to the main dashboard
   */
  { path: '**', redirectTo: '' }
];
