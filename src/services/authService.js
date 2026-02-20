import api from '../lib/axios';

export const authService = {
  register: async (userData) => {
    const { data } = await api.post('/auth/register', userData);
    return data;
  },

  login: async (credentials) => {
    const { data } = await api.post('/auth/login', credentials);
    return data;
  },

  logout: async () => {
    const { data } = await api.post('/auth/logout');
    return data;
  },

  getCurrentUser: async () => {
    const { data } = await api.get('/auth/me');
    return data;
  },

  refreshToken: async (refreshToken) => {
    const { data } = await api.post('/auth/refresh', { refreshToken });
    return data;
  },

  verifyEmail: async (token) => {
    const { data } = await api.get(`/auth/verify-email?token=${token}`);
    return data;
  },

  resendVerification: async (email) => {
    const { data } = await api.post('/auth/resend-verification', { email });
    return data;
  },

  forgotPassword: async (email) => {
    const { data } = await api.post('/auth/forgot-password', { email });
    return data;
  },

  resetPassword: async (token, newPassword) => {
    const { data } = await api.post('/auth/reset-password', { token, newPassword });
    return data;
  },
};
