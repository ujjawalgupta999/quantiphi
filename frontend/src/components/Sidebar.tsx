import React from 'react';
import { Plus, Search, Trash2, MessageSquare, Settings, Sparkles } from 'lucide-react';
import { Conversation } from '../types/chat';

interface SidebarProps {
  conversations: Conversation[];
  activeConversation: Conversation | null;
  onSelectConversation: (conv: Conversation) => void;
  onNewConversation: () => void;
  onDeleteConversation: (id: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  conversations,
  activeConversation,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
  searchQuery,
  onSearchChange,
  isOpen,
  onClose,
}) => {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  // Group conversations by date
  const grouped = conversations.reduce<Record<string, Conversation[]>>((acc, conv) => {
    const label = formatDate(conv.updatedAt);
    if (!acc[label]) acc[label] = [];
    acc[label].push(conv);
    return acc;
  }, {});

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-20 lg:hidden backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed lg:relative inset-y-0 left-0 z-30 lg:z-auto w-72 flex flex-col bg-gray-950 border-r border-white/5 transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-white/5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <Sparkles size={16} className="text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white">AI Assistant</h1>
            <p className="text-xs text-gray-500">Powered by Groq (Llama 3.3 70B)</p>
          </div>
        </div>

        {/* New Chat */}
        <div className="px-3 pt-3 pb-2">
          <button
            onClick={onNewConversation}
            className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 text-sm font-medium hover:bg-indigo-600/30 hover:border-indigo-500/50 transition-all duration-200"
          >
            <Plus size={16} />
            New conversation
          </button>
        </div>

        {/* Search */}
        <div className="px-3 pb-2">
          <div className="flex items-center gap-2 px-3 py-2 bg-gray-800/50 border border-white/5 rounded-xl">
            <Search size={14} className="text-gray-500 flex-shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search conversations..."
              className="flex-1 bg-transparent text-sm text-gray-300 placeholder-gray-600 outline-none"
            />
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto px-3 space-y-1 scrollbar-thin">
          {conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <MessageSquare size={32} className="text-gray-700 mb-3" />
              <p className="text-xs text-gray-600">No conversations yet</p>
              <p className="text-xs text-gray-700 mt-1">Start a new chat above</p>
            </div>
          ) : (
            Object.entries(grouped).map(([label, convs]) => (
              <div key={label}>
                <p className="text-xs text-gray-600 font-medium px-2 py-2">{label}</p>
                {convs.map((conv) => (
                  <div
                    key={conv._id}
                    className={`group relative flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-150 ${
                      activeConversation?._id === conv._id
                        ? 'bg-white/10 text-white'
                        : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
                    }`}
                    onClick={() => onSelectConversation(conv)}
                  >
                    <MessageSquare size={14} className="flex-shrink-0 opacity-60" />
                    <span className="flex-1 text-sm truncate">{conv.title}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteConversation(conv._id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-red-500/20 hover:text-red-400 transition-all"
                      title="Delete conversation"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            ))
          )}
        </div>

        {/* Settings footer */}
        <div className="p-3 border-t border-white/5">
          <div className="flex items-center gap-3 px-3 py-2 rounded-xl text-gray-500 hover:bg-white/5 hover:text-gray-300 transition-colors cursor-pointer">
            <Settings size={16} />
            <span className="text-sm">Settings</span>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

