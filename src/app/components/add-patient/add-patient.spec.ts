import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { AddPatientComponent } from './add-patient';
import { Api } from '../../services/api';
import { Router, provideRouter } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { CommonModule } from '@angular/common';

describe('AddPatientComponent', () => {
  let component: AddPatientComponent;
  let fixture: ComponentFixture<AddPatientComponent>;
  let apiSpy: jasmine.SpyObj<Api>;
  let router: Router;

  beforeEach(async () => {
    apiSpy = jasmine.createSpyObj('Api', ['addPatient']);

    await TestBed.configureTestingModule({
      imports: [
        AddPatientComponent,
        FormsModule,
        CommonModule
      ],
      providers: [
        { provide: Api, useValue: apiSpy },
        provideRouter([
          { path: 'gp/home', component: AddPatientComponent }
        ])
      ]
    }).compileComponents();

    router = TestBed.inject(Router);
    spyOn(router, 'navigate');

    fixture = TestBed.createComponent(AddPatientComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should reject invalid form submission', () => {
    component.submitNewPatient({ invalid: true } as any);

    expect(component.addPatientError).toContain('required');
    expect(component.isSubmitting).toBeFalse();
  });

  it('should reject empty required fields', () => {
    component.newPatient = {
      name: '',
      age: '',
      gender: 'Male',
      condition: '',
      image_url: ''
    };

    component.submitNewPatient({ invalid: false } as any);

    expect(component.addPatientError).toContain('required');
    expect(component.isSubmitting).toBeFalse();
  });

  it('should submit valid patient successfully and navigate', fakeAsync(() => {
    component.newPatient = {
      name: 'John Doe',
      age: '35',
      gender: 'Male',
      condition: 'Asthma',
      image_url: ''
    };

    apiSpy.addPatient.and.returnValue(of({ success: true }));

    component.submitNewPatient({ invalid: false } as any);
    tick();

    expect(apiSpy.addPatient).toHaveBeenCalled();
    expect(component.addPatientSuccess).toBeTrue();
    expect(component.isSubmitting).toBeFalse();

    tick(2000);
    expect(router.navigate).toHaveBeenCalledWith(['/gp/home']);
  }));

  it('should handle API failure response', fakeAsync(() => {
    component.newPatient = {
      name: 'John Doe',
      age: '35',
      gender: 'Male',
      condition: 'Asthma',
      image_url: ''
    };

    apiSpy.addPatient.and.returnValue(of({ success: false, message: 'Failed to add' }));

    component.submitNewPatient({ invalid: false } as any);
    tick();

    expect(component.addPatientError).toContain('Failed');
    expect(component.isSubmitting).toBeFalse();
  }));

  it('should handle API error response', fakeAsync(() => {
    component.newPatient = {
      name: 'John Doe',
      age: '35',
      gender: 'Male',
      condition: 'Asthma',
      image_url: ''
    };

    apiSpy.addPatient.and.returnValue(
      throwError(() => ({
        error: { message: 'Server error' }
      }))
    );

    component.submitNewPatient({ invalid: false } as any);
    tick();

    expect(component.addPatientError).toContain('Server error');
    expect(component.isSubmitting).toBeFalse();
  }));
});
