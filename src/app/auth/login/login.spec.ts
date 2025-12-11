import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { LoginComponent } from './login';
import { AuthService } from '../auth.service';
import { ToastService } from '../../shared/toast.service';
import { Router, provideRouter } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { of, throwError } from 'rxjs';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authSpy: jasmine.SpyObj<AuthService>;
  let toastSpy: jasmine.SpyObj<ToastService>;
  let router: Router;

  beforeEach(async () => {
    authSpy = jasmine.createSpyObj('AuthService', [
      'login',
      'storeToken',
      'isGP',
      'isPatient'
    ]);

    toastSpy = jasmine.createSpyObj('ToastService', [
      'success',
      'error',
      'warning'
    ]);

    await TestBed.configureTestingModule({
      imports: [
        LoginComponent,
        FormsModule,
        CommonModule
      ],
      providers: [
        { provide: AuthService, useValue: authSpy },
        { provide: ToastService, useValue: toastSpy },
        provideRouter([
          { path: '', component: LoginComponent },
          { path: 'patient-portal', component: LoginComponent }
        ])
      ]
    }).compileComponents();

    router = TestBed.inject(Router);
    spyOn(router, 'navigate');

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should reject empty credentials', () => {
    component.username = '';
    component.password = '';

    component.onSubmit();

    expect(component.error).toContain('username');
    expect(toastSpy.warning).toHaveBeenCalled();
  });

  it('should handle missing token response', fakeAsync(() => {
    component.username = 'test';
    component.password = 'test';

    authSpy.login.and.returnValue(of({ data: {} }));

    component.onSubmit();
    tick();

    expect(component.error).toContain('No token');
    expect(toastSpy.error).toHaveBeenCalled();
  }));

  it('should login as GP and navigate to dashboard', fakeAsync(() => {
    component.username = 'gp';
    component.password = 'pass';

    authSpy.login.and.returnValue(of({
      data: { token: 'jwt-token' }
    }));

    authSpy.isGP.and.returnValue(true);
    authSpy.isPatient.and.returnValue(false);

    component.onSubmit();
    tick();

    expect(authSpy.storeToken).toHaveBeenCalledWith('jwt-token');
    expect(router.navigate).toHaveBeenCalledWith(['/']);
    expect(toastSpy.success).toHaveBeenCalled();
  }));

  it('should login as patient and navigate to portal', fakeAsync(() => {
    component.username = 'patient';
    component.password = 'pass';

    authSpy.login.and.returnValue(of({
      data: { token: 'jwt-token' }
    }));

    authSpy.isGP.and.returnValue(false);
    authSpy.isPatient.and.returnValue(true);

    component.onSubmit();
    tick();

    expect(authSpy.storeToken).toHaveBeenCalledWith('jwt-token');
    expect(router.navigate).toHaveBeenCalledWith(['/patient-portal']);
    expect(toastSpy.success).toHaveBeenCalled();
  }));

  it('should handle unknown role in token', fakeAsync(() => {
    component.username = 'user';
    component.password = 'pass';

    authSpy.login.and.returnValue(of({
      data: { token: 'jwt-token' }
    }));

    authSpy.isGP.and.returnValue(false);
    authSpy.isPatient.and.returnValue(false);

    component.onSubmit();
    tick();

    expect(component.error).toContain('Unknown role');
    expect(toastSpy.error).toHaveBeenCalled();
  }));

  it('should handle login failure', fakeAsync(() => {
    component.username = 'bad';
    component.password = 'bad';

    authSpy.login.and.returnValue(
      throwError(() => new Error('Invalid'))
    );

    component.onSubmit();
    tick();

    expect(component.error).toContain('Login failed');
    expect(toastSpy.error).toHaveBeenCalled();
  }));
});
