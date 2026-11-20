import React, { useState } from 'react';
import { Check, Copy } from 'lucide-react';

interface CodeBlockProps {
  language?: string;
  children: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ language, children }) => {
  const [copied, setCopied] = useState(false);

  const cleanCode = typeof children === 'string' ? children.replace(/\n$/, '') : String(children || '');

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(cleanCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  const displayLang = language && language !== 'code' ? language : 'plaintext';

  return (
    <div className="my-4 rounded-xl overflow-hidden border border-white/10 bg-[#0d1117] shadow-md group">
      {/* Code Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#161b22] border-b border-white/5 select-none">
        <span className="text-xs font-mono font-medium text-gray-400 uppercase tracking-wider">
          {displayLang}
        </span>
        <button
          onClick={handleCopy}
          type="button"
          aria-label="Copy code"
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium text-gray-400 hover:text-gray-100 hover:bg-white/10 active:scale-95 transition-all"
        >
          {copied ? (
            <>
              <Check size={13} className="text-emerald-400" />
              <span className="text-emerald-400">Copied!</span>
            </>
          ) : (
            <>
              <Copy size={13} />
              <span>Copy code</span>
            </>
          )}
        </button>
      </div>

      {/* Code Body */}
      <div className="p-4 overflow-x-auto text-[13.5px] font-mono leading-relaxed scrollbar-thin">
        <code className={`hljs language-${displayLang} block !bg-transparent !p-0 !text-gray-200`}>
          {cleanCode}
        </code>
      </div>
    </div>
  );
};

export default CodeBlock;
