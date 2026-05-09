import React, { useState, useEffect } from 'react';
import { TrendingUp, Users, Truck, DollarSign, ArrowUpRight, Activity, Clock, RefreshCw } from 'lucide-react';
import { fetchAnalytics, fetchAnalyticsCharts, fetchNotificationsSummary } from '../services/api';
import { Skeleton } from './ui/Skeleton';

const StatCard = ({ label, value, icon: Icon, gradient, sub, loading }) => (
  <div className="stat-card group p-5 relative">
    <div className="flex items-start justify-between mb-4">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white bg-gradient-to-br ${gradient} shadow-sm`}>
        <Icon size={18} />
      </div>
    </div>
    <p className="text-[11px] font-semibold text-gray-400 dark:text-dark-muted uppercase tracking-wider mb-1">{label}</p>
    {loading
      ? <Skeleton className="h-6 w-24 mt-1" />
      : <p className="text-xl font-bold text-secondary dark:text-white tracking-tight">{value ?? '—'}</p>
    }
    {sub && <p className="text-[11px] text-gray-400 dark:text-dark-muted mt-1">{sub}</p>}
  </div>
);

const MiniBar = ({ value, max, color }) => (
  <div className="flex-1 h-1.5 bg-gray-100 dark:bg-dark-border rounded-full overflow-hidden">
    <div className={`h-full rounded-full ${color}`} style={{ width: `${Math.min(100, (value / Math.max(max, 1)) * 100)}%` }} />
  </div>
);

export const DashboardOverview = () => {
  const [stats, setStats]     = useState(null);
  const [charts, setCharts]   = useState(null);
  const [summary, setSummary] = useState(null);
  const [error, setError]     = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [analyticsRes, chartsRes, summaryRes] = await Promise.all([
        fetchAnalytics(),
        fetchAnalyticsCharts('week'),
        fetchNotificationsSummary(),
      ]);
      setStats(analyticsRes.data);
      setCharts(chartsRes.data);
      setSummary(summaryRes.data);
    } catch (e) {
      setError(e?.response?.data?.message || e?.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  // Build real ride chart from API data
  const rideData  = charts?.rides  ?? [];
  const maxRides  = Math.max(...rideData.map(d => d.count ?? 0), 1);

  return (
  <div className="space-y-6 animate-fade-in">
    {/* Header */}
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <p className="text-xs font-medium text-gray-400 dark:text-dark-muted mb-1">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
        <h1 className="page-title">Good morning, Admin 👋</h1>
        <p className="page-sub">Here's what's happening in Abay Ride today.</p>
      </div>
      <button onClick={load} className="btn-ghost flex items-center gap-2 text-sm py-2 shrink-0">
        <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
      </button>
    </div>

    {error && (
      <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl px-4 py-3 flex items-center gap-3">
        <span className="text-red-500 text-sm font-medium">{error}</span>
        <button onClick={load} className="ml-auto text-xs font-semibold text-red-500 hover:underline">Retry</button>
      </div>
    )}

    {/* Stats grid */}
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard loading={loading} label="Total Users"       value={stats?.usersCount?.toLocaleString()}          icon={Users}      gradient="from-blue-500 to-blue-600"    sub={`${stats?.activeDriversOnline ?? 0} online now`} />
      <StatCard loading={loading} label="Total Drivers"     value={stats?.driversCount?.toLocaleString()}         icon={Truck}      gradient="from-violet-500 to-violet-600" sub="Registered drivers" />
      <StatCard loading={loading} label="Completed Rides"   value={stats?.completedRidesCount?.toLocaleString()}  icon={Activity}   gradient="from-emerald-500 to-emerald-600" sub="All time" />
      <StatCard loading={loading}
        label="Platform Revenue (10%)"
        value={stats?.platformRevenue != null ? `${Number(stats.platformRevenue).toLocaleString()} ETB` : undefined}
        icon={DollarSign} gradient="from-amber-500 to-orange-500"
        sub={stats?.grossRevenue != null ? `Gross: ${Number(stats.grossRevenue).toLocaleString()} ETB` : undefined}
      />
    </div>

    {/* Charts + Activity */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      {/* Real rides bar chart */}
      <div className="lg:col-span-2 card p-5">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-semibold text-secondary dark:text-white text-sm">Rides This Week</h3>
            <p className="text-xs text-gray-400 dark:text-dark-muted mt-0.5">Daily ride volume</p>
          </div>
        </div>
        {loading ? (
          <div className="flex items-end gap-2 h-32">
            {[...Array(7)].map((_, i) => <Skeleton key={i} className="flex-1 rounded-lg" style={{ height: `${30 + Math.random() * 70}%` }} />)}
          </div>
        ) : rideData.length === 0 ? (
          <div className="h-32 flex items-center justify-center text-sm text-gray-400 dark:text-dark-muted">No ride data yet</div>
        ) : (
          <div className="flex items-end gap-2 h-32">
            {rideData.map((d) => (
              <div key={d.label} className="flex-1 flex flex-col items-center gap-1.5">
                <span className="text-[10px] font-semibold text-gray-400 dark:text-dark-muted">{d.count}</span>
                <div
                  className="w-full rounded-lg bg-primary/80 hover:bg-primary transition-colors duration-200 cursor-pointer"
                  style={{ height: `${(d.count / maxRides) * 100}%`, minHeight: 6 }}
                />
                <span className="text-[10px] text-gray-400 dark:text-dark-muted">{d.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Real recent rides feed */}
      <RecentRidesFeed />
    </div>

    {/* Quick stats row */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-2">
      {[
        { label: 'Pending Driver Applications', value: summary?.pendingDrivers ?? 0,  max: 20, color: 'bg-amber-400', badge: 'badge-warn' },
        { label: 'Failed Payments (24h)',        value: summary?.failedPayments ?? 0,  max: 20, color: 'bg-red-400',   badge: 'badge-danger' },
        { label: 'Active Drivers Online',        value: stats?.activeDriversOnline ?? 0, max: 50, color: 'bg-primary', badge: 'badge-info' },
      ].map((item) => (
        <div key={item.label} className="card p-4 flex items-center gap-4">
          <div className="flex-1">
            <p className="text-xs font-medium text-gray-400 dark:text-dark-muted mb-2">{item.label}</p>
            <div className="flex items-center gap-3">
              <MiniBar value={item.value} max={item.max} color={item.color} />
              {loading
                ? <Skeleton className="h-5 w-8 rounded-lg" />
                : <span className={`badge ${item.badge} shrink-0`}>{item.value}</span>
              }
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
  );
};

// Fetches the 5 most recent rides from the real API
function RecentRidesFeed() {
  const [rides, setRides]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    import('../services/api').then(({ fetchRides }) => {
      fetchRides({ page: 1, limit: 5 })
        .then(({ data }) => setRides(data.data ?? []))
        .catch(() => {})
        .finally(() => setLoading(false));
    });
  }, []);

  const STATUS_COLOR = {
    completed: 'bg-green-500',
    ongoing:   'bg-blue-500',
    accepted:  'bg-blue-400',
    requested: 'bg-orange-500',
    cancelled: 'bg-red-500',
  };

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-secondary dark:text-white text-sm">Recent Rides</h3>
        <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-500">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Live
        </span>
      </div>
      <div className="space-y-3">
        {loading
          ? [...Array(5)].map((_, i) => <Skeleton key={i} className="h-10 w-full rounded-xl" />)
          : rides.length === 0
            ? <p className="text-xs text-gray-400 dark:text-dark-muted text-center py-4">No rides yet</p>
            : rides.map((r) => (
              <div key={r.id} className="flex items-center gap-3">
                <div className={`w-7 h-7 rounded-lg ${STATUS_COLOR[r.status] ?? 'bg-gray-400'} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
                  {(r.rider?.name || '?').charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-secondary dark:text-white truncate">{r.rider?.name || 'Rider'}</p>
                  <p className="text-[11px] text-gray-400 dark:text-dark-muted truncate capitalize">{r.status} · {r.fare} ETB</p>
                </div>
                <span className="text-[10px] text-gray-300 dark:text-dark-muted shrink-0">
                  {r.created_at ? new Date(r.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                </span>
              </div>
            ))
        }
      </div>
    </div>
  );
}
