import React, { useRef, useCallback } from 'react';
import { Send, Square } from 'lucide-react';

interface ChatInputProps {
  onSend: (message: string) => void;
  onStop: () => void;
  isStreaming: boolean;
  disabled?: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSend, onStop, isStreaming }) => {
  const [value, setValue] = React.useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = useCallback(() => {
    const trimmed = value.trim();
    if (!trimmed || isStreaming) return;
    onSend(trimmed);
    setValue('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  }, [value, isStreaming, onSend]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
    const ta = e.target;
    ta.style.height = 'auto';
    ta.style.height = `${Math.min(ta.scrollHeight, 200)}px`;
  };

  return (
    <div className="border-t border-white/5 bg-black p-4">
      <div className="max-w-3xl sm:max-w-4xl mx-auto">
        <div className="relative flex items-end gap-3 bg-[#18181b] border border-white/10 rounded-[28px] px-5 py-3 focus-within:border-blue-500/50 transition-colors shadow-sm">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Message AI Assistant... (Shift+Enter for new line)"
            rows={1}
            disabled={false}
            className="flex-1 bg-transparent text-gray-100 placeholder-neutral-500 text-[15px] resize-none outline-none min-h-[24px] max-h-[200px] leading-relaxed"
          />

          {isStreaming ? (
            <button
              onClick={onStop}
              type="button"
              className="flex-shrink-0 w-9 h-9 rounded-full bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 flex items-center justify-center transition-all"
              title="Stop generating"
            >
              <Square size={13} fill="currentColor" />
            </button>
          ) : (
            <button
              onClick={handleSend}
              type="button"
              disabled={!value.trim()}
              className="flex-shrink-0 w-9 h-9 rounded-full bg-[#1053b0] text-white hover:bg-[#135bec] flex items-center justify-center transition-all disabled:opacity-20 disabled:cursor-not-allowed"
              title="Send message"
            >
              <Send size={15} />
            </button>
          )}
        </div>
        <p className="text-xs text-neutral-500 text-center mt-2.5">
          AI can make mistakes. Verify important information.
        </p>
      </div>
    </div>
  );
};

export default ChatInput;
