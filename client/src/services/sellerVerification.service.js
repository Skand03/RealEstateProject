import api from './api';

export const sellerVerificationService = {
  submitVerification: (formData) =>
    api.post('/seller-verification/submit', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  getMyStatus: () => api.get('/seller-verification/status'),
  getAllVerifications: (params) =>
    api.get('/seller-verification', { params }),
  getVerificationById: (id) => api.get(`/seller-verification/${id}`),
  approveVerification: (id, data) =>
    api.patch(`/seller-verification/${id}/approve`, data),
  rejectVerification: (id, data) =>
    api.patch(`/seller-verification/${id}/reject`, data),
};
