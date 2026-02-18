import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FullCalendarModule } from '@fullcalendar/angular';
import dayGridPlugin from '@fullcalendar/daygrid';
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
    plugins: [dayGridPlugin, interactionPlugin],
    initialView: 'dayGridMonth',
    headerToolbar: {
      left: 'title',
      center: '',
      right: 'prev,next'
    },
    displayEventTime: false,
    eventDisplay: 'block',
    selectable: false,
    editable: false,
    fixedWeekCount: false,
    height: 'auto',
    eventClick: (arg: EventClickArg) => {
      this.eventClicked.emit(arg.event.extendedProps);
    }
  };

  ngOnChanges() {
    this.calendarOptions = {
      ...this.calendarOptions,
      events: this.events
    };
  }
}