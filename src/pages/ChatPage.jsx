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
import { Menu, X } from "lucide-react";

export default function ChatPage() {
  const queryClient = new QueryClient();
  const { user, accessToken } = useAuthStore();
  const { currentRoom, setRooms } = useChatStore();
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 768);

  const { data: roomsData } = useQuery({
    queryKey: ["rooms"],
    queryFn: roomService.getRooms,
  });

  useEffect(() => {
    if (roomsData) setRooms(roomsData.rooms || roomsData);
  }, [roomsData, setRooms]);

  // Close sidebar on mobile when room is selected
  useEffect(() => {
    if (window.innerWidth < 768 && currentRoom) {
      setSidebarOpen(false);
    }
  }, [currentRoom]);

  // Update sidebar state on window resize
  useEffect(() => {
    const handleResize = () => {
      setSidebarOpen(window.innerWidth >= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
    
      socket.emit("room:join", { roomId: newRoom._id });
      queryClient.invalidateQueries(["rooms"]);
    });

    return () => {
      socket.off("connect");
      socket.off("connect_error");
      socket.off("room:new");
    };
  }, [accessToken, user, setRooms]);

  useEffect(() => {
    const socket = getSocket();
    if (socket?.connected && currentRoom) {
      socket.emit("join_room", currentRoom._id);
    }
  }, [currentRoom]);

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar overlay on mobile */}
      {sidebarOpen && window.innerWidth < 768 && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed md:relative md:flex h-full z-40 transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <ChatSidebar onCreateRoom={() => setShowNewChatModal(true)} />
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header with menu button */}
        <div className="md:hidden flex items-center justify-between px-3 py-2 border-b bg-card h-16">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-accent rounded-lg"
          >
            {sidebarOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
          <h1 className="text-lg font-semibold flex-1 text-center">
            {currentRoom
              ? currentRoom.type === "dm"
                ? currentRoom.members?.find((m) => m._id !== user._id)?.username || "Chat"
                : currentRoom.name
              : "Messages"}
          </h1>
          <div className="w-10" />
        </div>

        {/* Desktop header */}
        <div className="hidden md:block">
          <ChatHeader room={currentRoom} />
        </div>

        {currentRoom ? (
          <>
            <ChatMessages room={currentRoom} />
            <ChatInput room={currentRoom} />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center px-4">
            <div className="text-center">
              <div className="w-16 h-16 sm:w-24 sm:h-24 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <svg
                  className="w-8 h-8 sm:w-12 sm:h-12 text-primary"
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
              <h2 className="text-xl sm:text-2xl font-bold mb-2">Welcome to Chat!</h2>
              <p className="text-muted-foreground text-sm sm:text-base">
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
