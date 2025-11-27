// src/app/auth/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
  exp?: number;
  user?: string;
  admin?: boolean;
  patient_id?: string;
  [key: string]: any;
}

@Injectable({ providedIn: 'root' })
export class AuthService {

  private baseUrl = 'http://127.0.0.1:5000/api/v1.0';
  private tokenKey = 'gpportal_token';

  constructor(private http: HttpClient) {}

  login(username: string, password: string) {
    const headers = new HttpHeaders({
      Authorization: 'Basic ' + btoa(`${username}:${password}`)
    });
    return this.http.get<any>(`${this.baseUrl}/auth/login`, { headers });
  }

  storeToken(token: string) {
    localStorage.setItem(this.tokenKey, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  private decode(): DecodedToken | null {
    const token = this.getToken();
    if (!token) return null;
    try {
      return jwtDecode<DecodedToken>(token);
    } catch {
      return null;
    }
  }

  /** Check if token exists AND not expired */
  isLoggedIn(): boolean {
    const decoded = this.decode();
    if (!decoded?.exp) return !!this.getToken();
    const now = Date.now() / 1000;
    return decoded.exp > now;
  }

  getUsername(): string | null {
    const decoded = this.decode();
    return decoded?.user || null;
  }

  getPatientId(): string | null {
    const decoded = this.decode();
    return decoded?.patient_id || null;
  }

  isGP(): boolean {
    const decoded = this.decode();
    return !!decoded && decoded.admin === true;
  }

  isPatient(): boolean {
    const decoded = this.decode();
    return !!decoded && decoded.admin === false;
  }

  logoutApi() {
    const token = this.getToken();
    return this.http.get(`${this.baseUrl}/auth/logout`, {
      headers: new HttpHeaders({
        'x-access-token': token || ''
      })
    });
  }

  logout() {
    localStorage.removeItem(this.tokenKey);
  }
}
