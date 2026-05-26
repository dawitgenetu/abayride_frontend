import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { fetchNotificationsSummary } from '../services/api';

const NotificationsContext = createContext({
  summary: null,
  items: [],
  totalCount: 0,
  loading: true,
  refresh: () => {},
  navigate: () => {},
});

const POLL_MS = 60_000;

function normalizeSummary(data) {
  if (!data) return { items: [], total: 0 };
  if (Array.isArray(data.items) && data.items.length > 0) return data;

  const items = [];
  const pd = data.pendingDrivers || 0;
  const fp = data.failedPayments || 0;
  const pw = data.pendingWithdrawals || 0;
  const rr = data.requestedRides || 0;

  if (pd > 0) {
    items.push({
      id: 'pending-drivers',
      type: 'drivers',
      title: 'Pending driver applications',
      description: 'Drivers awaiting your approval',
      count: pd,
      tab: 'drivers',
      severity: 'warn',
    });
  }
  if (pw > 0) {
    items.push({
      id: 'pending-withdrawals',
      type: 'withdrawals',
      title: 'Pending withdrawal requests',
      description: 'Review and approve driver payouts',
      count: pw,
      tab: 'withdrawals',
      severity: 'warn',
    });
  }
  if (rr > 0) {
    items.push({
      id: 'requested-rides',
      type: 'rides',
      title: 'Rides waiting for drivers',
      description: 'New ride requests not yet accepted',
      count: rr,
      tab: 'rides',
      severity: 'info',
    });
  }
  if (fp > 0) {
    items.push({
      id: 'failed-payments',
      type: 'payments',
      title: 'Failed payments (24h)',
      description: 'Payment transactions that failed recently',
      count: fp,
      tab: 'payments',
      severity: 'danger',
    });
  }

  return {
    ...data,
    items,
    total: data.total ?? pd + fp + pw + rr,
  };
}

export function NotificationsProvider({ children, onNavigate }) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    try {
      const { data } = await fetchNotificationsSummary();
      setSummary(normalizeSummary(data));
      setError(null);
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || 'Failed to load alerts');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, POLL_MS);
    return () => clearInterval(id);
  }, [refresh]);

  const items = useMemo(() => summary?.items ?? [], [summary]);

  const totalCount = useMemo(() => {
    if (typeof summary?.total === 'number') return summary.total;
    return items.reduce((s, i) => s + (i.count || 0), 0);
  }, [summary, items]);

  const navigate = useCallback(
    (tab) => {
      if (tab) onNavigate?.(tab);
    },
    [onNavigate],
  );

  const value = useMemo(
    () => ({ summary, items, totalCount, loading, error, refresh, navigate }),
    [summary, items, totalCount, loading, error, refresh, navigate],
  );

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  return useContext(NotificationsContext);
}
