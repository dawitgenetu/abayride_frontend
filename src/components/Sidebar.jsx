import React from 'react';
import {
  LayoutDashboard, Users, Truck, MapPin, CreditCard, DollarSign,
  Bell, Settings, LogOut, BarChart3, ChevronLeft, ChevronRight, Zap,
} from 'lucide-react';

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

const NavItem = ({ icon: Icon, label, active, onClick, collapsed, badge }) => (
  <button
    onClick={onClick}
    title={collapsed ? label : undefined}
    className={`nav-item ${active ? 'nav-item-active' : 'nav-item-inactive'}`}
  >
    {/* Active indicator */}
    {active && (
      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-primary rounded-r-full" />
    )}
    <Icon size={17} className="shrink-0" />
    {!collapsed && <span className="truncate">{label}</span>}
    {!collapsed && badge && (
      <span className="ml-auto min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold px-1">
        {badge}
      </span>
    )}
    {collapsed && (
      <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-secondary dark:bg-dark-card text-white text-xs font-semibold rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap shadow-lg z-50 border border-dark-border">
        {label}
      </div>
    )}
  </button>
);

export const Sidebar = ({ currentTab, setTab, isOpen, setIsOpen, onLogout }) => (
  <aside
    className="fixed left-0 top-0 h-screen bg-white dark:bg-dark-surface border-r border-gray-100 dark:border-dark-border flex flex-col transition-all duration-300 z-30 shadow-premium"
    style={{ width: isOpen ? '15rem' : '4.5rem' }}
  >
    {/* Logo */}
    <div className={`flex items-center gap-3 px-4 h-16 border-b border-gray-100 dark:border-dark-border shrink-0 ${isOpen ? '' : 'justify-center'}`}>
      <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center shrink-0 shadow-glow">
        <Zap size={16} className="text-white" />
      </div>
      {isOpen && (
        <div>
          <p className="text-sm font-bold text-secondary dark:text-white leading-tight">Abay Ride</p>
          <p className="text-[10px] text-gray-400 dark:text-dark-muted font-medium">Admin Panel</p>
        </div>
      )}
    </div>

    {/* Nav */}
    <nav className="flex-1 overflow-y-auto px-2.5 py-4 space-y-0.5">
      {isOpen && (
        <p className="text-[10px] font-bold text-gray-300 dark:text-dark-muted uppercase tracking-widest px-3 mb-2">
          Menu
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
        />
      ))}
    </nav>

    {/* Footer */}
    <div className="px-2.5 py-3 border-t border-gray-100 dark:border-dark-border">
      <NavItem icon={LogOut} label="Sign Out" active={false} onClick={onLogout} collapsed={!isOpen} />
    </div>

    {/* Collapse toggle */}
    <button
      onClick={() => setIsOpen(!isOpen)}
      className="absolute -right-3 top-[4.5rem] w-6 h-6 bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-full flex items-center justify-center text-gray-400 hover:text-primary dark:hover:text-primary transition-all shadow-sm z-50"
    >
      {isOpen ? <ChevronLeft size={12} /> : <ChevronRight size={12} />}
    </button>
  </aside>
);
