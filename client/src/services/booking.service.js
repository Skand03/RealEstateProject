import api from './api';

export const bookingService = {
  createBooking: (data) => api.post('/bookings', data),
  getBuyerBookings: (params) => api.get('/bookings/buyer/mine', { params }),
  getSellerBookings: (params) => api.get('/bookings/seller/mine', { params }),
  getAllBookings: (params) => api.get('/bookings', { params }),
  cancelBooking: (id) => api.patch(`/bookings/${id}/cancel`),
  acceptBooking: (id, data) => api.patch(`/bookings/${id}/accept`, data),
  rejectBooking: (id, data) => api.patch(`/bookings/${id}/reject`, data),
  completeBooking: (id) => api.patch(`/bookings/${id}/complete`),
};
