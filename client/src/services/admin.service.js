import api from './api';

export const adminService = {
  getDashboardStats: () => api.get('/admin/stats'),
  getUsers: (params) => api.get('/users', { params }),
  updateUserStatus: (id) => api.patch(`/users/${id}/suspend`),
  getVerifications: (params) => api.get('/seller-verification', { params }),
  approveVerification: (id) => api.patch(`/seller-verification/${id}/approve`),
  rejectVerification: (id, data) => api.patch(`/seller-verification/${id}/reject`, data),
  getProperties: (params) => api.get('/admin/properties', { params }),
  updatePropertyStatus: (id, data) => api.patch(`/admin/properties/${id}/status`, data),
  deleteProperty: (id) => api.delete(`/properties/${id}`),
  getBookings: (params) => api.get('/bookings', { params }),
  getReviews: (params) => api.get('/reviews', { params }),
  deleteReview: (id) => api.delete(`/reviews/${id}`),
  getCommissions: (params) => api.get('/commissions', { params }),
};
