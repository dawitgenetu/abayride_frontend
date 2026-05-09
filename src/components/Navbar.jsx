import React, { useState } from 'react';
import { Search, Bell, Sun, Moon, ChevronDown, LogOut, User } from 'lucide-react';

export const Navbar = ({ isDark, setIsDark, isSidebarOpen, onLogout }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const email = localStorage.getItem('admin_email') || 'admin@abayride.com';
  const displayName = email.split('@')[0];
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <header
      className="fixed top-0 right-0 h-16 glass flex items-center justify-between z-20 transition-all duration-300 px-5 border-b border-gray-100/60 dark:border-dark-border/40"
      style={{ left: isSidebarOpen ? '15rem' : '4.5rem' }}
    >
      {/* Search */}
      <div className="flex-1 max-w-xs relative group">
        <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" />
        <input
          type="text"
          placeholder="Search..."
          className="w-full bg-gray-100/70 dark:bg-dark-border/40 border border-transparent focus:border-primary/30 focus:bg-white dark:focus:bg-dark-surface rounded-xl pl-9 pr-4 py-2 text-sm outline-none dark:text-white placeholder:text-gray-400 transition-all duration-150"
        />
      </div>

      {/* Right */}
      <div className="flex items-center gap-1.5 ml-4">
        {/* Theme */}
        <button onClick={() => setIsDark(!isDark)} className="btn-icon" title={isDark ? 'Light mode' : 'Dark mode'}>
          {isDark ? <Sun size={15} /> : <Moon size={15} />}
        </button>

        {/* Notifications */}
        <button className="btn-icon relative">
          <Bell size={15} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full" />
        </button>

        <div className="w-px h-5 bg-gray-200 dark:bg-dark-border mx-1" />

        {/* User */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(v => !v)}
            className="flex items-center gap-2.5 pl-1 pr-2.5 py-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-dark-border/40 transition-all duration-150 group"
          >
            <div className="w-7 h-7 bg-gradient-to-br from-primary to-blue-500 text-white rounded-lg flex items-center justify-center font-bold text-xs shadow-sm">
              {initials}
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-xs font-semibold text-secondary dark:text-white leading-tight capitalize">{displayName}</p>
              <p className="text-[10px] text-gray-400 dark:text-dark-muted leading-tight">Administrator</p>
            </div>
            <ChevronDown size={12} className={`text-gray-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {dropdownOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
              <div className="absolute right-0 top-full mt-2 w-52 bg-white dark:bg-dark-surface border border-gray-100 dark:border-dark-border rounded-2xl shadow-premium z-20 overflow-hidden animate-fade-in">
                <div className="px-4 py-3 border-b border-gray-100 dark:border-dark-border">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-gradient-to-br from-primary to-blue-500 text-white rounded-xl flex items-center justify-center font-bold text-sm">
                      {initials}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-secondary dark:text-white capitalize">{displayName}</p>
                      <p className="text-xs text-gray-400 dark:text-dark-muted truncate max-w-[130px]">{email}</p>
                    </div>
                  </div>
                </div>
                <div className="p-1.5">
                  <button
                    onClick={() => { setDropdownOpen(false); onLogout?.(); }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors"
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
