import React, { useState } from 'react';
import { Copy, RotateCcw, ThumbsUp, ThumbsDown, Check } from 'lucide-react';

interface MessageActionsProps {
  content: string;
  onRegenerate?: () => void;
  isStreaming?: boolean;
}

export const MessageActions: React.FC<MessageActionsProps> = ({
  content,
  onRegenerate,
  isStreaming = false,
}) => {
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState<'liked' | 'disliked' | null>(null);

  if (isStreaming || !content.trim()) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy response:', err);
    }
  };

  const handleLike = () => {
    setFeedback((prev) => (prev === 'liked' ? null : 'liked'));
  };

  const handleDislike = () => {
    setFeedback((prev) => (prev === 'disliked' ? null : 'disliked'));
  };

  return (
    <div className="flex items-center gap-1 mt-3 pt-1 select-none text-gray-400">
      {/* Copy Button */}
      <button
        onClick={handleCopy}
        type="button"
        title={copied ? 'Copied to clipboard' : 'Copy response'}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium hover:text-gray-200 hover:bg-white/5 active:bg-white/10 transition-colors"
      >
        {copied ? (
          <>
            <Check size={14} className="text-emerald-400" />
            <span className="text-emerald-400 text-xs">Copied</span>
          </>
        ) : (
          <>
            <Copy size={14} />
            <span className="hidden sm:inline">Copy</span>
          </>
        )}
      </button>

      {/* Regenerate Button */}
      {onRegenerate && (
        <button
          onClick={onRegenerate}
          type="button"
          title="Regenerate response"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium hover:text-gray-200 hover:bg-white/5 active:bg-white/10 transition-colors"
        >
          <RotateCcw size={14} />
          <span className="hidden sm:inline">Regenerate</span>
        </button>
      )}

      {/* Like Button */}
      <button
        onClick={handleLike}
        type="button"
        title="Good response"
        className={`p-1.5 rounded-lg transition-colors ${
          feedback === 'liked'
            ? 'text-emerald-400 bg-emerald-500/10'
            : 'hover:text-gray-200 hover:bg-white/5 active:bg-white/10'
        }`}
      >
        <ThumbsUp size={14} />
      </button>

      {/* Dislike Button */}
      <button
        onClick={handleDislike}
        type="button"
        title="Bad response"
        className={`p-1.5 rounded-lg transition-colors ${
          feedback === 'disliked'
            ? 'text-rose-400 bg-rose-500/10'
            : 'hover:text-gray-200 hover:bg-white/5 active:bg-white/10'
        }`}
      >
        <ThumbsDown size={14} />
      </button>
    </div>
  );
};

export default MessageActions;
