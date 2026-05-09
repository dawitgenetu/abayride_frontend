import React, { useState } from 'react';
import { Eye, EyeOff, Lock, Mail, Zap, ArrowRight, Sun, Moon } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import api from '../services/api';

export const LoginPage = ({ onLogin, isDark, setIsDark }) => {
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) { toast('Enter email and password', 'warn'); return; }
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      const token = data?.access_token ?? data?.session?.access_token ?? data?.token;
      if (!token) throw new Error(data?.message || 'Login failed');
      localStorage.setItem('admin_token', token);
      localStorage.setItem('admin_email', email);
      toast('Welcome back!');
      onLogin();
    } catch (err) {
      toast(err?.response?.data?.message || err?.message || 'Login failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background dark:bg-dark-bg flex">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-[42%] bg-primary p-12 relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="absolute rounded-full border border-white"
              style={{ width: `${(i+1)*180}px`, height: `${(i+1)*180}px`, top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }} />
          ))}
        </div>

        {/* Logo */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <Zap size={20} className="text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-lg leading-tight">Abay Ride</p>
            <p className="text-blue-200 text-xs">Admin Dashboard</p>
          </div>
        </div>

        {/* Hero text */}
        <div className="relative z-10">
          <h2 className="text-4xl font-bold text-white leading-tight mb-4">
            Manage your<br />ride platform<br />with ease.
          </h2>
          <p className="text-blue-200 text-sm leading-relaxed max-w-xs">
            Monitor drivers, riders, rides, and payments — all from one powerful dashboard.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 relative z-10">
          {[
            { label: 'Active Drivers', value: '—' },
            { label: 'Total Rides', value: '—' },
            { label: 'Revenue', value: '—' },
          ].map(s => (
            <div key={s.label} className="bg-white/10 rounded-xl p-3">
              <p className="text-white font-bold text-xl">{s.value}</p>
              <p className="text-blue-200 text-xs mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8 relative">
        {/* Theme toggle — top right */}
        <button
          onClick={() => setIsDark?.(!isDark)}
          className="absolute top-5 right-5 w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 dark:bg-dark-surface border border-gray-200 dark:border-dark-border text-gray-500 dark:text-dark-muted hover:text-secondary dark:hover:text-white hover:bg-gray-200 dark:hover:bg-dark-border transition-all"
          title={isDark ? 'Light mode' : 'Dark mode'}
        >
          {isDark ? <Sun size={16} /> : <Moon size={16} />}
        </button>
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex items-center justify-between mb-10 lg:hidden">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shadow-glow">
                <Zap size={18} className="text-white" />
              </div>
              <p className="font-bold text-secondary dark:text-white">Abay Ride Admin</p>
            </div>
            <button
              onClick={() => setIsDark?.(!isDark)}
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 dark:bg-dark-surface border border-gray-200 dark:border-dark-border text-gray-500 dark:text-dark-muted hover:text-secondary dark:hover:text-white transition-all"
            >
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </div>

          <h1 className="text-2xl font-bold text-secondary dark:text-white mb-1">Sign in</h1>
          <p className="text-sm text-gray-400 dark:text-dark-muted mb-8">Enter your admin credentials to continue</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500 dark:text-dark-muted">Email address</label>
              <div className="relative">
                <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="bdride@admin.com" autoComplete="email"
                  className="input-base pl-10"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500 dark:text-dark-muted">Password</label>
              <div className="relative">
                <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••" autoComplete="current-password"
                  className="input-base pl-10 pr-10"
                />
                <button type="button" onClick={() => setShowPw(v => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-secondary dark:hover:text-white transition-colors">
                  {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            <div className="pt-1">
              <button type="submit" disabled={loading}
                className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed py-3">
                {loading
                  ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <ArrowRight size={16} />
                }
                {loading ? 'Signing in…' : 'Sign In'}
              </button>
            </div>
          </form>

          <p className="text-center text-xs text-gray-400 dark:text-dark-muted mt-8">
            Abay Ride · Restricted to administrators only
          </p>
        </div>
      </div>
    </div>
  );
};
