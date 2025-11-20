// src/app/services/patient-data.service.ts
import { Injectable } from '@angular/core';
import patientData from '../../assets/patients.json';

@Injectable({
  providedIn: 'root'
})
export class PatientDataService {
  getPatients() {
    // Return the full list of patients from local JSON
    return patientData;
  }

  getAllPatients() {
  // patientData is the full JSON array you already import at top of this file
  return patientData;
}


  // Optional pagination example (FE12 §4)
  pageSize: number = 5;

  getPatientsPage(page: number) {
    const start = (page - 1) * this.pageSize;
    const end = start + this.pageSize;
    return patientData.slice(start, end);
  }

  getLastPageNumber() {
    return Math.ceil(patientData.length / this.pageSize);
  }

  getPatient(id: any) {
  return patientData.filter((p: any) => {
    const stringId = p._id?.$oid || p._id;
    return stringId === id;
  });
}

  filterByGender(gender: string) {
    return patientData.filter((p: any) => p.gender === gender);
  }

}
