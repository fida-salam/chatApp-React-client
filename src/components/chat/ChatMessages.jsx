// import { useEffect, useRef, useState } from "react";
// import { useQuery, useMutation } from "@tanstack/react-query";
// import { messageService } from "../../services/messageService";
// import { useChatStore } from "../../store/chatStore";
// import { useAuthStore } from "../../store/authStore";
// import { formatDistanceToNow } from "date-fns";
// import { Loader2, File, Download, Check, CheckCheck } from "lucide-react";
// import TypingIndicator from "./TypingIndicator";
// import MessageContextMenu from "./MessageContextMenu";
// import EmojiReactions from "./EmojiReactions";

// export default function ChatMessages({ room }) {
//   const { user } = useAuthStore();
//   const { messages, setMessages } = useChatStore();
//   const messagesEndRef = useRef(null);

//   const [contextMenu, setContextMenu] = useState(null);
//   const [editingMessage, setEditingMessage] = useState(null);
//   const [editContent, setEditContent] = useState("");
//   const [showEmojiPickerFor, setShowEmojiPickerFor] = useState(null);

//   if (!room) return null;

//   const roomMessages = messages[room._id] || [];
//   const hasMessages = roomMessages.length > 0;
//   const currentUserId = user?._id || user?.id;

//   const { isLoading, data } = useQuery({
//     queryKey: ["messages", room._id],
//     queryFn: () => messageService.getMessages(room._id),
//     enabled: !!room._id,
//     refetchOnWindowFocus: false,
//   });

//   useEffect(() => {
//     if (data && room?._id) {
//       const messagesData = data.messages || data;
//       if (!messages[room._id] || messages[room._id].length === 0) {
//         setMessages(room._id, messagesData);
//       }
//     }
//   }, [data, room?._id, setMessages]);

//   useEffect(() => {
//     if (hasMessages) {
//       messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//     }
//   }, [roomMessages, hasMessages]);

//   const deleteMutation = useMutation({
//     mutationFn: (messageId) => messageService.deleteMessage(messageId),
//     onSuccess: (_, messageId) => {
//       const updated = (messages[room._id] || []).filter(
//         (m) => m._id !== messageId
//       );
//       setMessages(room._id, updated);
//     },
//   });

//   const editMutation = useMutation({
//     mutationFn: ({ messageId, content }) =>
//       messageService.editMessage(messageId, content),
//     onSuccess: (data) => {
//       const updated = data.message || data;
//       setMessages(
//         room._id,
//         (messages[room._id] || []).map((m) =>
//           m._id === updated._id ? updated : m
//         )
//       );
//       setEditingMessage(null);
//       setEditContent("");
//     },
//   });

//   const handleContextMenu = (e, message) => {
//     e.preventDefault();
//     setShowEmojiPickerFor(null);
//     setContextMenu({ x: e.clientX, y: e.clientY, message });
//   };

//   const handleEditSubmit = (e) => {
//     e.preventDefault();
//     if (!editContent.trim() || editMutation.isPending) return;
//     editMutation.mutate({ messageId: editingMessage._id, content: editContent });
//   };

//   if (isLoading) {
//     return (
//       <div className="flex-1 flex items-center justify-center">
//         <Loader2 className="w-8 h-8 animate-spin text-primary" />
//       </div>
//     );
//   }

//   return (
//     <div className="flex-1 overflow-y-auto p-4 space-y-4">
//       {!hasMessages ? (
//         <div className="flex items-center justify-center h-full">
//           <p className="text-muted-foreground">
//             No messages yet. Start the conversation!
//           </p>
//         </div>
//       ) : (
//         roomMessages.map((message) => {
//           const isOwn =
//             message.sender?._id?.toString() === currentUserId?.toString();
//           const time = formatDistanceToNow(new Date(message.createdAt), {
//             addSuffix: true,
//           });
//           const isRead = (message.readBy?.length || 0) > 1;
//           const isEditing = editingMessage?._id === message._id;

//           return (
//             <div
//               key={message._id}
//               className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
//               onContextMenu={(e) => handleContextMenu(e, message)}
//             >
//               <div
//                 className={`flex gap-2 max-w-[70%] ${isOwn ? "flex-row-reverse" : ""}`}
//               >
//                 {!isOwn && message.sender && (
//                   <img
//                     src={
//                       message.sender.avatar ||
//                       `https://ui-avatars.com/api/?name=${message.sender.username}`
//                     }
//                     alt={message.sender.username}
//                     className="w-8 h-8 rounded-full object-cover self-end"
//                   />
//                 )}

//                 <div className="flex flex-col">
//                   {!isOwn && message.sender && (
//                     <p className="text-xs text-muted-foreground mb-1 ml-2">
//                       {message.sender.username}
//                     </p>
//                   )}

//                   {isEditing ? (
//                     <form
//                       onSubmit={handleEditSubmit}
//                       className="flex flex-col gap-2 min-w-[200px]"
//                     >
//                       <input
//                         autoFocus
//                         value={editContent}
//                         onChange={(e) => setEditContent(e.target.value)}
//                         className="text-sm border rounded-xl px-3 py-2 bg-background focus:outline-none focus:ring-2 focus:ring-primary"
//                         onKeyDown={(e) => {
//                           if (e.key === "Escape") {
//                             setEditingMessage(null);
//                             setEditContent("");
//                           }
//                         }}
//                       />
//                       <div className="flex gap-2 justify-end">
//                         <button
//                           type="button"
//                           onClick={() => {
//                             setEditingMessage(null);
//                             setEditContent("");
//                           }}
//                           className="text-xs text-muted-foreground hover:text-foreground"
//                         >
//                           Cancel
//                         </button>
//                         <button
//                           type="submit"
//                           disabled={editMutation.isPending}
//                           className="text-xs text-primary font-medium hover:underline disabled:opacity-50"
//                         >
//                           {editMutation.isPending ? "Saving..." : "Save"}
//                         </button>
//                       </div>
//                     </form>
//                   ) : (
//                     <div
//                       className={`rounded-2xl px-4 py-2 ${
//                         isOwn
//                           ? "bg-primary text-primary-foreground"
//                           : "bg-secondary text-secondary-foreground"
//                       }`}
//                     >
//                       {message.type === "text" && (
//                         <p className="text-sm whitespace-pre-wrap break-words">
//                           {message.content}
//                         </p>
//                       )}

//                       {message.type === "image" && message.attachments?.[0] && (
//                         <div>
//                           <img
//                             src={message.attachments[0].url}
//                             alt="Shared image"
//                             className="rounded-lg max-w-sm cursor-pointer hover:opacity-90 transition-opacity"
//                             onClick={() =>
//                               window.open(message.attachments[0].url, "_blank")
//                             }
//                           />
//                           {message.content !== "📷 Image" && (
//                             <p className="text-sm mt-2">{message.content}</p>
//                           )}
//                         </div>
//                       )}

//                       {message.type === "file" && message.attachments?.[0] && (
//                         <div className="flex items-center gap-3 p-2 bg-background/10 rounded-lg">
//                           <div className="p-2 bg-background/20 rounded">
//                             <File className="w-5 h-5" />
//                           </div>
//                           <div className="flex-1 min-w-0">
//                             <p className="text-sm font-medium truncate">
//                               {message.attachments[0].filename}
//                             </p>
//                             <p className="text-xs opacity-70">
//                               {(message.attachments[0].fileSize / 1024).toFixed(1)} KB
//                             </p>
//                           </div>
//                           <a
//                             href={message.attachments[0].url}
//                             download
//                             className="p-2 hover:bg-background/20 rounded transition-colors"
//                           >
//                             <Download className="w-4 h-4" />
//                           </a>
//                         </div>
//                       )}
//                     </div>
//                   )}

//                   {!isEditing && (
//                     <div
//                       className={`flex items-center gap-1 mt-1 ${
//                         isOwn ? "justify-end mr-1" : "ml-2"
//                       }`}
//                     >
//                       <p className="text-xs text-muted-foreground">
//                         {time}
//                         {message.isEdited && " (edited)"}
//                       </p>
//                       {isOwn &&
//                         (isRead ? (
//                           <CheckCheck className="w-3.5 h-3.5 text-blue-500" />
//                         ) : (
//                           <Check className="w-3.5 h-3.5 text-muted-foreground" />
//                         ))}
//                     </div>
//                   )}

//                   <EmojiReactions
//                     message={message}
//                     roomId={room._id}
//                     showPicker={showEmojiPickerFor === message._id}
//                     onClose={() => setShowEmojiPickerFor(null)}
//                   />
//                 </div>
//               </div>
//             </div>
//           );
//         })
//       )}

//       <TypingIndicator roomId={room._id} />
//       <div ref={messagesEndRef} />

//       {contextMenu && (
//         <MessageContextMenu
//           x={contextMenu.x}
//           y={contextMenu.y}
//           isOwn={
//             contextMenu.message.sender?._id?.toString() ===
//             currentUserId?.toString()
//           }
//           onReact={() => {
//             setShowEmojiPickerFor(contextMenu.message._id);
//             setContextMenu(null);
//           }}
//           onEdit={() => {
//             setEditingMessage(contextMenu.message);
//             setEditContent(contextMenu.message.content);
//             setContextMenu(null);
//           }}
//           onDelete={() => {
//             deleteMutation.mutate(contextMenu.message._id);
//             setContextMenu(null);
//           }}
//           onClose={() => setContextMenu(null)}
//         />
//       )}
//     </div>
//   );
// }

import { useEffect, useRef, useState, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { messageService } from "../../services/messageService";
import { useChatStore } from "../../store/chatStore";
import { useAuthStore } from "../../store/authStore";
import { formatDistanceToNow } from "date-fns";
import { Loader2, File, Download, Check, CheckCheck } from "lucide-react";
import TypingIndicator from "./TypingIndicator";
import MessageContextMenu from "./MessageContextMenu";
import EmojiReactions from "./EmojiReactions";

const LONG_PRESS_DURATION = 500; // ms

export default function ChatMessages({ room }) {
  const { user } = useAuthStore();
  const { messages, setMessages } = useChatStore();
  const messagesEndRef = useRef(null);

  const [contextMenu, setContextMenu] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const [editContent, setEditContent] = useState("");
  const [showEmojiPickerFor, setShowEmojiPickerFor] = useState(null);

  const longPressTimer = useRef(null);

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
        setMessages(room._id, messagesData);
      }
    }
  }, [data, room?._id, setMessages]);

  useEffect(() => {
    if (hasMessages) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [roomMessages, hasMessages]);

  const deleteMutation = useMutation({
    mutationFn: (messageId) => messageService.deleteMessage(messageId),
    onSuccess: (_, messageId) => {
      const updated = (messages[room._id] || []).filter(
        (m) => m._id !== messageId
      );
      setMessages(room._id, updated);
    },
  });

  const editMutation = useMutation({
    mutationFn: ({ messageId, content }) =>
      messageService.editMessage(messageId, content),
    onSuccess: (data) => {
      const updated = data.message || data;
      setMessages(
        room._id,
        (messages[room._id] || []).map((m) =>
          m._id === updated._id ? updated : m
        )
      );
      setEditingMessage(null);
      setEditContent("");
    },
  });

  // Right-click → context menu (desktop)
  // const handleContextMenu = (e, message) => {
  //   e.preventDefault();
  //   setShowEmojiPickerFor(null);
  //   setContextMenu({ x: e.clientX, y: e.clientY, message });
  // };
  const handleContextMenu = (e, message) => {
    e.preventDefault();
    setContextMenu(null); // never show context menu
    setShowEmojiPickerFor(
      showEmojiPickerFor === message._id ? null : message._id
    );
  };

  // Long press → emoji picker (mobile)
  const handleTouchStart = (e, message) => {
    longPressTimer.current = setTimeout(() => {
      e.preventDefault();
      setContextMenu(null);
      setShowEmojiPickerFor(message._id);
    }, LONG_PRESS_DURATION);
  };

  const handleTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!editContent.trim() || editMutation.isPending) return;
    editMutation.mutate({ messageId: editingMessage._id, content: editContent });
  };

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
          const isRead = (message.readBy?.length || 0) > 1;
          const isEditing = editingMessage?._id === message._id;

          return (
            <div
              key={message._id}
              className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
              onContextMenu={(e) => handleContextMenu(e, message)}
              onTouchStart={(e) => handleTouchStart(e, message)}
              onTouchEnd={handleTouchEnd}
              onTouchMove={handleTouchEnd}
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
                    className="w-8 h-8 rounded-full object-cover self-end"
                  />
                )}

                <div className="flex flex-col">
                  {/* Sender name */}
                  {!isOwn && message.sender && (
                    <p className="text-xs text-muted-foreground mb-1 ml-2">
                      {message.sender.username}
                    </p>
                  )}

                  {/* Edit form OR bubble */}
                  {isEditing ? (
                    <form
                      onSubmit={handleEditSubmit}
                      className="flex flex-col gap-2 min-w-[200px]"
                    >
                      <input
                        autoFocus
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="text-sm border rounded-xl px-3 py-2 bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                        onKeyDown={(e) => {
                          if (e.key === "Escape") {
                            setEditingMessage(null);
                            setEditContent("");
                          }
                        }}
                      />
                      <div className="flex gap-2 justify-end">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingMessage(null);
                            setEditContent("");
                          }}
                          className="text-xs text-muted-foreground hover:text-foreground"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={editMutation.isPending}
                          className="text-xs text-primary font-medium hover:underline disabled:opacity-50"
                        >
                          {editMutation.isPending ? "Saving..." : "Save"}
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div
                      className={`rounded-2xl px-4 py-2 ${
                        isOwn
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-secondary-foreground"
                      }`}
                    >
                      {message.type === "text" && (
                        <p className="text-sm whitespace-pre-wrap break-words">
                          {message.content}
                        </p>
                      )}

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
                              {(message.attachments[0].fileSize / 1024).toFixed(1)} KB
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
                  )}

                  {/* Timestamp + read receipt */}
                  {!isEditing && (
                    <div
                      className={`flex items-center gap-1 mt-1 ${
                        isOwn ? "justify-end mr-1" : "ml-2"
                      }`}
                    >
                      <p className="text-xs text-muted-foreground">
                        {time}
                        {message.isEdited && " (edited)"}
                      </p>
                      {isOwn &&
                        (isRead ? (
                          <CheckCheck className="w-3.5 h-3.5 text-blue-500" />
                        ) : (
                          <Check className="w-3.5 h-3.5 text-muted-foreground" />
                        ))}
                    </div>
                  )}

                  {/* Emoji reactions */}
                  <EmojiReactions
                    message={message}
                    roomId={room._id}
                    showPicker={showEmojiPickerFor === message._id}
                    onClose={() => setShowEmojiPickerFor(null)}
                  />
                </div>
              </div>
            </div>
          );
        })
      )}

      <TypingIndicator roomId={room._id} />
      <div ref={messagesEndRef} />

      {/* Context menu (right-click on desktop) */}
      {contextMenu && (
        <MessageContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          isOwn={
            contextMenu.message.sender?._id?.toString() ===
            currentUserId?.toString()
          }
          onReact={() => {
            setShowEmojiPickerFor(contextMenu.message._id);
            setContextMenu(null);
          }}
          onEdit={() => {
            setEditingMessage(contextMenu.message);
            setEditContent(contextMenu.message.content);
            setContextMenu(null);
          }}
          onDelete={() => {
            deleteMutation.mutate(contextMenu.message._id);
            setContextMenu(null);
          }}
          onClose={() => setContextMenu(null)}
        />
      )}
    </div>
  );
}