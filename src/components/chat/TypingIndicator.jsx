import { useChatStore } from '../../store/chatStore';
import { useAuthStore } from '../../store/authStore';

export default function TypingIndicator({ roomId }) {
  const { typingUsers } = useChatStore();
  const { user } = useAuthStore();

  const typers = (typingUsers[roomId] || []).filter(
    (u) => u.userId !== (user?._id || user?.id)
  );

  if (typers.length === 0) return null;

  const text =
    typers.length === 1
      ? `${typers[0].username} is typing`
      : typers.length === 2
      ? `${typers[0].username} and ${typers[1].username} are typing`
      : 'Several people are typing';

  return (
    <div className="flex items-center gap-2 px-4 py-1">
      <div className="flex gap-1">
        <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:0ms]" />
        <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:150ms]" />
        <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:300ms]" />
      </div>
      <p className="text-xs text-muted-foreground italic">{text}</p>
    </div>
  );
}