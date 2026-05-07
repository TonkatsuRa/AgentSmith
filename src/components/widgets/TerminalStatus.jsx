import React, { useEffect, useState } from 'react';

/**
 * TerminalStatus Component
 * Renders a text-based status terminal with scrolling logs.
 */
const TerminalStatus = ({
  title = "SYSTEM LOG",
  color = "currentColor",
  speed = 1
}) => {
  const [logs, setLogs] = useState([
    "> INITIALIZING SYSTEM...",
    "> KERNEL LOADED",
    "> AUTHENTICATING..."
  ]);

  const possibleLogs = [
    "> ACCESSING DATA STREAM",
    "> ENCRYPTING PACKETS",
    "> PINGING RELAY HUB",
    "> RE-ROUTING NODE 7",
    "> BUFFER OVERFLOW DETECTED",
    "> HANDSHAKE COMPLETE",
    "> DOWNLOADING UPDATE...",
    "> SYNCING WITH CORE",
    "> PARSING PROTOCOL",
    "> VALIDATING CHECKSUM"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setLogs(prev => {
        const newLog = possibleLogs[Math.floor(Math.random() * possibleLogs.length)];
        const timestamp = new Date().toLocaleTimeString().split(' ')[0];
        const combined = `[${timestamp}] ${newLog}`;
        const updated = [...prev, combined];
        return updated.slice(-6); // Keep last 6 lines
      });
    }, 2000 / speed);

    return () => clearInterval(interval);
  }, [speed]);

  return (
    <div className="w-full h-full flex flex-col p-2 bg-terminal-panel border border-terminal-border rounded-sm overflow-hidden" style={{ color }}>
      <div className="flex justify-between items-center mb-1 border-b border-terminal-border/30 pb-1">
        <span className="text-[10px] uppercase font-bold tracking-widest glow-text">{title}</span>
        <div className="flex gap-1">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
        </div>
      </div>

      <div className="flex-1 font-mono text-[9px] leading-tight overflow-hidden opacity-90">
        {logs.map((log, i) => (
          <div key={i} className="mb-0.5 whitespace-nowrap overflow-hidden text-ellipsis">
            {log}
          </div>
        ))}
        <div className="animate-pulse inline-block w-1.5 h-3 bg-current" />
      </div>

      <div className="mt-1 flex justify-between text-[7px] opacity-50 border-t border-terminal-border/20 pt-1">
        <span>S_LEVEL: ALPHA</span>
        <span>ID: 0x8F2A</span>
      </div>
    </div>
  );
};

export default TerminalStatus;
