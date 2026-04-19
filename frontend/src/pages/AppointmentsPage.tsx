import { useEffect, useState } from 'react';
import { usePatient } from '../contexts/PatientContext';
import { fetchAppointments } from '../services/api';
import type { Appointment } from '../types/fhir';
import LoadingSpinner from '../components/LoadingSpinner';

const STATUS_COLOR: Record<string, string> = {
  booked: 'bg-blue-100 text-blue-800',
  arrived: 'bg-green-100 text-green-800',
  fulfilled: 'bg-gray-100 text-gray-600',
  cancelled: 'bg-red-100 text-red-700',
  noshow: 'bg-orange-100 text-orange-800',
  proposed: 'bg-purple-100 text-purple-800',
};

function AppointmentCard({ a }: { a: Appointment }) {
  const date = a.start ? new Date(a.start) : null;
  return (
    <div className="bg-white border border-border rounded-xl p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-medium text-text-h">{a.description}</h3>
          {a.serviceType && <p className="text-xs text-gray-500 mt-0.5">{a.serviceType}</p>}
          {date && (
            <p className="text-sm text-gray-600 mt-1">
              {date.toLocaleDateString()} at {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          )}
        </div>
        <span className={`text-xs px-2 py-1 rounded-full shrink-0 ${STATUS_COLOR[a.status] || 'bg-gray-100 text-gray-600'}`}>
          {a.status}
        </span>
      </div>
    </div>
  );
}

export default function AppointmentsPage() {
  const { patient, accessToken, fhirBaseUrl } = usePatient();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!patient) return;
    fetchAppointments(patient.id, accessToken, fhirBaseUrl)
      .then(appts => setAppointments(appts.sort((a, b) => new Date(b.start).getTime() - new Date(a.start).getTime())))
      .catch(() => setError('Failed to load appointments'))
      .finally(() => setLoading(false));
  }, [patient]);

  if (loading) return <LoadingSpinner />;

  const now = new Date();
  const upcoming = appointments.filter(a => a.start && new Date(a.start) >= now);
  const past = appointments.filter(a => !a.start || new Date(a.start) < now);

  return (
    <div className="p-6 max-w-3xl">
      <h1 className="text-xl font-semibold text-text-h mb-4">Appointments</h1>
      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
      {appointments.length === 0 ? (
        <p className="text-sm text-gray-400">No appointments found</p>
      ) : (
        <>
          {upcoming.length > 0 && (
            <section className="mb-6">
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Upcoming</h2>
              <div className="space-y-3">{upcoming.map(a => <AppointmentCard key={a.id} a={a} />)}</div>
            </section>
          )}
          {past.length > 0 && (
            <section>
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Past</h2>
              <div className="space-y-3">{past.map(a => <AppointmentCard key={a.id} a={a} />)}</div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
