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
  // PRESCRIPTIONS
  // --------------------------
  getPrescriptions(patientId: string): Observable<any> {
    return this.http.get(
      `${this.baseUrl}/patients/${patientId}/prescriptions`,
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
}
