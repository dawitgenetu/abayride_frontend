import React, { useState, useEffect, useCallback } from 'react';
import { MoreHorizontal, Shield, ShieldOff, Search, ChevronLeft, ChevronRight, Trash2, UserPlus, X } from 'lucide-react';
import { fetchUsers, blockUser, deleteUser, createAdminUser } from '../services/api';
import { TableSkeleton } from './ui/Skeleton';
import { Modal } from './ui/Modal';
import { useToast } from '../context/ToastContext';

const ROLE_FILTERS = ['all', 'rider', 'driver', 'admin'];

const statusStyle = {
  true:  { dot: 'bg-red-500',   label: 'Blocked' },
  false: { dot: 'bg-green-500', label: 'Active', ping: true },
};

export const UserManagement = () => {
  const toast = useToast();
  const [users, setUsers]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [role, setRole]             = useState('all');
  const [page, setPage]             = useState(1);
  const [total, setTotal]           = useState(0);
  const limit = 10;

  // Delete confirm modal
  const [deleteModal, setDeleteModal] = useState(null); // { id, name }
  const [deleting, setDeleting]       = useState(false);

  // Add admin modal
  const [addAdminModal, setAddAdminModal] = useState(false);
  const [adminForm, setAdminForm]         = useState({ name: '', email: '', phone: '', password: '' });
  const [addingAdmin, setAddingAdmin]     = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit, q: search || undefined };
      if (role !== 'all') params.role = role;
      const { data } = await fetchUsers(params);
      setUsers(data.data ?? data.users ?? data ?? []);
      setTotal(data.total ?? 0);
    } catch {
      toast('Failed to load users', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, search, role]);

  useEffect(() => { load(); }, [load]);

  const handleBlock = async (id, currentlyBlocked) => {
    try {
      await blockUser(id, !currentlyBlocked);
      toast(currentlyBlocked ? 'User unblocked' : 'User blocked');
      load();
    } catch { toast('Action failed', 'error'); }
  };

  const handleDelete = async () => {
    if (!deleteModal) return;
    setDeleting(true);
    try {
      await deleteUser(deleteModal.id);
      toast(`${deleteModal.name} deleted`);
      setDeleteModal(null);
      load();
    } catch (e) {
      toast(e?.response?.data?.message || 'Delete failed', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const handleAddAdmin = async () => {
    if (!adminForm.name || !adminForm.email || !adminForm.password) {
      toast('Name, email and password are required', 'error');
      return;
    }
    setAddingAdmin(true);
    try {
      await createAdminUser(adminForm);
      toast('Admin user created');
      setAddAdminModal(false);
      setAdminForm({ name: '', email: '', phone: '', password: '' });
      load();
    } catch (e) {
      toast(e?.response?.data?.message || 'Failed to create admin', 'error');
    } finally {
      setAddingAdmin(false);
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="animate-slide-up space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-secondary dark:text-white tracking-tight">User Directory</h1>
          <p className="text-gray-400 dark:text-dark-muted text-sm mt-1">Manage riders, drivers and admins across Abay Ride.</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {/* Add Admin button */}
          <button
            onClick={() => setAddAdminModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white font-bold rounded-xl text-sm hover:bg-primary/90 transition-all shadow-sm"
          >
            <UserPlus size={15} /> Add Admin
          </button>
          {/* Search */}
          <div className="relative">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search users..."
              className="bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none focus:border-primary dark:text-white transition-all w-52"
            />
          </div>
          {/* Role filter */}
          <div className="flex gap-1 bg-gray-100 dark:bg-dark-surface rounded-xl p-1">
            {ROLE_FILTERS.map((r) => (
              <button key={r} onClick={() => { setRole(r); setPage(1); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${role === r ? 'bg-white dark:bg-dark-bg text-secondary dark:text-white shadow-sm' : 'text-gray-400 dark:text-dark-muted hover:text-secondary dark:hover:text-white'}`}>
                {r}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-dark-surface rounded-3xl border border-gray-100 dark:border-dark-border shadow-premium overflow-hidden">
        {loading ? <TableSkeleton rows={6} cols={5} /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-left whitespace-nowrap">
              <thead className="bg-gray-50/80 dark:bg-dark-bg border-b border-gray-100 dark:border-dark-border">
                <tr>
                  {['Member', 'Role', 'Status', 'Joined', 'Actions'].map((h) => (
                    <th key={h} className="px-6 py-4 text-xs font-extrabold text-gray-400 dark:text-dark-muted tracking-widest uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-dark-border/50">
                {users.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-16 text-center text-gray-400 dark:text-dark-muted">No users found.</td></tr>
                ) : users.map((user, idx) => {
                  const blocked = user.is_blocked ?? false;
                  const st = statusStyle[String(blocked)];
                  return (
                    <tr key={user.id} className={`group hover:bg-gray-50/50 dark:hover:bg-dark-bg transition-colors ${idx % 2 !== 0 ? 'bg-gray-50/20 dark:bg-dark-bg/20' : ''}`}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 font-bold flex items-center justify-center text-secondary dark:text-white group-hover:scale-110 group-hover:-rotate-3 transition-all duration-300 text-sm shrink-0">
                            {(user.name || '?').charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-secondary dark:text-white text-sm">{user.name || '—'}</p>
                            <p className="text-xs text-gray-400 dark:text-dark-muted">{user.phone || '—'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`badge capitalize ${user.role === 'driver' ? 'badge-info' : user.role === 'admin' ? 'badge-warn' : 'badge-neutral'}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="relative flex h-2.5 w-2.5">
                            {!blocked && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />}
                            <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${st.dot}`} />
                          </div>
                          <span className="font-bold text-secondary dark:text-white text-sm">{st.label}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-400 dark:text-dark-muted">
                        {user.created_at ? new Date(user.created_at).toLocaleDateString() : '—'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                          {/* Block / Unblock */}
                          <button
                            onClick={() => handleBlock(user.id, blocked)}
                            className="p-2 bg-gray-50 dark:bg-dark-bg border border-transparent dark:border-dark-border text-gray-500 dark:text-dark-muted rounded-xl hover:bg-primary hover:text-white dark:hover:bg-primary transition-all hover:scale-110"
                            title={blocked ? 'Unblock' : 'Block'}
                          >
                            {blocked ? <Shield size={15} /> : <ShieldOff size={15} />}
                          </button>
                          {/* Delete */}
                          <button
                            onClick={() => setDeleteModal({ id: user.id, name: user.name || 'this user' })}
                            className="p-2 bg-gray-50 dark:bg-dark-bg border border-transparent dark:border-dark-border text-gray-500 dark:text-dark-muted rounded-xl hover:bg-red-500 hover:text-white transition-all hover:scale-110"
                            title="Delete user"
                          >
                            <Trash2 size={15} />
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

      {/* ── Delete confirm modal ── */}
      <Modal open={!!deleteModal} onClose={() => setDeleteModal(null)} title="Delete User">
        <div className="space-y-4">
          <p className="text-sm text-gray-500 dark:text-dark-muted">
            Are you sure you want to permanently delete <span className="font-bold text-secondary dark:text-white">{deleteModal?.name}</span>?
            This cannot be undone.
          </p>
          <div className="flex gap-3 justify-end">
            <button onClick={() => setDeleteModal(null)} className="btn-ghost text-sm">Cancel</button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="px-5 py-2.5 bg-red-500 text-white font-bold rounded-xl text-sm hover:bg-red-600 transition-all disabled:opacity-60"
            >
              {deleting ? 'Deleting…' : 'Delete'}
            </button>
          </div>
        </div>
      </Modal>

      {/* ── Add Admin modal ── */}
      <Modal open={addAdminModal} onClose={() => setAddAdminModal(false)} title="Add Admin User">
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3">
            {[
              { key: 'name',     label: 'Full Name',    type: 'text',     placeholder: 'Admin Name',       required: true },
              { key: 'email',    label: 'Email',        type: 'email',    placeholder: 'admin@example.com', required: true },
              { key: 'phone',    label: 'Phone',        type: 'tel',      placeholder: '+251...',           required: false },
              { key: 'password', label: 'Password',     type: 'password', placeholder: 'Min. 6 characters', required: true },
            ].map(({ key, label, type, placeholder, required }) => (
              <div key={key}>
                <label className="block text-xs font-bold text-gray-500 dark:text-dark-muted mb-1.5 uppercase tracking-wide">
                  {label}{required && <span className="text-red-500 ml-0.5">*</span>}
                </label>
                <input
                  type={type}
                  value={adminForm[key]}
                  onChange={(e) => setAdminForm(f => ({ ...f, [key]: e.target.value }))}
                  placeholder={placeholder}
                  className="w-full bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary dark:text-white transition-all"
                />
              </div>
            ))}
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button onClick={() => setAddAdminModal(false)} className="btn-ghost text-sm">Cancel</button>
            <button
              onClick={handleAddAdmin}
              disabled={addingAdmin}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white font-bold rounded-xl text-sm hover:bg-primary/90 transition-all disabled:opacity-60"
            >
              <UserPlus size={14} />
              {addingAdmin ? 'Creating…' : 'Create Admin'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
