import React, { useState, useEffect, useCallback } from 'react';
import { Download, ChevronLeft, ChevronRight, CreditCard } from 'lucide-react';
import { fetchPayments, exportPaymentsCsv } from '../services/api';
import { TableSkeleton } from './ui/Skeleton';
import { useToast } from '../context/ToastContext';

const METHOD_FILTERS = ['all', 'cash', 'chapa'];
const STATUS_FILTERS = ['all', 'completed', 'pending', 'failed'];

const statusStyle = {
  completed: 'badge-success',
  pending: 'badge-warn',
  failed: 'badge-danger',
};

export const PaymentsManagement = () => {
  const toast = useToast();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [method, setMethod] = useState('all');
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit };
      if (method !== 'all') params.method = method;
      if (status !== 'all') params.status = status;
      const { data } = await fetchPayments(params);
      setPayments(data.data ?? data.payments ?? data ?? []);
      setTotal(data.total ?? 0);
    } catch {
      toast('Failed to load payments', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, method, status]);

  useEffect(() => { load(); }, [load]);

  const handleExport = async () => {
    try {
      const params = {};
      if (method !== 'all') params.method = method;
      if (status !== 'all') params.status = status;
      const { data } = await exportPaymentsCsv(params);
      const url = URL.createObjectURL(new Blob([data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = 'payments.csv';
      a.click();
      URL.revokeObjectURL(url);
      toast('CSV exported');
    } catch {
      toast('Export failed', 'error');
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="animate-slide-up space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-secondary dark:text-white tracking-tight">Payments</h1>
          <p className="text-gray-400 dark:text-dark-muted text-sm mt-1">Track all transactions and payment activity.</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex gap-1 bg-gray-100 dark:bg-dark-surface rounded-xl p-1">
            {METHOD_FILTERS.map((m) => (
              <button key={m} onClick={() => { setMethod(m); setPage(1); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${method === m ? 'bg-white dark:bg-dark-bg text-secondary dark:text-white shadow-sm' : 'text-gray-400 dark:text-dark-muted hover:text-secondary dark:hover:text-white'}`}>
                {m}
              </button>
            ))}
          </div>
          <div className="flex gap-1 bg-gray-100 dark:bg-dark-surface rounded-xl p-1">
            {STATUS_FILTERS.map((s) => (
              <button key={s} onClick={() => { setStatus(s); setPage(1); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${status === s ? 'bg-white dark:bg-dark-bg text-secondary dark:text-white shadow-sm' : 'text-gray-400 dark:text-dark-muted hover:text-secondary dark:hover:text-white'}`}>
                {s}
              </button>
            ))}
          </div>
          <button onClick={handleExport} className="btn-ghost flex items-center gap-2 text-sm">
            <Download size={14} /> Export CSV
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-dark-surface rounded-3xl border border-gray-100 dark:border-dark-border shadow-premium overflow-hidden">
        {loading ? <TableSkeleton rows={6} cols={5} /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-left whitespace-nowrap">
              <thead className="bg-gray-50/80 dark:bg-dark-bg border-b border-gray-100 dark:border-dark-border">
                <tr>
                  {['Rider', 'Driver', 'Amount', 'Method', 'Status'].map((h) => (
                    <th key={h} className="px-6 py-4 text-xs font-extrabold text-gray-400 dark:text-dark-muted tracking-widest uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-dark-border/50">
                {payments.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-16 text-center text-gray-400 dark:text-dark-muted">No payments found.</td></tr>
                ) : payments.map((p, idx) => (
                  <tr key={p.id} className={`group hover:bg-gray-50/50 dark:hover:bg-dark-bg transition-colors ${idx % 2 !== 0 ? 'bg-gray-50/20 dark:bg-dark-bg/20' : ''}`}>
                    <td className="px-6 py-4 font-semibold text-secondary dark:text-white text-sm">{p.ride?.rider?.name || '—'}</td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-dark-muted">{p.ride?.driver?.name || '—'}</td>
                    <td className="px-6 py-4 font-bold text-secondary dark:text-white text-sm">{p.amount ? `${p.amount} ETB` : '—'}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <CreditCard size={13} className="text-gray-400" />
                        <span className="text-sm text-gray-500 dark:text-dark-muted capitalize">{p.method || '—'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`badge ${statusStyle[p.status] || 'badge-neutral'} capitalize`}>{p.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 dark:border-dark-border">
            <span className="text-xs text-gray-400 dark:text-dark-muted">Page {page} of {totalPages}</span>
            <div className="flex gap-2">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 dark:border-dark-border text-gray-400 hover:text-secondary dark:hover:text-white disabled:opacity-40 transition-all">
                <ChevronLeft size={14} />
              </button>
              <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 dark:border-dark-border text-gray-400 hover:text-secondary dark:hover:text-white disabled:opacity-40 transition-all">
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
