import React, { useState, useEffect } from 'react';
import { Bell, AlertTriangle, UserCheck, CreditCard, RefreshCw } from 'lucide-react';
import { fetchNotificationsSummary } from '../services/api';
import { Skeleton } from './ui/Skeleton';
import { useToast } from '../context/ToastContext';

export const NotificationsPanel = () => {
  const toast = useToast();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await fetchNotificationsSummary();
      setSummary(data);
    } catch {
      toast('Failed to load notifications', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const items = summary ? [
    {
      icon: UserCheck,
      color: 'bg-orange-50 dark:bg-orange-500/10 text-orange-500',
      label: 'Pending Driver Applications',
      value: summary.pendingDrivers ?? 0,
      desc: 'Drivers awaiting approval',
    },
    {
      icon: CreditCard,
      color: 'bg-red-50 dark:bg-red-500/10 text-red-500',
      label: 'Failed Payments (24h)',
      value: summary.failedPayments ?? 0,
      desc: 'Transactions that failed in the last 24 hours',
    },
  ] : [];

  return (
    <div className="animate-slide-up space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-secondary dark:text-white tracking-tight">Alerts</h1>
          <p className="text-gray-400 dark:text-dark-muted text-sm mt-1">System notifications and pending actions.</p>
        </div>
        <button onClick={load} className="btn-ghost flex items-center gap-2 text-sm">
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => <Skeleton key={i} className="h-24 w-full" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {items.map(({ icon: Icon, color, label, value, desc }) => (
            <div key={label} className="bg-white dark:bg-dark-surface rounded-3xl border border-gray-100 dark:border-dark-border p-6 shadow-premium flex items-center gap-5">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${color}`}>
                <Icon size={24} />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 dark:text-dark-muted uppercase tracking-widest mb-1">{label}</p>
                <p className="text-3xl font-extrabold text-secondary dark:text-white">{value}</p>
                <p className="text-xs text-gray-400 dark:text-dark-muted mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && summary?.pendingDrivers === 0 && summary?.failedPayments === 0 && (
        <div className="bg-white dark:bg-dark-surface rounded-3xl border border-gray-100 dark:border-dark-border p-16 shadow-premium flex flex-col items-center justify-center gap-3 text-center">
          <div className="w-14 h-14 rounded-2xl bg-green-50 dark:bg-green-500/10 flex items-center justify-center">
            <Bell size={24} className="text-green-500" />
          </div>
          <p className="font-bold text-secondary dark:text-white">All clear</p>
          <p className="text-sm text-gray-400 dark:text-dark-muted">No pending actions or alerts right now.</p>
        </div>
      )}
    </div>
  );
};
