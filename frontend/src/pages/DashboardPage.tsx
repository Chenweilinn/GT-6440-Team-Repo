import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { usePatient } from '../contexts/PatientContext';
import { fetchMedications, fetchConditions, fetchLabs, fetchAppointments } from '../services/api';
import type { Medication, Condition, LabResult, Appointment } from '../types/fhir';
import LoadingSpinner from '../components/LoadingSpinner';

function StatCard({ label, count, to }: { label: string; count: number; to: string }) {
  return (
    <Link
      to={to}
      className="bg-white border border-border rounded-xl p-5 hover:border-primary-border hover:shadow-sm transition-all"
    >
      <p className="text-2xl font-bold text-primary">{count}</p>
      <p className="text-sm text-gray-500 mt-0.5">{label}</p>
    </Link>
  );
}

export default function DashboardPage() {
  const { patient, accessToken, fhirBaseUrl } = usePatient();
  const [meds, setMeds] = useState<Medication[]>([]);
  const [conditions, setConditions] = useState<Condition[]>([]);
  const [labs, setLabs] = useState<LabResult[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!patient) return;
    Promise.all([
      fetchMedications(patient.id, accessToken, fhirBaseUrl),
      fetchConditions(patient.id, accessToken, fhirBaseUrl),
      fetchLabs(patient.id, accessToken, fhirBaseUrl),
      fetchAppointments(patient.id, accessToken, fhirBaseUrl),
    ])
      .then(([m, c, l, a]) => { setMeds(m); setConditions(c); setLabs(l); setAppointments(a); })
      .finally(() => setLoading(false));
  }, [patient]);

  if (loading) return <LoadingSpinner />;

  const activeMeds = meds.filter(m => m.status === 'active').slice(0, 4);
  const upcomingAppts = appointments
    .filter(a => a.start && new Date(a.start) >= new Date())
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
    .slice(0, 4);
  const recentLabs = labs.slice(0, 4);

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      <h1 className="text-xl font-semibold text-text-h">Overview</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Medications" count={meds.length} to="/portal/medications" />
        <StatCard label="Conditions" count={conditions.length} to="/portal/conditions" />
        <StatCard label="Lab Results" count={labs.length} to="/portal/labs" />
        <StatCard label="Appointments" count={appointments.length} to="/portal/appointments" />
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        <div className="bg-white border border-border rounded-xl p-5">
          <h2 className="font-semibold text-text-h text-sm mb-3">Active Medications</h2>
          {activeMeds.length === 0 ? (
            <p className="text-sm text-gray-400">No active medications</p>
          ) : (
            <ul className="space-y-2">
              {activeMeds.map(med => (
                <li key={med.id} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-text-h truncate">{med.name}</p>
                    {med.dosageText && <p className="text-xs text-gray-500 truncate">{med.dosageText}</p>}
                  </div>
                </li>
              ))}
            </ul>
          )}
          <Link to="/portal/medications" className="text-xs text-primary mt-3 block hover:underline">View all →</Link>
        </div>

        <div className="bg-white border border-border rounded-xl p-5">
          <h2 className="font-semibold text-text-h text-sm mb-3">Upcoming Appointments</h2>
          {upcomingAppts.length === 0 ? (
            <p className="text-sm text-gray-400">No upcoming appointments</p>
          ) : (
            <ul className="space-y-2">
              {upcomingAppts.map(appt => (
                <li key={appt.id}>
                  <p className="text-sm font-medium text-text-h truncate">{appt.description}</p>
                  <p className="text-xs text-gray-500">{new Date(appt.start).toLocaleDateString()}</p>
                </li>
              ))}
            </ul>
          )}
          <Link to="/portal/appointments" className="text-xs text-primary mt-3 block hover:underline">View all →</Link>
        </div>

        <div className="bg-white border border-border rounded-xl p-5">
          <h2 className="font-semibold text-text-h text-sm mb-3">Recent Lab Results</h2>
          {recentLabs.length === 0 ? (
            <p className="text-sm text-gray-400">No lab results</p>
          ) : (
            <ul className="space-y-2">
              {recentLabs.map(lab => (
                <li key={lab.id} className="flex items-center justify-between">
                  <p className="text-sm text-text-h truncate mr-2">{lab.name}</p>
                  <span className="text-sm font-medium text-primary shrink-0">{lab.value} {lab.unit}</span>
                </li>
              ))}
            </ul>
          )}
          <Link to="/portal/labs" className="text-xs text-primary mt-3 block hover:underline">View all →</Link>
        </div>

        <div className="bg-white border border-border rounded-xl p-5">
          <h2 className="font-semibold text-text-h text-sm mb-3">Active Conditions</h2>
          {conditions.length === 0 ? (
            <p className="text-sm text-gray-400">No conditions recorded</p>
          ) : (
            <ul className="space-y-2">
              {conditions.filter(c => c.clinicalStatus === 'active').slice(0, 4).map(c => (
                <li key={c.id} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-2 shrink-0" />
                  <p className="text-sm text-text-h">{c.name}</p>
                </li>
              ))}
            </ul>
          )}
          <Link to="/portal/conditions" className="text-xs text-primary mt-3 block hover:underline">View all →</Link>
        </div>
      </div>
    </div>
  );
}
