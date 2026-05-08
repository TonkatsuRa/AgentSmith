import React, { useEffect, useState } from 'react';

/**
 * BarChart Component
 * Renders an equalizer-style animated bar chart.
 */
const BarChart = ({
  title = "SIGNAL FREQ",
  color = "currentColor",
  speed = 1,
  barCount = 12,
  segmentCount = 10,
  showPeaks = true
}) => {
  const [bars, setBars] = useState([]);
  const [peaks, setPeaks] = useState([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setBars(prevBars => {
        const newBars = Array.from({ length: barCount }, () => Math.random() * 80 + 10);

        if (showPeaks) {
          setPeaks(prevPeaks => {
            const newPeaks = [...prevPeaks];
            if (newPeaks.length !== barCount) return newBars.map(h => h);
            return newPeaks.map((p, i) => {
              if (newBars[i] > p) return newBars[i];
              return p - 0.5; // Slowly drop peaks
            });
          });
        }

        return newBars;
      });
    }, 100 / speed);

    return () => clearInterval(interval);
  }, [speed, barCount, showPeaks]);

  return (
    <div className="w-full h-full flex flex-col p-2 bg-terminal-panel border border-terminal-border rounded-sm overflow-hidden" style={{ color }}>
      <div className="flex justify-between items-center mb-1 border-b border-terminal-border/30 pb-1">
        <span className="text-[10px] uppercase font-bold tracking-widest glow-text">{title}</span>
        <span className="text-[10px] opacity-50 flex items-center gap-1">
          <span className="w-1 h-1 bg-current rounded-full animate-pulse"></span>
          RECV
        </span>
      </div>

      <div className="flex-1 flex items-end gap-1 px-1 relative">
        {bars.map((height, i) => (
          <div key={i} className="flex-1 flex flex-col justify-end items-center h-full gap-0.5">
            {/* Peaks */}
            {showPeaks && peaks[i] > 0 && (
              <div
                className="w-full h-[1px] bg-current opacity-60 absolute transition-all duration-300"
                style={{ bottom: `${peaks[i]}%`, left: `${(i / barCount) * 100}%`, width: `${100 / barCount - 2}%` }}
              />
            )}

            {/* Segments */}
            {Array.from({ length: segmentCount }).map((_, segmentIndex) => {
              const segmentThreshold = (segmentCount - segmentIndex) * (100 / segmentCount);
              const isActive = height >= segmentThreshold;
              return (
                <div
                  key={segmentIndex}
                  className={`w-full transition-all duration-75 ${
                    isActive ? 'bg-current opacity-80' : 'bg-current opacity-5'
                  }`}
                  style={{
                    height: `${100 / (segmentCount * 2)}%`,
                    boxShadow: isActive ? '0 0 4px currentColor' : 'none'
                  }}
                />
              );
            })}
          </div>
        ))}
      </div>

      <div className="mt-1 flex justify-between text-[8px] opacity-70">
        <span>S_COUNT: {segmentCount}</span>
        <span>PEAK: {Math.max(...bars, 0).toFixed(1)}</span>
      </div>
    </div>
  );
};

export default BarChart;
