import { useEffect, useState } from 'react';
import { usePatient } from '../contexts/PatientContext';
import { fetchLabs } from '../services/api';
import type { LabResult } from '../types/fhir';
import LoadingSpinner from '../components/LoadingSpinner';

function interpretationBadge(code?: string) {
  if (!code) return null;
  const map: Record<string, string> = {
    H: 'bg-red-100 text-red-800',
    HH: 'bg-red-100 text-red-800',
    L: 'bg-blue-100 text-blue-800',
    LL: 'bg-blue-100 text-blue-800',
    N: 'bg-green-100 text-green-800',
  };
  const label: Record<string, string> = { H: 'High', HH: 'Critical High', L: 'Low', LL: 'Critical Low', N: 'Normal' };
  return (
    <span className={`text-xs px-2 py-1 rounded-full shrink-0 ${map[code] || 'bg-gray-100 text-gray-600'}`}>
      {label[code] || code}
    </span>
  );
}

export default function LabResultsPage() {
  const { patient, accessToken, fhirBaseUrl } = usePatient();
  const [labs, setLabs] = useState<LabResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!patient) return;
    fetchLabs(patient.id, accessToken, fhirBaseUrl)
      .then(setLabs)
      .catch(() => setError('Failed to load lab results'))
      .finally(() => setLoading(false));
  }, [patient]);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="p-6 max-w-3xl">
      <h1 className="text-xl font-semibold text-text-h mb-4">Lab Results</h1>
      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
      {labs.length === 0 ? (
        <p className="text-sm text-gray-400">No lab results found</p>
      ) : (
        <div className="space-y-3">
          {labs.map(lab => (
            <div key={lab.id} className="bg-white border border-border rounded-xl p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="font-medium text-text-h">{lab.name}</h3>
                  <div className="flex items-baseline gap-1.5 mt-1">
                    <span className="text-lg font-semibold text-primary">{lab.value}</span>
                    {lab.unit && <span className="text-sm text-gray-500">{lab.unit}</span>}
                  </div>
                  {lab.referenceRange && (
                    <p className="text-xs text-gray-400 mt-0.5">Ref: {lab.referenceRange}</p>
                  )}
                  {lab.effectiveDate && (
                    <p className="text-xs text-gray-400 mt-0.5">{new Date(lab.effectiveDate).toLocaleDateString()}</p>
                  )}
                </div>
                {interpretationBadge(lab.interpretation)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
