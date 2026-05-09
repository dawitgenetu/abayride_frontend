import React, { useState, useEffect } from 'react';
import { User, Lock, Bell, Palette, Save, DollarSign } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import api from '../services/api';

const Section = ({ icon: Icon, title, children }) => (
  <div className="bg-white dark:bg-dark-surface rounded-3xl border border-gray-100 dark:border-dark-border p-6 shadow-premium space-y-5">
    <div className="flex items-center gap-3 pb-4 border-b border-gray-100 dark:border-dark-border">
      <div className="w-9 h-9 rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
        <Icon size={16} className="text-primary" />
      </div>
      <h3 className="font-bold text-secondary dark:text-white">{title}</h3>
    </div>
    {children}
  </div>
);

const Field = ({ label, ...props }) => (
  <div className="space-y-1.5">
    <label className="text-xs font-bold text-gray-400 dark:text-dark-muted uppercase tracking-widest">{label}</label>
    <input
      {...props}
      className="w-full bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary dark:text-white transition-all"
    />
  </div>
);

export const SettingsPage = ({ isDark, setIsDark }) => {
  const toast = useToast();
  const [name, setName] = useState('Admin');
  const [email, setEmail] = useState('admin@abayride.com');

  // Fare settings
  const [baseFee, setBaseFee]       = useState(100);
  const [ratePerKm, setRatePerKm]   = useState(100);
  const [fareLoading, setFareLoading] = useState(true);
  const [fareSaving, setFareSaving]   = useState(false);

  useEffect(() => {
    api.get('/admin/settings/fare')
      .then(res => {
        setBaseFee(res.data.base_fee);
        setRatePerKm(res.data.rate_per_km);
      })
      .catch(() => {})
      .finally(() => setFareLoading(false));
  }, []);

  const handleSaveFare = async () => {
    setFareSaving(true);
    try {
      await api.patch('/admin/settings/fare', {
        base_fee:    Number(baseFee),
        rate_per_km: Number(ratePerKm),
      });
      toast('Fare settings saved');
    } catch {
      toast('Failed to save fare settings');
    } finally {
      setFareSaving(false);
    }
  };

  const handleSave = () => toast('Settings saved');

  return (
    <div className="animate-slide-up space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-extrabold text-secondary dark:text-white tracking-tight">Settings</h1>
        <p className="text-gray-400 dark:text-dark-muted text-sm mt-1">Manage your account and preferences.</p>
      </div>

      {/* ── Fare Pricing ── */}
      <Section icon={DollarSign} title="Fare Pricing">
        {fareLoading ? (
          <p className="text-sm text-gray-400 dark:text-dark-muted">Loading…</p>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-400 dark:text-dark-muted uppercase tracking-widest">
                  Base / Standby Fee (ETB)
                </label>
                <input
                  type="number"
                  min="0"
                  value={baseFee}
                  onChange={e => setBaseFee(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary dark:text-white transition-all"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-400 dark:text-dark-muted uppercase tracking-widest">
                  Rate per KM (ETB)
                </label>
                <input
                  type="number"
                  min="0"
                  value={ratePerKm}
                  onChange={e => setRatePerKm(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary dark:text-white transition-all"
                />
              </div>
            </div>
            <p className="text-xs text-gray-400 dark:text-dark-muted">
              Fare formula: <span className="font-mono font-semibold text-primary">Base Fee + (Distance km × Rate per KM)</span>
            </p>
            <div className="flex justify-end">
              <button
                onClick={handleSaveFare}
                disabled={fareSaving}
                className="btn-primary flex items-center gap-2 disabled:opacity-60"
              >
                <Save size={15} /> {fareSaving ? 'Saving…' : 'Save Fare Settings'}
              </button>
            </div>
          </>
        )}
      </Section>

      <Section icon={User} title="Profile">
        <Field label="Display Name" value={name} onChange={(e) => setName(e.target.value)} />
        <Field label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      </Section>

      <Section icon={Lock} title="Security">
        <Field label="Current Password" type="password" placeholder="••••••••" />
        <Field label="New Password" type="password" placeholder="••••••••" />
        <Field label="Confirm New Password" type="password" placeholder="••••••••" />
      </Section>

      <Section icon={Palette} title="Appearance">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-secondary dark:text-white text-sm">Dark Mode</p>
            <p className="text-xs text-gray-400 dark:text-dark-muted mt-0.5">Switch between light and dark theme</p>
          </div>
          <button
            onClick={() => setIsDark(!isDark)}
            className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${isDark ? 'bg-primary' : 'bg-gray-200'}`}
          >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-300 ${isDark ? 'translate-x-6' : 'translate-x-0'}`} />
          </button>
        </div>
      </Section>

      <div className="flex justify-end">
        <button onClick={handleSave} className="btn-primary flex items-center gap-2">
          <Save size={15} /> Save Changes
        </button>
      </div>
    </div>
  );
};
