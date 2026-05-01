import { useState } from 'react';
import { mockLabResults } from '../data/mockData';
import styles from './LabResults.module.css';

const CATEGORIES = ['All', ...Array.from(new Set(mockLabResults.map(l => l.category)))];

export default function LabResults() {
  const [category, setCategory] = useState('All');

  const filtered = category === 'All'
    ? mockLabResults
    : mockLabResults.filter(l => l.category === category);

  const normal   = mockLabResults.filter(l => l.status === 'normal').length;
  const abnormal = mockLabResults.filter(l => l.status !== 'normal').length;

  return (
    <div className={styles.page}>
      {/* Summary bar */}
      <div className={`${styles.summaryBar} fade-up`}>
        <div className={`${styles.sumItem} card`}>
          <span className={styles.sumValue}>{mockLabResults.length}</span>
          <span className={styles.sumLabel}>Total Tests</span>
        </div>
        <div className={`${styles.sumItem} card`}>
          <span className={`${styles.sumValue} ${styles.green}`}>{normal}</span>
          <span className={styles.sumLabel}>Normal</span>
        </div>
        <div className={`${styles.sumItem} card`}>
          <span className={`${styles.sumValue} ${styles.amber}`}>{abnormal}</span>
          <span className={styles.sumLabel}>Out of Range</span>
        </div>
        <div className={`${styles.sumItem} card`}>
          <span className={styles.sumValue}>{mockLabResults[0]?.date}</span>
          <span className={styles.sumLabel}>Last Drawn</span>
        </div>
      </div>

      {/* Category pills */}
      <div className={`${styles.pills} fade-up`}>
        {CATEGORIES.map(c => (
          <button
            key={c}
            className={`${styles.pill} ${category === c ? styles.pillActive : ''}`}
            onClick={() => setCategory(c)}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Results table */}
      <div className={`card ${styles.tableWrap} fade-up`}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Test Name</th>
              <th>Category</th>
              <th>Value</th>
              <th>Reference Range</th>
              <th>Status</th>
              <th>Date</th>
              <th>Ordered By</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((lab, i) => (
              <tr
                key={lab.id}
                className={`${styles.row} ${lab.status !== 'normal' ? styles.rowAbnormal : ''} fade-up`}
                style={{ animationDelay: `${i * 0.04}s` }}
              >
                <td>
                  <div className={styles.labName}>{lab.name}</div>
                  {lab.notes && <div className={styles.labNote}>{lab.notes}</div>}
                </td>
                <td><span className={styles.categoryTag}>{lab.category}</span></td>
                <td>
                  <span className={`${styles.valueCell} ${styles[`value_${lab.status}`]}`}>
                    {lab.value} <span className={styles.unit}>{lab.unit}</span>
                  </span>
                </td>
                <td className={styles.refRange}>{lab.referenceRange}</td>
                <td><span className={`badge badge-${lab.status}`}>{lab.status}</span></td>
                <td className={styles.dateCell}>{new Date(lab.date).toLocaleDateString()}</td>
                <td className={styles.providerCell}>{lab.orderedBy}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
