import { useEffect, useState } from 'react';
import { usePatient } from '../contexts/PatientContext';
import { fetchConditions } from '../services/api';
import type { Condition } from '../types/fhir';
import LoadingSpinner from '../components/LoadingSpinner';

function ConditionCard({ c }: { c: Condition }) {
  return (
    <div className="bg-white border border-border rounded-xl p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-medium text-text-h">{c.name}</h3>
          {c.category && <p className="text-xs text-gray-500 mt-0.5">{c.category}</p>}
          {c.onsetDate && (
            <p className="text-xs text-gray-400 mt-1">Onset: {new Date(c.onsetDate).toLocaleDateString()}</p>
          )}
        </div>
        <span className={`text-xs px-2 py-1 rounded-full shrink-0 ${
          c.clinicalStatus === 'active' ? 'bg-orange-100 text-orange-800' :
          c.clinicalStatus === 'resolved' ? 'bg-green-100 text-green-800' :
          'bg-gray-100 text-gray-600'
        }`}>
          {c.clinicalStatus || 'unknown'}
        </span>
      </div>
    </div>
  );
}

export default function ConditionsPage() {
  const { patient, accessToken, fhirBaseUrl } = usePatient();
  const [conditions, setConditions] = useState<Condition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!patient) return;
    fetchConditions(patient.id, accessToken, fhirBaseUrl)
      .then(setConditions)
      .catch(() => setError('Failed to load conditions'))
      .finally(() => setLoading(false));
  }, [patient]);

  if (loading) return <LoadingSpinner />;

  const active = conditions.filter(c => c.clinicalStatus === 'active');
  const other = conditions.filter(c => c.clinicalStatus !== 'active');

  return (
    <div className="p-6 max-w-3xl">
      <h1 className="text-xl font-semibold text-text-h mb-4">Conditions &amp; Diagnoses</h1>
      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
      {conditions.length === 0 ? (
        <p className="text-sm text-gray-400">No conditions found</p>
      ) : (
        <>
          {active.length > 0 && (
            <section className="mb-6">
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Active</h2>
              <div className="space-y-3">{active.map(c => <ConditionCard key={c.id} c={c} />)}</div>
            </section>
          )}
          {other.length > 0 && (
            <section>
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Historical</h2>
              <div className="space-y-3">{other.map(c => <ConditionCard key={c.id} c={c} />)}</div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
