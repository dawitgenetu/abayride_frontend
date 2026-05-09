import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { DashboardOverview } from './components/DashboardOverview';
import { UserManagement } from './components/UserManagement';
import { DriversManagement } from './components/DriversManagement';
import { RidesManagement } from './components/RidesManagement';
import { PaymentsManagement } from './components/PaymentsManagement';
import { WithdrawalsManagement } from './components/WithdrawalsManagement';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { NotificationsPanel } from './components/NotificationsPanel';
import { SettingsPage } from './components/SettingsPage';
import { LoginPage } from './pages/LoginPage';
import { ToastProvider } from './context/ToastContext';

const PAGES = {
  overview: DashboardOverview,
  users: UserManagement,
  drivers: DriversManagement,
  rides: RidesManagement,
  payments: PaymentsManagement,
  withdrawals: WithdrawalsManagement,
  analytics: AnalyticsDashboard,
  notifications: NotificationsPanel,
  settings: SettingsPage,
};

function AppShell() {
  const [tab, setTab] = useState('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('admin_token'));

  const [isDark, setIsDark] = useState(() =>
    localStorage.getItem('theme') === 'dark' ||
    (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)
  );

  useEffect(() => {
    document.body.classList.toggle('dark', isDark);
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  const handleLogin = () => setIsLoggedIn(true);

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_email');
    setIsLoggedIn(false);
  };

  if (!isLoggedIn) {
    return <LoginPage onLogin={handleLogin} isDark={isDark} setIsDark={setIsDark} />;
  }

  const PageComponent = PAGES[tab] ?? PAGES.overview;

  return (
    <div className="min-h-screen bg-background dark:bg-dark-bg font-sans text-secondary dark:text-dark-text transition-colors duration-300">
      <Sidebar currentTab={tab} setTab={setTab} isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} onLogout={handleLogout} />
      <Navbar isDark={isDark} setIsDark={setIsDark} isSidebarOpen={isSidebarOpen} onLogout={handleLogout} />
      <main
        className="flex-1 transition-all duration-300"
        style={{ marginLeft: isSidebarOpen ? '15rem' : '4.5rem' }}
      >
        <div className="p-7 pt-24">
          {tab === 'settings'
            ? <SettingsPage isDark={isDark} setIsDark={setIsDark} />
            : <PageComponent />
          }
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AppShell />
    </ToastProvider>
  );
}
