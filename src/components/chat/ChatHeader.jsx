import { Users, MoreVertical, X, Phone, Video } from "lucide-react";
import { Button } from "../ui/button";
import { useAuthStore } from "../../store/authStore";
import { useChatStore } from "../../store/chatStore";
import { useEffect, useState } from "react";

export default function ChatHeader({ room }) {
  const { user } = useAuthStore();
  const { onlineUsers } = useChatStore();
  const [otherMember, setOtherMember] = useState(null);
  const [showRoomInfo, setShowRoomInfo] = useState(false);

  useEffect(() => {
    if (room && user) {
      const currentUserId = user?._id || user?.id;

      const other = room.members?.find((m) => {
        const memberId = m._id?.toString();
        return memberId !== currentUserId?.toString();
      });

      console.log("ChatHeader - Other member:", {
        roomId: room._id,
        currentUserId,
        otherMember: other,
        allMembers: room.members,
      });

      setOtherMember(other);
    }
  }, [room, user]);

  if (!room) {
    return (
      <div className="h-16 border-b flex items-center justify-center bg-card">
        <p className="text-muted-foreground">
          Select a chat to start messaging
        </p>
      </div>
    );
  }

  const isOnline = otherMember
    ? onlineUsers.has(otherMember._id?.toString())
    : false;

  return (
    <div className="h-16 border-b px-6 flex items-center justify-between bg-card">
      <div className="flex items-center gap-3">
        <div>
          <h2 className="font-semibold">
            {room.type === "dm"
              ? otherMember?.username || "Unknown User"
              : room.name}
          </h2>
          <p className="text-sm flex items-center gap-1">
            {room.type === "group" && (
              <span className="text-muted-foreground">
                <Users className="w-3 h-3 inline mr-1" />
                {room.members?.length || 0} members
              </span>
            )}
            {room.type === "dm" && otherMember && (
              <span
                className={
                  isOnline ? "text-green-500" : "text-muted-foreground"
                }
              >
                ● {isOnline ? "Online" : "Offline"}
              </span>
            )}
          </p>
        </div>
      </div>

      {/* <Button variant="ghost" size="icon">
        <MoreVertical className="w-5 h-5" />
      </Button> */}
      <Button variant="ghost" size="icon" onClick={() => setShowRoomInfo(true)}>
  <MoreVertical className="w-5 h-5" />
</Button>

{/* Room Info Drawer */}
{showRoomInfo && (
  <div className="fixed inset-y-0 right-0 w-72 bg-card border-l shadow-xl z-40 flex flex-col">
    <div className="p-4 border-b flex items-center justify-between">
      <h3 className="font-semibold">
        {room.type === 'dm' ? 'Contact Info' : 'Group Info'}
      </h3>
      <Button size="icon" variant="ghost" onClick={() => setShowRoomInfo(false)}>
        <X className="w-5 h-5" />
      </Button>
    </div>

    <div className="flex-1 overflow-y-auto p-4 space-y-6">
      {/* Avatar + Name */}
      <div className="flex flex-col items-center gap-3 py-4">
        <img
          src={
            room.type === 'dm'
              ? otherMember?.avatar || `https://ui-avatars.com/api/?name=${otherMember?.username}`
              : `https://ui-avatars.com/api/?name=${room.name}&background=random`
          }
          alt="avatar"
          className="w-20 h-20 rounded-full object-cover"
        />
        <div className="text-center">
          <h4 className="font-semibold text-lg">
            {room.type === 'dm' ? otherMember?.username : room.name}
          </h4>
          {room.type === 'dm' && (
            <p className={`text-sm ${isOnline ? 'text-green-500' : 'text-muted-foreground'}`}>
              ● {isOnline ? 'Online' : 'Offline'}
            </p>
          )}
          {room.type === 'group' && (
            <p className="text-sm text-muted-foreground">
              {room.members?.length} members
            </p>
          )}
        </div>
      </div>

      {/* Members list for group */}
      {room.type === 'group' && (
        <div className="space-y-2">
          <h5 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Members
          </h5>
          {room.members?.map((member) => (
            <div key={member._id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent">
              <img
                src={member.avatar || `https://ui-avatars.com/api/?name=${member.username}`}
                alt={member.username}
                className="w-8 h-8 rounded-full object-cover"
              />
              <span className="text-sm font-medium">{member.username}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  </div>
  )}
    </div>
  );
}
