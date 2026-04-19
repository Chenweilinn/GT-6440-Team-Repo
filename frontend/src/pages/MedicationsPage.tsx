import { useEffect, useState } from 'react';
import { usePatient } from '../contexts/PatientContext';
import { fetchMedications } from '../services/api';
import type { Medication } from '../types/fhir';
import LoadingSpinner from '../components/LoadingSpinner';

const STATUS_COLOR: Record<string, string> = {
  active: 'bg-green-100 text-green-800',
  stopped: 'bg-red-100 text-red-800',
  completed: 'bg-gray-100 text-gray-600',
  'on-hold': 'bg-yellow-100 text-yellow-800',
  cancelled: 'bg-red-100 text-red-700',
};

export default function MedicationsPage() {
  const { patient, accessToken, fhirBaseUrl } = usePatient();
  const [meds, setMeds] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!patient) return;
    fetchMedications(patient.id, accessToken, fhirBaseUrl)
      .then(setMeds)
      .catch(() => setError('Failed to load medications'))
      .finally(() => setLoading(false));
  }, [patient]);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="p-6 max-w-3xl">
      <h1 className="text-xl font-semibold text-text-h mb-4">Medications</h1>
      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
      {meds.length === 0 ? (
        <p className="text-sm text-gray-400">No medications found</p>
      ) : (
        <div className="space-y-3">
          {meds.map(med => (
            <div key={med.id} className="bg-white border border-border rounded-xl p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="font-medium text-text-h">{med.name}</h3>
                  {med.dosageText && <p className="text-sm text-gray-600 mt-0.5">{med.dosageText}</p>}
                  <div className="flex gap-3 mt-1">
                    {med.authoredOn && (
                      <p className="text-xs text-gray-400">Prescribed: {new Date(med.authoredOn).toLocaleDateString()}</p>
                    )}
                    {med.requester && <p className="text-xs text-gray-400">By: {med.requester}</p>}
                  </div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full shrink-0 ${STATUS_COLOR[med.status] || 'bg-gray-100 text-gray-600'}`}>
                  {med.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
