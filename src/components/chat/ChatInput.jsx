// // import { useState } from "react";
// // import { useMutation, useQueryClient } from "@tanstack/react-query";
// // import { messageService } from "../../services/messageService";
// // import { useChatStore } from "../../store/chatStore";
// // import { Button } from "../ui/button";
// // import { Input } from "../ui/input";
// // import { useAuthStore } from "../../store/authStore";
// // import { Send, Paperclip, Image as ImageIcon, Smile } from "lucide-react";
// // import { getSocket } from "../../lib/socket"; // ✅ Import socket

// // export default function ChatInput({ room }) {
// //   const [message, setMessage] = useState("");
// //   const queryClient = useQueryClient();
// //   const { addMessage } = useChatStore();
// //   const { user } = useAuthStore();

// //   const currentUserId = user?._id || user?.id;

// //   const generateTempId = () => {
// //     return `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
// //   };

// //   const sendMessageMutation = useMutation({
// //     mutationFn: (messageData) => messageService.sendMessage(messageData),
// //     onSuccess: (data, variables) => {
// //       const savedMessage = data.data || data;
// //       const tempId = variables.tempId;

// //       if (savedMessage && !savedMessage.sender?._id) {
// //         savedMessage.sender = {
// //           ...user,
// //           _id: currentUserId, // Use safe ID
// //         };
// //       }

// //       addMessage(room._id, savedMessage);

// //       queryClient.invalidateQueries(["messages", room._id]);
// //       queryClient.invalidateQueries(["rooms"]);

// //       console.log("✅ Message sent successfully:", savedMessage);
// //     },
// //     onError: (error, variables) => {
// //       console.error("❌ Error sending message:", error);
// //     },
// //   });

// //   const handleSubmit = (e) => {
// //     e.preventDefault();
// //     if (!message.trim()) return;

// //     const tempId = generateTempId();
// //     const messageContent = message;
// //     setMessage("");

// //     const tempMessage = {
// //       _id: tempId,
// //       room: room._id,
// //       sender: {
// //         _id: currentUserId,
// //         username: user?.username,
// //         avatar: user?.avatar,
// //       },
// //       content: messageContent,
// //       type: "text",
// //       createdAt: new Date().toISOString(),
// //       tempId,
// //     };
// //     addMessage(room._id, tempMessage);

// //     const socket = getSocket();
// //     if (socket) {
// //       socket.emit("message:send", {
// //         // ← was 'send_message', must match server
// //         roomId: room._id,
// //         content: messageContent,
// //         type: "text",
// //         tempId,
// //       });
// //     }
// //   };

// //   const handleKeyPress = (e) => {
// //     if (e.key === "Enter" && !e.shiftKey) {
// //       e.preventDefault();
// //       handleSubmit(e);
// //     }
// //   };

// //   const handleTyping = () => {
// //     const socket = getSocket();
// //     if (socket && message.trim()) {
// //       socket.emit("typing:start", {
// //         roomId: room._id,
// //       });
// //     }
// //   };

// //   const handleStopTyping = () => {
// //     const socket = getSocket();
// //     if (socket) {
// //       socket.emit("typing:stop", {
// //         roomId: room._id,
// //       });
// //     }
// //   };

// //   return (
// //     <div className="border-t p-4 bg-card">
// //       <form onSubmit={handleSubmit} className="flex items-end gap-2">
// //         {/* File Upload Buttons */}
// //         <div className="flex gap-1">
// //           <Button
// //             type="button"
// //             size="icon"
// //             variant="ghost"
// //             title="Attach file"
// //             disabled={sendMessageMutation.isPending}
// //           >
// //             <Paperclip className="w-5 h-5" />
// //           </Button>
// //           <Button
// //             type="button"
// //             size="icon"
// //             variant="ghost"
// //             title="Send image"
// //             disabled={sendMessageMutation.isPending}
// //           >
// //             <ImageIcon className="w-5 h-5" />
// //           </Button>
// //         </div>

// //         {/* Message Input */}
// //         <div className="flex-1">
// //           <Input
// //             value={message}
// //             onChange={(e) => setMessage(e.target.value)}
// //             onKeyPress={handleKeyPress}
// //             onFocus={handleTyping}
// //             onBlur={handleStopTyping}
// //             placeholder="Type a message..."
// //             className="resize-none"
// //             disabled={sendMessageMutation.isPending}
// //           />
// //         </div>

// //         {/* Emoji Button */}
// //         <Button
// //           type="button"
// //           size="icon"
// //           variant="ghost"
// //           title="Add emoji"
// //           disabled={sendMessageMutation.isPending}
// //         >
// //           <Smile className="w-5 h-5" />
// //         </Button>

// //         {/* Send Button */}
// //         <Button
// //           type="submit"
// //           size="icon"
// //           disabled={!message.trim() || sendMessageMutation.isPending}
// //         >
// //           <Send className="w-5 h-5" />
// //         </Button>
// //       </form>

// //       {/* Sending indicator */}
// //       {sendMessageMutation.isPending && (
// //         <div className="text-xs text-muted-foreground mt-2">Sending...</div>
// //       )}
// //     </div>
// //   );
// // }
// import { useState } from "react";
// import { useChatStore } from "../../store/chatStore";
// import { Button } from "../ui/button";
// import { Input } from "../ui/input";
// import { useAuthStore } from "../../store/authStore";
// import { Send, Paperclip, Image as ImageIcon, Smile } from "lucide-react";
// import { getSocket } from "../../lib/socket";

// export default function ChatInput({ room }) {
//   const [message, setMessage] = useState("");
//   const [isSending, setIsSending] = useState(false);
//   const { addMessage } = useChatStore();
//   const { user } = useAuthStore();

//   const currentUserId = user?._id || user?.id;

//   const generateTempId = () => {
//     return `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     if (!message.trim() || isSending) return;

//     const tempId = generateTempId();
//     const messageContent = message;
//     setMessage("");
//     setIsSending(true);

//     const tempMessage = {
//       _id: tempId,
//       room: room._id,
//       sender: {
//         _id: currentUserId,
//         username: user?.username,
//         avatar: user?.avatar,
//       },
//       content: messageContent,
//       type: "text",
//       createdAt: new Date().toISOString(),
//       tempId,
//     };

//     addMessage(room._id, tempMessage);

//     const socket = getSocket();
//     if (socket) {
//       socket.emit("message:send", {
//         roomId: room._id,
//         content: messageContent,
//         type: "text",
//         tempId,
//       });
//       setTimeout(() => setIsSending(false), 500);
//     } else {
//       console.error("❌ Socket not connected");
//       setIsSending(false);
//     }
//   };

//   const handleKeyPress = (e) => {
//     if (e.key === "Enter" && !e.shiftKey) {
//       e.preventDefault();
//       handleSubmit(e);
//     }
//   };

//   const handleTyping = () => {
//     const socket = getSocket();
//     if (socket && message.trim()) {
//       socket.emit("typing:start", { roomId: room._id });
//     }
//   };

//   const handleStopTyping = () => {
//     const socket = getSocket();
//     if (socket) {
//       socket.emit("typing:stop", { roomId: room._id });
//     }
//   };

//   return (
//     <div className="border-t p-4 bg-card">
//       <form onSubmit={handleSubmit} className="flex items-end gap-2">
//         {/* File Upload Buttons */}
//         <div className="flex gap-1">
//           <Button
//             type="button"
//             size="icon"
//             variant="ghost"
//             title="Attach file"
//             disabled={isSending}
//           >
//             <Paperclip className="w-5 h-5" />
//           </Button>
//           <Button
//             type="button"
//             size="icon"
//             variant="ghost"
//             title="Send image"
//             disabled={isSending}
//           >
//             <ImageIcon className="w-5 h-5" />
//           </Button>
//         </div>

//         {/* Message Input */}
//         {/* Message Input */}
//         <div className="flex-1 relative">
//           <Input
//             value={message}
//             onChange={(e) => setMessage(e.target.value)}
//             onKeyDown={handleKeyPress}   
//             onFocus={handleTyping}
//             onBlur={handleStopTyping}
//             placeholder="Type a message..."
//             className="pr-10"          
//             disabled={isSending}
//           />
//           <Button
//             type="submit"
//             size="icon"
//             variant="ghost"
//             disabled={!message.trim() || isSending}
//             className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
//           >
//             <Send className="w-4 h-4" />
//           </Button>
//         </div>

//         {/* Emoji Button */}
//         <Button
//           type="button"
//           size="icon"
//           variant="ghost"
//           title="Add emoji"
//           disabled={isSending}
//         >
//           <Smile className="w-5 h-5" />
//         </Button>

//         {/* Send Button */}
//         <Button
//           type="submit"
//           size="icon"
//           disabled={!message.trim() || isSending}
//         >
//           <Send className="w-5 h-5" />
//         </Button>
//       </form>

//       {/* Sending indicator */}
//       {isSending && (
//         <div className="text-xs text-muted-foreground mt-2">Sending...</div>
//       )}
//     </div>
//   );
// }

import { useState, useRef } from "react";
import { useChatStore } from "../../store/chatStore";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useAuthStore } from "../../store/authStore";
import { Send, Paperclip, Image as ImageIcon, Smile } from "lucide-react";
import { getSocket } from "../../lib/socket";

const EMOJI_LIST = [
  '😀','😂','😍','🥹','😎','😭','😅','🤔','😤','🥳',
  '👍','👎','❤️','🔥','🎉','💯','🙏','👏','🤣','😊',
];

export default function ChatInput({ room }) {
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const { addMessage } = useChatStore();
  const { user } = useAuthStore();
  const inputRef = useRef(null);

  const currentUserId = user?._id || user?.id;

  const generateTempId = () =>
    `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!message.trim() || isSending) return;

    const tempId = generateTempId();
    const messageContent = message;
    setMessage("");
    setIsSending(true);
    setShowEmojiPicker(false);

    const tempMessage = {
      _id: tempId,
      room: room._id,
      sender: {
        _id: currentUserId,
        username: user?.username,
        avatar: user?.avatar,
      },
      content: messageContent,
      type: "text",
      createdAt: new Date().toISOString(),
      tempId,
    };

    addMessage(room._id, tempMessage);

    const socket = getSocket();
    if (socket) {
      socket.emit("message:send", {
        roomId: room._id,
        content: messageContent,
        type: "text",
        tempId,
      });
      setTimeout(() => setIsSending(false), 500);
    } else {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleTyping = () => {
    const socket = getSocket();
    if (socket && message.trim()) {
      socket.emit("typing:start", { roomId: room._id });
    }
  };

  const handleStopTyping = () => {
    const socket = getSocket();
    if (socket) {
      socket.emit("typing:stop", { roomId: room._id });
    }
  };

  // Insert emoji at cursor position
  const handleEmojiClick = (emoji) => {
    const input = inputRef.current?.querySelector('input');
    if (input) {
      const start = input.selectionStart;
      const end = input.selectionEnd;
      const newValue = message.slice(0, start) + emoji + message.slice(end);
      setMessage(newValue);
      // Restore cursor after emoji
      setTimeout(() => {
        input.setSelectionRange(start + emoji.length, start + emoji.length);
        input.focus();
      }, 0);
    } else {
      setMessage((prev) => prev + emoji);
    }
  };

  return (
    <div className="border-t p-4 bg-card">
      {/* Emoji Picker */}
      {showEmojiPicker && (
        <div className="mb-2 p-2 bg-card border rounded-xl shadow-lg flex flex-wrap gap-1">
          {EMOJI_LIST.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => handleEmojiClick(emoji)}
              className="text-xl hover:scale-125 transition-transform p-1"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        {/* Attach buttons */}
        <div className="flex gap-1">
          <Button type="button" size="icon" variant="ghost" title="Attach file" disabled={isSending}>
            <Paperclip className="w-5 h-5" />
          </Button>
          <Button type="button" size="icon" variant="ghost" title="Send image" disabled={isSending}>
            <ImageIcon className="w-5 h-5" />
          </Button>
        </div>
        <div ref={inputRef} className="flex-1 relative">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={handleTyping}
            onBlur={handleStopTyping}
            placeholder="Type a message..."
            className="pr-10"
            disabled={isSending}
          />
          <Button
            type="submit"
            size="icon"
            variant="ghost"
            disabled={!message.trim() || isSending}
            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        {/* Emoji toggle */}
        <Button
          type="button"
          size="icon"
          variant="ghost"
          title="Add emoji"
          onClick={() => setShowEmojiPicker((prev) => !prev)}
          className={showEmojiPicker ? "text-primary" : ""}
        >
          <Smile className="w-5 h-5" />
        </Button>

        {/* Message input + inline send */}
      
      </form>
    </div>
  );
}