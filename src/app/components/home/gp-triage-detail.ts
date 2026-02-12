import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Api } from '../../services/api';

@Component({
  standalone: true,
  selector: 'app-gp-triage-detail',
  imports: [CommonModule],
  templateUrl: './gp-triage-detail.html',
  styleUrls: ['./gp-triage-detail.css']
})
export class GpTriageDetailComponent implements OnInit {

  triage: any;
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private api: Api,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;

    this.api.getGpTriageCase(id).subscribe(res => {
      this.triage = res.data.case;
      this.loading = false;
    });
  }

  /**
   * Main method to format symptoms based on category
   */
  getStringValue(value: any): string {
    return this.formatSymptoms(value, this.triage?.category);
  }

  /**
   * Formats symptom data into readable text based on category
   */
  formatSymptoms(symptoms: any, category?: string): string {
    if (!symptoms) return 'No symptoms reported';
    
    // If it's already a string, return it
    if (typeof symptoms === 'string') return symptoms;
    
    // If it's not an object, convert to string
    if (typeof symptoms !== 'object') return String(symptoms);
    
    // Format based on category or detect from data structure
    if (category === 'physical' || this.isPhysicalSymptoms(symptoms)) {
      return this.formatPhysicalSymptoms(symptoms);
    }
    
    if (category === 'mental' || this.isMentalHealthSymptoms(symptoms)) {
      return this.formatMentalHealthSymptoms(symptoms);
    }
    
    if (category === 'general' || this.isGeneralCheckupSymptoms(symptoms)) {
      return this.formatGeneralCheckupSymptoms(symptoms);
    }
    
    if (category === 'unsure' || this.isUnsureSymptoms(symptoms)) {
      return this.formatUnsureSymptoms(symptoms);
    }
    
    // Fallback - format whatever we have
    return this.formatGenericSymptoms(symptoms);
  }

  /**
   * Detect if symptoms object is for physical complaints
   */
  isPhysicalSymptoms(symptoms: any): boolean {
    const physicalIndicators = [
      'pain_level', 'body_area', 'specific_symptoms', 'fever', 
      'breathing_difficulty', 'chest_pain', 'mobility_impact', 'duration_days'
    ];
    return physicalIndicators.some(key => key in symptoms);
  }

  /**
   * Detect if symptoms object is for mental health
   */
  isMentalHealthSymptoms(symptoms: any): boolean {
    const mentalIndicators = [
      'mental_symptoms', 'mental_severity', 'daily_impact', 
      'suicidal_thoughts', 'homicidal_thoughts', 'has_support', 
      'previous_treatment', 'duration_weeks'
    ];
    return mentalIndicators.some(key => key in symptoms);
  }

  /**
   * Detect if symptoms object is for general checkup
   */
  isGeneralCheckupSymptoms(symptoms: any): boolean {
    const generalIndicators = [
      'age', 'concerns', 'chronic_conditions', 'family_history', 
      'last_checkup_months', 'lifestyle_factors', 'medications'
    ];
    return generalIndicators.some(key => key in symptoms);
  }

  /**
   * Detect if symptoms object is for unsure category
   */
  isUnsureSymptoms(symptoms: any): boolean {
    const unsureIndicators = [
      'concern_level', 'described_symptoms', 'persistent', 'vague_description'
    ];
    return unsureIndicators.some(key => key in symptoms);
  }

  /**
   * Format physical symptoms
   */
  formatPhysicalSymptoms(symptoms: any): string {
    const parts = [];
    
    // Body area
    if (symptoms.body_area) {
      const areaName = this.getBodyAreaName(symptoms.body_area);
      parts.push(`Area: ${areaName}`);
    }
    
    // Specific symptoms
    if (symptoms.specific_symptoms && Array.isArray(symptoms.specific_symptoms) && symptoms.specific_symptoms.length > 0) {
      const symptomNames = symptoms.specific_symptoms
        .map((s: string) => this.formatSymptomName(s))
        .join(', ');
      parts.push(`Symptoms: ${symptomNames}`);
    }
    
    // Pain level
    if (symptoms.pain_level !== undefined) {
      let painDesc = 'No pain';
      if (symptoms.pain_level >= 7) painDesc = 'Severe pain';
      else if (symptoms.pain_level >= 4) painDesc = 'Moderate pain';
      else if (symptoms.pain_level > 0) painDesc = 'Mild pain';
      else painDesc = 'No pain';
      
      parts.push(`${painDesc} (${symptoms.pain_level}/10)`);
    }
    
    // Duration
    if (symptoms.duration_days) {
      const days = symptoms.duration_days;
      parts.push(`Duration: ${days} day${days > 1 ? 's' : ''}`);
    }
    
    // Additional symptoms
    const additionalSymptoms = [];
    if (symptoms.fever) additionalSymptoms.push('Fever/Chills');
    if (symptoms.breathing_difficulty) additionalSymptoms.push('Breathing difficulty');
    if (symptoms.chest_pain) additionalSymptoms.push('Chest pain');
    if (symptoms.mobility_impact) additionalSymptoms.push('Mobility affected');
    
    if (additionalSymptoms.length > 0) {
      parts.push(`Additional: ${additionalSymptoms.join(', ')}`);
    }
    
    return parts.length > 0 ? parts.join(' • ') : JSON.stringify(symptoms);
  }

  /**
   * Format mental health symptoms
   */
  formatMentalHealthSymptoms(symptoms: any): string {
    const parts = [];
    
    // Mental symptoms
    if (symptoms.mental_symptoms && Array.isArray(symptoms.mental_symptoms)) {
      const formattedSymptoms = symptoms.mental_symptoms
        .map((s: string) => this.formatSymptomName(s))
        .join(', ');
      parts.push(`Mental health: ${formattedSymptoms}`);
    }
    
    // Severity
    if (symptoms.mental_severity !== undefined) {
      let severityText = 'Mild';
      if (symptoms.mental_severity >= 7) severityText = 'Severe';
      else if (symptoms.mental_severity >= 4) severityText = 'Moderate';
      parts.push(`Severity: ${severityText} (${symptoms.mental_severity}/10)`);
    }
    
    // Duration
    if (symptoms.duration_weeks !== undefined) {
      const weeks = symptoms.duration_weeks;
      parts.push(`Duration: ${weeks} week${weeks > 1 ? 's' : ''}`);
    }
    
    // Daily impact
    if (symptoms.daily_impact !== undefined) {
      let impactText = 'Minimal';
      if (symptoms.daily_impact >= 7) impactText = 'Severe';
      else if (symptoms.daily_impact >= 4) impactText = 'Moderate';
      parts.push(`Daily impact: ${impactText} (${symptoms.daily_impact}/10)`);
    }
    
    // Support system
    if (symptoms.has_support !== undefined) {
      parts.push(`Support system: ${symptoms.has_support ? 'Yes' : 'No'}`);
    }
    
    // Previous treatment
    if (symptoms.previous_treatment !== undefined) {
      parts.push(`Previous treatment: ${symptoms.previous_treatment ? 'Yes' : 'No'}`);
    }
    
    // Crisis indicators - always show these prominently
    if (symptoms.suicidal_thoughts) {
      parts.push(`CRITICAL: Suicidal thoughts reported`);
    }
    if (symptoms.homicidal_thoughts) {
      parts.push(`CRITICAL: Homicidal thoughts reported`);
    }
    
    return parts.length > 0 ? parts.join(' • ') : JSON.stringify(symptoms);
  }

  /**
   * Format general checkup symptoms
   */
  formatGeneralCheckupSymptoms(symptoms: any): string {
    const parts = [];
    
    // Concerns
    if (symptoms.concerns && Array.isArray(symptoms.concerns)) {
      const concerns = symptoms.concerns
        .map((c: string) => this.formatSymptomName(c))
        .join(', ');
      parts.push(`Concerns: ${concerns}`);
    }
    
    // Age and checkup
    if (symptoms.age) {
      parts.push(`Age: ${symptoms.age} years`);
    }
    
    if (symptoms.last_checkup_months !== undefined) {
      const months = symptoms.last_checkup_months;
      if (months === 0) {
        parts.push(`Never had a checkup`);
      } else if (months < 12) {
        parts.push(`Last checkup: ${months} month${months > 1 ? 's' : ''} ago`);
      } else {
        const years = Math.floor(months / 12);
        const remainingMonths = months % 12;
        if (remainingMonths === 0) {
          parts.push(`Last checkup: ${years} year${years > 1 ? 's' : ''} ago`);
        } else {
          parts.push(`Last checkup: ${years} year${years > 1 ? 's' : ''}, ${remainingMonths} month${remainingMonths > 1 ? 's' : ''} ago`);
        }
      }
    }
    
    // Chronic conditions
    if (symptoms.chronic_conditions && Array.isArray(symptoms.chronic_conditions) && symptoms.chronic_conditions.length > 0) {
      parts.push(`Chronic conditions: ${symptoms.chronic_conditions.join(', ')}`);
    }
    
    // Family history
    if (symptoms.family_history && Array.isArray(symptoms.family_history) && symptoms.family_history.length > 0) {
      parts.push(`Family history: ${symptoms.family_history.join(', ')}`);
    }
    
    // Lifestyle factors
    if (symptoms.lifestyle_factors && Array.isArray(symptoms.lifestyle_factors) && symptoms.lifestyle_factors.length > 0) {
      const factors = symptoms.lifestyle_factors
        .map((f: string) => this.formatSymptomName(f))
        .join(', ');
      parts.push(`Lifestyle: ${factors}`);
    }
    
    // Medications
    if (symptoms.medications && Array.isArray(symptoms.medications) && symptoms.medications.length > 0) {
      parts.push(`Medications: ${symptoms.medications.join(', ')}`);
    }
    
    return parts.length > 0 ? parts.join(' • ') : JSON.stringify(symptoms);
  }

  /**
   * Format unsure/general symptoms
   */
  formatUnsureSymptoms(symptoms: any): string {
    const parts = [];
    
    // Described symptoms (most important for unsure category)
    if (symptoms.described_symptoms) {
      parts.push(`Patient describes: "${symptoms.described_symptoms}"`);
    }
    
    // Concern level
    if (symptoms.concern_level !== undefined) {
      let concernText = 'Not worried';
      if (symptoms.concern_level >= 7) concernText = 'Very concerned';
      else if (symptoms.concern_level >= 4) concernText = 'Somewhat concerned';
      parts.push(`Concern level: ${concernText} (${symptoms.concern_level}/10)`);
    }
    
    // Duration
    if (symptoms.duration_days) {
      const days = symptoms.duration_days;
      parts.push(`Duration: ${days} day${days > 1 ? 's' : ''}`);
    }
    
    // Persistent
    if (symptoms.persistent) {
      parts.push(`Persistent/recurring symptoms`);
    }
    
    // Vague description
    if (symptoms.vague_description) {
      parts.push(`Additional: ${symptoms.vague_description}`);
    }
    
    return parts.length > 0 ? parts.join(' • ') : JSON.stringify(symptoms);
  }

  /**
   * Generic formatter for any symptom object
   */
  formatGenericSymptoms(symptoms: any): string {
    const parts = [];
    
    // Look for common fields across all categories
    if (symptoms.notes) {
      parts.push(`Notes: ${symptoms.notes}`);
    }
    
    // Try to extract any meaningful key-value pairs
    for (const [key, value] of Object.entries(symptoms)) {
      // Skip empty, internal, or already processed fields
      if (!value || 
          key.startsWith('_') || 
          key === 'notes' || 
          key === 'id' ||
          typeof value === 'object') {
        continue;
      }
      
      // Format boolean values
      if (typeof value === 'boolean') {
        if (value) {
          parts.push(this.formatFieldName(key));
        }
      } 
      // Format array values
      else if (Array.isArray(value) && value.length > 0) {
        parts.push(`${this.formatFieldName(key)}: ${value.join(', ')}`);
      }
      // Format other values
      else if (value !== '' && value !== null) {
        parts.push(`${this.formatFieldName(key)}: ${value}`);
      }
    }
    
    return parts.length > 0 ? parts.join(' • ') : 'Symptoms reported (details not available)';
  }

  /**
   * Format field name for display
   */
  formatFieldName(key: string): string {
    // Convert snake_case or camelCase to Title Case
    return key
      .replace(/_/g, ' ')
      .replace(/([A-Z])/g, ' $1')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ')
      .trim();
  }

  /**
   * Format symptom ID to readable name
   */
  formatSymptomName(symptomId: string): string {
    if (!symptomId) return '';
    
    // Common symptom mappings
    const symptomMap: Record<string, string> = {
      // Mental health
      'anxiety': 'Anxiety',
      'depression': 'Depression',
      'panic_attacks': 'Panic attacks',
      'insomnia': 'Insomnia',
      'fatigue': 'Fatigue',
      'mood_swings': 'Mood swings',
      'social_withdrawal': 'Social withdrawal',
      'irritability': 'Irritability',
      
      // Physical - Head
      'headache': 'Headache',
      'dizziness': 'Dizziness',
      'vision_issues': 'Vision issues',
      
      // Physical - Chest
      'chest_pain': 'Chest pain',
      'breathing_difficulty': 'Breathing difficulty',
      'coughing': 'Coughing',
      
      // Physical - Abdomen
      'abdominal_pain': 'Abdominal pain',
      'nausea': 'Nausea',
      'vomiting': 'Vomiting',
      
      // Physical - Limbs
      'joint_pain': 'Joint pain',
      'swelling': 'Swelling',
      'muscle_pain': 'Muscle pain',
      
      // General concerns
      'annual_checkup': 'Annual checkup',
      'screening': 'Health screening',
      'medication_review': 'Medication review',
      'chronic_management': 'Chronic condition management',
      'weight_concern': 'Weight concern',
      'sleep_issues': 'Sleep issues',
      'nutrition_advice': 'Nutrition advice',
      
      // Lifestyle
      'smoking': 'Smoking',
      'alcohol': 'Alcohol use',
      'sedentary': 'Sedentary lifestyle',
      'poor_diet': 'Poor diet',
      'high_stress': 'High stress',
      
      // Pain types
      'pain': 'Pain',
      'discomfort': 'Discomfort'
    };
    
    return symptomMap[symptomId] || this.formatFieldName(symptomId);
  }

  /**
   * Get body area name from ID
   */
  getBodyAreaName(areaId: string): string {
    const bodyAreaMap: Record<string, string> = {
      'head': 'Head & Face',
      'neck': 'Neck & Throat',
      'chest': 'Chest',
      'abdomen': 'Abdomen',
      'back': 'Back',
      'pelvis': 'Pelvis',
      'limbs': 'Arms & Legs',
      'skin': 'Skin'
    };
    
    return bodyAreaMap[areaId] || this.formatFieldName(areaId);
  }

  /**
   * Get category icon class
   */
  getCategoryIcon(category: string): string {
    const iconMap: Record<string, string> = {
      'physical': 'bi bi-body-index',
      'mental': 'bi bi-brain',
      'general': 'bi bi-heart-pulse',
      'unsure': 'bi bi-question-circle'
    };
    return iconMap[category] || 'bi bi-clipboard';
  }

  /**
   * Get category display name
   */
  getCategoryDisplayName(category: string): string {
    const nameMap: Record<string, string> = {
      'physical': 'Physical Symptoms',
      'mental': 'Mental Health',
      'general': 'General Checkup',
      'unsure': 'General Concern'
    };
    return nameMap[category] || category;
  }

  // Check if symptoms have detailed structure
  hasSymptomsDetails(): boolean {
    const s = this.triage?.symptoms;
    if (!s || typeof s === 'string') return false;
    return !!(s.duration || s.severity || s.onset || s.progression || s.body_location || s.character);
  }

  // Check if additional info exists
  hasAdditionalInfo(): boolean {
    return !!(this.triage?.body_area || this.triage?.duration || this.triage?.notes || this.triage?.additional_details);
  }

  // Calculate age from DOB
  calculateAge(dob: string): number {
    if (!dob) return 0;
    try {
      const birthDate = new Date(dob);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age;
    } catch (e) {
      return 0;
    }
  }

  // Get status class for banner
  getStatusClass(): string {
    if (!this.triage) return '';
    if (this.triage.status === 'closed') return 'closed';
    if (this.triage.reviewed_at) return 'reviewed';
    return 'active';
  }

  // Get case status text
  getCaseStatus(): string {
    if (!this.triage) return 'New Case';
    if (this.triage.status === 'closed') return 'Closed Case';
    if (this.triage.reviewed_at) return 'Reviewed';
    return 'New Case - Action Required';
  }

  // Get score percentage for progress bar
  getScorePercentage(): number {
    const score = this.triage?.score || this.triage?.priority?.score || 0;
    const numericScore = Number(score) || 0;
    return Math.min((numericScore / 10) * 100, 100);
  }

  // Get score class for styling
  getScoreClass(): string {
    const score = this.triage?.score || this.triage?.priority?.score || 0;
    const numericScore = Number(score) || 0;
    if (numericScore >= 7) return 'high';
    if (numericScore >= 4) return 'moderate';
    return 'low';
  }

  // Get confidence class for styling
  getConfidenceClass(confidence: any): string {
    if (!confidence && confidence !== 0) return '';
    
    const confidenceStr = String(confidence).toLowerCase();
    
    if (confidenceStr.includes('high') || 
        confidenceStr.includes('>80') || 
        confidenceStr.includes('80%') ||
        confidence === 'high' ||
        Number(confidence) >= 80) {
      return 'high';
    }
    
    if (confidenceStr.includes('medium') || 
        confidenceStr.includes('50-80') || 
        confidenceStr.includes('50%') ||
        confidence === 'medium' ||
        (Number(confidence) >= 50 && Number(confidence) < 80)) {
      return 'medium';
    }
    
    return 'low';
  }

  // Get keys from breakdown object
  getBreakdownKeys(): string[] {
    const breakdown = this.triage?.priority?.breakdown || {};
    if (!breakdown || typeof breakdown !== 'object') return [];
    
    return Object.keys(breakdown).filter(key => 
      key && 
      typeof key === 'string' && 
      !key.includes('_id') && 
      !key.includes('_at') &&
      !key.includes('__')
    );
  }

  // Format breakdown label for display
  formatBreakdownLabel(key: string): string {
    if (!key) return '';
    return key
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  // Safely get symptom property
  getSymptomProperty(property: string): any {
    try {
      const symptoms = this.triage?.symptoms;
      if (!symptoms) return null;
      if (typeof symptoms === 'string') return null;
      return symptoms[property];
    } catch (e) {
      return null;
    }
  }

  goBack(): void {
    this.router.navigate(['/gp/home']);
  }

  markAsRead() {
    this.takeAction('reviewed');
  }

  closeCase() {
    this.takeAction('closed');
  }

  scheduleAppointment(): void {
    if (this.triage?.patient?._id) {
      this.router.navigate(['/gp/add-appointment'], {
        queryParams: { 
          patientId: this.triage.patient._id,
          patientName: this.triage.patient_name || this.triage.patient?.name || 'Patient'
        }
      });
    } else {
      this.router.navigate(['/gp/add-appointment']);
    }
  }

  private takeAction(action: string) {
    if (!this.triage?._id) return;
    this.api.gpTriageAction(this.triage._id, { action }).subscribe({
      next: () => {
        this.router.navigate(['/gp/home']);
      },
      error: (err) => {
        console.error('Error taking action:', err);
        this.router.navigate(['/gp/home']);
      }
    });
  }
}