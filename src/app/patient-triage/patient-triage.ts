import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { Api } from '../services/api';

interface Category {
  id: string;
  name: string;
  icon: string;
  description: string;
}

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
  
  // Step 1: Category Selection
  selectedCategory: string = '';
  categories: Category[] = [];
  
  // Step 2: Body Area or Mental Health
  selectedBodyArea: string = '';
  isBodySelected: boolean = false;
  specificSymptoms: Symptom[] = [];
  
  // Step 3: Details
  pain_level = 5;
  mental_severity = 3;
  daily_impact = 3;
  concern_level = 3;
  duration_days = 1;
  duration_weeks = 1;
  age = 30;
  last_checkup_months = 12;
  fever = false;
  breathing_difficulty = false;
  chest_pain = false;
  suicidal_thoughts = false;
  homicidal_thoughts = false;
  mobility_impact = false;
  previous_treatment = false;
  has_support = true;
  persistent = false;
  
  // General fields
  notes = '';
  described_symptoms = '';
  currentStep: number = 1;
  loading = false;
  loadingSymptoms = false;
  message = '';
  messageType: 'success' | 'warning' | 'danger' = 'success';
  
  // Arrays for multi-select
  mental_symptoms: string[] = [];
  concerns: string[] = [];
  chronic_conditions: string[] = [];
  family_history: string[] = [];
  lifestyle_factors: string[] = [];
  medications: string[] = [];
  
  // Body areas for physical symptoms
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

  // Mental health symptoms
  mentalSymptomsList: Symptom[] = [
    { id: 'anxiety', name: 'Anxiety', description: 'Excessive worry, nervousness, or fear', selected: false },
    { id: 'depression', name: 'Depression', description: 'Persistent sadness or hopelessness', selected: false },
    { id: 'panic_attacks', name: 'Panic Attacks', description: 'Sudden episodes of intense fear', selected: false },
    { id: 'insomnia', name: 'Insomnia', description: 'Difficulty falling or staying asleep', selected: false },
    { id: 'fatigue', name: 'Fatigue', description: 'Constant tiredness or lack of energy', selected: false },
    { id: 'mood_swings', name: 'Mood Swings', description: 'Rapid changes in mood', selected: false },
    { id: 'social_withdrawal', name: 'Social Withdrawal', description: 'Avoiding social interactions', selected: false },
    { id: 'irritability', name: 'Irritability', description: 'Easily annoyed or angered', selected: false }
  ];

  // General checkup concerns
  generalConcerns: Symptom[] = [
    { id: 'annual_checkup', name: 'Annual Checkup', description: 'Routine yearly health examination', selected: false },
    { id: 'screening', name: 'Health Screening', description: 'Preventive screening tests', selected: false },
    { id: 'medication_review', name: 'Medication Review', description: 'Review current medications', selected: false },
    { id: 'chronic_management', name: 'Chronic Condition', description: 'Manage ongoing health issues', selected: false },
    { id: 'weight_concern', name: 'Weight Concern', description: 'Weight gain or loss issues', selected: false },
    { id: 'sleep_issues', name: 'Sleep Issues', description: 'Sleep problems or disorders', selected: false },
    { id: 'nutrition_advice', name: 'Nutrition Advice', description: 'Diet and nutrition guidance', selected: false }
  ];

  // Lifestyle factors
  lifestyleFactorsList: Symptom[] = [
    { id: 'smoking', name: 'Smoking', description: 'Current or former smoker', selected: false },
    { id: 'alcohol', name: 'Alcohol Use', description: 'Regular alcohol consumption', selected: false },
    { id: 'sedentary', name: 'Sedentary Lifestyle', description: 'Little physical activity', selected: false },
    { id: 'poor_diet', name: 'Poor Diet', description: 'Unhealthy eating habits', selected: false },
    { id: 'high_stress', name: 'High Stress', description: 'High stress levels', selected: false }
  ];

  constructor(
    private api: Api,
    private auth: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadCategories();
    this.resetForm();
  }

  loadCategories() {
    this.loading = true;
    this.api.getTriageCategories().subscribe({
      next: (res: ApiResponse) => {
        this.loading = false;
        if (res.success && res.data?.categories) {
          this.categories = res.data.categories;
        } else {
          // Fallback categories
          this.categories = this.getFallbackCategories();
        }
      },
      error: (err: Error) => {
        this.loading = false;
        console.error('Failed to load categories:', err);
        // Use fallback categories on error
        this.categories = this.getFallbackCategories();
        this.showMessage('Unable to load categories. Using default options.', 'warning');
      }
    });
  }

  getFallbackCategories(): Category[] {
    return [
      { id: 'physical', name: 'Physical Symptoms', icon: 'bi bi-body-index', description: 'Pain, injury, or physical discomfort' },
      { id: 'mental', name: 'Mental Health', icon: 'bi bi-brain', description: 'Emotional or psychological concerns' },
      { id: 'general', name: 'General Checkup', icon: 'bi bi-heart-pulse', description: 'Routine exam or wellness visit' },
      { id: 'unsure', name: 'Not Sure / General', icon: 'bi bi-question-circle', description: 'Unknown symptoms or need guidance' }
    ];
  }

  selectCategory(categoryId: string) {
    this.selectedCategory = categoryId;
    this.nextStep();
  }

  selectBodyArea(areaId: string) {
    this.selectedBodyArea = areaId;
    this.isBodySelected = true;
    this.loadSymptomsForArea(areaId);
  }

  loadSymptomsForArea(areaId: string) {
    this.loadingSymptoms = true;
    this.api.getSymptomsByCategoryAndArea('physical', areaId).subscribe({
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

  toggleMentalSymptom(symptom: Symptom) {
    symptom.selected = !symptom.selected;
    this.mental_symptoms = this.mentalSymptomsList
      .filter(s => s.selected)
      .map(s => s.id);
  }

  toggleGeneralConcern(symptom: Symptom) {
    symptom.selected = !symptom.selected;
    this.concerns = this.generalConcerns
      .filter(s => s.selected)
      .map(s => s.id);
  }

  toggleLifestyleFactor(symptom: Symptom) {
    symptom.selected = !symptom.selected;
    this.lifestyle_factors = this.lifestyleFactorsList
      .filter(s => s.selected)
      .map(s => s.id);
  }

  getSelectedSymptoms(): string[] {
    return this.specificSymptoms
      .filter(symptom => symptom.selected)
      .map(symptom => symptom.id);
  }

  getStep2Validation(): boolean {
    switch (this.selectedCategory) {
      case 'physical':
        return !this.selectedBodyArea;
      case 'mental':
        return this.mental_symptoms.length === 0;
      case 'general':
        return this.concerns.length === 0;
      case 'unsure':
        return !this.described_symptoms || this.described_symptoms.trim().length === 0;
      default:
        return true;
    }
  }

  nextStep() {
    if (this.currentStep === 1 && !this.selectedCategory) {
      this.showMessage('Please select a category', 'warning');
      return;
    }
    
    if (this.currentStep === 2 && this.getStep2Validation()) {
      if (this.selectedCategory === 'physical') {
        this.showMessage('Please select a body area', 'warning');
      } else if (this.selectedCategory === 'mental') {
        this.showMessage('Please select at least one mental health symptom', 'warning');
      } else if (this.selectedCategory === 'general') {
        this.showMessage('Please select at least one concern', 'warning');
      } else if (this.selectedCategory === 'unsure') {
        this.showMessage('Please describe your symptoms', 'warning');
      }
      return;
    }
    
    this.currentStep++;
  }

  previousStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  showMessage(text: string, type: 'success' | 'warning' | 'danger') {
    this.message = text;
    this.messageType = type;
    setTimeout(() => {
      this.message = '';
    }, 5000);
  }

  getNotesPlaceholder(): string {
    switch (this.selectedCategory) {
      case 'physical':
        return 'Describe what makes it better/worse, any triggers, medications tried, etc.';
      case 'mental':
        return 'Describe your emotional state, triggers, coping mechanisms, etc.';
      case 'general':
        return 'Any specific health goals or concerns you want to discuss?';
      case 'unsure':
        return 'Anything else you\'d like us to know about how you\'re feeling...';
      default:
        return 'Additional information...';
    }
  }

  getAlertIcon(): string {
    switch (this.messageType) {
      case 'success':
        return 'bi bi-check-circle-fill';
      case 'warning':
        return 'bi bi-exclamation-triangle-fill';
      case 'danger':
        return 'bi bi-exclamation-octagon-fill';
      default:
        return 'bi bi-info-circle-fill';
    }
  }

  getAlertTitle(): string {
    switch (this.messageType) {
      case 'success':
        return 'Success!';
      case 'warning':
        return 'Important:';
      case 'danger':
        return 'Emergency:';
      default:
        return 'Information:';
    }
  }

  submitTriage() {
    const patientId = this.auth.getPatientId();
    if (!patientId) {
      this.router.navigate(['/login']);
      return;
    }

    // Build payload based on category
    let payload: any = {
      patient_id: patientId,
      category: this.selectedCategory,
      notes: this.notes
    };

    switch (this.selectedCategory) {
      case 'physical':
        payload = {
          ...payload,
          body_area: this.selectedBodyArea,
          specific_symptoms: this.getSelectedSymptoms(),
          pain_level: this.pain_level,
          duration_days: this.duration_days,
          fever: this.fever,
          breathing_difficulty: this.breathing_difficulty,
          chest_pain: this.chest_pain,
          mobility_impact: this.mobility_impact
        };
        break;
      
      case 'mental':
        payload = {
          ...payload,
          mental_symptoms: this.mental_symptoms,
          mental_severity: this.mental_severity,
          duration_weeks: this.duration_weeks,
          daily_impact: this.daily_impact,
          previous_treatment: this.previous_treatment,
          has_support: this.has_support,
          suicidal_thoughts: this.suicidal_thoughts,
          homicidal_thoughts: this.homicidal_thoughts
        };
        break;
      
      case 'general':
        payload = {
          ...payload,
          age: this.age,
          concerns: this.concerns,
          chronic_conditions: this.chronic_conditions,
          family_history: this.family_history,
          last_checkup_months: this.last_checkup_months,
          lifestyle_factors: this.lifestyle_factors,
          medications: this.medications
        };
        break;
      
      case 'unsure':
        payload = {
          ...payload,
          concern_level: this.concern_level,
          described_symptoms: this.described_symptoms,
          duration_days: this.duration_days,
          persistent: this.persistent,
          vague_description: this.notes
        };
        break;
    }

    this.loading = true;

    this.api.submitTriage(payload).subscribe({
      next: (res: any) => {
        this.loading = false;
        
        if (res.data?.emergency_referral?.required) {
          this.showMessage(
            `EMERGENCY: ${res.data.emergency_referral.message}. Please seek immediate care or call ${res.data.emergency_referral.hotline || '911'}.`,
            'danger'
          );
          setTimeout(() => {
            this.router.navigate(['/patient-portal']);
          }, 5000);
          return;
        }

        if (res.data?.action === 'auto_book') {
          const categoryName = this.getCategoryName(this.selectedCategory);
          this.showMessage(
            `Appointment requested for ${categoryName.toLowerCase()} concern. You'll be contacted shortly.`,
            'success'
          );
        } else if (res.data?.action === 'gp_review') {
          this.showMessage(
            `Urgent concern sent for medical review. A healthcare provider will contact you soon.`,
            'warning'
          );
        } else if (res.data?.action === 'mental_health_crisis') {
          this.showMessage(
            `Urgent mental health concern identified. Please call 988 for immediate support. A provider will contact you.`,
            'warning'
          );
        }

        setTimeout(() => {
          this.router.navigate(['/patient-portal']);
        }, 4000);
      },
      error: (err: Error) => {
        this.loading = false;
        this.showMessage('Failed to submit triage. Please try again.', 'danger');
      }
    });
  }

  getCategoryName(categoryId: string): string {
    const category = this.categories.find(c => c.id === categoryId);
    return category ? category.name : 'health concern';
  }

  getBodyAreaName(areaId: string): string {
    const area = this.bodyAreas.find(a => a.id === areaId);
    return area ? area.name : 'selected area';
  }

  resetForm() {
    this.currentStep = 1;
    this.selectedCategory = '';
    this.selectedBodyArea = '';
    this.isBodySelected = false;
    this.specificSymptoms = [];
    
    // Reset all symptoms selections
    this.mentalSymptomsList.forEach(s => s.selected = false);
    this.generalConcerns.forEach(s => s.selected = false);
    this.lifestyleFactorsList.forEach(s => s.selected = false);
    
    // Reset form values
    this.pain_level = 5;
    this.mental_severity = 3;
    this.daily_impact = 3;
    this.concern_level = 3;
    this.duration_days = 1;
    this.duration_weeks = 1;
    this.age = 30;
    this.last_checkup_months = 12;
    this.fever = false;
    this.breathing_difficulty = false;
    this.chest_pain = false;
    this.suicidal_thoughts = false;
    this.homicidal_thoughts = false;
    this.mobility_impact = false;
    this.previous_treatment = false;
    this.has_support = true;
    this.persistent = false;
    
    // Reset arrays
    this.mental_symptoms = [];
    this.concerns = [];
    this.chronic_conditions = [];
    this.family_history = [];
    this.lifestyle_factors = [];
    this.medications = [];
    
    // Reset text fields
    this.notes = '';
    this.described_symptoms = '';
  }

  // Helper method to add chronic condition
  addChronicCondition() {
    const condition = prompt('Enter chronic condition:');
    if (condition && condition.trim()) {
      this.chronic_conditions.push(condition.trim());
    }
  }

  // Helper method to add medication
  addMedication() {
    const medication = prompt('Enter medication name:');
    if (medication && medication.trim()) {
      this.medications.push(medication.trim());
    }
  }

  // Helper method to add family history
  addFamilyHistory() {
    const history = prompt('Enter family medical history:');
    if (history && history.trim()) {
      this.family_history.push(history.trim());
    }
  }

  // Remove items from arrays
  removeChronicCondition(index: number) {
    this.chronic_conditions.splice(index, 1);
  }

  removeMedication(index: number) {
    this.medications.splice(index, 1);
  }

  removeFamilyHistory(index: number) {
    this.family_history.splice(index, 1);
  }
}