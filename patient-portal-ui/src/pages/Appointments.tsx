import { useState } from 'react';
import { mockAppointments } from '../data/mockData';
import type { Appointment } from '../types/fhir';
import styles from './Appointments.module.css';

type Filter = 'all' | 'upcoming' | 'completed' | 'cancelled';

export default function Appointments() {
  const [filter, setFilter] = useState<Filter>('all');
  const [showSchedule, setShowSchedule] = useState(false);
  const [rescheduleTarget, setRescheduleTarget] = useState<Appointment | null>(null);

  const filtered = filter === 'all'
    ? mockAppointments
    : mockAppointments.filter(a => a.status === filter);

  const sorted = [...filtered].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className={styles.page}>
      {/* Top bar */}
      <div className={`${styles.topBar} fade-up`}>
        <div className={styles.filters}>
          {(['all', 'upcoming', 'completed', 'cancelled'] as Filter[]).map(f => (
            <button
              key={f}
              className={`${styles.filterBtn} ${filter === f ? styles.filterActive : ''}`}
              onClick={() => setFilter(f)}
            >
              {f === 'all'
                ? `All (${mockAppointments.length})`
                : `${f.charAt(0).toUpperCase() + f.slice(1)} (${mockAppointments.filter(a => a.status === f).length})`}
            </button>
          ))}
        </div>
        <button className={styles.scheduleBtn} onClick={() => setShowSchedule(true)}>
          + Schedule Appointment
        </button>
      </div>

      {/* Appointment cards */}
      <div className={styles.list}>
        {sorted.map((apt, i) => (
          <div
            key={apt.id}
            className={`card ${styles.aptCard} ${apt.status === 'upcoming' ? styles.aptUpcoming : ''} fade-up`}
            style={{ animationDelay: `${i * 0.05}s` }}
          >
            {/* Date column */}
            <div className={`${styles.dateCol} ${apt.status !== 'upcoming' ? styles.dateColDim : ''}`}>
              <span className={styles.dateDay}>{new Date(apt.date).getDate()}</span>
              <span className={styles.dateMonth}>
                {new Date(apt.date).toLocaleString('default', { month: 'short' })}
              </span>
              <span className={styles.dateYear}>{new Date(apt.date).getFullYear()}</span>
            </div>

            {/* Divider */}
            <div className={styles.divider} />

            {/* Info */}
            <div className={styles.aptInfo}>
              <div className={styles.aptRow1}>
                <h3 className={styles.aptTitle}>{apt.title}</h3>
                <div className={styles.aptBadges}>
                  <span className={`badge badge-${apt.status}`}>{apt.status}</span>
                  <span className={`badge badge-${apt.type === 'telehealth' ? 'upcoming' : 'active'}`}>
                    {apt.type === 'telehealth' ? '📹 Telehealth' : '🏥 In-Person'}
                  </span>
                </div>
              </div>

              <div className={styles.aptMeta}>
                <span>👨‍⚕️ {apt.provider}</span>
                <span className={styles.dot}>·</span>
                <span>{apt.specialty}</span>
                <span className={styles.dot}>·</span>
                <span>🕐 {apt.time}</span>
                <span className={styles.dot}>·</span>
                <span>{apt.duration} min</span>
              </div>

              <div className={styles.aptLocation}>
                📍 {apt.location}
              </div>

              {apt.notes && (
                <div className={styles.aptNotes}>
                  📋 {apt.notes}
                </div>
              )}
            </div>

            {/* Actions */}
            {apt.status === 'upcoming' && (
              <div className={styles.aptActions}>
                <button
                  className={styles.rescheduleBtn}
                  onClick={() => setRescheduleTarget(apt)}
                >
                  Reschedule
                </button>
                <button className={styles.cancelBtn}>Cancel</button>
              </div>
            )}
          </div>
        ))}

        {sorted.length === 0 && (
          <div className={`card ${styles.empty}`}>
            <span>📅</span>
            <p>No appointments found for this filter.</p>
          </div>
        )}
      </div>

      {/* Schedule modal */}
      {showSchedule && (
        <ScheduleModal onClose={() => setShowSchedule(false)} />
      )}

      {/* Reschedule modal */}
      {rescheduleTarget && (
        <RescheduleModal
          appointment={rescheduleTarget}
          onClose={() => setRescheduleTarget(null)}
        />
      )}
    </div>
  );
}

/* ── Schedule new appointment modal ───────────────────────────────────── */
function ScheduleModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(1);

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={`card ${styles.modal}`} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>Schedule Appointment</h2>
          <button className={styles.modalClose} onClick={onClose}>✕</button>
        </div>

        {/* Steps indicator */}
        <div className={styles.steps}>
          {['Specialty', 'Provider', 'Date & Time', 'Confirm'].map((s, i) => (
            <div key={s} className={`${styles.step} ${step > i + 1 ? styles.stepDone : ''} ${step === i + 1 ? styles.stepActive : ''}`}>
              <span className={styles.stepNum}>{step > i + 1 ? '✓' : i + 1}</span>
              <span className={styles.stepLabel}>{s}</span>
            </div>
          ))}
        </div>

        {/* Step content */}
        {step === 1 && (
          <div className={styles.stepContent}>
            <p className={styles.stepPrompt}>What type of visit do you need?</p>
            <div className={styles.specialtyGrid}>
              {['Primary Care', 'Cardiology', 'Endocrinology', 'Dermatology', 'Orthopedics', 'Neurology'].map(s => (
                <button key={s} className={styles.specialtyBtn} onClick={() => setStep(2)}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className={styles.stepContent}>
            <p className={styles.stepPrompt}>Select a provider</p>
            <div className={styles.providerList}>
              {['Dr. Sarah Nguyen', 'Dr. James Park', 'Dr. Lisa Torres'].map(p => (
                <button key={p} className={styles.providerBtn} onClick={() => setStep(3)}>
                  <span className={styles.providerAvatar}>{p.split(' ').slice(-1)[0][0]}</span>
                  <div>
                    <div className={styles.providerName}>{p}</div>
                    <div className={styles.providerSub}>Next available: Apr 18</div>
                  </div>
                  <span className={styles.providerArrow}>→</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className={styles.stepContent}>
            <p className={styles.stepPrompt}>Pick a date and time</p>
            <div className={styles.dateTimeGrid}>
              <div className={styles.formGroup}>
                <label>Preferred Date</label>
                <input type="date" className={styles.input} />
              </div>
              <div className={styles.formGroup}>
                <label>Visit Type</label>
                <select className={styles.input}>
                  <option>In-Person</option>
                  <option>Telehealth</option>
                </select>
              </div>
            </div>
            <div className={styles.timeSlots}>
              {['8:00 AM', '9:30 AM', '11:00 AM', '1:00 PM', '2:30 PM', '4:00 PM'].map(t => (
                <button key={t} className={styles.timeSlot} onClick={() => setStep(4)}>{t}</button>
              ))}
            </div>
          </div>
        )}

        {step === 4 && (
          <div className={styles.stepContent}>
            <div className={styles.confirmCard}>
              <div className={styles.confirmIcon}>✓</div>
              <h3>Confirm Appointment</h3>
              <div className={styles.confirmDetails}>
                <div className={styles.confirmRow}><span>Provider</span><span>Dr. Sarah Nguyen</span></div>
                <div className={styles.confirmRow}><span>Specialty</span><span>Primary Care</span></div>
                <div className={styles.confirmRow}><span>Date</span><span>Selected date</span></div>
                <div className={styles.confirmRow}><span>Time</span><span>Selected time</span></div>
              </div>
              <div className={styles.formGroup}>
                <label>Notes for your provider (optional)</label>
                <textarea className={styles.textarea} placeholder="Reason for visit, symptoms, questions..." rows={3} />
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className={styles.modalFooter}>
          {step > 1 && (
            <button className={styles.backBtn} onClick={() => setStep(s => s - 1)}>← Back</button>
          )}
          {step === 4 && (
            <button className={styles.confirmBtn} onClick={onClose}>Confirm Appointment</button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Reschedule modal ─────────────────────────────────────────────────── */
function RescheduleModal({ appointment, onClose }: { appointment: Appointment; onClose: () => void }) {
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={`card ${styles.modal} ${styles.modalSm}`} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>Reschedule Appointment</h2>
          <button className={styles.modalClose} onClick={onClose}>✕</button>
        </div>

        <div className={styles.rescheduleInfo}>
          <div className={styles.rescheduleOld}>
            <span className={styles.rescheduleOldLabel}>Current:</span>
            <strong>{appointment.title}</strong>
            <span>{new Date(appointment.date).toLocaleDateString()} at {appointment.time}</span>
          </div>
        </div>

        <div className={styles.stepContent}>
          <div className={styles.dateTimeGrid}>
            <div className={styles.formGroup}>
              <label>New Date</label>
              <input type="date" className={styles.input} />
            </div>
            <div className={styles.formGroup}>
              <label>Reason for Change</label>
              <select className={styles.input}>
                <option>Scheduling conflict</option>
                <option>Provider unavailable</option>
                <option>Personal reason</option>
                <option>Other</option>
              </select>
            </div>
          </div>
          <div className={styles.timeSlots}>
            {['8:00 AM', '9:30 AM', '11:00 AM', '1:00 PM', '2:30 PM', '4:00 PM'].map(t => (
              <button key={t} className={styles.timeSlot}>{t}</button>
            ))}
          </div>
        </div>

        <div className={styles.modalFooter}>
          <button className={styles.backBtn} onClick={onClose}>Cancel</button>
          <button className={styles.confirmBtn} onClick={onClose}>Confirm Reschedule</button>
        </div>
      </div>
    </div>
  );
}
