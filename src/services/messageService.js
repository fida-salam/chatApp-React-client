import api from '../lib/axios';

export const messageService = {
  getMessages: async (roomId, page = 1, limit = 50) => {
    const { data } = await api.get(`/messages/room/${roomId}`, {
      params: { page, limit },
    });
    return data;
  },

  sendMessage: async (messageData) => {
    const { data } = await api.post('/messages', messageData);
    return data;
  },

  markAsRead: async (messageId) => {
    const { data } = await api.patch(`/messages/${messageId}/read`);
    return data;
  },

  markAllAsRead: async (roomId) => {
    const { data } = await api.patch(`/messages/room/${roomId}/read-all`);
    return data;
  },

  editMessage: async (messageId, content) => {
    const { data } = await api.patch(`/messages/${messageId}`, { content });
    return data;
  },

  deleteMessage: async (messageId, deleteForEveryone = false) => {
    const { data } = await api.delete(`/messages/${messageId}`, {
      params: { deleteForEveryone },
    });
    return data;
  },

  getUnreadCount: async () => {
    const { data } = await api.get('/messages/unread');
    return data;
  },

  searchMessages: async (query) => {
    const { data } = await api.get('/messages/search', { params: { q: query } });
    return data;
  },
};
