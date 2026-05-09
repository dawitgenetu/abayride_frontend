import React, { useState, useEffect, useCallback } from 'react';
import { Search, ChevronLeft, ChevronRight, MapPin, Trash2 } from 'lucide-react';
import { fetchRides, deleteRide } from '../services/api';
import { TableSkeleton } from './ui/Skeleton';
import { useToast } from '../context/ToastContext';

const STATUS_FILTERS = ['all', 'requested', 'accepted', 'ongoing', 'completed', 'cancelled'];

const statusStyle = {
  completed: 'badge-success',
  ongoing: 'badge-info',
  accepted: 'badge-info',
  requested: 'badge-warn',
  cancelled: 'badge-danger',
};

// Rides that are actively in progress — block deletion
const ACTIVE_STATUSES = ['ongoing', 'accepted'];

export const RidesManagement = () => {
  const toast = useToast();
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  // Delete confirmation state
  const [confirmRide, setConfirmRide] = useState(null); // ride object to delete
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit };
      if (statusFilter !== 'all') params.status = statusFilter;
      const { data } = await fetchRides(params);
      setRides(data.data ?? data.rides ?? data ?? []);
      setTotal(data.total ?? 0);
    } catch {
      toast('Failed to load rides', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => { load(); }, [load]);

  const totalPages = Math.ceil(total / limit);

  const handleDeleteConfirm = async () => {
    if (!confirmRide) return;
    setDeleting(true);
    try {
      await deleteRide(confirmRide.id);
      toast('Ride deleted successfully', 'success');
      setConfirmRide(null);
      load();
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to delete ride';
      toast(msg, 'error');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="animate-slide-up space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-secondary dark:text-white tracking-tight">Rides</h1>
          <p className="text-gray-400 dark:text-dark-muted text-sm mt-1">Monitor all ride activity across the platform.</p>
        </div>
        <div className="flex gap-1 bg-gray-100 dark:bg-dark-surface rounded-xl p-1 flex-wrap">
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

      <div className="bg-white dark:bg-dark-surface rounded-3xl border border-gray-100 dark:border-dark-border shadow-premium overflow-hidden">
        {loading ? <TableSkeleton rows={6} cols={7} /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-left whitespace-nowrap">
              <thead className="bg-gray-50/80 dark:bg-dark-bg border-b border-gray-100 dark:border-dark-border">
                <tr>
                  {['Rider', 'Driver', 'Pickup', 'Destination', 'Price', 'Status', ''].map((h, i) => (
                    <th key={i} className="px-6 py-4 text-xs font-extrabold text-gray-400 dark:text-dark-muted tracking-widest uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-dark-border/50">
                {rides.length === 0 ? (
                  <tr><td colSpan={7} className="px-6 py-16 text-center text-gray-400 dark:text-dark-muted">No rides found.</td></tr>
                ) : rides.map((r, idx) => (
                  <tr key={r.id} className={`group hover:bg-gray-50/50 dark:hover:bg-dark-bg transition-colors ${idx % 2 !== 0 ? 'bg-gray-50/20 dark:bg-dark-bg/20' : ''}`}>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-secondary dark:text-white text-sm">{r.rider?.name || '—'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-500 dark:text-dark-muted">{r.driver?.name || <span className="badge badge-neutral">Unassigned</span>}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-dark-muted max-w-[160px]">
                        <MapPin size={12} className="text-green-500 shrink-0" />
                        <span className="truncate">
                          {r.pickup_location?.address
                            || (r.pickup_location?.lat != null ? `${Number(r.pickup_location.lat).toFixed(4)}, ${Number(r.pickup_location.lng).toFixed(4)}` : 'N/A')}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-dark-muted max-w-[160px]">
                        <MapPin size={12} className="text-red-500 shrink-0" />
                        <span className="truncate">
                          {r.destination_location?.address
                            || (r.destination_location?.lat != null ? `${Number(r.destination_location.lat).toFixed(4)}, ${Number(r.destination_location.lng).toFixed(4)}` : 'N/A')}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-bold text-secondary dark:text-white text-sm">{r.fare ? `${r.fare} ETB` : '—'}</p>
                        {r.driver_earning > 0 && (
                          <p className="text-[11px] text-gray-400 dark:text-dark-muted">Driver: {r.driver_earning} ETB</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`badge ${statusStyle[r.status] || 'badge-neutral'} capitalize`}>{r.status}</span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => setConfirmRide(r)}
                        disabled={ACTIVE_STATUSES.includes(r.status)}
                        title={ACTIVE_STATUSES.includes(r.status) ? 'Cannot delete an active ride' : 'Delete ride'}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 disabled:opacity-20 disabled:cursor-not-allowed disabled:hover:text-gray-400 disabled:hover:bg-transparent"
                      >
                        <Trash2 size={15} />
                      </button>
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

      {/* Delete confirmation modal */}
      {confirmRide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-dark-surface rounded-2xl shadow-2xl border border-gray-100 dark:border-dark-border w-full max-w-sm mx-4 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-500/10 flex items-center justify-center shrink-0">
                <Trash2 size={18} className="text-red-500" />
              </div>
              <div>
                <h3 className="font-extrabold text-secondary dark:text-white text-base">Delete Ride</h3>
                <p className="text-xs text-gray-400 dark:text-dark-muted mt-0.5">This action cannot be undone</p>
              </div>
            </div>

            <p className="text-sm text-gray-500 dark:text-dark-muted mb-1">
              You're about to delete the ride between:
            </p>
            <div className="bg-gray-50 dark:bg-dark-bg rounded-xl p-3 mb-5 space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400 dark:text-dark-muted">Rider</span>
                <span className="font-semibold text-secondary dark:text-white">{confirmRide.rider?.name || '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400 dark:text-dark-muted">Driver</span>
                <span className="font-semibold text-secondary dark:text-white">{confirmRide.driver?.name || 'Unassigned'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400 dark:text-dark-muted">Status</span>
                <span className={`badge ${statusStyle[confirmRide.status] || 'badge-neutral'} capitalize`}>{confirmRide.status}</span>
              </div>
              {confirmRide.fare && (
                <div className="flex justify-between">
                  <span className="text-gray-400 dark:text-dark-muted">Fare</span>
                  <span className="font-semibold text-secondary dark:text-white">{confirmRide.fare} ETB</span>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setConfirmRide(null)}
                disabled={deleting}
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-dark-border text-sm font-bold text-gray-500 dark:text-dark-muted hover:bg-gray-50 dark:hover:bg-dark-bg transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deleting}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-bold transition-all disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {deleting ? (
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                ) : (
                  <Trash2 size={14} />
                )}
                {deleting ? 'Deleting…' : 'Delete Ride'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
