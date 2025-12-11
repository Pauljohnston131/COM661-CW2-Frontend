// src/app/auth/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { jwtDecode } from 'jwt-decode';

/**
 * Shape of the decoded JWT token.
 * Only includes the fields we actually use in the app.
 */
interface DecodedToken {
  exp?: number;
  user?: string;
  admin?: boolean;
  patient_id?: string;
  [key: string]: any;
}

/**
 * AuthService
 *
 * Handles:
 * - Logging in
 * - Storing and reading the JWT token
 * - Checking login status
 * - Checking user roles (GP vs Patient)
 * - Logging out
 */
@Injectable({ providedIn: 'root' })
export class AuthService {

  /** Base API URL for auth endpoints */
  private baseUrl = 'http://127.0.0.1:5000/api/v1.0';

  /** Key used to store the JWT in localStorage */
  private tokenKey = 'gpportal_token';

  constructor(private http: HttpClient) {}

  /**
   * Logs a user in using Basic Auth.
   * If successful, a JWT is returned from the backend.
   *
   * @param username User login name
   * @param password User password
   */
  login(username: string, password: string) {
    const headers = new HttpHeaders({
      Authorization: 'Basic ' + btoa(`${username}:${password}`)
    });

    return this.http.get<any>(`${this.baseUrl}/auth/login`, { headers });
  }

  /**
   * Saves the JWT token to localStorage.
   *
   * @param token JWT returned from the backend
   */
  storeToken(token: string) {
    localStorage.setItem(this.tokenKey, token);
  }

  /**
   * Gets the stored JWT token from localStorage.
   */
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  /**
   * Decodes the stored JWT token so we can read user info.
   * If anything fails, it safely returns null.
   */
  private decode(): DecodedToken | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      return jwtDecode<DecodedToken>(token);
    } catch {
      return null;
    }
  }

  /**
   * Checks whether the user is logged in.
   * If the token has an expiry time, it also checks that it hasn't expired.
   */
  isLoggedIn(): boolean {
    const decoded = this.decode();

    if (!decoded?.exp) return !!this.getToken();

    const now = Date.now() / 1000;
    return decoded.exp > now;
  }

  /**
   * Gets the username from the token.
   */
  getUsername(): string | null {
    const decoded = this.decode();
    return decoded?.user || null;
  }

  /**
   * Gets the patient ID from the token (used for patient portal views).
   */
  getPatientId(): string | null {
    const decoded = this.decode();
    return decoded?.patient_id || null;
  }

  /**
   * Checks if the logged-in user is a GP (admin role).
   */
  isGP(): boolean {
    const decoded = this.decode();
    return !!decoded && decoded.admin === true;
  }

  /**
   * Checks if the logged-in user is a patient.
   */
  isPatient(): boolean {
    const decoded = this.decode();
    return !!decoded && decoded.admin === false;
  }

  /**
   * Calls the backend logout endpoint to invalidate the token server-side.
   */
  logoutApi() {
    const token = this.getToken();

    return this.http.get(`${this.baseUrl}/auth/logout`, {
      headers: new HttpHeaders({
        'x-access-token': token || ''
      })
    });
  }

  /**
   * Logs the user out locally by removing the token.
   */
  logout() {
    localStorage.removeItem(this.tokenKey);
  }
}
