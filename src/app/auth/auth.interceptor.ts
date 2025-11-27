// src/app/auth/auth.interceptor.ts
import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, catchError, finalize, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { LoadingService } from '../shared/loading.service';
import { ToastService } from '../shared/toast.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(
    private auth: AuthService,
    private loading: LoadingService,
    private toast: ToastService,
    private router: Router
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    this.loading.show();

    let cloned = req;
    const token = this.auth.getToken();

    // Add token only if not already explicitly set
    if (token && !req.headers.has('x-access-token')) {
      cloned = req.clone({
        setHeaders: {
          'x-access-token': token
        }
      });
    }

    return next.handle(cloned).pipe(
      catchError((err: HttpErrorResponse) => {
        if (err.status === 401) {
          // Session expired / invalid token
          this.auth.logout();
          this.toast.error('Your session has expired. Please log in again.', 'Session expired');
          this.router.navigate(['/login']);
        } else if (err.status >= 500) {
          this.toast.error('A server error occurred. Please try again later.', 'Server error');
        }

        return throwError(() => err);
      }),
      finalize(() => {
        this.loading.hide();
      })
    );
  }
}
