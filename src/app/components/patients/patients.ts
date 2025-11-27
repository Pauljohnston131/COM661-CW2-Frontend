import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Api } from '../../services/api';

@Component({
  selector: 'app-patients',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './patients.html',
  styleUrl: './patients.css'
})
export class PatientsComponent {

  patients: any[] = [];
  filteredPatients: any[] = [];
  searchQuery: string = "";

  page: number = 1;
  lastPage: number = 1;

  constructor(private api: Api) {}

  ngOnInit() {
    this.loadPage(this.page);
  }

  loadPage(page: number) {
    this.api.getPatients(page).subscribe((res: any) => {
      this.patients = res.data.patients;
      this.filteredPatients = this.patients;
      this.page = res.data.page;
      this.lastPage = Math.ceil(res.data.count / 10);
    });
  }

  filterPatients() {
    const q = this.searchQuery.toLowerCase();
    this.filteredPatients = this.patients.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.condition.toLowerCase().includes(q)
    );
  }

  nextPage() {
    if (this.page < this.lastPage) {
      this.loadPage(this.page + 1);
    }
  }

  previousPage() {
    if (this.page > 1) {
      this.loadPage(this.page - 1);
    }
  }
}
