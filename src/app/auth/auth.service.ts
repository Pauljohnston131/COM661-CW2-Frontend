// src/app/auth/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { jwtDecode } from "c:/COM661 CW1 Synthea/COM661-CW2-Frontend/node_modules/jwt-decode/build/esm/index";

@Injectable({ providedIn: 'root' })
export class AuthService {

  private baseUrl = 'http://127.0.0.1:5000/api/v1.0';
  private tokenKey = 'gpportal_token';

  constructor(private http: HttpClient) {}

  // ---- API CALLS ----
  login(username: string, password: string) {
    const headers = new HttpHeaders({
      Authorization: 'Basic ' + btoa(`${username}:${password}`)
    });

    // assumes backend returns { success: true, token: "..." }
    return this.http.get<any>(`${this.baseUrl}/auth/login`, { headers });
  }

  logout() {
    localStorage.removeItem(this.tokenKey);
  }

  // ---- TOKEN HANDLING ----
  storeToken(token: string) {
    localStorage.setItem(this.tokenKey, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  // ---- ROLE HELPERS ----
  private decode(): any | null {
    const token = this.getToken();
    if (!token) return null;
    try {
      return jwtDecode(token);
    } catch {
      return null;
    }
  }

  isGP(): boolean {
    const decoded = this.decode();
    return !!decoded && decoded.admin === true;
  }

  isPatient(): boolean {
    const decoded = this.decode();
    return !!decoded && decoded.admin === false;
  }
}
