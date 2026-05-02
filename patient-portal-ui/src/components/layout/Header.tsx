import styles from './Header.module.css';

const PAGE_TITLES: Record<string, { title: string; subtitle: string }> = {
  dashboard:    { title: 'Dashboard',    subtitle: 'Welcome back, Alexandra' },
  medications:  { title: 'Medications',  subtitle: 'Your current prescriptions and history' },
  diagnoses:    { title: 'Diagnoses',    subtitle: 'Active and past medical conditions' },
  'lab-results':{ title: 'Lab Results',  subtitle: 'Recent laboratory tests and values' },
  appointments: { title: 'Appointments', subtitle: 'Upcoming visits and scheduling' },
};

interface HeaderProps {
  activePage: string;
}

export default function Header({ activePage }: HeaderProps) {
  const info = PAGE_TITLES[activePage] ?? { title: activePage, subtitle: '' };
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  });

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <h1 className={styles.title}>{info.title}</h1>
        <p className={styles.subtitle}>{info.subtitle}</p>
      </div>
      <div className={styles.right}>
        <div className={styles.date}>{today}</div>
        <div className={styles.notifBtn} title="Notifications">
          <span>🔔</span>
          <span className={styles.notifDot} />
        </div>
      </div>
    </header>
  );
}
