// ── FHIR-aligned TypeScript types ──────────────────────────────────────────

export interface Patient {
  id: string;
  name: string;
  birthDate: string;
  gender: string;
  phone: string;
  email: string;
  address: string;
  insuranceId: string;
  primaryCare: string;
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  prescriber: string;
  startDate: string;
  endDate?: string;
  status: 'active' | 'stopped' | 'on-hold';
  instructions?: string;
  refillsRemaining: number;
}

export interface Diagnosis {
  id: string;
  code: string;         // ICD-10
  display: string;
  category: string;
  onsetDate: string;
  status: 'active' | 'resolved' | 'inactive';
  severity?: 'mild' | 'moderate' | 'severe';
  notes?: string;
}

export interface LabResult {
  id: string;
  name: string;
  category: string;
  value: string;
  unit: string;
  referenceRange: string;
  status: 'normal' | 'high' | 'low' | 'critical';
  date: string;
  orderedBy: string;
  notes?: string;
}

export interface Appointment {
  id: string;
  title: string;
  provider: string;
  specialty: string;
  location: string;
  date: string;
  time: string;
  duration: number;       // minutes
  status: 'upcoming' | 'completed' | 'cancelled' | 'pending';
  type: 'in-person' | 'telehealth';
  notes?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isLoading?: boolean;
}
