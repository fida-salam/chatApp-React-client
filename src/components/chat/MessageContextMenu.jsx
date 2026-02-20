import { useEffect, useRef } from 'react';
import { Pencil, Trash2, SmilePlus } from 'lucide-react';

export default function MessageContextMenu({ x, y, isOwn, onEdit, onDelete, onReact, onClose }) {
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) onClose();
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return (
    <div
      ref={menuRef}
      style={{ top: y, left: x, position: 'fixed' }}
      className="z-50 bg-card border rounded-lg shadow-lg py-1 min-w-36 text-sm"
    >
      <button
        onClick={onReact}
        className="w-full flex items-center gap-2 px-3 py-2 hover:bg-accent transition-colors"
      >
        <SmilePlus className="w-4 h-4" />
        Add Reaction
      </button>

      {isOwn && (
        <>
          <button
            onClick={onEdit}
            className="w-full flex items-center gap-2 px-3 py-2 hover:bg-accent transition-colors"
          >
            <Pencil className="w-4 h-4" />
            Edit Message
          </button>
          <hr className="my-1" />
          <button
            onClick={onDelete}
            className="w-full flex items-center gap-2 px-3 py-2 hover:bg-accent text-destructive transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Delete Message
          </button>
        </>
      )}
    </div>
  );
}