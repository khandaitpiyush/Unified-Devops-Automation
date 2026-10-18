import React, { useState } from 'react';
import { Copy, Check, Download, FileCode } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface CodeViewerProps {
  code: string;
  filename?: string;
  language?: string;
  className?: string;
  showLineNumbers?: boolean;
}

export const CodeViewer: React.FC<CodeViewerProps> = ({
  code,
  filename = 'configuration',
  language = 'text',
  className,
  showLineNumbers = true,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const lines = code.trim().split('\n');

  return (
    <div className={cn('rounded-lg border border-slate-700/80 overflow-hidden bg-slate-900 text-slate-100 shadow-sm font-mono text-xs', className)}>
      {/* File Buffer Header */}
      <div className="flex items-center justify-between px-3.5 py-2 bg-slate-950/80 border-b border-slate-800">
        <div className="flex items-center gap-2 text-slate-300">
          <FileCode className="w-3.5 h-3.5 text-blue-400 shrink-0" />
          <span className="font-semibold text-slate-200 text-xs">{filename}</span>
          <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
            {language}
          </span>
          <span className="text-[11px] text-slate-500 font-sans hidden sm:inline">
            {lines.length} lines
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700 text-[11px] font-sans"
            title="Copy code to clipboard"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700 text-[11px] font-sans"
            title="Download file"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download</span>
          </button>
        </div>
      </div>

      {/* Code Area with Exact Line Alignment */}
      <div className="p-3 overflow-x-auto max-h-[480px] leading-relaxed select-text bg-[#0B0F19]">
        <pre className="flex text-[11px]">
          {showLineNumbers && (
            <div className="select-none pr-3 text-right text-slate-600 font-mono border-r border-slate-800 mr-3 shrink-0 min-w-[28px]">
              {lines.map((_, i) => (
                <div key={i}>{i + 1}</div>
              ))}
            </div>
          )}
          <code className="text-slate-200 flex-1 whitespace-pre leading-relaxed">{code}</code>
        </pre>
      </div>
    </div>
  );
};
