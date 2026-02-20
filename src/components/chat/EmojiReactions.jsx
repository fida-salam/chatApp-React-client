import { useState } from 'react';
import { getSocket } from '../../lib/socket';

const QUICK_EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🔥'];

export default function EmojiReactions({ message, roomId }) {
  const [showPicker, setShowPicker] = useState(false);

  const handleReact = (emoji) => {
    const socket = getSocket();
    if (socket) {
      socket.emit('message:react', {
        messageId: message._id,
        roomId,
        emoji,
      });
    }
    setShowPicker(false);
  };

  // Group reactions: { '👍': ['userId1', 'userId2'], '❤️': [...] }
  const grouped = (message.reactions || []).reduce((acc, r) => {
    acc[r.emoji] = acc[r.emoji] || [];
    acc[r.emoji].push(r.user);
    return acc;
  }, {});

  return (
    <div className="flex flex-wrap items-center gap-1 mt-1">
      {/* Existing reactions */}
      {Object.entries(grouped).map(([emoji, users]) => (
        <button
          key={emoji}
          onClick={() => handleReact(emoji)}
          className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-accent text-xs hover:bg-accent/80 transition-colors border"
          title={`${users.length} reaction${users.length > 1 ? 's' : ''}`}
        >
          {emoji} <span>{users.length}</span>
        </button>
      ))}

      {/* Add reaction button */}
      <div className="relative">
        <button
          onClick={() => setShowPicker(!showPicker)}
          className="px-2 py-0.5 rounded-full bg-accent text-xs hover:bg-accent/80 transition-colors border opacity-0 group-hover:opacity-100"
        >
          +😊
        </button>

        {showPicker && (
          <div className="absolute bottom-8 left-0 flex gap-1 p-2 bg-card border rounded-xl shadow-lg z-50">
            {QUICK_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => handleReact(emoji)}
                className="text-lg hover:scale-125 transition-transform"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}