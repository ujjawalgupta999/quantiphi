import React from 'react';
import { Tone } from '../types/chat';
import { ChevronDown, Check } from 'lucide-react';

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
    <div ref={ref} className="relative z-50">
      <button
        onClick={() => !disabled && setOpen((o) => !o)}
        disabled={disabled}
        type="button"
        aria-label="Select response tone"
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-sm text-gray-200 hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
      >
        <span className="hidden sm:inline text-gray-400 text-xs">{current.description}</span>
        <span className="font-medium text-white">{current.label}</span>
        <ChevronDown size={14} className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 rounded-xl bg-[#18181b] border border-white/20 shadow-[0_12px_40px_rgba(0,0,0,0.85)] z-[100] overflow-hidden backdrop-blur-md">
          {toneOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
              className={`w-full text-left px-4 py-3 flex items-center justify-between transition-colors hover:bg-white/10 cursor-pointer ${
                tone === opt.value ? 'bg-blue-600/20 text-blue-300' : 'text-gray-200'
              }`}
            >
              <div className="flex flex-col gap-0.5">
                <span className="font-medium text-sm text-white">{opt.label}</span>
                <span className="text-xs text-gray-400">{opt.description}</span>
              </div>
              {tone === opt.value && <Check size={16} className="text-blue-400 flex-shrink-0" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ToneSelector;
