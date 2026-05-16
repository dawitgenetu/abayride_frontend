import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'https://abayride-backend.onrender.com/api';

const api = axios.create({ baseURL: BASE_URL });

// Attach token on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-logout on 401/403
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401 || err?.response?.status === 403) {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_email');
      window.location.reload();
    }
    return Promise.reject(err);
  }
);

// Analytics
export const fetchAnalytics = () => api.get('/admin/analytics');
export const fetchAnalyticsCharts = (period = 'week') => api.get(`/admin/analytics/charts?period=${period}`);
export const fetchNotificationsSummary = () => api.get('/admin/notifications/summary');

// Users
export const fetchUsers = (params = {}) => api.get('/admin/users', { params });
export const updateUser = (id, data) => api.patch(`/admin/users/${id}`, data);
export const blockUser = (id, blocked) => api.patch(`/admin/users/${id}/block`, { blocked });
export const deleteUser = (id) => api.delete(`/admin/users/${id}`);
export const createAdminUser = (data) => api.post('/admin/users/admin', data);

// Drivers
export const fetchDrivers = (params = {}) => api.get('/admin/drivers', { params });
export const approveDriver = (id) => api.patch(`/admin/drivers/${id}/approve`);
export const rejectDriver = (id, reason) => api.patch(`/admin/drivers/${id}/reject`, { reason });
export const deleteDriver = (userId) => api.delete(`/admin/users/${userId}`);

// Rides
export const fetchRides = (params = {}) => api.get('/admin/rides', { params });
export const assignRide = (id, driverUserId) => api.patch(`/admin/rides/${id}/assign`, { driver_user_id: driverUserId });
export const deleteRide = (id) => api.delete(`/admin/rides/${id}`);

// Payments
export const fetchPayments = (params = {}) => api.get('/admin/payments', { params });
export const exportPaymentsCsv = (params = {}) => api.get('/admin/payments/export/csv', { params, responseType: 'blob' });

// Fare settings
export const fetchFareSettings = () => api.get('/admin/settings/fare');
export const updateFareSettings = (data) => api.patch('/admin/settings/fare', data);

// Withdrawals
export const fetchWithdrawals = (params = {}) => api.get('/admin/withdrawals', { params });
export const approveWithdrawal = (id) => api.patch(`/admin/withdrawals/${id}/approve`);
export const rejectWithdrawal = (id, note) => api.patch(`/admin/withdrawals/${id}/reject`, { note });

export default api;
