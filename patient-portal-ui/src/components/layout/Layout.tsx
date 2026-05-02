import { type ReactNode } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import styles from './Layout.module.css';

interface LayoutProps {
  children: ReactNode;
  activePage: string;
  onNavigate: (page: string) => void;
  chatOpen: boolean;
  onToggleChat: () => void;
}

export default function Layout({ children, activePage, onNavigate, chatOpen, onToggleChat }: LayoutProps) {
  return (
    <div className={styles.root}>
      <Sidebar
        activePage={activePage}
        onNavigate={onNavigate}
        chatOpen={chatOpen}
        onToggleChat={onToggleChat}
      />
      <div className={`${styles.main} ${chatOpen ? styles.chatShift : ''}`}>
        <Header activePage={activePage} />
        <main className={styles.content}>
          {children}
        </main>
      </div>
    </div>
  );
}
