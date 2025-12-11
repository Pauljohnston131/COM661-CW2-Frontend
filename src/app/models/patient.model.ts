import { Appointment } from './appointment.model';
import { Prescription } from './prescription.model';
import { Careplan } from './careplan.model';

export interface Patient {
  _id?: string;
  id?: string;

  name: string;
  age: number;
  gender?: string;
  town?: string;
  condition?: string;
  age_group?: string;

  appointments: Appointment[];
  prescriptions: Prescription[];
  careplans: Careplan[];

  location?: {
    coordinates: [number, number];
  };

  created_at?: string;
  updated_at?: string;
}
