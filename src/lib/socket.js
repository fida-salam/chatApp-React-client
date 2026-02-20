import { io } from "socket.io-client";
import { useChatStore } from "../store/chatStore";

let socket = null;

export const initSocket = (token) => {
  if (socket) return socket;

  socket = io(import.meta.env.VITE_SOCKET_URL || "http://localhost:5000", {
    auth: { token },
    transports: ["websocket"],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  socket.on("connect", () => {
    console.log("✅ Socket connected:", socket.id);
  });

  socket.on("disconnect", () => {
    console.log("❌ Socket disconnected");
  });

  socket.on("connect_error", (error) => {
    console.error("Socket connection error:", error);
  });
  socket.on("message:new", (message) => {
    const { messages, setMessages, addMessage, updateRoom, currentRoom } = useChatStore.getState();
  
    // Always update the message in store
    const roomMessages = messages[message.room] || [];
    const optimisticIndex = roomMessages.findIndex(
      (m) => m.tempId === message.tempId || m._id === message._id
    );
  
    if (optimisticIndex !== -1) {
      const updated = [...roomMessages];
      updated[optimisticIndex] = message;
      setMessages(message.room, updated);
    } else {
      addMessage(message.room, message); // ✅ Add even if room not open
    }
  
    // Always update sidebar
    updateRoom(message.room, {
      lastMessage: message,
      lastMessageAt: message.createdAt,
    });
  });
  socket.on('message:read', ({ messageId, roomId, userId }) => {
    const { messages, setMessages } = useChatStore.getState();
    const roomMessages = messages[roomId] || [];
  
    const updated = roomMessages.map((m) => {
      if (m._id === messageId) {
        const alreadyRead = m.readBy?.some((r) => 
          (r.user || r) === userId
        );
        if (!alreadyRead) {
          return { ...m, readBy: [...(m.readBy || []), { user: userId }] };
        }
      }
      return m;
    });
  
    setMessages(roomId, updated);
  });
  socket.on('message:reaction', ({ messageId, roomId, emoji, userId }) => {
    const { messages, setMessages } = useChatStore.getState();
    const roomMessages = messages[roomId] || [];
  
    const updated = roomMessages.map((m) => {
      if (m._id === messageId) {
        const reactions = m.reactions || [];
        const exists = reactions.find(
          (r) => r.emoji === emoji && r.user === userId
        );
        return {
          ...m,
          reactions: exists
            ? reactions.filter((r) => !(r.emoji === emoji && r.user === userId)) // toggle off
            : [...reactions, { emoji, user: userId }], // add
        };
      }
      return m;
    });
  
    setMessages(roomId, updated);
  });
  // socket.on("message:new", (message) => {
  //   const { messages, setMessages, updateRoom, currentRoom } = useChatStore.getState();
  
  //   if (currentRoom?._id === message.room) {
  //     const roomMessages = messages[message.room] || [];
  
  //     // Check if optimistic version already exists by tempId
  //     const optimisticIndex = roomMessages.findIndex(
  //       (m) => m.tempId === message.tempId || m._id === message._id
  //     );
  
  //     if (optimisticIndex !== -1) {
  //       // Replace optimistic message with real one from server
  //       const updated = [...roomMessages];
  //       updated[optimisticIndex] = message;
  //       setMessages(message.room, updated);
  //     } else {
  //       // New message from another user — add normally
  //       const { addMessage } = useChatStore.getState();
  //       addMessage(message.room, message);
  //     }
  //   }
  
  //   updateRoom(message.room, {
  //     lastMessage: message,
  //     lastMessageAt: message.createdAt,
  //   });
  // });
  // socket.on("message:new", (message) => {
  //   const { addMessage, updateRoom, currentRoom } = useChatStore.getState();

  //   if (currentRoom?._id === message.room) {
  //     addMessage(message.room, message);
  //   }

  //   updateRoom(message.room, {
  //     lastMessage: message,
  //     lastMessageAt: message.createdAt,
  //   });
  // });

  socket.on("users:online", (userIds) => {
    const { setUserOnline } = useChatStore.getState();
    userIds.forEach((id) => setUserOnline(id, true));
  });

  socket.on("user:status", ({ userId, isOnline }) => {
    const { setUserOnline } = useChatStore.getState();
    setUserOnline(userId, isOnline);
  });

  socket.on("typing:start", ({ roomId, userId, username }) => {
    const { typingUsers, setTypingUsers } = useChatStore.getState();
    const current = typingUsers[roomId] || [];
    if (!current.find((u) => u.userId === userId)) {
      setTypingUsers(roomId, [...current, { userId, username }]);
    }
  });

  socket.on("typing:stop", ({ roomId, userId }) => {
    const { typingUsers, setTypingUsers } = useChatStore.getState();
    const current = typingUsers[roomId] || [];
    setTypingUsers(
      roomId,
      current.filter((u) => u.userId !== userId),
    );
  });

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
