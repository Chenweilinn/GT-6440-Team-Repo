import { useState, useRef, useEffect } from 'react';
import type { ChatMessage } from '../../types/fhir';
import {
  mockPatient,
  mockMedications,
  mockDiagnoses,
  mockLabResults,
  mockAppointments,
} from '../../data/mockData';
import styles from './ChatBot.module.css';

/* ── System prompt — injected with patient context ──────────────────── */
const buildSystemPrompt = () => `
You are a helpful, empathetic AI health assistant embedded in a patient portal.
Your role is to help the patient understand their health information, explain medical terms clearly, and assist with appointment-related questions.

IMPORTANT RULES:
- Never diagnose or prescribe. Always recommend contacting their provider for medical decisions.
- Be warm, clear, and reassuring. Avoid jargon. Explain terms when you use them.
- Keep answers concise (3–5 sentences max unless detailed explanation is requested).
- For scheduling requests, acknowledge them and explain the portal's scheduling feature.

PATIENT CONTEXT (from their FHIR record):
Patient: ${mockPatient.name}, DOB: ${mockPatient.birthDate}, Provider: ${mockPatient.primaryCare}

Active Medications:
${mockMedications.filter(m => m.status === 'active').map(m => `- ${m.name} ${m.dosage} ${m.frequency} (${m.refillsRemaining} refills left)`).join('\n')}

Active Diagnoses:
${mockDiagnoses.filter(d => d.status === 'active').map(d => `- ${d.display} (${d.code}) — ${d.severity ?? 'unspecified'} severity`).join('\n')}

Recent Lab Results:
${mockLabResults.map(l => `- ${l.name}: ${l.value} ${l.unit} (ref: ${l.referenceRange}) — ${l.status}`).join('\n')}

Upcoming Appointments:
${mockAppointments.filter(a => a.status === 'upcoming').map(a => `- ${a.title} with ${a.provider} on ${a.date} at ${a.time}`).join('\n')}
`.trim();

/* ── Quick prompts ─────────────────────────────────────────────────── */
const QUICK_PROMPTS = [
  'Explain my HbA1c result',
  'What are my upcoming appointments?',
  'Do I have any low refills?',
  'What does Metformin do?',
  'What is hypertension?',
  'Schedule an appointment',
];

interface ChatBotProps {
  isOpen: boolean;
}

export default function ChatBot({ isOpen }: ChatBotProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Hi ${mockPatient.name.split(' ')[0]}! 👋 I'm your health assistant. I can help you understand your lab results, medications, diagnoses, and appointments. What would you like to know?`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLTextAreaElement>(null);

  // Scroll to bottom on new message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 300);
  }, [isOpen]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: text.trim(),
      timestamp: new Date(),
    };

    const loadingMsg: ChatMessage = {
      id: `a-${Date.now()}`,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isLoading: true,
    };

    setMessages(prev => [...prev, userMsg, loadingMsg]);
    setInput('');
    setIsLoading(true);

    // Build conversation history for the API
    const history = messages
      .filter(m => !m.isLoading)
      .map(m => ({ role: m.role as 'user' | 'assistant', content: m.content }));

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          system: buildSystemPrompt(),
          messages: [...history, { role: 'user', content: text.trim() }],
        }),
      });

      const data = await response.json();
      const replyText = data.content
        ?.map((b: { type: string; text?: string }) => b.type === 'text' ? b.text : '')
        .join('') ?? 'Sorry, I couldn\'t generate a response.';

      setMessages(prev =>
        prev.map(m =>
          m.isLoading
            ? { ...m, content: replyText, isLoading: false }
            : m
        )
      );
    } catch {
      setMessages(prev =>
        prev.map(m =>
          m.isLoading
            ? { ...m, content: '⚠️ Unable to connect. Please try again.', isLoading: false }
            : m
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const clearChat = () => {
    setMessages([{
      id: 'welcome',
      role: 'assistant',
      content: `Hi ${mockPatient.name.split(' ')[0]}! 👋 I'm your health assistant. How can I help you today?`,
      timestamp: new Date(),
    }]);
  };

  return (
    <div className={`${styles.panel} ${isOpen ? styles.panelOpen : ''}`}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.botAvatar}>
            <span>✦</span>
          </div>
          <div>
            <div className={styles.botName}>Health Assistant</div>
            <div className={styles.botStatus}>
              <span className={styles.statusDot} />
              AI · Powered by Claude
            </div>
          </div>
        </div>
        <button className={styles.clearBtn} onClick={clearChat} title="Clear conversation">
          🗑
        </button>
      </div>

      {/* Messages */}
      <div className={styles.messages}>
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`${styles.message} ${msg.role === 'user' ? styles.userMsg : styles.botMsg}`}
          >
            {msg.role === 'assistant' && (
              <div className={styles.msgAvatar}>✦</div>
            )}
            <div className={styles.bubble}>
              {msg.isLoading ? (
                <div className={styles.typing}>
                  <span /><span /><span />
                </div>
              ) : (
                <p>{msg.content}</p>
              )}
              <span className={styles.msgTime}>
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Quick prompts */}
      {messages.length <= 1 && (
        <div className={styles.quickPrompts}>
          <p className={styles.quickLabel}>Try asking:</p>
          <div className={styles.quickList}>
            {QUICK_PROMPTS.map(q => (
              <button
                key={q}
                className={styles.quickBtn}
                onClick={() => sendMessage(q)}
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className={styles.inputArea}>
        <textarea
          ref={inputRef}
          className={styles.input}
          placeholder="Ask about your health data..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={2}
          disabled={isLoading}
        />
        <button
          className={`${styles.sendBtn} ${input.trim() && !isLoading ? styles.sendActive : ''}`}
          onClick={() => sendMessage(input)}
          disabled={!input.trim() || isLoading}
        >
          ↑
        </button>
      </div>

      <p className={styles.disclaimer}>
        For medical emergencies call 911. This assistant does not provide medical advice.
      </p>
    </div>
  );
}
