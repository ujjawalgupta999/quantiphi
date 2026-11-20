import React from 'react';
import { User, Sparkles } from 'lucide-react';
import { Message } from '../types/chat';
import StreamingIndicator from './StreamingIndicator';
import FollowUpSuggestions from './FollowUpSuggestions';
import MarkdownRenderer from './MarkdownRenderer';
import MessageActions from './MessageActions';

interface ChatMessageProps {
  message: Message;
  onRegenerate?: (messageId: string) => void;
  onSuggestionClick?: (suggestion: string) => void;
  isStreaming?: boolean;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  onRegenerate,
  onSuggestionClick,
  isStreaming = false,
}) => {
  const isUser = message.role === 'user';
  const isMsgStreaming = message.isStreaming || false;

  if (isUser) {
    return (
      <div className="flex justify-end gap-3 group">
        <div className="flex flex-col items-end max-w-[85%] sm:max-w-[75%]">
          <div className="rounded-3xl rounded-tr-md px-5 py-3.5 bg-gradient-to-br from-indigo-600 to-indigo-700 text-white shadow-sm">
            <p className="whitespace-pre-wrap text-[15px] leading-relaxed break-words">
              {message.content}
            </p>
          </div>
        </div>

        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-700 border border-white/10 flex items-center justify-center mt-1 text-gray-300 shadow-sm">
          <User size={16} />
        </div>
      </div>
    );
  }

  // Assistant Message (ChatGPT-like clean layout without enclosing box)
  return (
    <div className="flex justify-start gap-3 sm:gap-4 group w-full">
      {/* Bot Avatar */}
      <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500/20 to-indigo-500/20 border border-emerald-500/30 flex items-center justify-center mt-0.5 text-emerald-400 shadow-sm">
        <Sparkles size={16} />
      </div>

      {/* Message Content Area */}
      <div className="flex-1 min-w-0 max-w-full">
        {isMsgStreaming && !message.content ? (
          <div className="py-1">
            <StreamingIndicator />
          </div>
        ) : (
          <div className="py-0.5">
            <MarkdownRenderer
              content={message.content}
              isStreaming={isMsgStreaming}
            />
          </div>
        )}

        {/* Message Action Toolbar (Copy, Regenerate, Like, Dislike) */}
        {!isMsgStreaming && message.content && (
          <MessageActions
            content={message.content}
            onRegenerate={onRegenerate ? () => onRegenerate(message._id) : undefined}
            isStreaming={isStreaming}
          />
        )}

        {/* Follow-up suggestions */}
        {!isMsgStreaming && message.suggestions && message.suggestions.length > 0 && onSuggestionClick && (
          <div className="mt-2">
            <FollowUpSuggestions
              suggestions={message.suggestions}
              onSelect={onSuggestionClick}
              disabled={isStreaming}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
