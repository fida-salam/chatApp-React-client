import { create } from 'zustand';

export const useChatStore = create((set, get) => ({
  rooms: [],
  currentRoom: null,
  messages: {},
  unreadCounts: {},
  typingUsers: {},
  onlineUsers: new Set(),

  setRooms: (rooms) => set({ rooms }),
  
  setCurrentRoom: (room) => set({ currentRoom: room }),
  
  addRoom: (room) => set((state) => ({
    rooms: [room, ...state.rooms],
  })),
  
  updateRoom: (roomId, updates) => set((state) => ({
    rooms: state.rooms.map((room) =>
      room._id === roomId ? { ...room, ...updates } : room
    ),
  })),

  setMessages: (roomId, messages) => set((state) => ({
    messages: {
      ...state.messages,
      [roomId]: messages,
    },
  })),

  addMessage: (roomId, message) => set((state) => ({
    messages: {
      ...state.messages,
      [roomId]: [...(state.messages[roomId] || []), message],
    },
  })),

  updateMessage: (roomId, messageId, updates) => set((state) => ({
    messages: {
      ...state.messages,
      [roomId]: state.messages[roomId]?.map((msg) =>
        msg._id === messageId ? { ...msg, ...updates } : msg
      ),
    },
  })),

  deleteMessage: (roomId, messageId) => set((state) => ({
    messages: {
      ...state.messages,
      [roomId]: state.messages[roomId]?.filter((msg) => msg._id !== messageId),
    },
  })),

  setUnreadCount: (roomId, count) => set((state) => ({
    unreadCounts: {
      ...state.unreadCounts,
      [roomId]: count,
    },
  })),

  setTypingUsers: (roomId, users) => set((state) => ({
    typingUsers: {
      ...state.typingUsers,
      [roomId]: users,
    },
  })),











  setUserOnline: (userId, isOnline) => set((state) => {
    const newOnlineUsers = new Set(state.onlineUsers);
    const id = userId?.toString();
    if (isOnline) {
      newOnlineUsers.add(id);
    } else {
      newOnlineUsers.delete(id);
    }
    return { onlineUsers: newOnlineUsers };
  }),
  reset: () => set({
    rooms: [],
    currentRoom: null,
    messages: {},
    unreadCounts: {},
    typingUsers: {},
    onlineUsers: new Set(),
  }),
}));
