import api from './api';

export const propertyService = {
  getProperties: (params) => api.get('/properties', { params }),
  getPropertyById: (id) => api.get(`/properties/${id}`),
  getMyProperties: (params) => api.get('/properties/seller/mine', { params }),
  createProperty: (formData) =>
    api.post('/properties', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  updateProperty: (id, formData) =>
    api.patch(`/properties/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  deleteProperty: (id) => api.delete(`/properties/${id}`),
  deletePropertyImage: (propertyId, imageId) =>
    api.delete(`/properties/${propertyId}/images/${imageId}`),
  setPrimaryImage: (propertyId, imageId) =>
    api.patch(`/properties/${propertyId}/images/${imageId}/primary`),
};
