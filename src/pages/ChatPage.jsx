import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { initSocket, getSocket } from "../lib/socket";
import { useAuthStore } from "../store/authStore";
import { useChatStore } from "../store/chatStore";
import { roomService } from "../services/roomService";
import ChatSidebar from "../components/chat/ChatSidebar";
import ChatHeader from "../components/chat/ChatHeader";
import ChatMessages from "../components/chat/ChatMessages";
import ChatInput from "../components/chat/ChatInput";
import NewChatModal from "../components/chat/NewChatModal";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export default function ChatPage() {
  const queryClient = new QueryClient();
  const { user, accessToken } = useAuthStore();
  const { currentRoom, setRooms } = useChatStore();
  const [showNewChatModal, setShowNewChatModal] = useState(false);

  const { data: roomsData } = useQuery({
    queryKey: ["rooms"],
    queryFn: roomService.getRooms,
  });

  useEffect(() => {
    if (roomsData) setRooms(roomsData.rooms || roomsData);
  }, [roomsData, setRooms]);

  useEffect(() => {
    if (!accessToken || !user) return;

    const socket = initSocket(accessToken);

    socket.on("connect", () => {
      console.log("✅ Socket connected:", socket.id);
      if (currentRoom) socket.emit("join_room", currentRoom._id);
    });

    socket.on("connect_error", (error) => {
      console.error("❌ Socket error:", error.message);
    });

    socket.on("room:new", (newRoom) => {
      const { rooms, setRooms, currentRoom, setCurrentRoom } = useChatStore.getState();
    
      const exists = rooms.some((r) => r._id === newRoom._id);
      if (!exists) {
        setRooms([newRoom, ...rooms]);
      }
    
      // Auto-join the socket room
      socket.emit("room:join", { roomId: newRoom._id });
    
      // Refetch rooms list to sync sidebar
      queryClient.invalidateQueries(["rooms"]);
    });
    // socket.on("room:new", (newRoom) => {
    //   console.log("🆕 New room received via socket:", newRoom);

    //   setRooms((prevRooms) => {
    //     const exists = prevRooms.some((r) => r._id === newRoom._id);
    //     if (!exists) {
    //       console.log("➕ Adding new room to store");
    //       return [newRoom, ...prevRooms];
    //     }
    //     return prevRooms;
    //   });

    //   const { currentRoom } = useChatStore.getState();
    //   if (!currentRoom) {
    //     console.log("🔄 Auto-selecting new room");
    //     useChatStore.getState().setCurrentRoom(newRoom);
    //   }

    //   socket.emit("join_room", newRoom._id);
    // });

    return () => {
      socket.off("connect");
      socket.off("connect_error");
      socket.off("room:new"); // Clean up this listener
    };
  }, [accessToken, user, setRooms]); // Add setRooms to dependencies

  useEffect(() => {
    const socket = getSocket();
    if (socket?.connected && currentRoom) {
      socket.emit("join_room", currentRoom._id);
    }
  }, [currentRoom]);

  return (
    <div className="flex h-screen bg-background">
      <ChatSidebar onCreateRoom={() => setShowNewChatModal(true)} />

      <div className="flex-1 flex flex-col">
        <ChatHeader room={currentRoom} />

        {currentRoom ? (
          <>
            <ChatMessages room={currentRoom} />
            <ChatInput room={currentRoom} />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <svg
                  className="w-12 h-12 text-primary"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold mb-2">Welcome to Chat!</h2>
              <p className="text-muted-foreground">
                Select a conversation or start a new chat
              </p>
            </div>
          </div>
        )}
      </div>

      {showNewChatModal && (
        <NewChatModal onClose={() => setShowNewChatModal(false)} />
      )}
    </div>
  );
}
