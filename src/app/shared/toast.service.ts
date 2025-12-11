// src/app/shared/toast.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastMessage {
  id: number;
  type: ToastType;
  message: string;
  title?: string;
  duration?: number; 
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private toasts: ToastMessage[] = [];
  private toastsSubject = new BehaviorSubject<ToastMessage[]>([]);
  toasts$ = this.toastsSubject.asObservable();

  private idCounter = 1;

  private show(type: ToastType, message: string, title?: string, duration = 4000) {
    const toast: ToastMessage = {
      id: this.idCounter++,
      type,
      message,
      title,
      duration
    };
    this.toasts.push(toast);
    this.toastsSubject.next([...this.toasts]);

    setTimeout(() => {
      this.dismiss(toast.id);
    }, duration);
  }

  success(message: string, title?: string, duration?: number) {
    this.show('success', message, title, duration);
  }

  error(message: string, title?: string, duration?: number) {
    this.show('error', message, title, duration);
  }

  info(message: string, title?: string, duration?: number) {
    this.show('info', message, title, duration);
  }

  warning(message: string, title?: string, duration?: number) {
    this.show('warning', message, title, duration);
  }

  dismiss(id: number) {
    this.toasts = this.toasts.filter(t => t.id !== id);
    this.toastsSubject.next([...this.toasts]);
  }

  clearAll() {
    this.toasts = [];
    this.toastsSubject.next([]);
  }
}
