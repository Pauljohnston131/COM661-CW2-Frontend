import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { PatientsComponent } from './patients';
import { Api } from '../../services/api';

describe('PatientsComponent', () => {
  let component: PatientsComponent;
  let fixture: ComponentFixture<PatientsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        PatientsComponent,      
        HttpClientTestingModule,
        RouterTestingModule
      ],
      providers: [Api]
    }).compileComponents();

    fixture = TestBed.createComponent(PatientsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  
  it('should create the Patients component', () => {
    expect(component).toBeTruthy();
  });

  it('should start on page 1 by default', () => {
    expect(component.page).toBe(1);
  });

  it('should call loadPage(page + 1) when nextPage() is called and page < lastPage', () => {
  spyOn(component, 'loadPage');

  component.page = 1;
  component.lastPage = 3;

  component.nextPage();

  expect(component.loadPage).toHaveBeenCalledWith(2);
});

it('should NOT call loadPage when nextPage() is called on last page', () => {
  spyOn(component, 'loadPage');

  component.page = 3;
  component.lastPage = 3;

  component.nextPage();

  expect(component.loadPage).not.toHaveBeenCalled();
});

it('should call loadPage(page - 1) when previousPage() is called and page > 1', () => {
  spyOn(component, 'loadPage');

  component.page = 3;

  component.previousPage();

  expect(component.loadPage).toHaveBeenCalledWith(2);
});

it('should NOT call loadPage when previousPage() is called on page 1', () => {
  spyOn(component, 'loadPage');

  component.page = 1;

  component.previousPage();

  expect(component.loadPage).not.toHaveBeenCalled();
});

  it('should clear the search query when clearSearch() is called', () => {
    component.searchQuery = 'john';

    component.clearSearch();

    expect(component.searchQuery).toBe('');
  });

  it('should reset filter to all when clearFilter() is called', () => {
    component.filterOption = 'active';

    component.clearFilter();

    expect(component.filterOption).toBe('all');
  });

  it('should clear both search and filter when clearAllFilters() is called', () => {
    component.searchQuery = 'john';
    component.filterOption = 'chronic';

    component.clearAllFilters();

    expect(component.searchQuery).toBe('');
    expect(component.filterOption).toBe('all');
  });

  it('should return _id if present when getPatientId() is called', () => {
    const patient: any = { _id: '123' };

    const result = component.getPatientId(patient);

    expect(result).toBe('123');
  });

  it('should return id if _id is not present when getPatientId() is called', () => {
    const patient: any = { id: '456' };

    const result = component.getPatientId(patient);

    expect(result).toBe('456');
  });

  it('should return 0 when appointment_count is undefined', () => {
    const patient: any = {};

    const result = component.getAppointmentsCount(patient);

    expect(result).toBe(0);
  });

  it('should return 0 when prescription_count is undefined', () => {
    const patient: any = {};

    const result = component.getPrescriptionsCount(patient);

    expect(result).toBe(0);
  });

  it('should return 0 when careplan_count is undefined', () => {
    const patient: any = {};

    const result = component.getCareplansCount(patient);

    expect(result).toBe(0);
  });

  it('should return true for a known chronic condition', () => {
    const patient: any = { condition: 'Diabetes' };

    const result = component.isChronic(patient);

    expect(result).toBeTrue();
  });

  it('should return false for a non-chronic condition', () => {
    const patient: any = { condition: 'Cold' };

    const result = component.isChronic(patient);

    expect(result).toBeFalse();
  });
});
