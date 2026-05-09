import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { TrendingUp, Users, Truck, Activity, DollarSign } from 'lucide-react';
import { fetchAnalytics, fetchAnalyticsCharts } from '../services/api';
import { StatsSkeleton, Skeleton } from './ui/Skeleton';
import { useToast } from '../context/ToastContext';

const PERIODS = ['day', 'week', 'month'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-dark-surface border border-gray-100 dark:border-dark-border rounded-2xl px-4 py-3 shadow-premium text-sm">
      <p className="font-bold text-secondary dark:text-white mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }} className="font-semibold">{p.name}: {p.value}</p>
      ))}
    </div>
  );
};

export const AnalyticsDashboard = () => {
  const toast = useToast();
  const [stats, setStats] = useState(null);
  const [charts, setCharts] = useState(null);
  const [period, setPeriod] = useState('week');
  const [loading, setLoading] = useState(true);
  const [chartsLoading, setChartsLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics()
      .then(({ data }) => setStats(data))
      .catch(() => toast('Failed to load analytics', 'error'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    setChartsLoading(true);
    fetchAnalyticsCharts(period)
      .then(({ data }) => setCharts(data))
      .catch(() => toast('Failed to load chart data', 'error'))
      .finally(() => setChartsLoading(false));
  }, [period]);

  const statCards = stats ? [
    { label: 'Total Users',       value: stats.usersCount?.toLocaleString() ?? '—',          icon: Users,      gradient: 'from-blue-500 to-indigo-600' },
    { label: 'Total Drivers',     value: stats.driversCount?.toLocaleString() ?? '—',         icon: Truck,      gradient: 'from-slate-600 to-slate-800' },
    { label: 'Completed Rides',   value: stats.completedRidesCount?.toLocaleString() ?? '—',  icon: Activity,   gradient: 'from-emerald-400 to-green-600' },
    { label: 'Platform Revenue',  value: stats.platformRevenue != null ? `${Number(stats.platformRevenue).toLocaleString()} ETB` : (stats.completedRevenue ? `${Number(stats.completedRevenue).toLocaleString()} ETB` : '—'), icon: DollarSign, gradient: 'from-orange-400 to-red-500' },
  ] : [];

  return (
    <div className="animate-slide-up space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-secondary dark:text-white tracking-tight">Analytics</h1>
          <p className="text-gray-400 dark:text-dark-muted text-sm mt-1">Platform performance and trends.</p>
        </div>
        <div className="flex gap-1 bg-gray-100 dark:bg-dark-surface rounded-xl p-1">
          {PERIODS.map((p) => (
            <button key={p} onClick={() => setPeriod(p)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${period === p ? 'bg-white dark:bg-dark-bg text-secondary dark:text-white shadow-sm' : 'text-gray-400 dark:text-dark-muted hover:text-secondary dark:hover:text-white'}`}>
              {p}
            </button>
          ))}
        </div>
      </div>

      {loading ? <StatsSkeleton /> : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {statCards.map(({ label, value, icon: Icon, gradient }) => (
            <div key={label} className="stat-card group p-6 relative overflow-hidden">
              <div className={`absolute -right-8 -top-8 w-36 h-36 rounded-full opacity-[0.07] bg-gradient-to-br ${gradient} blur-2xl`} />
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white bg-gradient-to-br ${gradient} shadow-md mb-4 group-hover:scale-110 transition-transform`}>
                <Icon size={20} />
              </div>
              <p className="text-xs font-bold text-gray-400 dark:text-dark-muted uppercase tracking-widest mb-1">{label}</p>
              <p className="text-2xl font-extrabold text-secondary dark:text-white tracking-tight">{value}</p>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Rides line chart */}
        <div className="bg-white dark:bg-dark-surface rounded-3xl border border-gray-100 dark:border-dark-border p-6 shadow-premium">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-secondary dark:text-white">Rides Over Time</h3>
              <p className="text-xs text-gray-400 dark:text-dark-muted mt-0.5">Ride volume trend</p>
            </div>
            <TrendingUp size={18} className="text-primary" />
          </div>
          {chartsLoading ? <Skeleton className="h-48 w-full" /> : (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={charts?.rides ?? []}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="count" name="Rides" stroke="#2563EB" strokeWidth={2.5} dot={false} activeDot={{ r: 5, fill: '#2563EB' }} />
              </LineChart>            </ResponsiveContainer>
          )}
        </div>

        {/* Revenue bar chart */}
        <div className="bg-white dark:bg-dark-surface rounded-3xl border border-gray-100 dark:border-dark-border p-6 shadow-premium">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-secondary dark:text-white">Revenue by Method</h3>
              <p className="text-xs text-gray-400 dark:text-dark-muted mt-0.5">Cash vs Chapa</p>
            </div>
            <DollarSign size={18} className="text-green-500" />
          </div>
          {chartsLoading ? <Skeleton className="h-48 w-full" /> : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={charts?.revenue ?? []}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="cash" name="Cash" fill="#22C55E" radius={[6, 6, 0, 0]} />
                <Bar dataKey="chapa" name="Chapa" fill="#2563EB" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Driver status chart */}
      <div className="bg-white dark:bg-dark-surface rounded-3xl border border-gray-100 dark:border-dark-border p-6 shadow-premium">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-bold text-secondary dark:text-white">Driver Activity</h3>
            <p className="text-xs text-gray-400 dark:text-dark-muted mt-0.5">Active vs idle drivers over time</p>
          </div>
        </div>
        {chartsLoading ? <Skeleton className="h-48 w-full" /> : (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={charts?.drivers ?? []}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="active" name="Active" stroke="#22C55E" strokeWidth={2.5} dot={false} />
              <Line type="monotone" dataKey="idle" name="Idle" stroke="#94A3B8" strokeWidth={2} dot={false} strokeDasharray="4 4" />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};
