import { useNavigate } from 'react-router-dom';
import { usePatient } from '../contexts/PatientContext';

export default function PatientHeader() {
  const { patient, setPatient, setAccessToken } = usePatient();
  const navigate = useNavigate();

  const handleSwitch = () => {
    setPatient(null);
    setAccessToken('');
    navigate('/');
  };

  if (!patient) return null;

  return (
    <header className="bg-white border-b border-border px-6 py-3 flex items-center justify-between shrink-0">
      <div>
        <p className="font-semibold text-text-h text-sm">{patient.name}</p>
        <p className="text-xs text-gray-500">
          {[patient.birthDate && `DOB: ${patient.birthDate}`, patient.gender].filter(Boolean).join(' · ')}
        </p>
      </div>
      <button
        onClick={handleSwitch}
        className="text-xs text-gray-500 hover:text-text-h border border-border hover:border-gray-400 px-3 py-1.5 rounded-lg transition-colors"
      >
        Switch Patient
      </button>
    </header>
  );
}
