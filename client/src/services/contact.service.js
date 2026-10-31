import api from './api';

export const contactService = {
  create: (data) => api.post('/contact', data),
};
