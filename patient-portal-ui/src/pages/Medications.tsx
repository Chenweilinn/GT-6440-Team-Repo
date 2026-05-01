import { useState } from 'react';
import { mockMedications } from '../data/mockData';
import type { Medication } from '../types/fhir';
import styles from './Medications.module.css';

type Filter = 'all' | 'active' | 'stopped' | 'on-hold';

export default function Medications() {
  const [filter, setFilter] = useState<Filter>('all');
  const [selected, setSelected] = useState<Medication | null>(null);

  const filtered = filter === 'all'
    ? mockMedications
    : mockMedications.filter(m => m.status === filter);

  return (
    <div className={styles.page}>
      {/* Filter tabs */}
      <div className={`${styles.filterBar} card fade-up`}>
        {(['all', 'active', 'stopped', 'on-hold'] as Filter[]).map(f => (
          <button
            key={f}
            className={`${styles.filterBtn} ${filter === f ? styles.filterActive : ''}`}
            onClick={() => setFilter(f)}
          >
            {f === 'all' ? `All (${mockMedications.length})` : `${f.charAt(0).toUpperCase() + f.slice(1)} (${mockMedications.filter(m => m.status === f).length})`}
          </button>
        ))}
      </div>

      <div className={styles.layout}>
        {/* Med list */}
        <div className={styles.list}>
          {filtered.map((med, i) => (
            <button
              key={med.id}
              className={`${styles.medCard} card fade-up`}
              style={{ animationDelay: `${i * 0.05}s` }}
              onClick={() => setSelected(med === selected ? null : med)}
              data-active={selected?.id === med.id}
            >
              <div className={styles.medHeader}>
                <div>
                  <div className={styles.medName}>{med.name}</div>
                  <div className={styles.medDose}>{med.dosage} · {med.frequency}</div>
                </div>
                <span className={`badge badge-${med.status}`}>{med.status}</span>
              </div>

              <div className={styles.medMeta}>
                <span>👨‍⚕️ {med.prescriber}</span>
                <span>📅 Started {new Date(med.startDate).toLocaleDateString()}</span>
                {med.endDate && <span>Ended {new Date(med.endDate).toLocaleDateString()}</span>}
              </div>

              {med.status === 'active' && (
                <div className={styles.refillRow}>
                  <span className={styles.refillLabel}>Refills remaining:</span>
                  <div className={styles.refillPips}>
                    {Array.from({ length: 5 }).map((_, j) => (
                      <span
                        key={j}
                        className={`${styles.pip} ${j < med.refillsRemaining ? styles.pipFilled : ''}`}
                      />
                    ))}
                  </div>
                  <span className={`${styles.refillCount} ${med.refillsRemaining <= 1 ? styles.refillLow : ''}`}>
                    {med.refillsRemaining}
                  </span>
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Detail panel */}
        <div className={`${styles.detail} ${selected ? styles.detailVisible : ''}`}>
          {selected ? (
            <div className={`card ${styles.detailCard}`}>
              <div className={styles.detailHeader}>
                <h3>{selected.name}</h3>
                <button className={styles.closeBtn} onClick={() => setSelected(null)}>✕</button>
              </div>
              <span className={`badge badge-${selected.status}`}>{selected.status}</span>

              <div className={styles.detailGrid}>
                <div className={styles.detailItem}>
                  <span className={styles.detailKey}>Dosage</span>
                  <span className={styles.detailVal}>{selected.dosage}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailKey}>Frequency</span>
                  <span className={styles.detailVal}>{selected.frequency}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailKey}>Prescriber</span>
                  <span className={styles.detailVal}>{selected.prescriber}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailKey}>Start Date</span>
                  <span className={styles.detailVal}>{new Date(selected.startDate).toLocaleDateString()}</span>
                </div>
                {selected.endDate && (
                  <div className={styles.detailItem}>
                    <span className={styles.detailKey}>End Date</span>
                    <span className={styles.detailVal}>{new Date(selected.endDate).toLocaleDateString()}</span>
                  </div>
                )}
                {selected.status === 'active' && (
                  <div className={styles.detailItem}>
                    <span className={styles.detailKey}>Refills Left</span>
                    <span className={`${styles.detailVal} ${selected.refillsRemaining <= 1 ? styles.refillLow : ''}`}>
                      {selected.refillsRemaining}
                    </span>
                  </div>
                )}
              </div>

              {selected.instructions && (
                <div className={styles.instructions}>
                  <span className={styles.instructLabel}>📋 Instructions</span>
                  <p>{selected.instructions}</p>
                </div>
              )}

              {selected.status === 'active' && selected.refillsRemaining <= 1 && (
                <div className={styles.refillAlert}>
                  ⚠️ Low refills — contact your provider soon.
                </div>
              )}
            </div>
          ) : (
            <div className={`card ${styles.detailEmpty}`}>
              <span>💊</span>
              <p>Select a medication to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
