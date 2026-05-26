import React, { useState } from 'react';
import { Bell, ChevronRight, RefreshCw, UserCheck, CreditCard, MapPin, DollarSign } from 'lucide-react';
import { useNotifications } from '../context/NotificationsContext';

const ICONS = {
  drivers: UserCheck,
  payments: CreditCard,
  rides: MapPin,
  withdrawals: DollarSign,
};

const SEVERITY_STYLES = {
  warn: 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400',
  danger: 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400',
  info: 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400',
};

export function NotificationBell() {
  const { items, totalCount, loading, refresh, navigate } = useNotifications();
  const [open, setOpen] = useState(false);

  const badgeLabel = totalCount > 99 ? '99+' : totalCount;

  const handleItemClick = (item) => {
    setOpen(false);
    navigate(item.tab);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="btn-icon relative"
        title="Notifications"
        aria-label={`Notifications${totalCount ? `, ${totalCount} pending` : ''}`}
      >
        <Bell size={15} />
        {totalCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-extrabold ring-2 ring-white dark:ring-dark-surface">
            {badgeLabel}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} aria-hidden />
          <div className="absolute right-0 top-full mt-2 w-[340px] max-w-[calc(100vw-2rem)] bg-white dark:bg-dark-surface border border-gray-100 dark:border-dark-border rounded-2xl shadow-premium z-40 overflow-hidden animate-fade-in">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-dark-border">
              <div>
                <p className="text-sm font-bold text-secondary dark:text-white">Notifications</p>
                <p className="text-[11px] text-gray-400 dark:text-dark-muted">
                  {totalCount > 0 ? `${totalCount} item${totalCount !== 1 ? 's' : ''} need attention` : 'All caught up'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => refresh()}
                className="btn-icon w-8 h-8"
                title="Refresh"
              >
                <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
              </button>
            </div>

            <div className="max-h-[320px] overflow-y-auto">
              {loading && items.length === 0 ? (
                <p className="px-4 py-8 text-center text-sm text-gray-400 dark:text-dark-muted">Loading…</p>
              ) : items.length === 0 ? (
                <div className="px-4 py-10 text-center">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-green-50 dark:bg-green-500/10 flex items-center justify-center">
                    <Bell size={20} className="text-green-500" />
                  </div>
                  <p className="text-sm font-bold text-secondary dark:text-white">All clear</p>
                  <p className="text-xs text-gray-400 dark:text-dark-muted mt-1">No pending actions right now</p>
                </div>
              ) : (
                <ul className="p-1.5">
                  {items.map((item) => {
                    const Icon = ICONS[item.type] || Bell;
                    const colorClass = SEVERITY_STYLES[item.severity] || SEVERITY_STYLES.info;
                    return (
                      <li key={item.id}>
                        <button
                          type="button"
                          onClick={() => handleItemClick(item)}
                          className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-dark-bg text-left transition-colors"
                        >
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${colorClass}`}>
                            <Icon size={18} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-secondary dark:text-white truncate">
                              {item.title}
                            </p>
                            <p className="text-[11px] text-gray-400 dark:text-dark-muted truncate">
                              {item.description}
                            </p>
                          </div>
                          <span className="shrink-0 min-w-[22px] h-[22px] flex items-center justify-center rounded-full bg-primary text-white text-[11px] font-bold px-1.5">
                            {item.count}
                          </span>
                          <ChevronRight size={14} className="text-gray-300 dark:text-dark-muted shrink-0" />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            <div className="p-2 border-t border-gray-100 dark:border-dark-border">
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  navigate('notifications');
                }}
                className="w-full py-2.5 text-xs font-bold text-primary hover:bg-primary/5 dark:hover:bg-primary/10 rounded-xl transition-colors"
              >
                View all alerts
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
