import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePatient } from '../contexts/PatientContext';
import { fetchPatient } from '../services/api';


export default function SelectPatientPage() {
  const [patientId, setPatientId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { setPatient, fhirBaseUrl } = usePatient();
  const navigate = useNavigate();

  const loadPatient = async (id: string) => {
    const trimmed = id.trim();
    if (!trimmed) return;
    setLoading(true);
    setError('');
    try {
      const patient = await fetchPatient(trimmed, undefined, fhirBaseUrl);
      setPatient(patient);
      navigate('/portal/dashboard');
    } catch {
      setError(`Patient "${trimmed}" not found on HAPI FHIR. Try a different ID.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-2">
        <h1 className="text-2xl font-bold text-text-h">Patient Portal</h1>
        <p className="text-sm text-gray-500 mb-8">FHIR-powered health record viewer with AI assistant</p>

        <div className="bg-white border border-border rounded-xl p-6 space-y-5">
          {/* Direct patient ID */}
          <section>
            <h2 className="font-semibold text-text-h text-sm mb-1">Load by Patient ID</h2>
            <p className="text-xs text-gray-500 mb-3">Queries the HAPI FHIR R4 Demo Server directly (no login needed)</p>
            <div className="flex gap-2">
              <input
                value={patientId}
                onChange={e => setPatientId(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && loadPatient(patientId)}
                placeholder="e.g. 131942539"
                className="flex-1 text-sm border border-border rounded-lg px-3 py-2 outline-none focus:border-primary"
              />
              <button
                onClick={() => loadPatient(patientId)}
                disabled={loading || !patientId.trim()}
                className="bg-primary text-white px-4 py-2 rounded-lg text-sm disabled:opacity-40 hover:opacity-90 transition-opacity"
              >
                {loading ? '…' : 'Load'}
              </button>
            </div>
            {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
          </section>

          {/* SMART on FHIR */}
          <section className="border-t border-border pt-5">
            <h2 className="font-semibold text-text-h text-sm mb-1">SMART on FHIR Launch</h2>
            <p className="text-xs text-gray-500 mb-3">
              For EHR context simulation via the SMART Health IT Launcher.
              Configure the launcher to redirect to{' '}
              <code className="bg-gray-100 px-1 rounded text-xs">http://localhost:5173/launch</code>
            </p>
            <a
              href="https://launch.smarthealthit.org"
              target="_blank"
              rel="noreferrer"
              className="block text-center text-sm border border-primary text-primary px-4 py-2 rounded-lg hover:bg-primary-bg transition-colors"
            >
              Open SMART Health IT Launcher ↗
            </a>
          </section>
        </div>
      </div>
    </div>
  );
}
