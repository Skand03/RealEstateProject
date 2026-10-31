import api from './api';

export const reviewService = {
  createReview: (data) => api.post('/reviews', data),
  getPropertyReviews: (propertyId, params) =>
    api.get(`/reviews/property/${propertyId}`, { params }),
  getSellerReviews: (sellerId, params) =>
    api.get(`/reviews/seller/${sellerId}`, { params }),
  getMyReviews: (params) => api.get('/reviews/my', { params }),
  getAllReviews: (params) => api.get('/reviews', { params }),
  deleteReview: (id) => api.delete(`/reviews/${id}`),
};
