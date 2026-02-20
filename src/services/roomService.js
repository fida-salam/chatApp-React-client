import api from '../lib/axios';

export const roomService = {
  getRooms: async () => {
    const { data } = await api.get('/rooms');
    return data;
  },

  getRoom: async (roomId) => {
    const { data } = await api.get(`/rooms/${roomId}`);
    return data;
  },

  createRoom: async (roomData) => {
    const { data } = await api.post('/rooms', roomData);
    return data;
  },

  addMembers: async (roomId, userIds) => {
    const { data } = await api.post(`/rooms/${roomId}/members`, { userIds });
    return data;
  },

  removeMember: async (roomId, userId) => {
    const { data } = await api.delete(`/rooms/${roomId}/members/${userId}`);
    return data;
  },

  leaveRoom: async (roomId) => {
    const { data } = await api.patch(`/rooms/${roomId}/leave`);
    return data;
  },
};
