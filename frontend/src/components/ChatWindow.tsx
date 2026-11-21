import React, { useEffect, useRef, useState } from 'react';
import { Sparkles, MessageSquare, ArrowDown } from 'lucide-react';
import { Message, Conversation, Tone } from '../types/chat';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';

interface ChatWindowProps {
  messages: Message[];
  activeConversation: Conversation | null;
  isStreaming: boolean;
  error: string | null;
  tone: Tone;
  onSendMessage: (content: string) => void;
  onStopStreaming: () => void;
  onRegenerate: (messageId: string) => void;
  onSuggestionClick: (suggestion: string) => void;
  onDismissError: () => void;
}

const WELCOME_PROMPTS = [
  'What can you help me with today?',
  'Explain quantum computing in simple terms',
  'Find the derivative of sin(x) + tan(x)',
  'Help me write a professional email',
];

const ChatWindow: React.FC<ChatWindowProps> = ({
  messages,
  activeConversation,
  isStreaming,
  error,
  onSendMessage,
  onStopStreaming,
  onRegenerate,
  onSuggestionClick,
  onDismissError,
}) => {
  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showScrollBottom, setShowScrollBottom] = useState(false);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    const isScrolledUp = scrollHeight - scrollTop - clientHeight > 100;
    setShowScrollBottom(isScrolledUp);
  };

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const isEmptyState = !activeConversation && messages.length === 0;

  return (
    <div className="relative flex-1 flex flex-col min-w-0 h-full bg-black">
      {/* Messages Scroll Area */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto scrollbar-thin"
      >
        {isEmptyState ? (
          // Welcome Screen
          <div className="h-full flex flex-col items-center justify-center px-6 py-12">
            <div className="w-14 h-14 rounded-2xl bg-neutral-900 border border-white/10 flex items-center justify-center mb-6 shadow-md">
              <Sparkles size={24} className="text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">How can I help you today?</h2>
            <p className="text-gray-400 text-sm mb-10 text-center max-w-md">
              Ask anything — math, coding, explanations, writing, and creative ideas.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-xl">
              {WELCOME_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => onSendMessage(prompt)}
                  className="flex items-start gap-3 p-4 rounded-2xl bg-neutral-900/60 border border-white/5 text-left hover:bg-neutral-900 hover:border-white/15 transition-all duration-200 group"
                >
                  <MessageSquare
                    size={16}
                    className="text-blue-400 flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform"
                  />
                  <span className="text-sm text-gray-300 leading-snug">{prompt}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          // Message List — Clean Black Layout Matching Screenshot
          <div className="max-w-3xl sm:max-w-4xl mx-auto px-4 sm:px-8 py-8 space-y-7">
            {messages.map((msg) => (
              <ChatMessage
                key={msg._id}
                message={msg}
                onRegenerate={msg.role === 'assistant' ? onRegenerate : undefined}
                onSuggestionClick={onSuggestionClick}
                isStreaming={isStreaming}
              />
            ))}

            {/* Error banner */}
            {error && (
              <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                <span>{error}</span>
                <button onClick={onDismissError} className="text-red-500 hover:text-red-300 text-xs underline">
                  Dismiss
                </button>
              </div>
            )}

            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Floating Scroll to Bottom Button (matches down-arrow button in screenshot) */}
      {showScrollBottom && (
        <button
          onClick={scrollToBottom}
          aria-label="Scroll to bottom"
          className="absolute bottom-24 left-1/2 -translate-x-1/2 w-9 h-9 rounded-full bg-[#18181b] border border-white/20 text-white shadow-xl flex items-center justify-center hover:bg-neutral-800 active:scale-95 transition-all z-20"
        >
          <ArrowDown size={15} />
        </button>
      )}

      {/* Input Bar */}
      <ChatInput
        onSend={onSendMessage}
        onStop={onStopStreaming}
        isStreaming={isStreaming}
      />
    </div>
  );
};

export default ChatWindow;
