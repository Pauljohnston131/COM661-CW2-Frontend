import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { PatientPortalComponent } from './patient-portal';
import { Api } from '../../services/api';
import { AuthService } from '../../auth/auth.service';

describe('PatientPortalComponent', () => {
  let component: PatientPortalComponent;
  let fixture: ComponentFixture<PatientPortalComponent>;

  const mockAuthService = {
    getPatientId: () => 'test-patient-id'
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        PatientPortalComponent,
        HttpClientTestingModule
      ],
      providers: [
        Api,
        { provide: AuthService, useValue: mockAuthService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PatientPortalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the Patient Portal component', () => {
    expect(component).toBeTruthy();
  });

  it('should display error toast when showToast is called with error', () => {
    (component as any).showToast('Error message', 'error');

    expect(component.toastMessage).toBe('Error message');
    expect(component.toastType).toBe('error');
  });

  it('should block submission if no date is selected', () => {
    component.requestDate = '';
    component.requestSymptoms = 'Test symptoms';

    component.submitRequest();

    expect(component.toastType).toBe('error');
  });

  it('should block submission if symptoms are too short', () => {
    component.requestDate = '2025-01-01';
    component.requestSymptoms = 'bad';

    component.submitRequest();

    expect(component.toastType).toBe('error');
  });

  it('should format a date correctly using fmt()', () => {
    const result = component.fmt('2025-01-01');
    expect(result).toContain('Jan');
  });

  it('should return correct badge class for requested', () => {
    const result = component.badge('requested');
    expect(result).toBe('bg-warning text-dark');
  });

  it('should return default badge class for unknown status', () => {
    const result = component.badge('unknown');
    expect(result).toBe('bg-secondary');
  });

  it('should return green class for active prescription', () => {
    const result = component.getPrescriptionStatusClass({ status: 'active' });
    expect(result).toBe('bg-success');
  });

  it('should return danger class for cancelled prescription', () => {
    const result = component.getPrescriptionStatusClass({ status: 'cancelled' });
    expect(result).toBe('bg-danger');
  });

  it('should return today in YYYY-MM-DD format', () => {
    const today = component.getTodayDate();
    expect(today.length).toBe(10); 
    expect(today).toContain('-');
  });
});
