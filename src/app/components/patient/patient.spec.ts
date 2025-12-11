import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

import { PatientComponent } from './patient';
import { Api } from '../../services/api';

describe('PatientComponent', () => {
  let component: PatientComponent;
  let fixture: ComponentFixture<PatientComponent>;

  const mockRoute = {
    snapshot: {
      paramMap: {
        get: () => 'test-patient-id'
      }
    }
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        PatientComponent,
        HttpClientTestingModule,
        ReactiveFormsModule
      ],
      providers: [
        Api,
        { provide: ActivatedRoute, useValue: mockRoute }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PatientComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the Patient component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize appointment form on init', () => {
    expect(component.appointmentForm).toBeTruthy();
  });

  it('should initialize prescription form on init', () => {
    expect(component.prescriptionForm).toBeTruthy();
  });

  it('should initialize careplan form on init', () => {
    expect(component.careplanForm).toBeTruthy();
  });

  it('should show toast message when showToast is called', () => {
    component.showToast('Test toast', 'success');

    expect(component.toastMessage).toBe('Test toast');
    expect(component.toastType).toBe('success');
  });

  it('should enter editing mode when startEditAppointment is called', () => {
    const mockAppt: any = { _id: '123', doctor: 'Dr A' };

    component.startEditAppointment(mockAppt);

    expect(component.editingAppointmentId).toBe('123');
  });

  it('should cancel editing appointment correctly', () => {
    component.editingAppointmentId = '123';

    component.cancelEditAppointment();

    expect(component.editingAppointmentId).toBeNull();
  });


  it('should format a valid date using fmt()', () => {
    const result = component.fmt('2025-01-01');
    expect(result).toContain('Jan');
  });

  it('should return dash when fmt() is called with no date', () => {
    const result = component.fmt(undefined);
    expect(result).toBe('—');
  });
  
  it('should return primary badge for scheduled', () => {
    expect(component.badge('scheduled')).toBe('bg-primary');
  });

  it('should return success badge for completed', () => {
    expect(component.badge('completed')).toBe('bg-success');
  });

  it('should return danger badge for cancelled', () => {
    expect(component.badge('cancelled')).toBe('bg-danger');
  });

  it('should return default badge for unknown status', () => {
    expect(component.badge('unknown')).toBe('bg-secondary');
  });
});
