// src/app/shared/notification.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface NotificationItem {
  id: string;
  message: string;
  createdAt: Date;
  read: boolean;
  type: 'info' | 'success' | 'warning' | 'danger';
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private _items = new BehaviorSubject<NotificationItem[]>([]);
  items$ = this._items.asObservable();

  private generateId(): string {
    return Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
  }

  push(message: string, type: 'info' | 'success' | 'warning' | 'danger' = 'info') {
    const current = this._items.value;
    const newItem: NotificationItem = {
      id: this.generateId(),
      message,
      createdAt: new Date(),
      read: false,
      type
    };
    this._items.next([newItem, ...current]);
  }

  markAsRead(id: string) {
    const updated = this._items.value.map(n =>
      n.id === id ? { ...n, read: true } : n
    );
    this._items.next(updated);
  }

  markAllAsRead() {
    const updated = this._items.value.map(n => ({ ...n, read: true }));
    this._items.next(updated);
  }
}
