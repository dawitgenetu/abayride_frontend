import React from 'react';
import {
  LayoutDashboard, Users, Truck, MapPin, CreditCard, DollarSign,
  Bell, Settings, LogOut, BarChart3, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { useNotifications } from '../context/NotificationsContext';

const NAV_ITEMS = [
  { id: 'overview',       label: 'Overview',    icon: LayoutDashboard },
  { id: 'users',          label: 'Users',       icon: Users },
  { id: 'drivers',        label: 'Drivers',     icon: Truck },
  { id: 'rides',          label: 'Rides',       icon: MapPin },
  { id: 'payments',       label: 'Payments',    icon: CreditCard },
  { id: 'withdrawals',    label: 'Withdrawals', icon: DollarSign },
  { id: 'analytics',      label: 'Analytics',   icon: BarChart3 },
  { id: 'notifications',  label: 'Alerts',      icon: Bell },
  { id: 'settings',       label: 'Settings',    icon: Settings },
];

const NavItem = ({ icon: Icon, label, active, onClick, collapsed }) => (
  <button
    onClick={onClick}
    title={collapsed ? label : undefined}
    className={`nav-item group ${active ? 'nav-item-active' : 'nav-item-inactive'}`}
  >
    {active && (
      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full" />
    )}
    <span
      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
        active
          ? 'bg-primary text-white shadow-sm'
          : 'bg-gray-100 dark:bg-dark-bg text-gray-500 dark:text-dark-muted group-hover:bg-gray-200 dark:group-hover:bg-dark-border'
      }`}
    >
      <Icon size={16} />
    </span>
    {!collapsed && <span className="truncate flex-1 text-left">{label}</span>}
    {collapsed && (
      <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-secondary dark:bg-dark-card text-white text-xs font-semibold rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap shadow-lg z-50 border border-dark-border">
        {label}
      </div>
    )}
  </button>
);

export const Sidebar = ({ currentTab, setTab, isOpen, setIsOpen, onLogout }) => {
  const { totalCount } = useNotifications();
  const alertsBadge = totalCount > 0 ? (totalCount > 99 ? '99+' : String(totalCount)) : undefined;

  return (
  <aside
    className="fixed left-0 top-0 h-screen bg-white/95 dark:bg-dark-surface/95 backdrop-blur-xl border-r border-gray-100 dark:border-dark-border flex flex-col transition-all duration-300 z-30 shadow-premium"
    style={{ width: isOpen ? '16rem' : '4.75rem' }}
  >
    {/* Logo */}
    <div
      className={`flex items-center h-[4.25rem] border-b border-gray-100 dark:border-dark-border shrink-0 px-3 ${
        isOpen ? '' : 'justify-center'
      }`}
    >
      <BrandLogo size={isOpen ? 'md' : 'sm'} showText={isOpen} subtitle={isOpen ? 'Admin Panel' : null} />
    </div>

    {/* Nav */}
    <nav className="flex-1 overflow-y-auto px-2.5 py-4 space-y-1">
      {isOpen && (
        <p className="text-[10px] font-bold text-gray-300 dark:text-dark-muted uppercase tracking-widest px-3 mb-2">
          Main menu
        </p>
      )}
      {NAV_ITEMS.map((item) => (
        <NavItem
          key={item.id}
          icon={item.icon}
          label={item.label}
          active={currentTab === item.id}
          onClick={() => setTab(item.id)}
          collapsed={!isOpen}
          badge={item.id === 'notifications' ? alertsBadge : undefined}
        />
      ))}
    </nav>

    {/* Footer */}
    <div className="px-2.5 py-3 border-t border-gray-100 dark:border-dark-border space-y-1">
      <NavItem icon={LogOut} label="Sign Out" active={false} onClick={onLogout} collapsed={!isOpen} />
    </div>

    {/* Collapse toggle */}
    <button
      onClick={() => setIsOpen(!isOpen)}
      className="absolute -right-3 top-[5rem] w-7 h-7 bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-full flex items-center justify-center text-gray-400 hover:text-primary hover:border-primary/30 dark:hover:text-primary transition-all shadow-md z-50"
      aria-label={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
    >
      {isOpen ? <ChevronLeft size={13} /> : <ChevronRight size={13} />}
    </button>
  </aside>
  );
};
