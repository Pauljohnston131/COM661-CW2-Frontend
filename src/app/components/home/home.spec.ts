import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { HomeComponent } from './home';
import { Api } from '../../services/api';

describe('HomeComponent (logic-only, no Google Maps)', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let router: Router;

  const mockApiService = {
    getPendingRequests: () => ({
      subscribe: (cb: any) => cb({ data: { pending: 2 } })
    }),
    getPatientSummary: () => ({
      subscribe: (cb: any) => cb({
        data: {
          patients: [
            {
              id: '1',
              name: 'John Doe',
              appointments: [
                { date: '2025-01-01', status: 'requested', doctor: 'Dr A' }
              ],
              careplans: [{ description: 'Plan A' }],
              prescriptions_count: 2
            }
          ]
        }
      })
    })
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule
      ],
      providers: [
        { provide: Api, useValue: mockApiService },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: () => null
              }
            }
          }
        },
        ChangeDetectorRef
      ]
    }).compileComponents();

    TestBed.overrideComponent(HomeComponent, {
      set: {
        imports: [],      
        template: ''       
      }
    });

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);

    fixture.detectChanges();
  });

  it('should create the Home component', () => {
    expect(component).toBeTruthy();
  });

  it('should load dashboard data on init', () => {
    expect(component.pendingRequests).toBe(2);
    expect(component.totalPatients).toBe(1);
    expect(component.totalAppointments).toBe(1);
    expect(component.totalCareplans).toBe(1);
    expect(component.totalPrescriptions).toBe(2);
  });

  it('should add appointment request to GP checklist', () => {
    expect(component.gpChecklist.length).toBe(1);
    expect(component.gpChecklist[0].type).toBe('Appointment Request');
  });

  it('should return correct status color for completed', () => {
    const color = (component as any).statusColor('completed');
    expect(color).toBe('#198754');
  });

  it('should return correct status color for requested', () => {
    const color = (component as any).statusColor('requested');
    expect(color).toBe('#ffc107');
  });

  it('should navigate when goToFirstPending is called', () => {
    spyOn(router, 'navigate');

    component.goToFirstPending();

    expect(router.navigate).toHaveBeenCalled();
  });
});
