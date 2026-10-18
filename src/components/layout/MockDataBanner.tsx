import React from 'react';
import { Info, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export const MockDataBanner: React.FC = () => {
  return (
    <div className="bg-slate-900 border-b border-slate-800 px-4 py-1.5 text-xs text-slate-300 flex items-center justify-between select-none">
      <div className="flex items-center gap-2 max-w-4xl">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
        <span className="font-semibold text-white text-[11px]">Development Simulation Mode:</span>
        <span className="text-slate-400 text-[11px] hidden sm:inline">
          Displaying deterministic fixtures and mock adapter state for offline UI evaluation. Real cluster commands are disabled.
        </span>
      </div>
      <div className="flex items-center gap-3 shrink-0 ml-4">
        <span className="text-[10px] font-mono text-slate-300 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
          MOCK_DATA=true
        </span>
        <Link
          to="/app/integrations"
          className="text-[11px] font-medium text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
        >
          <HelpCircle className="w-3 h-3" /> Integrations Setup
        </Link>
      </div>
    </div>
  );
};
