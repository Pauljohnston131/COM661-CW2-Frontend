import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FullCalendarModule } from '@fullcalendar/angular';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { CalendarOptions, EventInput, EventClickArg } from '@fullcalendar/core';

@Component({
  selector: 'app-home-calendar',
  standalone: true,
  imports: [CommonModule, FullCalendarModule],
  templateUrl: './home-calendar.component.html',
  styleUrls: ['./home-calendar.component.css'],
})
export class HomeCalendarComponent {

  @Input() events: EventInput[] = [];
  @Output() eventClicked = new EventEmitter<any>();

  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    initialView: 'timeGridWeek',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay'
    },
    slotMinTime: '08:00:00',
    slotMaxTime: '18:00:00',
    // Remove allDaySlot - it's not in the CalendarOptions type
    nowIndicator: true,
    displayEventTime: true,
    eventDisplay: 'block',
    selectable: true,
    editable: true,
    eventDurationEditable: false,
    fixedWeekCount: false,
    height: 'auto',
    slotDuration: '01:00:00',
    eventTimeFormat: {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    },
    eventClick: (arg: EventClickArg) => {
      this.eventClicked.emit(arg.event.extendedProps);
    },
    eventClassNames: (arg) => {
      const status = arg.event.extendedProps['status'];
      return [`event-${status || 'confirmed'}`];
    }
  };

  ngOnChanges() {
    this.calendarOptions = {
      ...this.calendarOptions,
      events: this.events
    };
  }
}