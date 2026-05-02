import styles from './Sidebar.module.css';

interface NavItem {
  id: string;
  label: string;
  icon: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard',    label: 'Dashboard',    icon: '⬡' },
  { id: 'medications',  label: 'Medications',  icon: '💊' },
  { id: 'diagnoses',    label: 'Diagnoses',    icon: '🩺' },
  { id: 'lab-results',  label: 'Lab Results',  icon: '🧪' },
  { id: 'appointments', label: 'Appointments', icon: '📅' },
];

interface SidebarProps {
  activePage: string;
  onNavigate: (page: string) => void;
  chatOpen: boolean;
  onToggleChat: () => void;
}

export default function Sidebar({ activePage, onNavigate, chatOpen, onToggleChat }: SidebarProps) {
  return (
    <aside className={styles.sidebar}>
      {/* Logo */}
      <div className={styles.logo}>
        <div className={styles.logoMark}>
          <span>+</span>
        </div>
        <div>
          <div className={styles.logoName}>HealthBridge</div>
          <div className={styles.logoSub}>Patient Portal</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className={styles.nav}>
        <div className={styles.navGroup}>
          <span className={styles.navLabel}>Main Menu</span>
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              className={`${styles.navItem} ${activePage === item.id ? styles.active : ''}`}
              onClick={() => onNavigate(item.id)}
            >
              <span className={styles.navIcon}>{item.icon}</span>
              <span className={styles.navText}>{item.label}</span>
              {activePage === item.id && <span className={styles.activeIndicator} />}
            </button>
          ))}
        </div>
      </nav>

      {/* Chat toggle */}
      <div className={styles.chatToggleWrap}>
        <button
          className={`${styles.chatToggle} ${chatOpen ? styles.chatActive : ''}`}
          onClick={onToggleChat}
        >
          <span className={styles.chatIcon}>
            {chatOpen ? '✕' : '💬'}
          </span>
          <span>{chatOpen ? 'Close Assistant' : 'Ask Assistant'}</span>
          {!chatOpen && <span className={styles.chatBadge}>AI</span>}
        </button>
      </div>

      {/* Profile */}
      <div className={styles.profile}>
        <div className={styles.avatar}>AC</div>
        <div className={styles.profileInfo}>
          <div className={styles.profileName}>Alexandra Chen</div>
          <div className={styles.profileId}>ID: pt-001</div>
        </div>
      </div>
    </aside>
  );
}
