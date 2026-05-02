import { useState, useRef, useEffect } from 'react';
import { usePatient } from '../contexts/PatientContext';
import { fetchMedications, fetchConditions, fetchLabs, fetchAppointments, sendChatMessage } from '../services/api';
import type { ChatMessage } from '../types/fhir';

const SUGGESTED_PROMPTS = [
  'What are my current medications?',
  'Do I have any abnormal lab results?',
  'When is my next appointment?',
];

function buildContext(data: {
  patient: { name: string; birthDate: string; gender: string };
  meds: { name: string; status: string; dosageText?: string }[];
  conditions: { name: string; clinicalStatus: string }[];
  labs: { name: string; value: string; unit: string; interpretation?: string }[];
  appointments: { description: string; start: string; status: string }[];
}): string {
  return `Patient: ${data.patient.name}, DOB: ${data.patient.birthDate}, Gender: ${data.patient.gender}

MEDICATIONS (${data.meds.length}):
${data.meds.map(m => `- ${m.name} (${m.status})${m.dosageText ? ': ' + m.dosageText : ''}`).join('\n') || 'None'}

CONDITIONS (${data.conditions.length}):
${data.conditions.map(c => `- ${c.name} (${c.clinicalStatus})`).join('\n') || 'None'}

LAB RESULTS (${data.labs.length}${data.labs.length > 20 ? ', showing first 20' : ''}):
${data.labs.slice(0, 20).map(l => `- ${l.name}: ${l.value} ${l.unit}${l.interpretation ? ' [' + l.interpretation + ']' : ''}`).join('\n') || 'None'}

APPOINTMENTS (${data.appointments.length}${data.appointments.length > 10 ? ', showing first 10' : ''}):
${data.appointments.slice(0, 10).map(a => `- ${a.description} on ${a.start} (${a.status})`).join('\n') || 'None'}`.trim();
}

const INITIAL_MESSAGE: ChatMessage = {
  role: 'assistant',
  content: 'Hi! I can help you understand your health data. Ask me about your medications, lab results, conditions, or appointments.',
};

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [context, setContext] = useState('');
  const [contextLoaded, setContextLoaded] = useState(false);
  const { patient, accessToken, fhirBaseUrl } = usePatient();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!isOpen || contextLoaded || !patient) return;
    Promise.allSettled([
      fetchMedications(patient.id, accessToken, fhirBaseUrl),
      fetchConditions(patient.id, accessToken, fhirBaseUrl),
      fetchLabs(patient.id, accessToken, fhirBaseUrl),
      fetchAppointments(patient.id, accessToken, fhirBaseUrl),
    ]).then(([medsRes, condRes, labsRes, apptRes]) => {
      setContext(buildContext({
        patient,
        meds: medsRes.status === 'fulfilled' ? medsRes.value : [],
        conditions: condRes.status === 'fulfilled' ? condRes.value : [],
        labs: labsRes.status === 'fulfilled' ? labsRes.value : [],
        appointments: apptRes.status === 'fulfilled' ? apptRes.value : [],
      }));
      setContextLoaded(true);
    });
  }, [isOpen, contextLoaded, patient]);

  const handleSend = async (text = input.trim()) => {
    if (!text || sending) return;
    setInput('');
    const history = messages.slice(1);
    setMessages(prev => [...prev, { role: 'user', content: text }]);
    setSending(true);
    try {
      const reply = await sendChatMessage(text, context || `Patient: ${patient?.name || 'Unknown'}`, history);
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch (e: any) {
      setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${e.message}` }]);
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(o => !o)}
        className="fixed bottom-6 right-6 w-12 h-12 bg-primary text-white rounded-full shadow-lg flex items-center justify-center text-lg hover:opacity-90 transition-opacity z-50"
        aria-label="Toggle chat"
      >
        {isOpen ? '✕' : '💬'}
      </button>

      {isOpen && (
        <div className="fixed bottom-20 right-6 w-80 bg-white border border-border rounded-xl shadow-xl flex flex-col z-50 overflow-hidden" style={{ height: 420 }}>
          <div className="px-4 py-3 border-b border-border bg-primary-bg shrink-0">
            <p className="font-semibold text-sm text-text-h">Health Assistant</p>
            <p className="text-xs text-gray-500">Powered by Claude AI</p>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] px-3 py-2 rounded-xl text-sm leading-relaxed ${
                    msg.role === 'user' ? 'bg-primary text-white' : 'bg-gray-100 text-text-h'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {messages.length === 1 && contextLoaded && (
              <div className="flex flex-col gap-1.5">
                {SUGGESTED_PROMPTS.map(prompt => (
                  <button
                    key={prompt}
                    onClick={() => handleSend(prompt)}
                    className="text-left text-xs px-3 py-2 rounded-lg bg-gray-50 border border-border text-text-h hover:bg-primary-bg transition-colors"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            )}
            {sending && (
              <div className="flex justify-start">
                <div className="bg-gray-100 px-3 py-2 rounded-xl text-sm text-gray-400">Thinking…</div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className="p-3 border-t border-border flex gap-2 shrink-0">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
              disabled={!contextLoaded}
              placeholder={contextLoaded ? 'Ask about your health data…' : 'Loading your health data…'}
              className="flex-1 text-sm border border-border rounded-lg px-3 py-2 outline-none focus:border-primary disabled:bg-gray-50 disabled:text-gray-400"
            />
            <button
              onClick={() => handleSend()}
              disabled={sending || !input.trim() || !contextLoaded}
              className="bg-primary text-white px-3 py-2 rounded-lg text-sm disabled:opacity-40 hover:opacity-90 transition-opacity"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
}
