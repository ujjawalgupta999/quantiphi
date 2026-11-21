import React from 'react';
import { Lightbulb } from 'lucide-react';

interface FollowUpSuggestionsProps {
  suggestions: string[];
  onSelect: (suggestion: string) => void;
  disabled?: boolean;
}

const FollowUpSuggestions: React.FC<FollowUpSuggestionsProps> = ({
  suggestions,
  onSelect,
  disabled,
}) => {
  if (!suggestions || suggestions.length === 0) return null;

  return (
    <div className="mt-3 flex flex-col gap-2">
      <div className="flex items-center gap-1.5 text-xs text-gray-500">
        <Lightbulb size={12} />
        <span>Follow-up suggestions</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {suggestions.map((suggestion, i) => (
          <button
            key={i}
            onClick={() => !disabled && onSelect(suggestion)}
            disabled={disabled}
            className="px-3 py-1.5 text-xs rounded-full border border-blue-500/30 text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 hover:border-blue-500/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-left"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
};

export default FollowUpSuggestions;

