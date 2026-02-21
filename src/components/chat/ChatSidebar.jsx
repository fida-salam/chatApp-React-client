import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { roomService } from "../../services/roomService";
import { useChatStore } from "../../store/chatStore";
import { useAuthStore } from "../../store/authStore";
import { MessageSquare, Search, Plus, LogOut, Camera } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { formatDistanceToNow } from "date-fns";
import ProfileModal from './ProfileModal';

export default function ChatSidebar({ onCreateRoom }) {
  const { user, logout } = useAuthStore();
  const [showProfile, setShowProfile] = useState(false);
  const { rooms, currentRoom, setCurrentRoom, setRooms, unreadCounts,clearUnread } =
    useChatStore();
  const [searchQuery, setSearchQuery] = useState("");

  const { isLoading, data } = useQuery({
    queryKey: ["rooms"],
    queryFn: roomService.getRooms,
  });

  useEffect(() => {
    if (data) setRooms(data.rooms || data);
  }, [data]);

  const filteredRooms = rooms.filter((room) => {
    if (room.type === "dm") {
      const otherUser = room.members?.find((m) => m._id !== user._id);
      if (!otherUser) return false;
    }

    const roomName =
      room.type === "dm"
        ? room.members?.find((m) => m._id !== user._id)?.username || "Unknown"
        : room.name;
    return roomName.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const getRoomName = (room) => {
    if (room.type === "dm") {
      const otherUser = room.members?.find((m) => m._id !== user._id);
      return otherUser?.username || "Unknown User";
    }
    return room.name;
  };

  const getRoomAvatar = (room) => {
    if (room.type === "dm") {
      const otherUser = room.members?.find((m) => m._id !== user._id);
      return (
        otherUser?.avatar ||
        `https://ui-avatars.com/api/?name=${otherUser?.username}`
      );
    }
    return `https://ui-avatars.com/api/?name=${room.name}&background=random`;
  };

  const handleLogout = () => {
    logout();
    window.location.href = "/login";
  };

  return (
    <div className="w-80 border-r bg-card flex flex-col h-screen">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-primary" />
            <h2 className="text-lg font-semibold">Chats</h2>
          </div>
          <Button
            size="icon"
            variant="ghost"
            onClick={handleLogout}
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search chats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* New Chat Button */}
      <div className="p-4 border-b">
        <Button onClick={onCreateRoom} className="w-full" variant="outline">
          <Plus className="w-4 h-4 mr-2" />
          New Chat
        </Button>
      </div>

      {/* Room List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-4 text-center text-muted-foreground">
            Loading...
          </div>
        ) : filteredRooms.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            {searchQuery ? "No chats found" : "No chats yet"}
          </div>
        ) : (
          filteredRooms.map((room) => {
            const isActive = currentRoom?._id === room._id;
            const unreadCount = unreadCounts[room._id] || 0;

            return (
              <div
                key={room._id}
                onClick={() => {
                  setCurrentRoom(room)
                  clearUnread(room._id);
                }}
                className={`flex items-center gap-3 p-4 cursor-pointer transition-colors hover:bg-accent ${isActive ? "bg-accent" : ""
                  }`}
              >
                <div className="relative">
                  <img
                    src={getRoomAvatar(room)}
                    alt={getRoomName(room)}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  {room.type === "dm" &&
                    (() => {
                      const otherUser = room.members?.find(
                        (m) => m._id !== user._id,
                      );
                      const isOnline =
                        otherUser &&
                        useChatStore.getState().onlineUsers.has(otherUser._id);
                      return isOnline ? (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-card" />
                      ) : null;
                    })()}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium truncate">
                      {getRoomName(room)}
                    </h3>
                    {room.lastMessageAt && (
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(room.lastMessageAt), {
                          addSuffix: true,
                        })}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground truncate">
                      {room.lastMessage?.content || "No messages yet"}
                    </p>
                    {unreadCount > 0 && (
                      <span className="ml-2 px-2 py-0.5 text-xs font-medium text-white bg-primary rounded-full">
                        {unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* User Info */}
      <div className="p-4 border-t">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowProfile(true)}
            className="relative flex-shrink-0 group"
            title="Edit profile"
          >
            <img
              src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.username}`}
              alt={user?.username}
              className="w-10 h-10 rounded-full object-cover ring-2 ring-transparent group-hover:ring-primary transition-all"
            />
            <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Camera className="w-4 h-4 text-white" />
            </div>
          </button>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium truncate">{user?.username}</h3>
            <p className="text-sm text-muted-foreground truncate">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* <div className="p-4 border-t">
        <div className="flex items-center gap-3">
          <img
            src={
              user?.avatar ||
              `https://ui-avatars.com/api/?name=${user?.username}`
            }
            alt={user?.username}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div className="flex-1 min-w-0">
            <h3 className="font-medium truncate">{user?.username}</h3>
            <p className="text-sm text-muted-foreground truncate">
              {user?.email}
            </p>
          </div>
        </div>
      </div> */}
      {showProfile && <ProfileModal onClose={() => setShowProfile(false)} />}

    </div >
  );
}
