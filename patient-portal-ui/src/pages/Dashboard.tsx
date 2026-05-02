import { mockPatient, mockMedications, mockDiagnoses, mockLabResults, mockAppointments } from '../data/mockData';
import styles from './Dashboard.module.css';

export default function Dashboard({ onNavigate }: { onNavigate: (page: string) => void }) {
  const activeMeds   = mockMedications.filter(m => m.status === 'active').length;
  const activeDx     = mockDiagnoses.filter(d => d.status === 'active').length;
  const upcomingApts = mockAppointments.filter(a => a.status === 'upcoming').length;
  const abnormalLabs = mockLabResults.filter(l => l.status !== 'normal').length;

  const nextApt = mockAppointments
    .filter(a => a.status === 'upcoming')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];

  const recentLabs = mockLabResults.slice(0, 4);

  return (
    <div className={styles.page}>
      {/* Greeting banner */}
      <div className={`${styles.banner} fade-up`}>
        <div className={styles.bannerText}>
          <h2>Good morning, {mockPatient.name.split(' ')[0]} 👋</h2>
          <p>Here's a summary of your health at a glance. Your next appointment is coming up soon.</p>
        </div>
        <div className={styles.bannerStats}>
          <div className={styles.bannerStat}>
            <span className={styles.bannerStatValue}>{mockPatient.primaryCare}</span>
            <span className={styles.bannerStatLabel}>Primary Care</span>
          </div>
          <div className={styles.bannerDivider} />
          <div className={styles.bannerStat}>
            <span className={styles.bannerStatValue}>{mockPatient.insuranceId}</span>
            <span className={styles.bannerStatLabel}>Insurance ID</span>
          </div>
        </div>
      </div>

      {/* KPI cards */}
      <div className={styles.kpiGrid}>
        {[
          { label: 'Active Medications', value: activeMeds,   icon: '💊', color: 'teal',  page: 'medications'  },
          { label: 'Active Diagnoses',   value: activeDx,     icon: '🩺', color: 'blue',  page: 'diagnoses'    },
          { label: 'Upcoming Visits',    value: upcomingApts, icon: '📅', color: 'green', page: 'appointments' },
          { label: 'Abnormal Labs',      value: abnormalLabs, icon: '🧪', color: 'amber', page: 'lab-results'  },
        ].map((kpi, i) => (
          <button
            key={kpi.label}
            className={`${styles.kpiCard} card fade-up fade-up-${i + 1}`}
            onClick={() => onNavigate(kpi.page)}
          >
            <div className={`${styles.kpiIcon} ${styles[`kpiIcon_${kpi.color}`]}`}>{kpi.icon}</div>
            <div className={styles.kpiValue}>{kpi.value}</div>
            <div className={styles.kpiLabel}>{kpi.label}</div>
            <span className={styles.kpiArrow}>→</span>
          </button>
        ))}
      </div>

      <div className={styles.twoCol}>
        {/* Next appointment */}
        <div className={`${styles.section} card fade-up`}>
          <div className={styles.sectionHeader}>
            <h3>Next Appointment</h3>
            <button className={styles.sectionLink} onClick={() => onNavigate('appointments')}>View all →</button>
          </div>
          {nextApt ? (
            <div className={styles.aptCard}>
              <div className={styles.aptDate}>
                <span className={styles.aptDay}>{new Date(nextApt.date).getDate()}</span>
                <span className={styles.aptMonth}>{new Date(nextApt.date).toLocaleString('default', { month: 'short' })}</span>
              </div>
              <div className={styles.aptInfo}>
                <div className={styles.aptTitle}>{nextApt.title}</div>
                <div className={styles.aptMeta}>{nextApt.provider} · {nextApt.time}</div>
                <div className={styles.aptMeta}>{nextApt.location}</div>
                <span className={`badge badge-${nextApt.type === 'telehealth' ? 'upcoming' : 'active'}`}>
                  {nextApt.type === 'telehealth' ? '📹 Telehealth' : '🏥 In-Person'}
                </span>
              </div>
            </div>
          ) : (
            <p className={styles.empty}>No upcoming appointments</p>
          )}
        </div>

        {/* Recent lab results */}
        <div className={`${styles.section} card fade-up fade-up-1`}>
          <div className={styles.sectionHeader}>
            <h3>Recent Lab Results</h3>
            <button className={styles.sectionLink} onClick={() => onNavigate('lab-results')}>View all →</button>
          </div>
          <div className={styles.labList}>
            {recentLabs.map(lab => (
              <div key={lab.id} className={styles.labRow}>
                <div className={styles.labName}>{lab.name}</div>
                <div className={styles.labValue}>
                  <span className={styles.labNum}>{lab.value} {lab.unit}</span>
                  <span className={`badge badge-${lab.status}`}>{lab.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Active medications strip */}
      <div className={`${styles.section} card fade-up`}>
        <div className={styles.sectionHeader}>
          <h3>Active Medications</h3>
          <button className={styles.sectionLink} onClick={() => onNavigate('medications')}>View all →</button>
        </div>
        <div className={styles.medStrip}>
          {mockMedications.filter(m => m.status === 'active').map(med => (
            <div key={med.id} className={styles.medChip}>
              <span className={styles.medName}>{med.name}</span>
              <span className={styles.medDose}>{med.dosage} · {med.frequency}</span>
              {med.refillsRemaining <= 1 && (
                <span className={styles.refillAlert} title="Low refills">⚠️</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
