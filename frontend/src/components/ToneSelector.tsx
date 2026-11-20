import React from 'react';
import { Tone } from '../types/chat';
import { ChevronDown } from 'lucide-react';

interface ToneSelectorProps {
  tone: Tone;
  onChange: (tone: Tone) => void;
  disabled?: boolean;
}

const toneOptions: { value: Tone; label: string; description: string }[] = [
  { value: 'professional', label: 'Professional', description: 'Formal & structured' },
  { value: 'casual', label: 'Casual', description: 'Friendly & conversational' },
  { value: 'concise', label: 'Concise', description: 'Short & direct' },
];

const ToneSelector: React.FC<ToneSelectorProps> = ({ tone, onChange, disabled }) => {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const current = toneOptions.find((o) => o.value === tone) || toneOptions[0];

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => !disabled && setOpen((o) => !o)}
        disabled={disabled}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-sm text-gray-200 hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span className="hidden sm:inline text-gray-400 text-xs">{current.description}</span>
        <span className="font-medium">{current.label}</span>
        <ChevronDown size={14} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-52 rounded-xl bg-gray-900 border border-white/10 shadow-2xl z-50 overflow-hidden">
          {toneOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
              className={`w-full text-left px-4 py-3 flex flex-col gap-0.5 transition-colors hover:bg-white/5 ${
                tone === opt.value ? 'bg-indigo-500/20 text-indigo-300' : 'text-gray-200'
              }`}
            >
              <span className="font-medium text-sm">{opt.label}</span>
              <span className="text-xs text-gray-500">{opt.description}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ToneSelector;

