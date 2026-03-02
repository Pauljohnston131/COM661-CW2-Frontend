import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Api } from '../../services/api';

@Component({
  selector: 'app-gp-appointment-review',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './gp-appointment-review.html',
  styleUrls: ['./gp-appointment-review.css']
})
export class GpAppointmentReviewComponent implements OnInit {
  
  appointment: any = null;
  loading = true;
  processing = false;
  
  // For rescheduling
  showRescheduleModal = false;
  newDate: string = '';
  newTime: string = '';
  gpNotes: string = '';
  
  // Available time slots for rescheduling
  availableSlots: any[] = [];
  selectedSlot: string = '';

  constructor(
    private route: ActivatedRoute,
    private api: Api,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadAppointment(id);
    }
  }

  loadAppointment(id: string): void {
  this.api.getAppointmentDetails(id).subscribe({
    next: (res) => {
      console.log('APPOINTMENT DATA:', res.data?.appointment);
      this.appointment = res.data?.appointment;
      this.loading = false;
    },
    error: (err) => {
      console.error('Error loading appointment:', err);
      this.loading = false;
    }
  });
}

  confirmAppointment(): void {
    this.processing = true;
    this.processAppointment('confirm');
  }

  declineAppointment(): void {
    if (confirm('Are you sure you want to decline this appointment request?')) {
      this.processing = true;
      this.processAppointment('decline');
    }
  }

  openRescheduleModal(): void {
    // Format current datetime for the input
    if (this.appointment?.datetime) {
      const date = new Date(this.appointment.datetime);
      this.newDate = date.toISOString().split('T')[0];
      this.newTime = date.toTimeString().slice(0, 5);
    }
    this.showRescheduleModal = true;
    this.loadAvailableSlots();
  }

  loadAvailableSlots(): void {
    this.api.getGpCalendar().subscribe({
      next: (res) => {
        // Get already confirmed datetimes so GP knows what's taken
        const confirmedTimes = (res.data?.appointments || []).map((a: any) => a.datetime);
        // Generate working slots and mark which are free
        this.availableSlots = this.generateWorkingSlots(confirmedTimes);
      },
      error: () => {
        // Fallback to empty — GP can still use manual date/time inputs
        this.availableSlots = [];
      }
    });
  }

  generateWorkingSlots(bookedTimes: string[]): any[] {
    const slots = [];
    const now = new Date();

    for (let dayOffset = 1; dayOffset <= 7; dayOffset++) {
      const date = new Date(now);
      date.setDate(now.getDate() + dayOffset);

      // Skip weekends
      if (date.getDay() === 0 || date.getDay() === 6) continue;

      for (let hour = 9; hour <= 16; hour++) {
        const slotDate = new Date(date);
        slotDate.setHours(hour, 0, 0, 0);

        // Format as "2026-02-18T09:00:00" to match backend
        const isoStr = slotDate.toISOString().substring(0, 19);

        // Skip if already booked
        const isBooked = bookedTimes.some(bt => bt.substring(0, 19) === isoStr);
        if (isBooked) continue;

        slots.push({
          datetime: isoStr,
          display: slotDate.toLocaleString('en-GB', {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
          })
        });
      }
    }
    return slots;
  }

  selectSlot(datetime: string): void {
    this.selectedSlot = datetime;
    const date = new Date(datetime);
    this.newDate = date.toISOString().split('T')[0];
    this.newTime = date.toTimeString().slice(0, 5);
  }

  submitReschedule(): void {
    if (!this.newDate || !this.newTime) {
      alert('Please select a new date and time');
      return;
    }

    const newDateTime = `${this.newDate}T${this.newTime}:00`;
    
    this.processing = true;
    this.processAppointment('reschedule', newDateTime);
  }

  private processAppointment(action: string, newDatetime?: string): void {
    const payload: any = {
      action: action,
      notes: this.gpNotes
    };

    if (newDatetime) {
      payload.new_datetime = newDatetime;
    }

    this.api.processAppointment(this.appointment._id, payload).subscribe({
      next: (res) => {
        this.processing = false;
        this.showRescheduleModal = false;
        this.router.navigate(['/gp/home']);
      },
      error: (err) => {
        console.error('Error processing appointment:', err);
        this.processing = false;
        alert('Failed to process appointment. Please try again.');
      }
    });
  }

  getStatusClass(): string {
    const statusMap: Record<string, string> = {
      'requested': 'pending',
      'confirmed': 'confirmed',
      'declined': 'declined',
      'rescheduled': 'rescheduled'
    };
    return statusMap[this.appointment?.status?.toLowerCase()] || '';
  }

  getCaseStatus(): string {
    const statusMap: Record<string, string> = {
      'requested': 'Pending Review',
      'confirmed': 'Confirmed',
      'declined': 'Declined',
      'rescheduled': 'Rescheduled'
    };
    return statusMap[this.appointment?.status?.toLowerCase()] || 'Unknown Status';
  }

  getUrgencyClass(urgency: string): string {
    const classes: Record<string, string> = {
      'emergency': 'emergency',
      'urgent': 'urgent',
      'routine': 'routine',
      'low': 'low'
    };
    return classes[urgency?.toLowerCase()] || 'low';
  }

  getUrgencyBadge(urgency: string): string {
    const badges: Record<string, string> = {
      'emergency': 'Emergency',
      'urgent': 'Urgent',
      'routine': 'Routine',
      'low': 'Low Priority'
    };
    return badges[urgency?.toLowerCase()] || 'Not Specified';
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    return new Date(dateString).toLocaleString('en-GB', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  calculateAge(dob: string): number {
    if (!dob) return 0;
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }

  goBack(): void {
    this.router.navigate(['/gp/home']);
  }

  // Add this method to your component class
formatRedFlag(flag: string): string {
  if (!flag) return '';
  return flag.replace(/_/g, ' ');
}
formatSymptoms(symptoms: any, category?: string): string {

  if (!symptoms) return 'No symptoms reported';

  if (typeof symptoms === 'string') return symptoms;

  if (typeof symptoms !== 'object') return String(symptoms);

  const parts: string[] = [];

  if (symptoms.body_area) {
    parts.push(`Area: ${symptoms.body_area}`);
  }

  if (symptoms.pain_level !== undefined) {
    parts.push(`Pain level: ${symptoms.pain_level}/10`);
  }

  if (symptoms.duration_days) {
    parts.push(`Duration: ${symptoms.duration_days} days`);
  }

  if (symptoms.described_symptoms) {
    parts.push(symptoms.described_symptoms);
  }

  if (symptoms.notes) {
    parts.push(`Notes: ${symptoms.notes}`);
  }

  return parts.join(' • ');
}

}