import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
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

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
  isStreaming = false,
}) => {
  return (
    <div className="markdown-body text-gray-200 text-[15px] leading-relaxed break-words">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
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
                className="px-1.5 py-0.5 mx-0.5 rounded-md bg-white/10 text-indigo-300 font-mono text-[0.875em] border border-white/5 font-normal"
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
            <h2 className="text-lg sm:text-xl font-semibold text-white mt-5 mb-2.5 tracking-tight border-b border-white/10 pb-1.5 first:mt-0">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-base sm:text-lg font-semibold text-gray-100 mt-4 mb-2 first:mt-0">
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-sm sm:text-base font-semibold text-gray-200 mt-3 mb-1.5 first:mt-0">
              {children}
            </h4>
          ),

          // Paragraphs
          p: ({ children }) => (
            <p className="mb-3.5 leading-relaxed text-[15px] text-gray-200 last:mb-0">
              {children}
            </p>
          ),

          // Lists
          ul: ({ children }) => (
            <ul className="list-disc list-outside ml-5 mb-3.5 space-y-1.5 text-[15px] text-gray-200">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-outside ml-5 mb-3.5 space-y-1.5 text-[15px] text-gray-200">
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
            <blockquote className="border-l-4 border-indigo-500/70 bg-white/[0.02] pl-4 py-2 my-4 text-gray-300 italic rounded-r-lg">
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
              className="text-indigo-400 hover:text-indigo-300 underline underline-offset-2 transition-colors font-medium break-all"
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
        {content}
      </ReactMarkdown>

      {/* Subtle typing cursor during streaming */}
      {isStreaming && (
        <span className="inline-block w-2 h-4 ml-1 bg-indigo-400 animate-pulse align-middle rounded-sm" />
      )}
    </div>
  );
};

export default MarkdownRenderer;
