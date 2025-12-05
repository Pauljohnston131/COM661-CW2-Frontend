// src/app/components/home/calendar/home-calendar.component.ts

import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FullCalendarModule } from '@fullcalendar/angular';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';

import { CalendarOptions, EventInput } from '@fullcalendar/core';

@Component({
  selector: 'app-home-calendar',
  standalone: true,
  imports: [CommonModule, FullCalendarModule],
  templateUrl: './home-calendar.component.html',
  styleUrls: ['./home-calendar.component.css'],
})
export class HomeCalendarComponent {

  @Input() events: EventInput[] = [];

  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, interactionPlugin],
    initialView: 'dayGridMonth',
    headerToolbar: {
      left: 'title',
      center: '',
      right: 'prev,next'
    },

    // Disable time display
    displayEventTime: false,

    // Simple dot indicators
    eventDisplay: 'block',

    // Prevent selecting, dragging, resizing
    selectable: false,
    editable: false,

    // Style tweaks
    fixedWeekCount: false,
    height: 'auto',
  };

  ngOnChanges() {
    this.calendarOptions = {
      ...this.calendarOptions,
      events: this.events
    };
  }
}
