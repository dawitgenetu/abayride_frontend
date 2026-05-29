import React, { useState } from 'react';
import { Search, Sun, Moon, ChevronDown, LogOut } from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { NotificationBell } from './NotificationBell';

const TAB_LABELS = {
  overview: 'Overview',
  users: 'Users',
  drivers: 'Drivers',
  fleet: 'Live map',
  rides: 'Rides',
  payments: 'Payments',
  withdrawals: 'Withdrawals',
  analytics: 'Analytics',
  notifications: 'Alerts',
  settings: 'Settings',
};

export const Navbar = ({ isDark, setIsDark, isSidebarOpen, onLogout, currentTab }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const email = localStorage.getItem('admin_email') || 'admin@abayride.com';
  const displayName = email.split('@')[0];
  const initials = displayName.slice(0, 2).toUpperCase();
  const pageLabel = TAB_LABELS[currentTab] || 'Dashboard';

  return (
    <header
      className="fixed top-0 right-0 h-[4.25rem] glass flex items-center justify-between z-20 transition-all duration-300 px-5 border-b border-gray-100/60 dark:border-dark-border/40"
      style={{ left: isSidebarOpen ? '16rem' : '4.75rem' }}
    >
      {/* Breadcrumb / mobile brand */}
      <div className="flex items-center gap-4 min-w-0 flex-1">
        <div className="hidden md:flex items-center gap-2 text-sm">
          <span className="text-gray-400 dark:text-dark-muted font-medium">Abay Ride</span>
          <span className="text-gray-300 dark:text-dark-border">/</span>
          <span className="font-semibold text-secondary dark:text-white">{pageLabel}</span>
        </div>
        <div className="md:hidden">
          <BrandLogo size="sm" showText subtitle={null} />
        </div>
        <div className="flex-1 max-w-sm relative group hidden sm:block">
          <Search
            size={14}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors"
          />
          <input
            type="text"
            placeholder="Quick search…"
            className="w-full bg-gray-100/80 dark:bg-dark-border/30 border border-transparent focus:border-primary/25 focus:bg-white dark:focus:bg-dark-surface rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none dark:text-white placeholder:text-gray-400 transition-all duration-150"
          />
        </div>
      </div>

      <div className="flex items-center gap-1.5 ml-4 shrink-0">
        <button
          onClick={() => setIsDark(!isDark)}
          className="btn-icon"
          title={isDark ? 'Light mode' : 'Dark mode'}
        >
          {isDark ? <Sun size={15} /> : <Moon size={15} />}
        </button>

        <NotificationBell />

        <div className="w-px h-6 bg-gray-200 dark:bg-dark-border mx-1" />

        <div className="relative">
          <button
            onClick={() => setDropdownOpen((v) => !v)}
            className="flex items-center gap-2.5 pl-1 pr-2.5 py-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-dark-border/40 transition-all duration-150"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-blue-600 text-white rounded-xl flex items-center justify-center font-bold text-xs shadow-glow">
              {initials}
            </div>
            <div className="text-left hidden lg:block">
              <p className="text-xs font-bold text-secondary dark:text-white leading-tight capitalize">
                {displayName}
              </p>
              <p className="text-[10px] text-gray-400 dark:text-dark-muted leading-tight">Administrator</p>
            </div>
            <ChevronDown
              size={12}
              className={`text-gray-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {dropdownOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
              <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-dark-surface border border-gray-100 dark:border-dark-border rounded-2xl shadow-premium z-20 overflow-hidden animate-fade-in">
                <div className="px-4 py-3 border-b border-gray-100 dark:border-dark-border bg-gradient-to-br from-primary/5 to-transparent">
                  <div className="flex items-center gap-3">
                    <img src="/logo.png" alt="" className="w-9 h-9 rounded-xl object-contain bg-white ring-1 ring-gray-100" />
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-secondary dark:text-white capitalize truncate">
                        {displayName}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-dark-muted truncate">{email}</p>
                    </div>
                  </div>
                </div>
                <div className="p-1.5">
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      onLogout?.();
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors"
                  >
                    <LogOut size={14} />
                    Sign out
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
