import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

import { routes } from './app.routes';
import { AuthInterceptor } from './auth/auth.interceptor';

/**
 * Main application configuration.
 *
 * This replaces the traditional AppModule setup and is used to:
 * - Configure routing
 * - Set up global HTTP handling
 * - Enable performance optimisations
 * - Register the authentication interceptor
 */
export const appConfig: ApplicationConfig = {
  providers: [
    /**
     * Enables global error handling for the browser
     */
    provideBrowserGlobalErrorListeners(),

    /**
     * Improves performance by grouping UI updates together
     */
    provideZoneChangeDetection({ eventCoalescing: true }),

    /**
     * Registers the main application routes
     */
    provideRouter(routes),

    /**
     * Provides the Angular HTTP client and enables
     * dependency-injected interceptors
     */
    provideHttpClient(withInterceptorsFromDi()),

    /**
     * Registers the AuthInterceptor for attaching JWT tokens
     * to outgoing API requests
     */
    {
      provide: AuthInterceptor,
      useClass: AuthInterceptor
    }
  ]
};

