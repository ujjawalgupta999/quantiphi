import React, { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeHighlight from 'rehype-highlight';
import rehypeKatex from 'rehype-katex';
import CodeBlock from './CodeBlock';
import {
  MarkdownTable,
  TableHead,
  TableBody,
  TableRow,
  TableHeaderCell,
  TableCell,
} from './MarkdownTable';

interface MarkdownRendererProps {
  content: string;
  isStreaming?: boolean;
}

// Convert \[ ... \] and \( ... \) to standard $$ ... $$ and $ ... $ for remark-math
function normalizeMath(text: string): string {
  if (!text) return '';
  let processed = text.replace(/\\\[([\s\S]*?)\\\]/g, (_m, eq) => `\n$$\n${eq.trim()}\n$$\n`);
  processed = processed.replace(/\\\(([\s\S]*?)\\\)/g, (_m, eq) => `$${eq.trim()}$`);
  return processed;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
  isStreaming = false,
}) => {
  const formattedContent = useMemo(() => normalizeMath(content), [content]);

  return (
    <div className="markdown-body text-[#ececec] text-[15.5px] leading-relaxed break-words font-normal">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeHighlight, rehypeKatex]}
        components={{
          // Code Blocks and Inline Code
          pre: ({ children }) => <>{children}</>,
          code({ className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            const isCodeBlock = Boolean(match) || (typeof children === 'string' && children.includes('\n'));

            if (isCodeBlock) {
              return (
                <CodeBlock language={match ? match[1] : undefined}>
                  {String(children)}
                </CodeBlock>
              );
            }

            return (
              <code
                className="px-1.5 py-0.5 mx-0.5 rounded-md bg-white/10 text-[#60a5fa] font-mono text-[0.875em] border border-white/5 font-normal"
                {...props}
              >
                {children}
              </code>
            );
          },

          // Headings
          h1: ({ children }) => (
            <h1 className="text-xl sm:text-2xl font-bold text-white mt-6 mb-3 tracking-tight first:mt-0">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-lg sm:text-xl font-bold text-white mt-5 mb-2.5 tracking-tight border-b border-white/10 pb-1.5 first:mt-0">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-base sm:text-lg font-semibold text-white mt-4 mb-2 first:mt-0">
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-[15px] sm:text-base font-semibold text-white mt-3 mb-1.5 first:mt-0">
              {children}
            </h4>
          ),

          // Paragraphs
          p: ({ children }) => (
            <p className="mb-4 leading-relaxed text-[15.5px] text-[#ededed] last:mb-0">
              {children}
            </p>
          ),

          // Lists
          ul: ({ children }) => (
            <ul className="list-disc list-outside ml-5 mb-4 space-y-2 text-[15.5px] text-[#ededed]">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-outside ml-5 mb-4 space-y-2 text-[15.5px] text-[#ededed]">
              {children}
            </ol>
          ),
          li: ({ children }) => <li className="leading-relaxed pl-1">{children}</li>,

          // Tables
          table: ({ children }) => <MarkdownTable>{children}</MarkdownTable>,
          thead: ({ children }) => <TableHead>{children}</TableHead>,
          tbody: ({ children }) => <TableBody>{children}</TableBody>,
          tr: ({ children }) => <TableRow>{children}</TableRow>,
          th: ({ children }) => <TableHeaderCell>{children}</TableHeaderCell>,
          td: ({ children }) => <TableCell>{children}</TableCell>,

          // Blockquotes
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-blue-500/70 bg-white/[0.02] pl-4 py-2 my-4 text-gray-300 italic rounded-r-lg">
              {children}
            </blockquote>
          ),

          // Divider
          hr: () => <hr className="my-6 border-white/10" />,

          // Links
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 underline underline-offset-2 transition-colors font-medium break-all"
            >
              {children}
            </a>
          ),

          // Formatting
          strong: ({ children }) => (
            <strong className="font-semibold text-white">{children}</strong>
          ),
          em: ({ children }) => <em className="italic text-gray-300">{children}</em>,
        }}
      >
        {formattedContent}
      </ReactMarkdown>

      {/* Subtle typing cursor during streaming */}
      {isStreaming && (
        <span className="inline-block w-2 h-4 ml-1 bg-blue-500 animate-pulse align-middle rounded-sm" />
      )}
    </div>
  );
};

export default MarkdownRenderer;
