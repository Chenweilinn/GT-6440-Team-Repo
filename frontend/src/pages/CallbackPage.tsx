import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { usePatient } from '../contexts/PatientContext';
import { fetchPatient } from '../services/api';

const CLIENT_ID = 'patient_portal_app';

export default function CallbackPage() {
  const [params] = useSearchParams();
  const [error, setError] = useState('');
  const { setPatient, setAccessToken, setFhirBaseUrl } = usePatient();
  const navigate = useNavigate();

  useEffect(() => {
    const code = params.get('code');
    const state = params.get('state');
    const storedState = sessionStorage.getItem('smart_state');

    if (!code) { setError('No authorization code received.'); return; }
    if (state !== storedState) { setError('State mismatch — possible CSRF attack.'); return; }

    const verifier = sessionStorage.getItem('pkce_verifier') || '';
    const tokenEndpoint = sessionStorage.getItem('smart_token_endpoint') || '';
    const fhirBase = sessionStorage.getItem('smart_fhir_base') || '';

    if (!verifier || !tokenEndpoint || !fhirBase) { setError('Missing SMART session data.'); return; }

    const redirectUri = `${window.location.origin}/callback`;

    (async () => {
      try {
        const tokenResp = await fetch(tokenEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({ grant_type: 'authorization_code', code, redirect_uri: redirectUri, client_id: CLIENT_ID, code_verifier: verifier }),
        });
        if (!tokenResp.ok) throw new Error('Token exchange failed');
        const tokenData = await tokenResp.json();

        const { access_token, patient: patientId } = tokenData;
        setAccessToken(access_token);
        setFhirBaseUrl(fhirBase);

        if (patientId) {
          const patient = await fetchPatient(patientId, access_token, fhirBase);
          setPatient(patient);
        }

        ['pkce_verifier', 'smart_state', 'smart_token_endpoint', 'smart_fhir_base'].forEach(k => sessionStorage.removeItem(k));
        navigate('/portal/dashboard');
      } catch (e: any) {
        setError(e.message || 'Authorization failed');
      }
    })();
  }, []);

  if (error) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center p-6">
        <div className="bg-white border border-border rounded-xl p-6 max-w-md w-full">
          <p className="font-semibold text-text-h mb-2">Authorization Error</p>
          <p className="text-sm text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center">
      <p className="text-sm text-gray-500">Completing authorization…</p>
    </div>
  );
}
