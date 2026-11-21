import React, { useState } from 'react';
import { Menu, Plus, Sparkles } from 'lucide-react';
import { useChat } from '../hooks/useChat';
import { Tone } from '../types/chat';
import Sidebar from '../components/Sidebar';
import ChatWindow from '../components/ChatWindow';
import ToneSelector from '../components/ToneSelector';

const ChatPage: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const {
    conversations,
    activeConversation,
    messages,
    isStreaming,
    tone,
    error,
    searchQuery,
    setSearchQuery,
    sendMessage,
    regenerateMessage,
    selectConversation,
    startNewConversation,
    deleteConversation,
    stopStreaming,
    changeTone,
    setError,
  } = useChat();

  const handleToneChange = (newTone: Tone) => {
    changeTone(newTone);
  };

  return (
    <div className="flex h-screen bg-black text-white overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        conversations={conversations}
        activeConversation={activeConversation}
        onSelectConversation={(conv) => {
          selectConversation(conv);
          setSidebarOpen(false);
        }}
        onNewConversation={() => {
          startNewConversation();
          setSidebarOpen(false);
        }}
        onDeleteConversation={deleteConversation}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 bg-black relative">
        {/* Top Navigation */}
        <header className="relative z-40 flex items-center justify-between px-4 py-3 border-b border-white/10 bg-black/95 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            {/* Mobile menu button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
            >
              <Menu size={18} />
            </button>

            <div className="flex items-center gap-2">
              <div className="hidden lg:flex w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 items-center justify-center">
                <Sparkles size={12} className="text-white" />
              </div>
              <div>
                <span className="text-sm font-semibold text-white">
                  {activeConversation ? activeConversation.title : 'AI Assistant'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ToneSelector
              tone={tone}
              onChange={handleToneChange}
              disabled={isStreaming}
            />
            <button
              onClick={startNewConversation}
              disabled={isStreaming}
              className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="New conversation"
            >
              <Plus size={18} />
            </button>
          </div>
        </header>

        {/* Chat Window */}
        <ChatWindow
          messages={messages}
          activeConversation={activeConversation}
          isStreaming={isStreaming}
          error={error}
          tone={tone}
          onChangeTone={handleToneChange}
          onSendMessage={sendMessage}
          onStopStreaming={stopStreaming}
          onRegenerate={regenerateMessage}
          onSuggestionClick={sendMessage}
          onDismissError={() => setError(null)}
        />
      </div>
    </div>
  );
};

export default ChatPage;

