// import { useState } from "react";
// import { useMutation, useQueryClient } from "@tanstack/react-query";
// import { messageService } from "../../services/messageService";
// import { useChatStore } from "../../store/chatStore";
// import { Button } from "../ui/button";
// import { Input } from "../ui/input";
// import { useAuthStore } from "../../store/authStore";
// import { Send, Paperclip, Image as ImageIcon, Smile } from "lucide-react";
// import { getSocket } from "../../lib/socket"; // ✅ Import socket

// export default function ChatInput({ room }) {
//   const [message, setMessage] = useState("");
//   const queryClient = useQueryClient();
//   const { addMessage } = useChatStore();
//   const { user } = useAuthStore();

//   const currentUserId = user?._id || user?.id;

//   const generateTempId = () => {
//     return `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
//   };

//   const sendMessageMutation = useMutation({
//     mutationFn: (messageData) => messageService.sendMessage(messageData),
//     onSuccess: (data, variables) => {
//       const savedMessage = data.data || data;
//       const tempId = variables.tempId;

//       if (savedMessage && !savedMessage.sender?._id) {
//         savedMessage.sender = {
//           ...user,
//           _id: currentUserId, // Use safe ID
//         };
//       }

//       addMessage(room._id, savedMessage);

//       queryClient.invalidateQueries(["messages", room._id]);
//       queryClient.invalidateQueries(["rooms"]);

//       console.log("✅ Message sent successfully:", savedMessage);
//     },
//     onError: (error, variables) => {
//       console.error("❌ Error sending message:", error);
//     },
//   });

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     if (!message.trim()) return;

//     const tempId = generateTempId();
//     const messageContent = message;
//     setMessage("");

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
//         // ← was 'send_message', must match server
//         roomId: room._id,
//         content: messageContent,
//         type: "text",
//         tempId,
//       });
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
//       socket.emit("typing:start", {
//         roomId: room._id,
//       });
//     }
//   };

//   const handleStopTyping = () => {
//     const socket = getSocket();
//     if (socket) {
//       socket.emit("typing:stop", {
//         roomId: room._id,
//       });
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
//             disabled={sendMessageMutation.isPending}
//           >
//             <Paperclip className="w-5 h-5" />
//           </Button>
//           <Button
//             type="button"
//             size="icon"
//             variant="ghost"
//             title="Send image"
//             disabled={sendMessageMutation.isPending}
//           >
//             <ImageIcon className="w-5 h-5" />
//           </Button>
//         </div>

//         {/* Message Input */}
//         <div className="flex-1">
//           <Input
//             value={message}
//             onChange={(e) => setMessage(e.target.value)}
//             onKeyPress={handleKeyPress}
//             onFocus={handleTyping}
//             onBlur={handleStopTyping}
//             placeholder="Type a message..."
//             className="resize-none"
//             disabled={sendMessageMutation.isPending}
//           />
//         </div>

//         {/* Emoji Button */}
//         <Button
//           type="button"
//           size="icon"
//           variant="ghost"
//           title="Add emoji"
//           disabled={sendMessageMutation.isPending}
//         >
//           <Smile className="w-5 h-5" />
//         </Button>

//         {/* Send Button */}
//         <Button
//           type="submit"
//           size="icon"
//           disabled={!message.trim() || sendMessageMutation.isPending}
//         >
//           <Send className="w-5 h-5" />
//         </Button>
//       </form>

//       {/* Sending indicator */}
//       {sendMessageMutation.isPending && (
//         <div className="text-xs text-muted-foreground mt-2">Sending...</div>
//       )}
//     </div>
//   );
// }
import { useState } from "react";
import { useChatStore } from "../../store/chatStore";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useAuthStore } from "../../store/authStore";
import { Send, Paperclip, Image as ImageIcon, Smile } from "lucide-react";
import { getSocket } from "../../lib/socket";

export default function ChatInput({ room }) {
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const { addMessage } = useChatStore();
  const { user } = useAuthStore();

  const currentUserId = user?._id || user?.id;

  const generateTempId = () => {
    return `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!message.trim() || isSending) return;

    const tempId = generateTempId();
    const messageContent = message;
    setMessage("");
    setIsSending(true);

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
      console.error("❌ Socket not connected");
      setIsSending(false);
    }
  };

  const handleKeyPress = (e) => {
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

  return (
    <div className="border-t p-4 bg-card">
      <form onSubmit={handleSubmit} className="flex items-end gap-2">
        {/* File Upload Buttons */}
        <div className="flex gap-1">
          <Button
            type="button"
            size="icon"
            variant="ghost"
            title="Attach file"
            disabled={isSending}
          >
            <Paperclip className="w-5 h-5" />
          </Button>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            title="Send image"
            disabled={isSending}
          >
            <ImageIcon className="w-5 h-5" />
          </Button>
        </div>

        {/* Message Input */}
        <div className="flex-1">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            onFocus={handleTyping}
            onBlur={handleStopTyping}
            placeholder="Type a message..."
            className="resize-none"
            disabled={isSending}
          />
        </div>

        {/* Emoji Button */}
        <Button
          type="button"
          size="icon"
          variant="ghost"
          title="Add emoji"
          disabled={isSending}
        >
          <Smile className="w-5 h-5" />
        </Button>

        {/* Send Button */}
        <Button
          type="submit"
          size="icon"
          disabled={!message.trim() || isSending}
        >
          <Send className="w-5 h-5" />
        </Button>
      </form>

      {/* Sending indicator */}
      {isSending && (
        <div className="text-xs text-muted-foreground mt-2">Sending...</div>
      )}
    </div>
  );
}