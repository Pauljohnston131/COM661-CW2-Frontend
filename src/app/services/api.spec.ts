import { TestBed } from '@angular/core/testing';
import { Api } from './api';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from '../auth/auth.service';

describe('Api', () => {
  let service: Api;
  let httpMock: HttpTestingController;
  let authSpy: jasmine.SpyObj<AuthService>;

  beforeEach(() => {
    authSpy = jasmine.createSpyObj('AuthService', ['getToken']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        Api,
        { provide: AuthService, useValue: authSpy }
      ]
    });

    service = TestBed.inject(Api);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should verify token', () => {
    service.verifyToken().subscribe();

    const req = httpMock.expectOne(`${service.baseUrl}/auth/verify`);
    expect(req.request.method).toBe('GET');
    req.flush({});
  });

  it('should get patients with pagination and search', () => {
    service.getPatients(2, 20, 'john').subscribe();

    const req = httpMock.expectOne(
      `${service.baseUrl}/patients?page=2&limit=20&search=john`
    );
    expect(req.request.method).toBe('GET');
    req.flush({});
  });

  it('should get a single patient', () => {
    const id = '123';

    service.getPatient(id).subscribe();

    const req = httpMock.expectOne(`${service.baseUrl}/patients/${id}`);
    expect(req.request.method).toBe('GET');
    req.flush({});
  });

  it('should add a patient', () => {
    const payload = { name: 'John' };

    service.addPatient(payload).subscribe();

    const req = httpMock.expectOne(`${service.baseUrl}/patients`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush({});
  });

  it('should update a patient', () => {
    const id = '123';
    const payload = { name: 'Updated' };

    service.updatePatient(id, payload).subscribe();

    const req = httpMock.expectOne(`${service.baseUrl}/patients/${id}`);
    expect(req.request.method).toBe('PUT');
    req.flush({});
  });

  it('should delete a patient', () => {
    const id = '123';

    service.deletePatient(id).subscribe();

    const req = httpMock.expectOne(`${service.baseUrl}/patients/${id}`);
    expect(req.request.method).toBe('DELETE');
    req.flush({});
  });

  it('should get patient summary', () => {
    service.getPatientSummary().subscribe();

    const req = httpMock.expectOne(`${service.baseUrl}/patients/summary`);
    expect(req.request.method).toBe('GET');
    req.flush({});
  });

  it('should request an appointment', () => {
    const id = '123';
    const payload = { date: 'today' };

    service.requestAppointment(id, payload).subscribe();

    const req = httpMock.expectOne(`${service.baseUrl}/patients/${id}/request`);
    expect(req.request.method).toBe('POST');
    req.flush({});
  });

  it('should add an appointment', () => {
    const id = '123';
    const payload = { doctor: 'GP' };

    service.addAppointment(id, payload).subscribe();

    const req = httpMock.expectOne(`${service.baseUrl}/patients/${id}`);
    expect(req.request.method).toBe('POST');
    req.flush({});
  });

  it('should update an appointment', () => {
    const pid = '1';
    const aid = '2';
    const payload = { status: 'done' };

    service.updateAppointment(pid, aid, payload).subscribe();

    const req = httpMock.expectOne(`${service.baseUrl}/patients/${pid}/${aid}`);
    expect(req.request.method).toBe('PUT');
    req.flush({});
  });

  it('should delete an appointment', () => {
    const pid = '1';
    const aid = '2';

    service.deleteAppointment(pid, aid).subscribe();

    const req = httpMock.expectOne(`${service.baseUrl}/patients/${pid}/${aid}`);
    expect(req.request.method).toBe('DELETE');
    req.flush({});
  });

  it('should get prescriptions', () => {
    const id = '123';

    service.getPrescriptions(id).subscribe();

    const req = httpMock.expectOne(`${service.baseUrl}/patients/${id}/prescriptions`);
    expect(req.request.method).toBe('GET');
    req.flush({});
  });

  it('should add prescription', () => {
    const id = '123';
    const payload = { drug: 'Test' };

    service.addPrescription(id, payload).subscribe();

    const req = httpMock.expectOne(`${service.baseUrl}/patients/${id}/prescriptions`);
    expect(req.request.method).toBe('POST');
    req.flush({});
  });

  it('should update prescription', () => {
    const pid = '1';
    const rid = '2';
    const payload = { dose: '2x' };

    service.updatePrescription(pid, rid, payload).subscribe();

    const req = httpMock.expectOne(
      `${service.baseUrl}/patients/${pid}/prescriptions/${rid}`
    );
    expect(req.request.method).toBe('PUT');
    req.flush({});
  });

  it('should delete prescription', () => {
    const pid = '1';
    const rid = '2';

    service.deletePrescription(pid, rid).subscribe();

    const req = httpMock.expectOne(
      `${service.baseUrl}/patients/${pid}/prescriptions/${rid}`
    );
    expect(req.request.method).toBe('DELETE');
    req.flush({});
  });

  it('should get careplans', () => {
    const id = '123';

    service.getCareplans(id).subscribe();

    const req = httpMock.expectOne(`${service.baseUrl}/patients/${id}/careplans`);
    expect(req.request.method).toBe('GET');
    req.flush({});
  });

  it('should add careplan', () => {
    const id = '123';
    const payload = { plan: 'Test' };

    service.addCareplan(id, payload).subscribe();

    const req = httpMock.expectOne(`${service.baseUrl}/patients/${id}/careplans`);
    expect(req.request.method).toBe('POST');
    req.flush({});
  });

  it('should update careplan', () => {
    const pid = '1';
    const cid = '2';
    const payload = { note: 'Updated' };

    service.updateCareplan(pid, cid, payload).subscribe();

    const req = httpMock.expectOne(
      `${service.baseUrl}/patients/${pid}/careplans/${cid}`
    );
    expect(req.request.method).toBe('PUT');
    req.flush({});
  });

  it('should delete careplan', () => {
    const pid = '1';
    const cid = '2';

    service.deleteCareplan(pid, cid).subscribe();

    const req = httpMock.expectOne(
      `${service.baseUrl}/patients/${pid}/careplans/${cid}`
    );
    expect(req.request.method).toBe('DELETE');
    req.flush({});
  });

  it('should search patients', () => {
    service.searchPatients('john', 'male', 5, 10).subscribe();

    const req = httpMock.expectOne(
      `${service.baseUrl}/search?q=john&gender=male&skip=5&limit=10`
    );
    expect(req.request.method).toBe('GET');
    req.flush({});
  });

  it('should get overview stats', () => {
    service.getOverviewStats('female', 3).subscribe();

    const req = httpMock.expectOne(
      `${service.baseUrl}/stats/overview?gender=female&limit=3`
    );
    expect(req.request.method).toBe('GET');
    req.flush({});
  });

  it('should get nearby patients', () => {
    service.getNearbyPatients(10, 20, 1000).subscribe();

    const req = httpMock.expectOne(
      `${service.baseUrl}/geo/nearby?lon=10&lat=20&max_distance=1000`
    );
    expect(req.request.method).toBe('GET');
    req.flush({});
  });
});
