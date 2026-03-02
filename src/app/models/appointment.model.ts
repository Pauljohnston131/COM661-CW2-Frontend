export interface Appointment {
  _id?: string;
  doctor: string;
  date: string;
  notes?: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'requested';
  _source?: string;
  urgency?: string;
  category?: string;
  body_area?: string;
  pain_level?: number;
  duration_days?: number;
  duration_weeks?: number;
  specific_symptoms?: string[];
  fever?: boolean;
  chest_pain?: boolean;
  breathing_difficulty?: boolean;
  mobility_impact?: boolean;
}