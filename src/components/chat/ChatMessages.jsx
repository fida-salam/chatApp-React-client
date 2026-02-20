import { useEffect, useRef, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { messageService } from "../../services/messageService";
import { useChatStore } from "../../store/chatStore";
import { useAuthStore } from "../../store/authStore";
import { formatDistanceToNow } from "date-fns";
import { Loader2, File, Download } from "lucide-react";

export default function ChatMessages({ room }) {
  const { user } = useAuthStore();
  const { messages, setMessages } = useChatStore();
  const messagesEndRef = useRef(null);

  if (!room) return null;

  const roomMessages = messages[room._id] || [];
  const hasMessages = roomMessages.length > 0;

  const currentUserId = user?._id || user?.id;

  const { isLoading, data } = useQuery({
    queryKey: ["messages", room._id],
    queryFn: () => messageService.getMessages(room._id),
    enabled: !!room._id,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (data && room?._id) {
      const messagesData = data.messages || data;

      if (!messages[room._id] || messages[room._id].length === 0) {
        console.log(
          "📨 Setting messages for room:",
          room._id,
          messagesData.length,
        );
        setMessages(room._id, messagesData);
      }
    }
  }, [data, room?._id, setMessages]); // This is correct now

  useEffect(() => {
    if (hasMessages) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [roomMessages, hasMessages]);

  useEffect(() => {
    console.log(
      "📊 Messages updated for room:",
      room?._id,
      roomMessages.length,
    );
  }, [roomMessages, room?._id]);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {!hasMessages ? (
        <div className="flex items-center justify-center h-full">
          <p className="text-muted-foreground">
            No messages yet. Start the conversation!
          </p>
        </div>
      ) : (
        roomMessages.map((message) => {
          const isOwn =
            message.sender?._id?.toString() === currentUserId?.toString();
          const time = formatDistanceToNow(new Date(message.createdAt), {
            addSuffix: true,
          });

          return (
            <div
              key={message._id}
              className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`flex gap-2 max-w-[70%] ${isOwn ? "flex-row-reverse" : ""}`}
              >
                {/* Avatar */}
                {!isOwn && message.sender && (
                  <img
                    src={
                      message.sender.avatar ||
                      `https://ui-avatars.com/api/?name=${message.sender.username}`
                    }
                    alt={message.sender.username}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                )}

                {/* Message Bubble */}
                <div>
                  {!isOwn && message.sender && (
                    <p className="text-xs text-muted-foreground mb-1 ml-2">
                      {message.sender.username}
                    </p>
                  )}

                  <div
                    className={`rounded-2xl px-4 py-2 ${
                      isOwn
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground"
                    }`}
                  >
                    {/* Text Message */}
                    {message.type === "text" && (
                      <p className="text-sm whitespace-pre-wrap break-words">
                        {message.content}
                      </p>
                    )}

                    {/* Image Message */}
                    {message.type === "image" && message.attachments?.[0] && (
                      <div>
                        <img
                          src={message.attachments[0].url}
                          alt="Shared image"
                          className="rounded-lg max-w-sm cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={() =>
                            window.open(message.attachments[0].url, "_blank")
                          }
                        />
                        {message.content !== "📷 Image" && (
                          <p className="text-sm mt-2">{message.content}</p>
                        )}
                      </div>
                    )}

                    {/* File Message */}
                    {message.type === "file" && message.attachments?.[0] && (
                      <div className="flex items-center gap-3 p-2 bg-background/10 rounded-lg">
                        <div className="p-2 bg-background/20 rounded">
                          <File className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {message.attachments[0].filename}
                          </p>
                          <p className="text-xs opacity-70">
                            {(message.attachments[0].fileSize / 1024).toFixed(
                              1,
                            )}{" "}
                            KB
                          </p>
                        </div>
                        <a
                          href={message.attachments[0].url}
                          download
                          className="p-2 hover:bg-background/20 rounded transition-colors"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                      </div>
                    )}
                  </div>

                  <p
                    className={`text-xs text-muted-foreground mt-1 ${isOwn ? "text-right mr-2" : "ml-2"}`}
                  >
                    {time}
                    {message.isEdited && " (edited)"}
                  </p>
                </div>
              </div>
            </div>
          );
        })
      )}
      <div ref={messagesEndRef} />
    </div>
  );
}
