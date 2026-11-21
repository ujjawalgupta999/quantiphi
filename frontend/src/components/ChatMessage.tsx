import React from 'react';
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
      <div className="flex justify-end w-full">
        <div className="max-w-[85%] sm:max-w-[75%] rounded-[24px] px-5 py-2.5 sm:px-6 sm:py-3 bg-[#1053b0] text-white shadow-sm">
          <p className="whitespace-pre-wrap text-[15px] leading-relaxed break-words font-normal">
            {message.content}
          </p>
        </div>
      </div>
    );
  }

  // Assistant Message — exact match to screenshot (no avatar, clean left-aligned text & math)
  return (
    <div className="flex flex-col w-full text-left">
      <div className="w-full">
        {isMsgStreaming && !message.content ? (
          <div className="py-2">
            <StreamingIndicator />
          </div>
        ) : (
          <div className="py-1">
            <MarkdownRenderer
              content={message.content}
              isStreaming={isMsgStreaming}
            />
          </div>
        )}

        {/* Message Action Toolbar (Copy, Regenerate, Like, Dislike) */}
        {!isMsgStreaming && message.content && (
          <div className="opacity-70 hover:opacity-100 transition-opacity">
            <MessageActions
              content={message.content}
              onRegenerate={onRegenerate ? () => onRegenerate(message._id) : undefined}
              isStreaming={isStreaming}
            />
          </div>
        )}

        {/* Follow-up suggestions */}
        {!isMsgStreaming && message.suggestions && message.suggestions.length > 0 && onSuggestionClick && (
          <div className="mt-3">
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
