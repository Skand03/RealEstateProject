import api from './api';

export const favoriteService = {
  getFavorites: (params) => api.get('/favorites', { params }),
  addFavorite: (propertyId) => api.post('/favorites', { propertyId }),
  removeFavorite: (propertyId) => api.delete(`/favorites/${propertyId}`),
  checkFavorite: (propertyId) => api.get(`/favorites/check/${propertyId}`),
};
