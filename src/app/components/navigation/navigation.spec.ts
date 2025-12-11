import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

import { NavigationComponent } from './navigation';
import { AuthService } from '../../auth/auth.service';

describe('NavigationComponent', () => {
  let component: NavigationComponent;
  let fixture: ComponentFixture<NavigationComponent>;
  let router: Router;

 const mockAuthService = {
  getUsername: () => 'testuser',
  isGP: () => true,
  isPatient: () => false,
  isLoggedIn: () => true,  
  logout: jasmine.createSpy('logout')
};


  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        NavigationComponent,
        RouterTestingModule
      ],
      providers: [
        { provide: AuthService, useValue: mockAuthService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(NavigationComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);

    fixture.detectChanges();
  });

  it('should create the Navigation component', () => {
    expect(component).toBeTruthy();
  });

  it('should return the username from AuthService', () => {
    expect(component.username).toBe('testuser');
  });

  it('should return true for isGP when AuthService says GP', () => {
    expect(component.isGP).toBeTrue();
  });

  it('should return false for isPatient when AuthService says not patient', () => {
    expect(component.isPatient).toBeFalse();
  });

  it('should detect when on GP home route', () => {
    spyOnProperty(router, 'url', 'get').and.returnValue('/');

    expect(component.isOnGpHome).toBeTrue();
  });

  it('should detect when NOT on GP home route', () => {
    spyOnProperty(router, 'url', 'get').and.returnValue('/gp/patients');

    expect(component.isOnGpHome).toBeFalse();
  });

  it('should call logout and navigate to /login when logout() is called', () => {
    spyOn(router, 'navigate');

    component.logout();

    expect(mockAuthService.logout).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });
});
