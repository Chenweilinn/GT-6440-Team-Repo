import type { Patient, Medication, Condition, LabResult, Appointment, ChatMessage } from '../types/fhir';

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

function authHeaders(token?: string): HeadersInit {
  const h: HeadersInit = {};
  if (token) h['Authorization'] = `Bearer ${token}`;
  return h;
}

function fhirQuery(fhirBase?: string) {
  return fhirBase ? `?fhir_base=${encodeURIComponent(fhirBase)}` : '';
}

async function apiFetch(url: string, token?: string) {
  const resp = await fetch(url, { headers: authHeaders(token) });
  if (!resp.ok) throw new Error(`HTTP ${resp.status}: ${resp.statusText}`);
  return resp.json();
}

export async function fetchPatient(patientId: string, token?: string, fhirBase?: string): Promise<Patient> {
  const data = await apiFetch(`${API_BASE}/api/fhir/patient/${patientId}${fhirQuery(fhirBase)}`, token);
  return parsePatient(data);
}

export async function fetchMedications(patientId: string, token?: string, fhirBase?: string): Promise<Medication[]> {
  const data = await apiFetch(`${API_BASE}/api/fhir/patient/${patientId}/medications${fhirQuery(fhirBase)}`, token);
  return parseMedications(data);
}

export async function fetchConditions(patientId: string, token?: string, fhirBase?: string): Promise<Condition[]> {
  const data = await apiFetch(`${API_BASE}/api/fhir/patient/${patientId}/conditions${fhirQuery(fhirBase)}`, token);
  return parseConditions(data);
}

export async function fetchLabs(patientId: string, token?: string, fhirBase?: string): Promise<LabResult[]> {
  const data = await apiFetch(`${API_BASE}/api/fhir/patient/${patientId}/labs${fhirQuery(fhirBase)}`, token);
  return parseLabs(data);
}

export async function fetchAppointments(patientId: string, token?: string, fhirBase?: string): Promise<Appointment[]> {
  const data = await apiFetch(`${API_BASE}/api/fhir/patient/${patientId}/appointments${fhirQuery(fhirBase)}`, token);
  return parseAppointments(data);
}

export async function sendChatMessage(
  message: string,
  patientContext: string,
  history: ChatMessage[] = [],
): Promise<string> {
  const resp = await fetch(`${API_BASE}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, patient_context: patientContext, history }),
  });
  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}));
    throw new Error(err.detail || `HTTP ${resp.status}`);
  }
  const data = await resp.json();
  return data.response;
}

// ── FHIR Resource Parsers ──────────────────────────────────────────────────

function parsePatient(r: any): Patient {
  const name = r.name?.[0];
  const fullName = name
    ? [name.given?.join(' '), name.family].filter(Boolean).join(' ')
    : 'Unknown Patient';
  return {
    id: r.id,
    name: fullName,
    birthDate: r.birthDate || '',
    gender: r.gender || '',
    phone: r.telecom?.find((t: any) => t.system === 'phone')?.value,
    address: r.address?.[0]
      ? [r.address[0].line?.join(', '), r.address[0].city, r.address[0].state].filter(Boolean).join(', ')
      : undefined,
  };
}

function parseMedications(bundle: any): Medication[] {
  return (bundle.entry || []).map((e: any) => {
    const r = e.resource;
    return {
      id: r.id,
      name:
        r.medicationCodeableConcept?.text ||
        r.medicationCodeableConcept?.coding?.[0]?.display ||
        r.medicationReference?.display ||
        'Unknown',
      status: r.status || '',
      dosageText: r.dosageInstruction?.[0]?.text,
      authoredOn: r.authoredOn,
      requester: r.requester?.display,
    };
  });
}

function parseConditions(bundle: any): Condition[] {
  return (bundle.entry || []).map((e: any) => {
    const r = e.resource;
    return {
      id: r.id,
      name: r.code?.text || r.code?.coding?.[0]?.display || 'Unknown',
      clinicalStatus: r.clinicalStatus?.coding?.[0]?.code || '',
      verificationStatus: r.verificationStatus?.coding?.[0]?.code || '',
      onsetDate: r.onsetDateTime || r.onsetPeriod?.start,
      category: r.category?.[0]?.coding?.[0]?.display,
    };
  });
}

function parseLabs(bundle: any): LabResult[] {
  return (bundle.entry || []).map((e: any) => {
    const r = e.resource;
    let value = '';
    let unit = '';
    if (r.valueQuantity) {
      value = String(r.valueQuantity.value ?? '');
      unit = r.valueQuantity.unit || '';
    } else if (r.valueString) {
      value = r.valueString;
    } else if (r.valueCodeableConcept) {
      value = r.valueCodeableConcept.text || '';
    }
    return {
      id: r.id,
      name: r.code?.text || r.code?.coding?.[0]?.display || 'Unknown',
      value,
      unit,
      referenceRange: r.referenceRange?.[0]?.text,
      effectiveDate: r.effectiveDateTime || r.effectivePeriod?.start || '',
      status: r.status || '',
      interpretation: r.interpretation?.[0]?.coding?.[0]?.code,
    };
  });
}

function parseAppointments(bundle: any): Appointment[] {
  return (bundle.entry || []).map((e: any) => {
    const r = e.resource;
    return {
      id: r.id,
      description: r.description || r.serviceType?.[0]?.text || 'Appointment',
      status: r.status || '',
      start: r.start || '',
      end: r.end,
      serviceType: r.serviceType?.[0]?.text,
    };
  });
}
