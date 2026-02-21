import { useEffect, useRef } from 'react';
import { getSocket } from '../../lib/socket';
import { useAuthStore } from '../../store/authStore';

const QUICK_EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🔥'];

export default function EmojiReactions({ message, roomId, showPicker, onClose }) {
  const pickerRef = useRef(null);
  const { user } = useAuthStore();
  const currentUserId = user?._id || user?.id;

  useEffect(() => {
    if (!showPicker) return;

    let handler = null;

    const timer = setTimeout(() => {
      handler = (e) => {
        if (pickerRef.current && !pickerRef.current.contains(e.target)) {
          onClose();
        }
      };
      document.addEventListener('mousedown', handler);
      document.addEventListener('touchstart', handler);
    }, 50);

    return () => {
      clearTimeout(timer);
      if (handler) {
        document.removeEventListener('mousedown', handler);
        document.removeEventListener('touchstart', handler);
      }
    };
  }, [showPicker, onClose]);

  const handleReact = (emoji) => {
    const socket = getSocket();
    if (socket) {
      socket.emit('message:react', {
        messageId: message._id,
        roomId,
        emoji,
      });
    }
    onClose();
  };

  // Group reactions: { '👍': [userId1, userId2], ... }
  const grouped = (message.reactions || []).reduce((acc, r) => {
    const userId = r.user?._id || r.user;
    acc[r.emoji] = acc[r.emoji] || [];
    acc[r.emoji].push(userId);
    return acc;
  }, {});

  const hasReactions = Object.keys(grouped).length > 0;

  if (!hasReactions && !showPicker) return null;

  return (
    <div className="flex flex-wrap items-center gap-1 mt-1 relative">
      {/* Reaction pills */}
      {Object.entries(grouped).map(([emoji, userIds]) => {
        const iReacted = userIds.includes(currentUserId);
        return (
          <button
            key={emoji}
            onClick={() => handleReact(emoji)}
            className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs transition-colors border
              ${iReacted
                ? 'bg-primary/20 border-primary text-primary font-semibold'
                : 'bg-accent border-transparent hover:bg-accent/80'
              }`}
            title={`${userIds.length} reaction${userIds.length > 1 ? 's' : ''}`}
          >
            {emoji} <span>{userIds.length}</span>
          </button>
        );
      })}

      {/* Emoji picker */}
      {showPicker && (
        <div
          ref={pickerRef}
          className="absolute bottom-8 left-0 flex gap-2 p-3 bg-card border rounded-2xl shadow-xl z-50"
        >
          {QUICK_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              onClick={() => handleReact(emoji)}
              className="text-xl hover:scale-125 transition-transform active:scale-95"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}