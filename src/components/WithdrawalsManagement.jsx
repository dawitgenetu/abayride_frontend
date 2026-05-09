import React, { useState, useEffect, useCallback } from 'react';
import { Search, CheckCircle, XCircle, ChevronLeft, ChevronRight, DollarSign, Clock, AlertCircle } from 'lucide-react';
import { fetchWithdrawals, approveWithdrawal, rejectWithdrawal } from '../services/api';
import { TableSkeleton } from './ui/Skeleton';
import { Modal } from './ui/Modal';
import { useToast } from '../context/ToastContext';

const STATUS_FILTERS = ['all', 'pending', 'approved', 'rejected', 'paid'];

const statusStyle = {
  pending: 'badge-warn',
  approved: 'badge-success',
  rejected: 'badge-danger',
  paid: 'badge-success',
};

const statusIcon = {
  pending: Clock,
  approved: CheckCircle,
  rejected: XCircle,
  paid: CheckCircle,
};

export const WithdrawalsManagement = () => {
  const toast = useToast();
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const limit = 10;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = statusFilter !== 'all' ? { status: statusFilter } : {};
      const { data } = await fetchWithdrawals(params);
      setWithdrawals(Array.isArray(data) ? data : []);
    } catch {
      toast('Failed to load withdrawals', 'error');
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => { load(); }, [load]);

  const handleApprove = async (id) => {
    try {
      await approveWithdrawal(id);
      toast('Withdrawal approved and processed via Chapa');
      load();
    } catch (err) {
      toast(err?.response?.data?.message || 'Failed to approve withdrawal', 'error');
    }
  };

  const handleReject = async () => {
    try {
      await rejectWithdrawal(rejectModal, rejectReason);
      toast('Withdrawal rejected');
      setRejectModal(null);
      setRejectReason('');
      load();
    } catch {
      toast('Failed to reject withdrawal', 'error');
    }
  };

  const paginatedData = withdrawals.slice((page - 1) * limit, page * limit);
  const totalPages = Math.ceil(withdrawals.length / limit);

  return (
    <div className="animate-slide-up space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-secondary dark:text-white tracking-tight">Withdrawals</h1>
          <p className="text-gray-400 dark:text-dark-muted text-sm mt-1">Manage driver withdrawal requests and payouts.</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex gap-1 bg-gray-100 dark:bg-dark-surface rounded-xl p-1">
            {STATUS_FILTERS.map((s) => (
              <button
                key={s}
                onClick={() => { setStatusFilter(s); setPage(1); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${statusFilter === s ? 'bg-white dark:bg-dark-bg text-secondary dark:text-white shadow-sm' : 'text-gray-400 dark:text-dark-muted hover:text-secondary dark:hover:text-white'}`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-dark-surface rounded-3xl border border-gray-100 dark:border-dark-border shadow-premium overflow-hidden">
        {loading ? <TableSkeleton rows={6} cols={6} /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-left whitespace-nowrap">
              <thead className="bg-gray-50/80 dark:bg-dark-bg border-b border-gray-100 dark:border-dark-border">
                <tr>
                  {['Driver', 'Chapa Account', 'Amount', 'Status', 'Date', 'Actions'].map((h) => (
                    <th key={h} className="px-6 py-4 text-xs font-extrabold text-gray-400 dark:text-dark-muted tracking-widest uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-dark-border/50">
                {paginatedData.length === 0 ? (
                  <tr><td colSpan={6} className="px-6 py-16 text-center text-gray-400 dark:text-dark-muted">No withdrawals found.</td></tr>
                ) : paginatedData.map((w, idx) => {
                  const driverName = w.driver?.users?.name || w.driver?.name || '—';
                  const driverPhone = w.driver?.users?.phone || w.driver?.phone || '—';
                  const StatusIcon = statusIcon[w.status] || AlertCircle;
                  
                  return (
                    <tr key={w.id} className={`group hover:bg-gray-50/50 dark:hover:bg-dark-bg transition-colors ${idx % 2 !== 0 ? 'bg-gray-50/20 dark:bg-dark-bg/20' : ''}`}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 text-white font-bold flex items-center justify-center text-sm shrink-0">
                            {driverName.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-secondary dark:text-white text-sm">{driverName}</p>
                            <p className="text-xs text-gray-400 dark:text-dark-muted">{driverPhone}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-dark-muted">{driverPhone}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-sm font-semibold text-secondary dark:text-white">
                            {w.phone || driverPhone || '—'}
                          </span>
                          {w.bank_code && (
                            <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md w-fit">
                              {w.bank_code}
                            </span>
                          )}
                          {w.chapa_status && w.chapa_status !== 'manual' && (
                            <span className={`text-xs font-semibold ${w.chapa_status === 'manual_required' ? 'text-amber-500' : 'text-green-500'}`}>
                              {w.chapa_status === 'manual_required' ? '⚠ Manual payout needed' : `✓ Chapa: ${w.chapa_status}`}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <DollarSign size={14} className="text-green-600 dark:text-green-400" />
                          <span className="font-bold text-secondary dark:text-white">{Number(w.amount).toFixed(2)} ETB</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`badge ${statusStyle[w.status] || 'badge-neutral'} capitalize flex items-center gap-1.5 w-fit`}>
                          <StatusIcon size={12} />
                          {w.status || 'pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-dark-muted">
                        {new Date(w.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                          {w.status === 'pending' && (
                            <>
                              <button onClick={() => handleApprove(w.id)} className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 rounded-lg text-xs font-bold hover:bg-green-100 dark:hover:bg-green-500/20 transition-all">
                                <CheckCircle size={13} /> Approve
                              </button>
                              <button onClick={() => setRejectModal(w.id)} className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-lg text-xs font-bold hover:bg-red-100 dark:hover:bg-red-500/20 transition-all">
                                <XCircle size={13} /> Reject
                              </button>
                            </>
                          )}
                          {w.status !== 'pending' && (
                            <span className="text-xs text-gray-400 dark:text-dark-muted italic">No actions</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
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

      <Modal open={!!rejectModal} onClose={() => setRejectModal(null)} title="Reject Withdrawal">
        <div className="space-y-4">
          <p className="text-sm text-gray-500 dark:text-dark-muted">Provide a reason for rejecting this withdrawal request.</p>
          <textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Reason for rejection..."
            rows={3}
            className="w-full bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl px-4 py-3 text-sm outline-none focus:border-primary dark:text-white resize-none transition-all"
          />
          <div className="flex gap-3 justify-end">
            <button onClick={() => setRejectModal(null)} className="btn-ghost text-sm">Cancel</button>
            <button onClick={handleReject} className="px-5 py-2.5 bg-red-500 text-white font-bold rounded-xl text-sm hover:bg-red-600 transition-all">Reject</button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
