import React from 'react';
import {
  Bell, RefreshCw, UserCheck, CreditCard, MapPin, DollarSign, ChevronRight,
} from 'lucide-react';
import { PageHeader } from './PageHeader';
import { useNotifications } from '../context/NotificationsContext';
import { Skeleton } from './ui/Skeleton';

const ICONS = {
  drivers: UserCheck,
  payments: CreditCard,
  rides: MapPin,
  withdrawals: DollarSign,
};

const SEVERITY_CARD = {
  warn: 'border-amber-200 dark:border-amber-500/30 bg-amber-50/50 dark:bg-amber-500/5',
  danger: 'border-red-200 dark:border-red-500/30 bg-red-50/50 dark:bg-red-500/5',
  info: 'border-blue-200 dark:border-blue-500/30 bg-blue-50/50 dark:bg-blue-500/5',
};

const ICON_BG = {
  warn: 'bg-orange-50 dark:bg-orange-500/10 text-orange-500',
  danger: 'bg-red-50 dark:bg-red-500/10 text-red-500',
  info: 'bg-blue-50 dark:bg-blue-500/10 text-blue-500',
};

export const NotificationsPanel = ({ setTab }) => {
  const { summary, items, totalCount, loading, error, refresh, navigate } = useNotifications();

  const handleGo = (tab) => {
    if (setTab) setTab(tab);
    else navigate(tab);
  };

  return (
    <div className="animate-slide-up">
      <PageHeader
        badge="Live"
        title="Alerts"
        subtitle="System notifications and items that need your attention."
        actions={
          <button type="button" onClick={refresh} className="btn-ghost flex items-center gap-2 text-sm">
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
        }
      />

      {error && (
        <div className="mb-6 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl px-4 py-3 flex items-center gap-3">
          <span className="text-red-600 dark:text-red-400 text-sm font-medium flex-1">{error}</span>
          <button type="button" onClick={refresh} className="text-xs font-bold text-red-500 hover:underline">
            Retry
          </button>
        </div>
      )}

      {loading && !summary ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28 w-full rounded-3xl" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="card p-16 flex flex-col items-center justify-center gap-3 text-center rounded-3xl">
          <div className="w-14 h-14 rounded-2xl bg-green-50 dark:bg-green-500/10 flex items-center justify-center">
            <Bell size={24} className="text-green-500" />
          </div>
          <p className="font-bold text-secondary dark:text-white text-lg">All clear</p>
          <p className="text-sm text-gray-400 dark:text-dark-muted max-w-sm">
            No pending driver approvals, withdrawals, ride requests, or failed payments right now.
          </p>
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-500 dark:text-dark-muted mb-4">
            <span className="font-bold text-secondary dark:text-white">{totalCount}</span>
            {' '}total item{totalCount !== 1 ? 's' : ''} across {items.length} alert type{items.length !== 1 ? 's' : ''}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {items.map((item) => {
              const Icon = ICONS[item.type] || Bell;
              const cardClass = SEVERITY_CARD[item.severity] || SEVERITY_CARD.info;
              const iconClass = ICON_BG[item.severity] || ICON_BG.info;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleGo(item.tab)}
                  className={`card p-6 text-left rounded-3xl border-2 hover:-translate-y-0.5 hover:shadow-lg transition-all flex items-center gap-5 group ${cardClass}`}
                >
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${iconClass}`}>
                    <Icon size={24} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-gray-400 dark:text-dark-muted uppercase tracking-widest mb-1">
                      {item.type}
                    </p>
                    <p className="text-lg font-extrabold text-secondary dark:text-white leading-tight">
                      {item.title}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-dark-muted mt-1">{item.description}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <span className="text-3xl font-extrabold text-secondary dark:text-white">{item.count}</span>
                    <span className="flex items-center gap-1 text-xs font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                      Open <ChevronRight size={12} />
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};
