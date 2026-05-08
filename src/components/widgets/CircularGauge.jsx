import React, { useEffect, useState } from 'react';

/**
 * CircularGauge Component
 * Renders a radar or circular dial style widget.
 */
const CircularGauge = ({
  title = "CORE STABILITY",
  color = "currentColor",
  speed = 1,
  showRadarLine = true,
  ringCount = 3,
  showPercentage = true
}) => {
  const [value, setValue] = useState(0);
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setValue(prev => {
        const next = prev + (Math.random() - 0.5) * 5;
        return Math.min(Math.max(next, 0), 100);
      });
      setRotation(prev => (prev + 2 * speed) % 360);
    }, 50);

    return () => clearInterval(interval);
  }, [speed]);

  const radius = 35;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  return (
    <div className="w-full h-full flex flex-col p-2 bg-terminal-panel border border-terminal-border rounded-sm overflow-hidden" style={{ color }}>
      <div className="flex justify-between items-center mb-1 border-b border-terminal-border/30 pb-1">
        <span className="text-[10px] uppercase font-bold tracking-widest glow-text">{title}</span>
        <span className="text-[10px] opacity-50">ROT_SYNC</span>
      </div>

      <div className="flex-1 relative flex items-center justify-center">
        <svg viewBox="0 0 100 100" className="w-full h-full max-w-[120px]">
          {/* Background circles */}
          {Array.from({ length: ringCount }).map((_, i) => (
            <circle
              key={i}
              cx="50" cy="50"
              r={45 - (i * (40 / ringCount))}
              fill="none"
              stroke="currentColor"
              strokeWidth="0.5"
              opacity={0.1 + (i * 0.05)}
            />
          ))}

          {/* Crosshair */}
          <line x1="50" y1="5" x2="50" y2="95" stroke="currentColor" strokeWidth="0.2" opacity="0.2" />
          <line x1="5" y1="50" x2="95" y2="50" stroke="currentColor" strokeWidth="0.2" opacity="0.2" />

          {/* Rotating radar line */}
          {showRadarLine && (
            <line
              x1="50" y1="50"
              x2="50" y2="10"
              stroke="currentColor"
              strokeWidth="1"
              transform={`rotate(${rotation} 50 50)`}
              className="svg-glow"
            />
          )}

          {/* Progress arc */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            strokeDasharray={circumference}
            style={{
              strokeDashoffset,
              transition: 'stroke-dashoffset 0.3s ease',
            }}
            transform="rotate(-90 50 50)"
            className="svg-glow opacity-80"
          />

          {/* Center text */}
          {showPercentage && (
            <text
              x="50" y="55"
              textAnchor="middle"
              fill="currentColor"
              fontSize="12"
              className="font-bold glow-text"
            >
              {Math.round(value)}%
            </text>
          )}
        </svg>

        {/* Decorative corner brackets */}
        <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-terminal-border/50" />
        <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-terminal-border/50" />
        <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-terminal-border/50" />
        <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-terminal-border/50" />
      </div>

      <div className="mt-1 flex justify-between text-[8px] opacity-70">
        <span>RINGS: {ringCount}</span>
        <span>RADAR: {showRadarLine ? 'ON' : 'OFF'}</span>
      </div>
    </div>
  );
};

export default CircularGauge;
