import { mockDiagnoses } from '../data/mockData';
import styles from './Diagnoses.module.css';

const SEVERITY_COLOR: Record<string, string> = {
  mild: 'green',
  moderate: 'amber',
  severe: 'red',
};

export default function Diagnoses() {
  const active   = mockDiagnoses.filter(d => d.status === 'active');
  const resolved = mockDiagnoses.filter(d => d.status !== 'active');

  return (
    <div className={styles.page}>
      {/* Active */}
      <section className="fade-up">
        <h2 className={styles.sectionTitle}>Active Conditions</h2>
        <div className={styles.grid}>
          {active.map((dx, i) => (
            <div
              key={dx.id}
              className={`card ${styles.dxCard} fade-up`}
              style={{ animationDelay: `${i * 0.06}s` }}
            >
              <div className={styles.dxTop}>
                <span className={`${styles.code} badge`}>{dx.code}</span>
                <span className={`badge badge-${dx.status}`}>{dx.status}</span>
              </div>
              <h3 className={styles.dxName}>{dx.display}</h3>
              <div className={styles.dxMeta}>
                <span className={styles.metaChip}>🏥 {dx.category}</span>
                <span className={styles.metaChip}>📅 Since {new Date(dx.onsetDate).toLocaleDateString()}</span>
              </div>
              {dx.severity && (
                <div className={styles.severityRow}>
                  <span className={styles.severityLabel}>Severity:</span>
                  <div className={styles.severityBar}>
                    {(['mild','moderate','severe'] as const).map(s => (
                      <span
                        key={s}
                        className={`${styles.severitySegment} ${dx.severity === s || (dx.severity === 'severe' && s !== 'severe') || (dx.severity === 'moderate' && s === 'mild') ? styles[`seg_${SEVERITY_COLOR[dx.severity ?? 'mild']}`] : styles.segEmpty}`}
                        title={s}
                      />
                    ))}
                  </div>
                  <span className={`badge badge-${dx.severity === 'severe' ? 'cancelled' : dx.severity === 'moderate' ? 'on-hold' : 'active'}`}>
                    {dx.severity}
                  </span>
                </div>
              )}
              {dx.notes && (
                <p className={styles.notes}>{dx.notes}</p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Resolved / Inactive */}
      {resolved.length > 0 && (
        <section className="fade-up fade-up-2">
          <h2 className={styles.sectionTitle}>Past Conditions</h2>
          <div className={styles.resolvedList}>
            {resolved.map(dx => (
              <div key={dx.id} className={`card ${styles.resolvedCard}`}>
                <span className={`${styles.code} badge`}>{dx.code}</span>
                <span className={styles.resolvedName}>{dx.display}</span>
                <span className={styles.resolvedMeta}>{dx.category}</span>
                <span className={styles.resolvedMeta}>
                  {new Date(dx.onsetDate).toLocaleDateString()}
                </span>
                <span className={`badge badge-${dx.status}`}>{dx.status}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
