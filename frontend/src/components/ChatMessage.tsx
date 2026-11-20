import React, { useState } from 'react';
import { Copy, RotateCcw, Check, User, Bot } from 'lucide-react';
import { Message } from '../types/chat';
import StreamingIndicator from './StreamingIndicator';
import FollowUpSuggestions from './FollowUpSuggestions';

// Simple markdown renderer with syntax highlighting
function renderMarkdown(text: string): string {
  let html = text
    // Escape HTML
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Code blocks
  html = html.replace(
    /```(\w*)\n([\s\S]*?)```/g,
    (_m, lang: string, code: string) =>
      `<pre class="code-block"><div class="code-header"><span class="code-lang">${lang || 'code'}</span><button class="copy-code-btn" data-code="${encodeURIComponent(code.trim())}">Copy</button></div><code class="language-${lang}">${code.trim()}</code></pre>`
  );

  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');

  // Bold
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

  // Italic
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

  // Headers
  html = html.replace(/^### (.+)$/gm, '<h3 class="md-h3">$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2 class="md-h2">$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1 class="md-h1">$1</h1>');

  // Unordered lists
  html = html.replace(/^\* (.+)$/gm, '<li class="md-li">$1</li>');
  html = html.replace(/^- (.+)$/gm, '<li class="md-li">$1</li>');
  html = html.replace(/(<li[^>]*>.*<\/li>\n?)+/g, (m) => `<ul class="md-ul">${m}</ul>`);

  // Ordered lists
  html = html.replace(/^\d+\. (.+)$/gm, '<li class="md-li">$1</li>');

  // Horizontal rule
  html = html.replace(/^---$/gm, '<hr class="md-hr" />');

  // Paragraphs
  html = html.replace(/\n\n/g, '</p><p class="md-p">');
  html = `<p class="md-p">${html}</p>`;

  // Line breaks
  html = html.replace(/\n/g, '<br />');

  return html;
}

interface ChatMessageProps {
  message: Message;
  onRegenerate?: (messageId: string) => void;
  onSuggestionClick?: (suggestion: string) => void;
  isStreaming?: boolean;
}

const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  onRegenerate,
  onSuggestionClick,
  isStreaming,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isUser = message.role === 'user';

  return (
    <div className={`group flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mt-1">
          <Bot size={16} className="text-white" />
        </div>
      )}

      <div className={`flex flex-col max-w-[80%] ${isUser ? 'items-end' : 'items-start'}`}>
        <div
          className={`rounded-2xl px-4 py-3 ${
            isUser
              ? 'bg-gradient-to-br from-indigo-600 to-indigo-700 text-white rounded-tr-sm'
              : 'bg-gray-800/80 text-gray-100 rounded-tl-sm border border-white/5'
          }`}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>
          ) : (
            <>
              {message.isStreaming && !message.content ? (
                <StreamingIndicator />
              ) : (
                <div
                  className="prose-content text-sm leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: renderMarkdown(message.content) }}
                  onClick={(e) => {
                    // Handle copy code button clicks
                    const target = e.target as HTMLElement;
                    if (target.classList.contains('copy-code-btn')) {
                      const code = decodeURIComponent(target.getAttribute('data-code') || '');
                      navigator.clipboard.writeText(code);
                      target.textContent = 'Copied!';
                      setTimeout(() => (target.textContent = 'Copy'), 2000);
                    }
                  }}
                />
              )}
              {message.isStreaming && message.content && (
                <span className="inline-block w-0.5 h-4 bg-indigo-400 animate-pulse ml-0.5 align-middle" />
              )}
            </>
          )}
        </div>

        {/* Action buttons for assistant messages */}
        {!isUser && !message.isStreaming && message.content && (
          <div className="flex items-center gap-2 mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 px-2 py-1 rounded-md text-xs text-gray-500 hover:text-gray-300 hover:bg-white/5 transition-colors"
            >
              {copied ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
            {onRegenerate && !isStreaming && (
              <button
                onClick={() => onRegenerate(message._id)}
                className="flex items-center gap-1 px-2 py-1 rounded-md text-xs text-gray-500 hover:text-gray-300 hover:bg-white/5 transition-colors"
              >
                <RotateCcw size={12} />
                <span>Regenerate</span>
              </button>
            )}
          </div>
        )}

        {/* Follow-up suggestions */}
        {!isUser && !message.isStreaming && message.suggestions && onSuggestionClick && (
          <FollowUpSuggestions
            suggestions={message.suggestions}
            onSelect={onSuggestionClick}
            disabled={isStreaming}
          />
        )}
      </div>

      {isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center mt-1">
          <User size={16} className="text-white" />
        </div>
      )}
    </div>
  );
};

export default ChatMessage;

