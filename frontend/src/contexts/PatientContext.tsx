import { createContext, useContext, useState, ReactNode } from 'react';
import type { Patient } from '../types/fhir';

interface PatientContextType {
  patient: Patient | null;
  accessToken: string;
  fhirBaseUrl: string;
  setPatient: (p: Patient | null) => void;
  setAccessToken: (t: string) => void;
  setFhirBaseUrl: (u: string) => void;
}

const PatientContext = createContext<PatientContextType | null>(null);

const DEFAULT_FHIR_BASE = 'https://hapi.fhir.org/baseR4';

export function PatientProvider({ children }: { children: ReactNode }) {
  const [patient, setPatientState] = useState<Patient | null>(() => {
    try { return JSON.parse(localStorage.getItem('patient') || 'null'); } catch { return null; }
  });
  const [accessToken, setAccessTokenState] = useState(() => localStorage.getItem('accessToken') || '');
  const [fhirBaseUrl, setFhirBaseUrlState] = useState(() => localStorage.getItem('fhirBaseUrl') || DEFAULT_FHIR_BASE);

  const setPatient = (p: Patient | null) => {
    setPatientState(p);
    if (p) localStorage.setItem('patient', JSON.stringify(p));
    else localStorage.removeItem('patient');
  };

  const setAccessToken = (t: string) => {
    setAccessTokenState(t);
    if (t) localStorage.setItem('accessToken', t);
    else localStorage.removeItem('accessToken');
  };

  const setFhirBaseUrl = (u: string) => {
    setFhirBaseUrlState(u);
    localStorage.setItem('fhirBaseUrl', u);
  };

  return (
    <PatientContext.Provider value={{ patient, accessToken, fhirBaseUrl, setPatient, setAccessToken, setFhirBaseUrl }}>
      {children}
    </PatientContext.Provider>
  );
}

export function usePatient() {
  const ctx = useContext(PatientContext);
  if (!ctx) throw new Error('usePatient must be used within PatientProvider');
  return ctx;
}
