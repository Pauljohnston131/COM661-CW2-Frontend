// src/app/services/api.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class Api {

  baseUrl = 'http://127.0.0.1:5000/api/v1.0';

  constructor(
    private http: HttpClient,
    private auth: AuthService
  ) {}

  private get headers(): HttpHeaders {
    const token = this.auth.getToken();

    const headerObj: any = {
      'Content-Type': 'application/json'
    };

    if (token) {
      headerObj['x-access-token'] = token;
    }

    return new HttpHeaders(headerObj);
  }

  // --------------------------
  // AUTH
  // --------------------------
  verifyToken(): Observable<any> {
    return this.http.get(
      `${this.baseUrl}/auth/verify`,
      { headers: this.headers }
    );
  }

  // --------------------------
  // PATIENTS
  // --------------------------
  getPatients(page: number = 1, limit: number = 10): Observable<any> {
    return this.http.get(
      `${this.baseUrl}/patients?page=${page}&limit=${limit}`,
      { headers: this.headers }
    );
  }

  getPatient(id: string): Observable<any> {
    return this.http.get(
      `${this.baseUrl}/patients/${id}`,
      { headers: this.headers }
    );
  }

  addPatient(payload: any): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/patients`,
      payload,
      { headers: this.headers }
    );
  }

  updatePatient(id: string, payload: any): Observable<any> {
    return this.http.put(
      `${this.baseUrl}/patients/${id}`,
      payload,
      { headers: this.headers }
    );
  }

  deletePatient(id: string): Observable<any> {
    return this.http.delete(
      `${this.baseUrl}/patients/${id}`,
      { headers: this.headers }
    );
  }

  // NEW — full summary for dashboard
  getPatientSummary(): Observable<any> {
    return this.http.get(
      `${this.baseUrl}/patients/summary`,
      { headers: this.headers }
    );
  }

  // --------------------------
  // PATIENT REQUEST APPOINTMENT
  // --------------------------
  requestAppointment(patientId: string, payload: any): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/patients/${patientId}/request`,
      payload,
      { headers: this.headers }
    );
  }

  // --------------------------
  // APPOINTMENTS
  // --------------------------
  addAppointment(patientId: string, payload: any): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/patients/${patientId}`,
      payload,
      { headers: this.headers }
    );
  }

  updateAppointment(patientId: string, appointmentId: string, payload: any): Observable<any> {
    return this.http.put(
      `${this.baseUrl}/patients/${patientId}/${appointmentId}`,
      payload,
      { headers: this.headers }
    );
  }

  deleteAppointment(patientId: string, appointmentId: string): Observable<any> {
    return this.http.delete(
      `${this.baseUrl}/patients/${patientId}/${appointmentId}`,
      { headers: this.headers }
    );
  }

  // --------------------------
  // GP: Pending appointment requests
  // --------------------------
  getPendingRequests(): Observable<any> {
    return this.http.get(
      `${this.baseUrl}/patients/requests/pending`,
      { headers: this.headers }
    );
  }

  // --------------------------
  // PRESCRIPTIONS
  // --------------------------
  getPrescriptions(patientId: string): Observable<any> {
    return this.http.get(
      `${this.baseUrl}/patients/${patientId}/prescriptions`,
      { headers: this.headers }
    );
  }

  addPrescription(patientId: string, payload: any): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/patients/${patientId}/prescriptions`,
      payload,
      { headers: this.headers }
    );
  }

  updatePrescription(patientId: string, prescriptionId: string, payload: any): Observable<any> {
    return this.http.put(
      `${this.baseUrl}/patients/${patientId}/prescriptions/${prescriptionId}`,
      payload,
      { headers: this.headers }
    );
  }

  deletePrescription(patientId: string, prescriptionId: string): Observable<any> {
    return this.http.delete(
      `${this.baseUrl}/patients/${patientId}/prescriptions/${prescriptionId}`,
      { headers: this.headers }
    );
  }

  // --------------------------
  // CAREPLANS
  // --------------------------
  getCareplans(patientId: string): Observable<any> {
    return this.http.get(
      `${this.baseUrl}/patients/${patientId}/careplans`,
      { headers: this.headers }
    );
  }

  addCareplan(patientId: string, payload: any): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/patients/${patientId}/careplans`,
      payload,
      { headers: this.headers }
    );
  }

  updateCareplan(patientId: string, careplanId: string, payload: any): Observable<any> {
    return this.http.put(
      `${this.baseUrl}/patients/${patientId}/careplans/${careplanId}`,
      payload,
      { headers: this.headers }
    );
  }

  deleteCareplan(patientId: string, careplanId: string): Observable<any> {
    return this.http.delete(
      `${this.baseUrl}/patients/${patientId}/careplans/${careplanId}`,
      { headers: this.headers }
    );
  }

  // --------------------------
  // SEARCH & ANALYTICS
  // --------------------------
  searchPatients(q: string, gender: string = '', skip = 0, limit = 10): Observable<any> {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (gender) params.set('gender', gender);
    params.set('skip', String(skip));
    params.set('limit', String(limit));

    return this.http.get(
      `${this.baseUrl}/search?${params.toString()}`,
      { headers: this.headers }
    );
  }

  getOverviewStats(gender: string = '', limit = 5): Observable<any> {
    const params = new URLSearchParams();
    if (gender) params.set('gender', gender);
    params.set('limit', String(limit));

    return this.http.get(
      `${this.baseUrl}/stats/overview?${params.toString()}`,
      { headers: this.headers }
    );
  }

  // --------------------------
  // GEO
  // --------------------------
  getNearbyPatients(lon: number, lat: number, max_distance: number = 5000): Observable<any> {
    const params = new URLSearchParams();
    params.set('lon', String(lon));
    params.set('lat', String(lat));
    params.set('max_distance', String(max_distance));

    return this.http.get(
      `${this.baseUrl}/geo/nearby?${params.toString()}`,
      { headers: this.headers }
    );
  }
}
