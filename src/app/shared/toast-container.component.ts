// src/app/shared/toast-container.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, ToastMessage } from './toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast-container.component.html',
  styleUrls: ['./toast-container.component.css']
})
export class ToastContainerComponent {
  toasts: ToastMessage[] = [];

  constructor(private toastService: ToastService) {
    this.toastService.toasts$.subscribe(ts => {
      this.toasts = ts;
    });
  }

  dismiss(id: number) {
    this.toastService.dismiss(id);
  }

  cssClass(t: ToastMessage): string {
    switch (t.type) {
      case 'success': return 'toast-success';
      case 'error': return 'toast-error';
      case 'warning': return 'toast-warning';
      case 'info':
      default: return 'toast-info';
    }
  }
}
