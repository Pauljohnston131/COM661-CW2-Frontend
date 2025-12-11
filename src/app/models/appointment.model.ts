export interface Appointment {
  _id?: string;
  doctor: string;
  date: string;
  notes?: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'requested';
}
