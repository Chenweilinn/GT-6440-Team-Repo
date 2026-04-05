import { useState } from 'react';
import Layout from './components/layout/Layout';
import ChatBot from './components/chatbot/ChatBot';
import Dashboard    from './pages/Dashboard';
import Medications  from './pages/Medications';
import Diagnoses    from './pages/Diagnoses';
import LabResults   from './pages/LabResults';
import Appointments from './pages/Appointments';

type Page = 'dashboard' | 'medications' | 'diagnoses' | 'lab-results' | 'appointments';

export default function App() {
  const [page, setPage]         = useState<Page>('dashboard');
  const [chatOpen, setChatOpen] = useState(false);

  const navigate = (p: string) => setPage(p as Page);

  const renderPage = () => {
    switch (page) {
      case 'dashboard':    return <Dashboard onNavigate={navigate} />;
      case 'medications':  return <Medications />;
      case 'diagnoses':    return <Diagnoses />;
      case 'lab-results':  return <LabResults />;
      case 'appointments': return <Appointments />;
      default:             return <Dashboard onNavigate={navigate} />;
    }
  };

  return (
    <>
      <Layout
        activePage={page}
        onNavigate={navigate}
        chatOpen={chatOpen}
        onToggleChat={() => setChatOpen(o => !o)}
      >
        {renderPage()}
      </Layout>

      <ChatBot isOpen={chatOpen} />
    </>
  );
}
