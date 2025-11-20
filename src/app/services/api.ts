// src/app/services/api.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class Api {

  baseUrl = 'http://127.0.0.1:5000/api/v1.0';

  // TEMP — will replace with real login later
  private adminToken: string = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoicGF1bCIsImFkbWluIjp0cnVlLCJleHAiOjE3NjM2NjM3Mzd9.Yro1ngryMJ3FoO1ZJVCnS_Z3pU5oexdo8jlxHhTTJ34';

  constructor(private http: HttpClient) {}

  private get headers(): HttpHeaders {
    return new HttpHeaders({
      'x-access-token': this.adminToken,
      'Content-Type': 'application/json'
    });
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
