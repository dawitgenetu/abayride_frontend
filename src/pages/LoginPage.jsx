import React, { useState } from 'react';
import { Eye, EyeOff, Lock, Mail, ArrowRight, Sun, Moon, Shield } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { BrandLogo } from '../components/BrandLogo';
import api from '../services/api';

export const LoginPage = ({ onLogin, isDark, setIsDark }) => {
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast('Enter email and password', 'warn');
      return;
    }
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
      {/* Left brand panel */}
      <div className="hidden lg:flex flex-col justify-between w-[44%] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-primary to-indigo-800" />
        <div className="absolute inset-0 opacity-[0.12]">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full border-2 border-white"
              style={{
                width: `${(i + 1) * 160}px`,
                height: `${(i + 1) * 160}px`,
                top: '42%',
                left: '38%',
                transform: 'translate(-50%, -50%)',
              }}
            />
          ))}
        </div>
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-400/20 rounded-full blur-3xl" />

        <div className="relative z-10 p-12">
          <BrandLogo size="lg" variant="light" subtitle="Admin Dashboard" />
        </div>

        <div className="relative z-10 px-12 pb-4">
          <h2 className="text-4xl font-extrabold text-white leading-[1.15] tracking-tight mb-4">
            Run your ride
            <br />
            platform with
            <br />
            confidence.
          </h2>
          <p className="text-blue-100/90 text-sm leading-relaxed max-w-sm">
            Monitor drivers, riders, rides, payments, and withdrawals — all from one modern control center.
          </p>
        </div>

        <div className="relative z-10 p-12 grid grid-cols-3 gap-3">
          {[
            { label: 'Drivers', value: 'Live' },
            { label: 'Rides', value: '24/7' },
            { label: 'Payments', value: 'Secure' },
          ].map((s) => (
            <div
              key={s.label}
              className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl p-4"
            >
              <p className="text-white font-bold text-lg">{s.value}</p>
              <p className="text-blue-100/80 text-xs font-semibold mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right — sign in */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 relative">
        <button
          onClick={() => setIsDark?.(!isDark)}
          className="absolute top-5 right-5 btn-icon"
          title={isDark ? 'Light mode' : 'Dark mode'}
        >
          {isDark ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        <div className="w-full max-w-[420px] animate-slide-up">
          <div className="lg:hidden mb-8 flex justify-center">
            <BrandLogo size="lg" subtitle="Admin" />
          </div>

          <div className="card p-8 sm:p-10">
            <div className="mb-8">
              <h1 className="text-2xl font-extrabold text-secondary dark:text-white tracking-tight">
                Sign in
              </h1>
              <p className="text-sm text-gray-400 dark:text-dark-muted mt-1.5">
                Administrator access only
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 dark:text-dark-muted uppercase tracking-wide">
                  Email
                </label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    autoComplete="email"
                    className="input-base pl-10"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 dark:text-dark-muted uppercase tracking-wide">
                  Password
                </label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className="input-base pl-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((v) => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-secondary dark:hover:text-white transition-colors"
                  >
                    {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed py-3.5 text-[15px] mt-2"
              >
                {loading ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <ArrowRight size={18} />
                )}
                {loading ? 'Signing in…' : 'Sign In'}
              </button>
            </form>

            <div className="mt-8 flex items-center justify-center gap-2 text-xs text-gray-400 dark:text-dark-muted">
              <Shield size={13} className="text-primary shrink-0" />
              <span>Encrypted · Restricted to administrators</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
