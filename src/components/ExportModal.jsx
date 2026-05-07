import React, { useState } from 'react';
import { X, Copy, Check, Code } from 'lucide-react';
import { generateStandaloneCode } from '../utils/exportGenerator';

const ExportModal = ({ layout, widgetTypes, onClose }) => {
  const [copied, setCopied] = useState(false);
  const code = generateStandaloneCode(layout, widgetTypes);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-terminal-panel border border-terminal-cyan w-full max-w-4xl max-h-[80vh] flex flex-col shadow-[0_0_20px_rgba(0,250,255,0.2)]">
        <div className="flex justify-between items-center p-4 border-b border-terminal-cyan/30">
          <h2 className="text-terminal-cyan flex items-center gap-2 uppercase tracking-widest font-bold">
            <Code className="w-5 h-5" /> Export System // Standalone Code
          </h2>
          <button onClick={onClose} className="text-terminal-cyan hover:bg-terminal-cyan/10 p-1">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col p-4 gap-4">
          <p className="text-xs opacity-70 uppercase">
            Copy the code below to implement this dashboard in any HTML5 project.
            Includes CSS grid layout and CRT effects.
          </p>

          <div className="flex-1 relative bg-black border border-terminal-border overflow-auto font-mono text-[10px] p-4 text-terminal-green/80">
            <pre>{code}</pre>
            <button
              onClick={copyToClipboard}
              className="absolute top-2 right-2 flex items-center gap-2 px-3 py-1 bg-terminal-cyan text-black text-xs font-bold hover:bg-white transition-colors"
            >
              {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              {copied ? 'COPIED!' : 'COPY CODE'}
            </button>
          </div>
        </div>

        <div className="p-4 border-t border-terminal-cyan/20 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-terminal-cyan/50 text-terminal-cyan hover:bg-terminal-cyan/10 uppercase tracking-widest text-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportModal;
