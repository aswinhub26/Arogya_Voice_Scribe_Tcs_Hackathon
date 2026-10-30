export type UserRole = 'doctor' | 'nurse' | 'pharmacist' | 'admin';

export interface Patient {
  id: string;
  abhaId: string;
  qrId: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  phone: string;
  village: string;
  allergies: string[];
  chronicConditions: string[];
  isPregnant?: boolean;
  gestationalWeeks?: number;
  isLactating?: boolean;
  weightKg?: number;
  lastVisitDate?: string;
  activeMedications?: string[];
  avatarUrl?: string;
  pastVisits?: PastVisitRecord[];
}

export interface PastVisitRecord {
  id: string;
  date: string;
  doctorName: string;
  facility: string;
  chiefComplaints: string[];
  diagnosis: string[];
  icd10: string[];
  vitals: {
    bp?: string;
    pulse?: number;
    weight?: string;
    bloodGlucose?: string;
    temperature?: string;
  };
  medications: {
    name: string;
    dose: string;
    timing: string;
    days: number;
  }[];
  clinicalNotes: string;
  clinicalNotesTamil: string;
}

export interface Vitals {
  bpSystolic?: number;
  bpDiastolic?: number;
  bp?: string;
  pulse?: number;
  temperature?: string;
  weight?: string;
  spo2?: string;
  bloodGlucose?: string;
}

export interface DiagnosisEntry {
  icd10: string;
  nameEn: string;
  nameTa: string;
  isPrimary?: boolean;
}

export interface MedicationItem {
  id: string;
  drugName: string;
  tamilName: string;
  form: 'Tablet' | 'Capsule' | 'Syrup' | 'Injection' | 'Inhaler' | 'Sachet' | 'Ointment';
  dosage: string;
  frequency: string; // e.g. "1-1-1", "1-0-1", "1-0-0", "0-0-1", "SOS"
  frequencyTamil: string; // e.g. "காலை 1, மதியம் 1, இரவு 1"
  durationDays: number;
  duration: string; // "3 days" / "3 நாட்கள்"
  instructions: 'After food' | 'Before food' | 'With food' | 'At bedtime' | 'As needed';
  instructionsTamil: string; // "உணவுக்குப் பின்"
  inEssentialList: boolean;
  dispensed?: boolean;
}

export interface ConfidenceToken {
  word: string;
  confidence: number; // 0.0 to 1.0
  isLowConfidence: boolean;
  suggestions?: string[];
  isEdited?: boolean;
  originalWord?: string;
}

export type AlertSeverity = 'critical' | 'warning' | 'info';

export interface SafetyAlert {
  id: string;
  severity: AlertSeverity;
  type: 'allergy' | 'dose' | 'pregnancy' | 'interaction' | 'lasa' | 'formulary';
  title: string;
  titleTamil: string;
  message: string;
  messageTamil: string;
  targetDrug?: string;
  suggestedAlternative?: string;
  isOverridden?: boolean;
  overrideReason?: string;
  overriddenBy?: string;
  overriddenAt?: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  role: UserRole;
  action: 'DICTATION_CAPTURED' | 'FIELD_EDITED' | 'ALERT_OVERRIDDEN' | 'PRESCRIPTION_APPROVED' | 'DISPENSED' | 'SYNC_EXECUTED';
  details: string;
  field?: string;
  previousValue?: any;
  newValue?: any;
}

export interface ClinicalVisit {
  id: string;
  patientId: string;
  patientName: string;
  patientAge: number;
  patientGender: string;
  patientPhone: string;
  abhaId: string;
  date: string;
  doctorName: string;
  rawTranscript: string;
  tokens: ConfidenceToken[];
  chiefComplaints: string[];
  chiefComplaintsTamil: string[];
  vitals: Vitals;
  diagnosis: DiagnosisEntry[];
  medications: MedicationItem[];
  advice: string;
  adviceTamil: string;
  referralNeeded: boolean;
  referralFacility?: string;
  referralReason?: string;
  safetyAlerts: SafetyAlert[];
  status: 'draft' | 'reviewed' | 'approved' | 'dispensed';
  dictationStartTime?: number;
  approvalTime?: number;
  documentationSeconds?: number;
  isSynced: boolean;
  syncedAt?: string;
}

export interface EssentialDrug {
  id: string;
  nameEn: string;
  nameTa: string;
  form: 'Tablet' | 'Capsule' | 'Syrup' | 'Injection' | 'Inhaler' | 'Sachet' | 'Ointment';
  commonStrengths: string[];
  maxDailyDoseAdult: string;
  pediatricDose?: string;
  standardFrequency: string;
  standardFrequencyTamil: string;
  inPhcList: boolean;
  allergyClass?: 'penicillin' | 'nsaid' | 'sulfa' | 'macrolide' | 'cephalosporin';
  pregnancyCategory: 'Safe' | 'Caution' | 'Contraindicated';
  pregnancyWarning?: string;
  lookAlikes?: string[];
  category: 'Antipyretic' | 'Antibiotic' | 'Cardiovascular' | 'Antidiabetic' | 'Antihistamine' | 'Gastrointestinal' | 'Respiratory' | 'Analgesic' | 'Nutritional';
}

export interface Icd10PHC {
  code: string;
  nameEn: string;
  nameTa: string;
  category: string;
}
