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

/**
 * AuthInterceptor
 *
 * This interceptor runs on every outgoing HTTP request.
 * It:
 * - Automatically attaches the JWT token (if available)
 * - Displays a global loading spinner during requests
 * - Handles expired sessions (401 errors)
 * - Shows user-friendly error messages for server issues
 */
@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(
    private auth: AuthService,
    private loading: LoadingService,
    private toast: ToastService,
    private router: Router
  ) {}

  /**
   * Intercepts every HTTP request before it reaches the backend.
   *
   * @param req Original outgoing request
   * @param next HTTP request handler
   */
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    this.loading.show();

    let cloned = req;
    const token = this.auth.getToken();

    if (token && !req.headers.has('Authorization')) {
      cloned = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
    }

    return next.handle(cloned).pipe(
      catchError((err: HttpErrorResponse) => {

        if (err.status === 401) {
          this.auth.logout();
          this.toast.error(
            'Your session has expired. Please log in again.',
            'Session expired'
          );
          this.router.navigate(['/login']);
        }

        else if (err.status >= 500) {
          this.toast.error(
            'A server error occurred. Please try again later.',
            'Server error'
          );
        }

        return throwError(() => err);
      }),
      finalize(() => {

        this.loading.hide();
      })
    );
  }
}
