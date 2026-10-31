import api from './api';

export const authService = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  loginWithSupabase: (accessToken) => api.post('/auth/supabase', { accessToken }),
  getMe: () => api.get('/auth/me'),
  changePassword: (data) => api.patch('/auth/change-password', data),
  updateProfile: (formData) =>
    api.patch('/auth/profile', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};
