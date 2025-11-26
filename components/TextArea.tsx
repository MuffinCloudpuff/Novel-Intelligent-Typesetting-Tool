import React from 'react';

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  stats?: string;
}

export const TextArea: React.FC<TextAreaProps> = ({ label, stats, className = '', ...props }) => {
  return (
    <div className={`flex flex-col h-full ${className}`}>
      <div className="flex justify-between items-center mb-2 px-1">
        <label className="text-sm font-semibold text-slate-700 uppercase tracking-wide">{label}</label>
        {stats && <span className="text-xs text-slate-400 font-mono">{stats}</span>}
      </div>
      <div className="relative flex-grow">
        <textarea
          className="w-full h-full p-4 rounded-xl border-0 bg-white shadow-inner text-slate-800 placeholder-slate-300 resize-none focus:ring-2 focus:ring-indigo-500/50 outline-none text-base leading-relaxed transition-all"
          spellCheck={false}
          {...props}
        />
      </div>
    </div>
  );
};