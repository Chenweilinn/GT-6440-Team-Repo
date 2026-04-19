export interface Patient {
  id: string;
  name: string;
  birthDate: string;
  gender: string;
  phone?: string;
  address?: string;
}

export interface Medication {
  id: string;
  name: string;
  status: string;
  dosageText?: string;
  authoredOn?: string;
  requester?: string;
}

export interface Condition {
  id: string;
  name: string;
  clinicalStatus: string;
  verificationStatus: string;
  onsetDate?: string;
  category?: string;
}

export interface LabResult {
  id: string;
  name: string;
  value: string;
  unit: string;
  referenceRange?: string;
  effectiveDate: string;
  status: string;
  interpretation?: string;
}

export interface Appointment {
  id: string;
  description: string;
  status: string;
  start: string;
  end?: string;
  serviceType?: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}
