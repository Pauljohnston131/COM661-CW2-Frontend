export interface Prescription {
  _id?: string;
  name: string;
  start: string;
  stop?: string;
  status: 'active' | 'completed' | 'cancelled' | 'pending';
}
