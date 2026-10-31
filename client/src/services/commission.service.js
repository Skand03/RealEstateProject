import api from './api';

export const commissionService = {
  getSellerCommissions: (params) => api.get('/commissions/seller/mine', { params }),
  getBuyerCommissions: (params) => api.get('/commissions/buyer/mine', { params }),
  getAllCommissions: (params) => api.get('/commissions', { params }),
};
