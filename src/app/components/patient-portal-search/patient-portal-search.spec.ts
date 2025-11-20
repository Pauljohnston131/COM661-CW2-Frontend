import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientPortalSearchComponent } from './patient-portal-search';

describe('PatientPortalSearchComponent', () => {
  let component: PatientPortalSearchComponent;
  let fixture: ComponentFixture<PatientPortalSearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PatientPortalSearchComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PatientPortalSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
