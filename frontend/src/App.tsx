import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { PatientProvider, usePatient } from './contexts/PatientContext';
import Sidebar from './components/Sidebar';
import PatientHeader from './components/PatientHeader';
import Chatbot from './components/Chatbot';
import SelectPatientPage from './pages/SelectPatientPage';
import LaunchPage from './pages/LaunchPage';
import CallbackPage from './pages/CallbackPage';
import DashboardPage from './pages/DashboardPage';
import MedicationsPage from './pages/MedicationsPage';
import ConditionsPage from './pages/ConditionsPage';
import LabResultsPage from './pages/LabResultsPage';
import AppointmentsPage from './pages/AppointmentsPage';

function PortalLayout() {
  const { patient } = usePatient();
  if (!patient) return <Navigate to="/" replace />;
  return (
    <div className="flex h-screen overflow-hidden bg-bg">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <PatientHeader />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
      <Chatbot />
    </div>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<SelectPatientPage />} />
      <Route path="/launch" element={<LaunchPage />} />
      <Route path="/callback" element={<CallbackPage />} />
      <Route path="/portal" element={<PortalLayout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="medications" element={<MedicationsPage />} />
        <Route path="conditions" element={<ConditionsPage />} />
        <Route path="labs" element={<LabResultsPage />} />
        <Route path="appointments" element={<AppointmentsPage />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <PatientProvider>
        <AppRoutes />
      </PatientProvider>
    </BrowserRouter>
  );
}
