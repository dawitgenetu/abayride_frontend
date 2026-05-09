import React, { useState, useEffect, useCallback } from 'react';
import { Search, CheckCircle, XCircle, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import { fetchDrivers, approveDriver, rejectDriver, deleteDriver } from '../services/api';
import { TableSkeleton } from './ui/Skeleton';
import { Modal } from './ui/Modal';
import { useToast } from '../context/ToastContext';

const STATUS_FILTERS = ['all', 'pending', 'approved', 'rejected'];

const statusStyle = {
  approved: 'badge-success',
  pending: 'badge-warn',
  rejected: 'badge-danger',
};

export const DriversManagement = () => {
  const toast = useToast();
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [rejectModal, setRejectModal]   = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [deleteModal, setDeleteModal]   = useState(null); // { id, userId, name }
  const [deleting, setDeleting]         = useState(false);
  const limit = 10;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit, q: search || undefined };
      if (statusFilter !== 'all') params.approval_status = statusFilter;
      const { data } = await fetchDrivers(params);
      setDrivers(data.data ?? data.drivers ?? data ?? []);
      setTotal(data.total ?? 0);
    } catch {
      toast('Failed to load drivers', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => { load(); }, [load]);

  const handleApprove = async (id) => {
    try {
      await approveDriver(id);
      toast('Driver approved');
      load();
    } catch { toast('Failed to approve driver', 'error'); }
  };

  const handleReject = async () => {
    try {
      await rejectDriver(rejectModal, rejectReason);
      toast('Driver rejected');
      setRejectModal(null);
      setRejectReason('');
      load();
    } catch { toast('Failed to reject driver', 'error'); }
  };

  const handleDelete = async () => {
    if (!deleteModal) return;
    setDeleting(true);
    try {
      await deleteDriver(deleteModal.userId);
      toast(`${deleteModal.name} deleted`);
      setDeleteModal(null);
      load();
    } catch (e) {
      toast(e?.response?.data?.message || 'Delete failed', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="animate-slide-up space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-secondary dark:text-white tracking-tight">Drivers</h1>
          <p className="text-gray-400 dark:text-dark-muted text-sm mt-1">Approve, reject and manage driver accounts.</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search drivers..."
              className="bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none focus:border-primary dark:text-white transition-all w-52"
            />
          </div>
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
        {loading ? <TableSkeleton rows={6} cols={5} /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-left whitespace-nowrap">
              <thead className="bg-gray-50/80 dark:bg-dark-bg border-b border-gray-100 dark:border-dark-border">
                <tr>
                  {['Driver', 'Phone', 'Vehicle', 'Wallet', 'Status', 'Actions'].map((h) => (
                    <th key={h} className="px-6 py-4 text-xs font-extrabold text-gray-400 dark:text-dark-muted tracking-widest uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-dark-border/50">
                {drivers.length === 0 ? (
                  <tr><td colSpan={6} className="px-6 py-16 text-center text-gray-400 dark:text-dark-muted">No drivers found.</td></tr>
                ) : drivers.map((d, idx) => {
                  const balance = Number(d.wallet_balance || 0);
                  const isNegative = balance < 0;
                  return (
                    <tr key={d.id} className={`group hover:bg-gray-50/50 dark:hover:bg-dark-bg transition-colors ${idx % 2 !== 0 ? 'bg-gray-50/20 dark:bg-dark-bg/20' : ''}`}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-600 to-slate-800 text-white font-bold flex items-center justify-center text-sm shrink-0">
                            {(d.name || d.users?.name || '?').charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-secondary dark:text-white text-sm">{d.name || d.users?.name || '—'}</p>
                            <p className="text-xs text-gray-400 dark:text-dark-muted">{d.users?.phone || d.phone || '—'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-dark-muted">{d.users?.phone || d.phone || '—'}</td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-dark-muted">{d.car_info || '—'}</td>
                      <td className="px-6 py-4">
                        <span className={`font-bold text-sm ${isNegative ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                          {balance.toFixed(2)} ETB
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`badge ${statusStyle[d.approval_status] || 'badge-neutral'} capitalize`}>
                          {d.approval_status || 'pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                          {d.approval_status !== 'approved' && (
                            <button onClick={() => handleApprove(d.id)} className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 rounded-lg text-xs font-bold hover:bg-green-100 dark:hover:bg-green-500/20 transition-all">
                              <CheckCircle size={13} /> Approve
                            </button>
                          )}
                          {d.approval_status !== 'rejected' && (
                            <button onClick={() => setRejectModal(d.id)} className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-lg text-xs font-bold hover:bg-red-100 dark:hover:bg-red-500/20 transition-all">
                              <XCircle size={13} /> Reject
                            </button>
                          )}
                          <button
                            onClick={() => setDeleteModal({ id: d.id, userId: d.user_id, name: d.users?.name || 'this driver' })}
                            className="p-1.5 bg-red-50 dark:bg-red-500/10 text-red-500 rounded-lg hover:bg-red-100 dark:hover:bg-red-500/20 transition-all"
                            title="Delete driver"
                          >
                            <Trash2 size={13} />
                          </button>
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

      <Modal open={!!rejectModal} onClose={() => setRejectModal(null)} title="Reject Driver">
        <div className="space-y-4">
          <p className="text-sm text-gray-500 dark:text-dark-muted">Optionally provide a reason for rejection.</p>
          <textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Reason (optional)..."
            rows={3}
            className="w-full bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl px-4 py-3 text-sm outline-none focus:border-primary dark:text-white resize-none transition-all"
          />
          <div className="flex gap-3 justify-end">
            <button onClick={() => setRejectModal(null)} className="btn-ghost text-sm">Cancel</button>
            <button onClick={handleReject} className="px-5 py-2.5 bg-red-500 text-white font-bold rounded-xl text-sm hover:bg-red-600 transition-all">Reject</button>
          </div>
        </div>
      </Modal>

      {/* ── Delete confirm modal ── */}
      <Modal open={!!deleteModal} onClose={() => setDeleteModal(null)} title="Delete Driver">
        <div className="space-y-4">
          <p className="text-sm text-gray-500 dark:text-dark-muted">
            Are you sure you want to permanently delete{' '}
            <span className="font-bold text-secondary dark:text-white">{deleteModal?.name}</span>?
            This will remove their driver profile, user account, and cannot be undone.
          </p>
          <div className="flex gap-3 justify-end">
            <button onClick={() => setDeleteModal(null)} className="btn-ghost text-sm">Cancel</button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="flex items-center gap-2 px-5 py-2.5 bg-red-500 text-white font-bold rounded-xl text-sm hover:bg-red-600 transition-all disabled:opacity-60"
            >
              <Trash2 size={14} />
              {deleting ? 'Deleting…' : 'Delete Driver'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
