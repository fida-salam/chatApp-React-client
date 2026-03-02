import { useEffect, useRef, useState } from 'react';
import { getSocket } from '../../lib/socket';
import { useAuthStore } from '../../store/authStore';
import { ChevronDown } from 'lucide-react';

const QUICK_EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🔥', '😍', '🤔', '👏', '🔥'];
const EXTENDED_EMOJIS = [
  '👍', '👎', '❤️', '🔥', '😀', '😂', '😍', '🤔', '😢', '😡',
  '👏', '🙌', '🤝', '✨', '🎉', '💯', '🚀', '⭐', '💬', '👀'
];

export default function EmojiReactions({ message, roomId, showPicker, onClose }) {
  const pickerRef = useRef(null);
  const { user } = useAuthStore();
  const currentUserId = user?._id || user?.id;
  const [showExtended, setShowExtended] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

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
    setShowExtended(false);
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
  if (!isClient) return null; // prevent hydration mismatch

  return (
    <div className="flex flex-wrap items-center gap-1 mt-2 relative">
      {/* Reaction pills */}
      {Object.entries(grouped).map(([emoji, userIds]) => {
        const iReacted = userIds.includes(currentUserId);
        return (
          <button
            key={emoji}
            onClick={() => handleReact(emoji)}
            className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs sm:text-sm transition-all border
              ${iReacted
                ? 'bg-primary/20 border-primary text-primary font-semibold scale-105'
                : 'bg-accent border-transparent hover:bg-accent/80 active:scale-95'
              }`}
            title={`${userIds.length} reaction${userIds.length > 1 ? 's' : ''}`}
          >
            <span>{emoji}</span>
            <span className="hidden sm:inline">{userIds.length}</span>
          </button>
        );
      })}

      {/* Emoji picker button */}
      {showPicker && (
        <div
          ref={pickerRef}
          className="fixed sm:absolute bottom-16 sm:bottom-8 right-4 sm:right-auto sm:left-0 z-50 flex flex-col gap-2 p-3 bg-card border rounded-2xl shadow-2xl"
          style={{
            maxHeight: '70vh',
            overflowY: 'auto',
            minWidth: '280px',
            maxWidth: '90vw',
          }}
        >
          {/* Quick reactions */}
          <div className="flex flex-wrap gap-2 justify-center">
            {QUICK_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => handleReact(emoji)}
                className="text-xl sm:text-2xl hover:scale-125 transition-transform active:scale-95 p-1 rounded hover:bg-primary/10"
                type="button"
              >
                {emoji}
              </button>
            ))}
          </div>

          {/* Toggle for extended picker */}
          <button
            type="button"
            onClick={() => setShowExtended(!showExtended)}
            className="w-full py-2 flex items-center justify-center gap-2 text-xs text-muted-foreground hover:text-foreground border-t transition-colors"
          >
            More emojis
            <ChevronDown
              className={`w-4 h-4 transition-transform ${
                showExtended ? 'rotate-180' : ''
              }`}
            />
          </button>

          {/* Extended picker */}
          {showExtended && (
            <div className="flex flex-wrap gap-2 justify-center pt-2 border-t">
              {EXTENDED_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => handleReact(emoji)}
                  className="text-xl sm:text-2xl hover:scale-125 transition-transform active:scale-95 p-1 rounded hover:bg-primary/10"
                  type="button"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}