import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../auth/auth.service';

/**
 *
 * This service acts as the central communication layer between the Angular
 * frontend and the Flask backend API.
 *
 * It provides methods for:
 * - Authentication validation
 * - Patient CRUD operations
 * - Appointments
 * - Prescriptions
 * - Careplans
 * - GP dashboard summaries
 * - Appointment requests
 * - Geo-location patient search
 */
@Injectable({
  providedIn: 'root'
})
export class Api {

  /**
   * Base API endpoint for the backend
   */
  baseUrl = 'http://127.0.0.1:5000/api/v1.0';

  /**
   * Creates an instance of the API service.
   * @param http Angular HTTP client
   * @param auth Authentication service
   */
  constructor(
    private http: HttpClient,
    private auth: AuthService
  ) {}

  /**
   * Generates standard HTTP headers for API requests.
   */
  private get headers(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json'
    });
  }

  /**
   * Verifies the currently stored authentication token.
   * @returns Observable authentication verification response
   */
  verifyToken(): Observable<any> {
    return this.http.get(
      `${this.baseUrl}/auth/verify`,
      { headers: this.headers }
    );
  }

  /**
   * Retrieves a paginated list of patients.
   * @param page Page number
   * @param limit Number of patients per page
   * @param search Optional search query
   * @returns Observable patient list
   */
  getPatients(page: number = 1, limit: number = 10, search: string = ''): Observable<any> {
    let url = `${this.baseUrl}/patients?page=${page}&limit=${limit}`;

    if (search && search.trim()) {
      url += `&search=${encodeURIComponent(search.trim())}`;
    }

    return this.http.get(url, { headers: this.headers });
  }

  /**
   * Retrieves a single patient by ID.
   * @param id Patient ID
   * @returns Observable patient object
   */
  getPatient(id: string): Observable<any> {
    return this.http.get(
      `${this.baseUrl}/patients/${id}`,
      { headers: this.headers }
    );
  }

  /**
   * Creates a new patient.
   * @param payload Patient data
   * @returns Observable created patient
   */
  addPatient(payload: any): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/patients`,
      payload,
      { headers: this.headers }
    );
  }

  /**
   * Updates an existing patient.
   * @param id Patient ID
   * @param payload Updated patient data
   * @returns Observable update result
   */
  updatePatient(id: string, payload: any): Observable<any> {
    return this.http.put(
      `${this.baseUrl}/patients/${id}`,
      payload,
      { headers: this.headers }
    );
  }

  /**
   * Deletes a patient.
   * @param id Patient ID
   * @returns Observable delete result
   */
  deletePatient(id: string): Observable<any> {
    return this.http.delete(
      `${this.baseUrl}/patients/${id}`,
      { headers: this.headers }
    );
  }

  /**
   * Retrieves full aggregated dashboard summary data.
   * @returns Observable dashboard summary
   */
  getPatientSummary(): Observable<any> {
    return this.http.get(
      `${this.baseUrl}/patients/summary`,
      { headers: this.headers }
    );
  }

  /**
   * Submits an appointment request for a patient.
   * @param patientId Patient ID
   * @param payload Appointment request data
   * @returns Observable request result
   */
  requestAppointment(patientId: string, payload: any): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/patients/${patientId}/request`,
      payload,
      { headers: this.headers }
    );
  }

  /**
   * Adds a new appointment for a patient.
   * @param patientId Patient ID
   * @param payload Appointment data
   * @returns Observable appointment result
   */
  addAppointment(patientId: string, payload: any): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/patients/${patientId}`,
      payload,
      { headers: this.headers }
    );
  }

  /**
   * Updates an existing appointment.
   * @param patientId Patient ID
   * @param appointmentId Appointment ID
   * @param payload Updated appointment data
   * @returns Observable update result
   */
  updateAppointment(patientId: string, appointmentId: string, payload: any): Observable<any> {
    return this.http.put(
      `${this.baseUrl}/patients/${patientId}/${appointmentId}`,
      payload,
      { headers: this.headers }
    );
  }

  /**
   * Deletes an appointment.
   * @param patientId Patient ID
   * @param appointmentId Appointment ID
   * @returns Observable delete result
   */
  deleteAppointment(patientId: string, appointmentId: string): Observable<any> {
    return this.http.delete(
      `${this.baseUrl}/patients/${patientId}/${appointmentId}`,
      { headers: this.headers }
    );
  }

  /**
   * Retrieves all pending appointment requests for GPs.
   * @returns Observable pending requests list
   */
  getPendingRequests(): Observable<any> {
    return this.http.get(
      `${this.baseUrl}/patients/requests/pending`,
      { headers: this.headers }
    );
  }

  /**
   * Retrieves prescriptions for a patient.
   * @param patientId Patient ID
   * @returns Observable prescriptions list
   */
  getPrescriptions(patientId: string): Observable<any> {
    return this.http.get(
      `${this.baseUrl}/patients/${patientId}/prescriptions`,
      { headers: this.headers }
    );
  }

  /**
   * Adds a prescription for a patient.
   * @param patientId Patient ID
   * @param payload Prescription data
   * @returns Observable create result
   */
  addPrescription(patientId: string, payload: any): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/patients/${patientId}/prescriptions`,
      payload,
      { headers: this.headers }
    );
  }

  /**
   * Updates an existing prescription.
   * @param patientId Patient ID
   * @param prescriptionId Prescription ID
   * @param payload Updated prescription data
   * @returns Observable update result
   */
  updatePrescription(patientId: string, prescriptionId: string, payload: any): Observable<any> {
    return this.http.put(
      `${this.baseUrl}/patients/${patientId}/prescriptions/${prescriptionId}`,
      payload,
      { headers: this.headers }
    );
  }

  /**
   * Deletes a prescription from a patient.
   * @param patientId Patient ID
   * @param prescriptionId Prescription ID
   * @returns Observable delete result
   */
  deletePrescription(patientId: string, prescriptionId: string): Observable<any> {
    return this.http.delete(
      `${this.baseUrl}/patients/${patientId}/prescriptions/${prescriptionId}`,
      { headers: this.headers }
    );
  }

  /**
   * Retrieves careplans for a patient.
   * @param patientId Patient ID
   * @returns Observable careplan list
   */
  getCareplans(patientId: string): Observable<any> {
    return this.http.get(
      `${this.baseUrl}/patients/${patientId}/careplans`,
      { headers: this.headers }
    );
  }

  /**
   * Adds a careplan for a patient.
   * @param patientId Patient ID
   * @param payload Careplan data
   * @returns Observable create result
   */
  addCareplan(patientId: string, payload: any): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/patients/${patientId}/careplans`,
      payload,
      { headers: this.headers }
    );
  }

  /**
   * Updates a careplan.
   * @param patientId Patient ID
   * @param careplanId Careplan ID
   * @param payload Updated careplan data
   * @returns Observable update result
   */
  updateCareplan(patientId: string, careplanId: string, payload: any): Observable<any> {
    return this.http.put(
      `${this.baseUrl}/patients/${patientId}/careplans/${careplanId}`,
      payload,
      { headers: this.headers }
    );
  }

  /**
   * Deletes a careplan.
   * @param patientId Patient ID
   * @param careplanId Careplan ID
   * @returns Observable delete result
   */
  deleteCareplan(patientId: string, careplanId: string): Observable<any> {
    return this.http.delete(
      `${this.baseUrl}/patients/${patientId}/careplans/${careplanId}`,
      { headers: this.headers }
    );
  }

  /**
   * Performs patient search with optional filters.
   * @param q Search term
   * @param gender Gender filter
   * @param skip Skip value
   * @param limit Result limit
   * @returns Observable search results
   */
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

  /**
   * Retrieves demographic overview statistics.
   * @param gender Optional gender filter
   * @param limit Result limit
   * @returns Observable overview statistics
   */
  getOverviewStats(gender: string = '', limit = 5): Observable<any> {
    const params = new URLSearchParams();
    if (gender) params.set('gender', gender);
    params.set('limit', String(limit));

    return this.http.get(
      `${this.baseUrl}/stats/overview?${params.toString()}`,
      { headers: this.headers }
    );
  }
  

  /**
   * Retrieves nearby patients using geo-location search.
   * @param lon Longitude
   * @param lat Latitude
   * @param max_distance Maximum search radius in meters
   * @returns Observable nearby patients list
   */
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
