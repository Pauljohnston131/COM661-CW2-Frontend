import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../auth/auth.service';

/**
 * This service acts as the central communication layer between the Angular
 * frontend and the Flask backend API.
 */
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
    const headers: any = {
      'Content-Type': 'application/json'
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return new HttpHeaders(headers);
  }

  // ===== TRIAGE METHODS =====

  getGpTriageQueue(): Observable<any> {
  return this.http.get(
    `${this.baseUrl}/triage/gp/queue`,
    { headers: this.headers }
  );
}

getGpTriageCase(triageId: string): Observable<any> {
  return this.http.get(
    `${this.baseUrl}/triage/gp/case/${triageId}`,
    { headers: this.headers }
  );
}

gpTriageAction(triageId: string, payload: any): Observable<any> {
  return this.http.post(
    `${this.baseUrl}/triage/gp/case/${triageId}/action`,
    payload,
    { headers: this.headers }
  );
}

  
  /**
   * Gets all available triage categories
   * @returns Observable categories list
   */
  getTriageCategories(): Observable<any> {
    return this.http.get(
      `${this.baseUrl}/triage/categories`,
      { headers: this.headers }
    );
  }

  /**
   * Retrieves symptoms for a specific category and area
   * @param category Category identifier (physical, mental, general, unsure)
   * @param areaId Body area identifier (for physical category only)
   * @returns Observable symptoms list
   */
  getSymptomsByCategoryAndArea(category: string, areaId?: string): Observable<any> {
    let url = `${this.baseUrl}/triage/symptoms/${category}`;
    if (areaId) {
      url += `/${areaId}`;
    }
    return this.http.get(
      url,
      { headers: this.headers }
    );
  }

  /**
   * Submits a triage assessment
   * @param payload Triage data
   * @returns Observable triage result
   */
  submitTriage(payload: any): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/triage/submit`,
      payload,
      { headers: this.headers }
    );
  }

  /**
   * Retrieves symptoms for a specific body area (legacy method)
   * @param areaId Body area identifier
   * @returns Observable symptoms list
   */
  getSymptomsByArea(areaId: string): Observable<any> {
    return this.http.get(
      `${this.baseUrl}/triage/symptoms/physical/${areaId}`,
      { headers: this.headers }
    );
  }

  /**
   * Gets triage history for a patient
   * @param patientId Patient identifier
   * @returns Observable triage history
   */
  getTriageHistory(patientId: string): Observable<any> {
    return this.http.get(
      `${this.baseUrl}/triage/history/${patientId}`,
      { headers: this.headers }
    );
  }

  // ===== AUTHENTICATION =====
  
  verifyToken(): Observable<any> {
    return this.http.get(
      `${this.baseUrl}/auth/verify`,
      { headers: this.headers }
    );
  }

  // ===== PATIENT METHODS =====
  
  getPatients(page: number = 1, limit: number = 10, search: string = ''): Observable<any> {
    let url = `${this.baseUrl}/patients?page=${page}&limit=${limit}`;
    if (search && search.trim()) {
      url += `&search=${encodeURIComponent(search.trim())}`;
    }
    return this.http.get(url, { headers: this.headers });
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

  getPatientSummary(): Observable<any> {
    return this.http.get(
      `${this.baseUrl}/patients/summary`,
      { headers: this.headers }
    );
  }

  // ===== APPOINTMENT METHODS =====
  
  requestAppointment(patientId: string, payload: any): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/patients/${patientId}/request`,
      payload,
      { headers: this.headers }
    );
  }

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

  getPendingRequests(): Observable<any> {
    return this.http.get(
      `${this.baseUrl}/patients/requests/pending`,
      { headers: this.headers }
    );
  }

  // ===== PRESCRIPTION METHODS =====
  
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

  // ===== CAREPLAN METHODS =====
  
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

  // ===== SEARCH METHODS =====
  
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