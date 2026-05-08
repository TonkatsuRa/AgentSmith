import React, { useEffect, useState, useRef } from 'react';

/**
 * PulseLineChart Component
 * Renders an animated SVG line chart with a retro sci-fi look.
 * Supports custom colors, labels, and animation speed.
 */
const PulseLineChart = ({
  title = "HEARTBEAT MON",
  color = "currentColor",
  speed = 1,
  dataPoints = 50,
  amplitude = 10,
  strokeWidth = 1.5,
  glitchFrequency = 0.05
}) => {
  const [points, setPoints] = useState([]);
  const requestRef = useRef();
  const countRef = useRef(0);

  // Initialize points
  useEffect(() => {
    const initialPoints = Array.from({ length: dataPoints }, (_, i) => ({
      x: (i / (dataPoints - 1)) * 100,
      y: 50
    }));
    setPoints(initialPoints);
  }, [dataPoints]);

  // Animation loop
  const animate = (time) => {
    countRef.current += 0.1 * speed;

    setPoints(prevPoints => {
      const newPoints = [...prevPoints];
      // Shift points left
      for (let i = 0; i < newPoints.length - 1; i++) {
        newPoints[i].y = newPoints[i + 1].y;
      }

      // Generate new point with a "pulse" effect
      const t = countRef.current;
      const base = 50;
      // Main pulse
      let pulse = Math.sin(t) * amplitude;
      // Add some erratic spikes (glitch)
      if (Math.random() > (1 - glitchFrequency)) {
        pulse += (Math.random() - 0.5) * 60;
      }

      newPoints[newPoints.length - 1].y = base + pulse;
      return newPoints;
    });

    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
  }, [speed, amplitude, glitchFrequency]);

  const pathData = points.length > 0
    ? `M ${points.map(p => `${p.x},${p.y}`).join(' L ')}`
    : '';

  return (
    <div className="w-full h-full flex flex-col p-2 bg-terminal-panel border border-terminal-border rounded-sm overflow-hidden" style={{ color }}>
      <div className="flex justify-between items-center mb-1 border-b border-terminal-border/30 pb-1">
        <span className="text-[10px] uppercase font-bold tracking-widest glow-text">{title}</span>
        <span className="text-[10px] opacity-50">SYS.ACTIVE</span>
      </div>

      <div className="flex-1 relative">
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="w-full h-full"
        >
          {/* Grid lines */}
          <line x1="0" y1="25" x2="100" y2="25" stroke="currentColor" strokeWidth="0.1" strokeDasharray="1,1" opacity="0.2" />
          <line x1="0" y1="50" x2="100" y2="50" stroke="currentColor" strokeWidth="0.1" strokeDasharray="1,1" opacity="0.4" />
          <line x1="0" y1="75" x2="100" y2="75" stroke="currentColor" strokeWidth="0.1" strokeDasharray="1,1" opacity="0.2" />

          {/* Vertical grid lines */}
          {[20, 40, 60, 80].map(x => (
            <line key={x} x1={x} y1="0" x2={x} y2="100" stroke="currentColor" strokeWidth="0.1" strokeDasharray="1,1" opacity="0.2" />
          ))}

          {/* The Pulse Path */}
          <path
            d={pathData}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="svg-glow"
          />

          {/* Gradient fill under the path */}
          <path
            d={`${pathData} L 100,100 L 0,100 Z`}
            fill="currentColor"
            fillOpacity="0.05"
          />
        </svg>
      </div>

      <div className="mt-1 flex justify-between text-[8px] opacity-70">
        <span>RATE: {speed.toFixed(1)}x</span>
        <span>AMP: {amplitude.toFixed(0)}</span>
        <span>{glitchFrequency > 0.1 ? 'GLITCH_HIGH' : 'STABLE'}</span>
      </div>
    </div>
  );
};

export default PulseLineChart;
