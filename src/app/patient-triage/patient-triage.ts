import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { Api } from '../services/api';

interface BodyArea {
  id: string;
  name: string;
  icon: string;
  description: string;
}

interface Symptom {
  id: string;
  name: string;
  description: string;
  selected: boolean;
}

interface ApiResponse {
  success: boolean;
  data: any;
  message?: string;
}

@Component({
  selector: 'app-patient-triage',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './patient-triage.html',
  styleUrls: ['./patient-triage.css']
})
export class PatientTriageComponent implements OnInit {
  
  selectedBodyArea: string = '';
  isBodySelected: boolean = false;
  specificSymptoms: Symptom[] = [];
  pain_level = 5;
  duration_days = 1;
  fever = false;
  breathing_difficulty = false;
  chest_pain = false;
  mobility_impact = false;
  notes = '';
  currentStep: number = 1;
  loading = false;
  loadingSymptoms = false;
  message = '';
  messageType: 'success' | 'warning' = 'success';
  
  bodyAreas: BodyArea[] = [
    { id: 'head', name: 'Head & Face', icon: 'bi bi-ear', description: 'Headaches, vision, hearing, facial pain' },
    { id: 'neck', name: 'Neck & Throat', icon: 'bi bi-chat-text', description: 'Sore throat, swallowing, voice issues' },
    { id: 'chest', name: 'Chest', icon: 'bi bi-heart', description: 'Breathing, heart, lung concerns' },
    { id: 'abdomen', name: 'Abdomen', icon: 'bi bi-bucket', description: 'Stomach pain, digestion, nausea' },
    { id: 'back', name: 'Back', icon: 'bi bi-body-index', description: 'Back pain, spine, posture issues' },
    { id: 'pelvis', name: 'Pelvis', icon: 'bi bi-gender-ambiguous', description: 'Urinary, reproductive, rectal' },
    { id: 'limbs', name: 'Arms & Legs', icon: 'bi bi-hand-index', description: 'Joint pain, swelling, mobility' },
    { id: 'skin', name: 'Skin', icon: 'bi bi-droplet', description: 'Rashes, itching, sores, swelling' }
  ];

  constructor(
    private api: Api,
    private auth: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.specificSymptoms = [];
  }

  selectBodyArea(areaId: string) {
    this.selectedBodyArea = areaId;
    this.isBodySelected = true;
    this.loadSymptomsForArea(areaId);
  }

  loadSymptomsForArea(areaId: string) {
    this.loadingSymptoms = true;
    this.api.getSymptomsByArea(areaId).subscribe({
      next: (res: ApiResponse) => {
        if (res.success && res.data?.symptoms) {
          this.specificSymptoms = res.data.symptoms.map((symptom: any) => ({
            ...symptom,
            selected: false
          }));
        } else {
          this.specificSymptoms = this.getFallbackSymptoms(areaId);
        }
        this.loadingSymptoms = false;
      },
      error: (err: Error) => {
        console.error('Failed to load symptoms:', err);
        this.loadingSymptoms = false;
        this.specificSymptoms = this.getFallbackSymptoms(areaId);
      }
    });
  }

  getFallbackSymptoms(areaId: string): Symptom[] {
    const fallbackMap: Record<string, Symptom[]> = {
      'head': [
        { id: 'headache', name: 'Headache', description: 'Persistent or severe head pain', selected: false },
        { id: 'dizziness', name: 'Dizziness', description: 'Feeling lightheaded or unsteady', selected: false },
        { id: 'vision_issues', name: 'Vision Issues', description: 'Blurred vision or seeing spots', selected: false }
      ],
      'chest': [
        { id: 'chest_pain', name: 'Chest Pain', description: 'Pain, pressure, or discomfort in chest', selected: false },
        { id: 'breathing_difficulty', name: 'Breathing Difficulty', description: 'Trouble breathing or catching breath', selected: false },
        { id: 'coughing', name: 'Coughing', description: 'Persistent or painful cough', selected: false }
      ],
      'abdomen': [
        { id: 'abdominal_pain', name: 'Abdominal Pain', description: 'Pain in stomach or belly area', selected: false },
        { id: 'nausea', name: 'Nausea', description: 'Feeling sick to your stomach', selected: false },
        { id: 'vomiting', name: 'Vomiting', description: 'Throwing up', selected: false }
      ],
      'limbs': [
        { id: 'joint_pain', name: 'Joint Pain', description: 'Pain in joints like knees or shoulders', selected: false },
        { id: 'swelling', name: 'Swelling', description: 'Unusual swelling or puffiness', selected: false },
        { id: 'muscle_pain', name: 'Muscle Pain', description: 'Pain in muscles', selected: false }
      ],
      'back': [
        { id: 'back_pain', name: 'Back Pain', description: 'Pain in upper or lower back', selected: false },
        { id: 'muscle_spasms', name: 'Muscle Spasms', description: 'Involuntary muscle contractions', selected: false },
        { id: 'stiffness', name: 'Stiffness', description: 'Difficulty moving or bending', selected: false }
      ],
      'neck': [
        { id: 'stiff_neck', name: 'Stiff Neck', description: 'Difficulty moving neck', selected: false },
        { id: 'sore_throat', name: 'Sore Throat', description: 'Pain or irritation in throat', selected: false },
        { id: 'swollen_glands', name: 'Swollen Glands', description: 'Enlarged lymph nodes', selected: false }
      ],
      'pelvis': [
        { id: 'pelvic_pain', name: 'Pelvic Pain', description: 'Pain in lower abdomen area', selected: false },
        { id: 'urinary_pain', name: 'Urinary Pain', description: 'Pain when urinating', selected: false },
        { id: 'urinary_frequency', name: 'Urinary Frequency', description: 'Need to urinate often', selected: false }
      ],
      'skin': [
        { id: 'rash', name: 'Rash', description: 'Skin redness, bumps, or irritation', selected: false },
        { id: 'itching', name: 'Itching', description: 'Persistent itchiness', selected: false },
        { id: 'burning', name: 'Burning', description: 'Burning sensation on skin', selected: false }
      ]
    };

    return fallbackMap[areaId] || [
      { id: 'pain', name: 'Pain', description: 'General pain or discomfort', selected: false },
      { id: 'discomfort', name: 'Discomfort', description: 'General feeling of discomfort', selected: false }
    ];
  }

  toggleSymptom(symptom: Symptom) {
    symptom.selected = !symptom.selected;
  }

  getSelectedSymptoms(): string[] {
    return this.specificSymptoms
      .filter(symptom => symptom.selected)
      .map(symptom => symptom.id);
  }

  nextStep() {
    if (this.currentStep === 1 && !this.selectedBodyArea) {
      this.showMessage('Please select a body area', 'warning');
      return;
    }
    
    if (this.currentStep === 2 && this.getSelectedSymptoms().length === 0) {
      this.showMessage('Please select at least one specific symptom', 'warning');
      return;
    }
    
    this.currentStep++;
  }

  previousStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  showMessage(text: string, type: 'success' | 'warning') {
    this.message = text;
    this.messageType = type;
    setTimeout(() => {
      this.message = '';
    }, 3000);
  }

  submitTriage() {
    const patientId = this.auth.getPatientId();
    if (!patientId) {
      this.router.navigate(['/login']);
      return;
    }

    const payload = {
      patient_id: patientId,
      body_area: this.selectedBodyArea,
      specific_symptoms: this.getSelectedSymptoms(),
      pain_level: this.pain_level,
      duration_days: this.duration_days,
      fever: this.fever,
      breathing_difficulty: this.breathing_difficulty,
      chest_pain: this.chest_pain,
      mobility_impact: this.mobility_impact,
      notes: this.notes
    };

    this.loading = true;

    this.api.submitTriage(payload).subscribe({
      next: (res: any) => {
        if (res.data?.action === 'auto_book') {
          this.message = `Appointment booked for ${this.getBodyAreaName(this.selectedBodyArea)} concern.`;
          this.messageType = 'success';
        } else {
          this.message = `Urgent ${this.getBodyAreaName(this.selectedBodyArea)} concern sent to GP for review.`;
          this.messageType = 'warning';
        }

        setTimeout(() => {
          this.router.navigate(['/patient-portal']);
        }, 3000);
      },
      error: (err: Error) => {
        this.message = 'Failed to submit triage. Please try again.';
        this.messageType = 'warning';
        this.loading = false;
      }
    });
  }

  getBodyAreaName(areaId: string): string {
    const area = this.bodyAreas.find(a => a.id === areaId);
    return area ? area.name : 'selected area';
  }

  resetForm() {
    this.currentStep = 1;
    this.selectedBodyArea = '';
    this.isBodySelected = false;
    this.specificSymptoms = [];
    this.pain_level = 5;
    this.duration_days = 1;
    this.fever = false;
    this.breathing_difficulty = false;
    this.chest_pain = false;
    this.mobility_impact = false;
    this.notes = '';
  }
}