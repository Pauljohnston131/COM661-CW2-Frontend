import { TestBed } from '@angular/core/testing';

import { PatientData } from './patient-data';

describe('PatientData', () => {
  let service: PatientData;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PatientData);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
