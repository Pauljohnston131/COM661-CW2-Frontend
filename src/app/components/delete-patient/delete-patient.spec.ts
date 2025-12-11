import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { DeletePatientComponent } from './delete-patient.component';
import { Api } from '../../services/api';
import { Router, provideRouter } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { CommonModule } from '@angular/common';

describe('DeletePatientComponent', () => {
  let component: DeletePatientComponent;
  let fixture: ComponentFixture<DeletePatientComponent>;
  let apiSpy: jasmine.SpyObj<Api>;
  let router: Router;

  beforeEach(async () => {
    apiSpy = jasmine.createSpyObj('Api', ['getPatients', 'deletePatient']);

    await TestBed.configureTestingModule({
      imports: [
        DeletePatientComponent,
        FormsModule,
        CommonModule
      ],
      providers: [
        { provide: Api, useValue: apiSpy },
        provideRouter([
          { path: 'gp/patients', component: DeletePatientComponent }
        ])
      ]
    }).compileComponents();

    router = TestBed.inject(Router);
    spyOn(router, 'navigate');

    fixture = TestBed.createComponent(DeletePatientComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should search patients by name', fakeAsync(() => {
    const mockPatients = [
      { id: '123', name: 'John', condition: 'Asthma' }
    ];

    apiSpy.getPatients.and.returnValue(of({
      data: { patients: mockPatients }
    }));

    component.searchQuery = 'john';
    component.searchPatients();
    tick();

    expect(apiSpy.getPatients).toHaveBeenCalled();
    expect(component.searchResults.length).toBe(1);
    expect(component.searchResults[0].name).toBe('John');
  }));

  it('should copy selected patient ID into input', () => {
    const patient = { id: 'abc123', name: 'Mary' };

    component.selectPatient(patient as any);

    expect(component.patientId).toBe('abc123');
    expect(component.searchResults.length).toBe(0);
  });

  it('should reject invalid patient ID format', () => {
    component.patientId = '123';
    component.submitDeletePatient({} as any);

    expect(component.deleteError).toContain('Invalid Patient ID');
  });

  it('should delete patient successfully and navigate', fakeAsync(() => {
    spyOn(window, 'confirm').and.returnValue(true);

    component.patientId = '66f9c123456789abcde12345';

    apiSpy.deletePatient.and.returnValue(of({}));

    component.submitDeletePatient({} as any);
    tick();

    expect(apiSpy.deletePatient).toHaveBeenCalledWith(component.patientId);
    expect(component.deleteSuccess).toBeTrue();

    tick(2000);
    expect(router.navigate).toHaveBeenCalledWith(['/gp/patients']);
  }));

  it('should handle patient not found error', fakeAsync(() => {
    spyOn(window, 'confirm').and.returnValue(true);

    component.patientId = '66f9c123456789abcde12345';

    apiSpy.deletePatient.and.returnValue(
      throwError(() => ({
        error: { message: 'not found' }
      }))
    );

    component.submitDeletePatient({} as any);
    tick();

    expect(component.deleteError).toContain('not found');
    expect(component.isSubmitting).toBeFalse();
  }));

  it('should handle invalid ID backend error', fakeAsync(() => {
    spyOn(window, 'confirm').and.returnValue(true);

    component.patientId = '66f9c123456789abcde12345';

    apiSpy.deletePatient.and.returnValue(
      throwError(() => ({
        error: { message: 'Invalid ID' }
      }))
    );

    component.submitDeletePatient({} as any);
    tick();

    expect(component.deleteError).toContain('Invalid Patient ID');
  }));

  it('should cancel deletion if user declines confirmation', () => {
    spyOn(window, 'confirm').and.returnValue(false);

    component.patientId = '66f9c123456789abcde12345';
    component.submitDeletePatient({} as any);

    expect(apiSpy.deletePatient).not.toHaveBeenCalled();
  });
});
