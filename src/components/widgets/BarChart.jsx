import React, { useEffect, useState } from 'react';

/**
 * BarChart Component
 * Renders an equalizer-style animated bar chart.
 */
const BarChart = ({
  title = "SIGNAL FREQ",
  color = "currentColor",
  speed = 1,
  barCount = 12
}) => {
  const [bars, setBars] = useState([]);

  useEffect(() => {
    const interval = setInterval(() => {
      const newBars = Array.from({ length: barCount }, () => Math.random() * 80 + 10);
      setBars(newBars);
    }, 100 / speed);

    return () => clearInterval(interval);
  }, [speed, barCount]);

  return (
    <div className="w-full h-full flex flex-col p-2 bg-terminal-panel border border-terminal-border rounded-sm overflow-hidden" style={{ color }}>
      <div className="flex justify-between items-center mb-1 border-b border-terminal-border/30 pb-1">
        <span className="text-[10px] uppercase font-bold tracking-widest glow-text">{title}</span>
        <span className="text-[10px] opacity-50 flex items-center gap-1">
          <span className="w-1 h-1 bg-current rounded-full animate-pulse"></span>
          RECV
        </span>
      </div>

      <div className="flex-1 flex items-end gap-1 px-1">
        {bars.map((height, i) => (
          <div key={i} className="flex-1 flex flex-col justify-end items-center h-full gap-0.5">
            {/* Segments for a more retro look */}
            {Array.from({ length: 10 }).map((_, segmentIndex) => {
              const segmentThreshold = (10 - segmentIndex) * 10;
              const isActive = height >= segmentThreshold;
              return (
                <div
                  key={segmentIndex}
                  className={`w-full h-1 transition-all duration-75 ${
                    isActive ? 'bg-current opacity-80' : 'bg-current opacity-5'
                  }`}
                  style={{
                    boxShadow: isActive ? '0 0 4px currentColor' : 'none'
                  }}
                />
              );
            })}
          </div>
        ))}
      </div>

      <div className="mt-1 grid grid-cols-2 text-[8px] opacity-70">
        <div className="border-r border-terminal-border/30 pr-1 text-left">CH_01: {Math.round(bars[0] || 0)}db</div>
        <div className="pl-1 text-right">PEAK: {Math.max(...bars, 0).toFixed(1)}</div>
      </div>
    </div>
  );
};

export default BarChart;
