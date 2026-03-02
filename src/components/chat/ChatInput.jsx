

// import { useState, useRef } from "react";
// import { useChatStore } from "../../store/chatStore";
// import { Button } from "../ui/button";
// import { Input } from "../ui/input";
// import { useAuthStore } from "../../store/authStore";
// import { Send, Paperclip, Image as ImageIcon, Smile } from "lucide-react";
// import { getSocket } from "../../lib/socket";

// const EMOJI_LIST = [
//   '😀','😂','😍','🥹','😎','😭','😅','🤔','😤','🥳',
//   '👍','👎','❤️','🔥','🎉','💯','🙏','👏','🤣','😊',
// ];

// export default function ChatInput({ room }) {
//   const [message, setMessage] = useState("");
//   const [isSending, setIsSending] = useState(false);
//   const [showEmojiPicker, setShowEmojiPicker] = useState(false);
//   const { addMessage } = useChatStore();
//   const { user } = useAuthStore();
//   const inputRef = useRef(null);

//   const currentUserId = user?._id || user?.id;

//   const generateTempId = () =>
//     `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     if (!message.trim() || isSending) return;

//     const tempId = generateTempId();
//     const messageContent = message;
//     setMessage("");
//     setIsSending(true);
//     setShowEmojiPicker(false);

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
//       setIsSending(false);
//     }
//   };

//   const handleKeyDown = (e) => {
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

//   // Insert emoji at cursor position
//   const handleEmojiClick = (emoji) => {
//     const input = inputRef.current?.querySelector('input');
//     if (input) {
//       const start = input.selectionStart;
//       const end = input.selectionEnd;
//       const newValue = message.slice(0, start) + emoji + message.slice(end);
//       setMessage(newValue);
//       // Restore cursor after emoji
//       setTimeout(() => {
//         input.setSelectionRange(start + emoji.length, start + emoji.length);
//         input.focus();
//       }, 0);
//     } else {
//       setMessage((prev) => prev + emoji);
//     }
//   };

//   return (
//     <div className="border-t p-4 bg-card">
//       {/* Emoji Picker */}
//       {showEmojiPicker && (
//         <div className="mb-2 p-2 bg-card border rounded-xl shadow-lg flex flex-wrap gap-1">
//           {EMOJI_LIST.map((emoji) => (
//             <button
//               key={emoji}
//               type="button"
//               onClick={() => handleEmojiClick(emoji)}
//               className="text-xl hover:scale-125 transition-transform p-1"
//             >
//               {emoji}
//             </button>
//           ))}
//         </div>
//       )}

//       <form onSubmit={handleSubmit} className="flex items-center gap-2">
//         {/* Attach buttons */}
//         <div className="flex gap-1">
//           <Button type="button" size="icon" variant="ghost" title="Attach file" disabled={isSending}>
//             <Paperclip className="w-5 h-5" />
//           </Button>
//           <Button type="button" size="icon" variant="ghost" title="Send image" disabled={isSending}>
//             <ImageIcon className="w-5 h-5" />
//           </Button>
//         </div>
//         <div ref={inputRef} className="flex-1 relative">
//           <Input
//             value={message}
//             onChange={(e) => setMessage(e.target.value)}
//             onKeyDown={handleKeyDown}
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
//         {/* Emoji toggle */}
//         <Button
//           type="button"
//           size="icon"
//           variant="ghost"
//           title="Add emoji"
//           onClick={() => setShowEmojiPicker((prev) => !prev)}
//           className={showEmojiPicker ? "text-primary" : ""}
//         >
//           <Smile className="w-5 h-5" />
//         </Button>

//         {/* Message input + inline send */}
      
//       </form>
//     </div>
//   );
// }

import { useState, useRef } from "react";
import { useChatStore } from "../../store/chatStore";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useAuthStore } from "../../store/authStore";
import { Send, Paperclip, Image as ImageIcon, Smile, X, Loader2 } from "lucide-react";
import { getSocket } from "../../lib/socket";
import { messageService } from "../../services/messageService";

const EMOJI_LIST = [
  '😀','😂','😍','🥹','😎','😭','😅','🤔','😤','🥳',
  '👍','👎','❤️','🔥','🎉','💯','🙏','👏','🤣','😊',
];

export default function ChatInput({ room }) {
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [previewFile, setPreviewFile] = useState(null); // { file, type: 'image'|'file', previewUrl? }

  const { addMessage } = useChatStore();
  const { user } = useAuthStore();
  const inputRef = useRef(null);
  const imageInputRef = useRef(null);
  const fileInputRef = useRef(null);

  const currentUserId = user?._id || user?.id;
  const generateTempId = () =>
    `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // ─── File selection ───────────────────────────────────────────────────────

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    setPreviewFile({ file, type: "image", previewUrl });
    e.target.value = ""; // reset so same file can be re-selected
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreviewFile({ file, type: "file" });
    e.target.value = "";
  };

  const clearPreview = () => {
    if (previewFile?.previewUrl) URL.revokeObjectURL(previewFile.previewUrl);
    setPreviewFile(null);
  };

  // ─── Send ─────────────────────────────────────────────────────────────────

  const handleSubmit = async (e) => {
    e.preventDefault();
    const hasText = message.trim();
    const hasFile = !!previewFile;
    if ((!hasText && !hasFile) || isSending || isUploading) return;

    setShowEmojiPicker(false);

    // ── Upload attachment first ──
    if (hasFile) {
      setIsUploading(true);
      try {
        let serverMessage;
        if (previewFile.type === "image") {
          serverMessage = await messageService.uploadImage(previewFile.file, room._id);
        } else {
          serverMessage = await messageService.uploadFile(previewFile.file, room._id);
        }

        // messageService now unwraps the response so we should receive the
        // actual message object directly. guard just in case.
        if (!serverMessage || typeof serverMessage === 'string') {
          console.warn('Unexpected upload response', serverMessage);
        } else {
          addMessage(room._id, serverMessage);
        }

        clearPreview();
      } catch (err) {
        console.error("Upload failed:", err);
        alert("Failed to upload attachment. Please try again.");
      } finally {
        setIsUploading(false);
      }
    }

    // ── Send text message (if any) ──
    if (hasText) {
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
        setIsSending(false);
      }
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

  const handleEmojiClick = (emoji) => {
    const input = inputRef.current?.querySelector("input");
    if (input) {
      const start = input.selectionStart;
      const end = input.selectionEnd;
      const newValue = message.slice(0, start) + emoji + message.slice(end);
      setMessage(newValue);
      setTimeout(() => {
        input.setSelectionRange(start + emoji.length, start + emoji.length);
        input.focus();
      }, 0);
    } else {
      setMessage((prev) => prev + emoji);
    }
  };

  const isBusy = isSending || isUploading;

  return (
    <div className="border-t p-4 bg-card">

      {/* ── Emoji Picker ── */}
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

      {/* ── Attachment Preview ── */}
      {previewFile && (
        <div className="mb-2 flex items-center gap-3 p-3 bg-secondary rounded-xl">
          {previewFile.type === "image" ? (
            <img
              src={previewFile.previewUrl}
              alt="preview"
              className="h-16 w-16 object-cover rounded-lg border"
            />
          ) : (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Paperclip className="w-4 h-4 shrink-0" />
              <span className="truncate max-w-[200px]">{previewFile.file.name}</span>
              <span className="text-xs opacity-60">
                ({(previewFile.file.size / 1024).toFixed(1)} KB)
              </span>
            </div>
          )}
          <button
            type="button"
            onClick={clearPreview}
            className="ml-auto p-1 rounded-full hover:bg-background/40 transition-colors"
            title="Remove"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      )}

      {/* ── Hidden file inputs ── */}
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageSelect}
      />
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.zip,.rar,.csv"
        className="hidden"
        onChange={handleFileSelect}
      />

      {/* ── Input Row ── */}
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        {/* Attach buttons */}
        <div className="flex gap-1">
          <Button
            type="button"
            size="icon"
            variant="ghost"
            title="Attach file"
            disabled={isBusy}
            onClick={() => fileInputRef.current?.click()}
            className="w-9 h-9 sm:w-10 sm:h-10"
          >
            <Paperclip className="w-4 h-4 sm:w-5 sm:h-5" />
          </Button>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            title="Send image"
            disabled={isBusy}
            onClick={() => imageInputRef.current?.click()}
            className="w-9 h-9 sm:w-10 sm:h-10"
          >
            <ImageIcon className="w-4 h-4 sm:w-5 sm:h-5" />
          </Button>
        </div>

        {/* Text input + inline send */}
        <div ref={inputRef} className="flex-1 relative min-w-0">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={handleTyping}
            onBlur={handleStopTyping}
            placeholder={previewFile ? "Add a caption (optional)…" : "Type a message…"}
            className="pr-10"
            disabled={isBusy}
          />
          <Button
            type="submit"
            size="icon"
            variant="ghost"
            disabled={(!message.trim() && !previewFile) || isBusy}
            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
          >
            {isUploading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>

          <Button
            type="button"
            size="icon"
            variant="ghost"
            title="Add emoji"
            onClick={() => setShowEmojiPicker((prev) => !prev)}
            className={`w-9 h-9 sm:w-10 sm:h-10 ${
              showEmojiPicker ? "text-primary" : ""
            }`}
          >
            <Smile className="w-4 h-4 sm:w-5 sm:h-5" />
          </Button>
      </form>
    </div>
  );
}