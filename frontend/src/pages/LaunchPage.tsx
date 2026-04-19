import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

const CLIENT_ID = 'patient_portal_app';
const SCOPES = 'patient/*.read openid fhirUser launch';

async function generatePKCE(): Promise<{ verifier: string; challenge: string }> {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  const verifier = btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier));
  const challenge = btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  return { verifier, challenge };
}

export default function LaunchPage() {
  const [params] = useSearchParams();
  const [error, setError] = useState('');

  useEffect(() => {
    const iss = params.get('iss');
    const launch = params.get('launch');
    if (!iss) { setError('Missing iss parameter. Launch from the SMART Health IT Launcher.'); return; }

    (async () => {
      try {
        const configResp = await fetch(`${iss.replace(/\/$/, '')}/.well-known/smart-configuration`);
        if (!configResp.ok) throw new Error('Failed to fetch SMART configuration');
        const config = await configResp.json();

        const { verifier, challenge } = await generatePKCE();
        const state = crypto.randomUUID();

        sessionStorage.setItem('pkce_verifier', verifier);
        sessionStorage.setItem('smart_state', state);
        sessionStorage.setItem('smart_token_endpoint', config.token_endpoint);
        sessionStorage.setItem('smart_fhir_base', iss);

        const redirectUri = `${window.location.origin}/callback`;
        const authUrl = new URL(config.authorization_endpoint);
        authUrl.searchParams.set('response_type', 'code');
        authUrl.searchParams.set('client_id', CLIENT_ID);
        authUrl.searchParams.set('redirect_uri', redirectUri);
        authUrl.searchParams.set('scope', SCOPES);
        authUrl.searchParams.set('state', state);
        authUrl.searchParams.set('aud', iss);
        authUrl.searchParams.set('code_challenge', challenge);
        authUrl.searchParams.set('code_challenge_method', 'S256');
        if (launch) authUrl.searchParams.set('launch', launch);

        window.location.href = authUrl.toString();
      } catch (e: any) {
        setError(e.message || 'SMART launch failed');
      }
    })();
  }, []);

  if (error) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center p-6">
        <div className="bg-white border border-border rounded-xl p-6 max-w-md w-full">
          <p className="font-semibold text-text-h mb-2">Launch Error</p>
          <p className="text-sm text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center">
      <p className="text-sm text-gray-500">Initiating SMART on FHIR authorization…</p>
    </div>
  );
}
