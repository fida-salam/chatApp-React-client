import api from '../lib/axios';

export const userService = {
  // searchUsers: async (query) => {
  //   const { data } = await api.get('/users/search', { params: { q: query } });
  //   return data;
  // },
  // userService.js
searchUsers: async (query = '') => {
  const { data } = await api.get('/users/search', { params: { q: query } });
  return data;
},

  getUser: async (userId) => {
    const { data } = await api.get(`/users/${userId}`);
    return data;
  },

  // ✅ Added — was missing
  getMyProfile: async () => {
    const { data } = await api.get('/users/me');
    return data;
  },

  // ✅ Fixed route: /users/profile → /users/me
  updateProfile: async (profileData) => {
    const { data } = await api.patch('/users/profile', profileData);
    return data;
  },

  uploadAvatar: async (file) => {
    const formData = new FormData();
    formData.append('avatar', file);
    const { data } = await api.post('/upload/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },
};