/**
 * Generates a standalone HTML snippet for the entire dashboard.
 */
export const generateStandaloneCode = (layout, widgetTypes, effects = {}) => {
  const widgetsHtml = layout.map(w => {
    return `
    <div class="widget" style="grid-area: ${w.y + 1} / ${w.x + 1} / span ${w.h} / span ${w.w}; color: ${w.props.color};">
      <div class="widget-container" data-type="${w.type}" data-props='${JSON.stringify(w.props)}'>
        <div class="widget-header">
          <span class="widget-title">${w.props.title}</span>
          <span class="widget-status">ACTIVE</span>
        </div>
        <div class="widget-content" id="widget-${w.i}">
           <svg viewBox="0 0 100 100" preserveAspectRatio="none" class="graph-svg"></svg>
        </div>
      </div>
    </div>`;
  }).join('\n');

  const fullHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Retro Telemetry Widget</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=VT323&display=swap');

    body {
      background: #0a0a0a;
      color: #00ff41;
      font-family: 'VT323', monospace;
      margin: 0;
      overflow: hidden;
    }

    .dashboard {
      display: grid;
      grid-template-columns: repeat(12, 1fr);
      grid-auto-rows: 30px;
      gap: 10px;
      padding: 20px;
      height: 100vh;
      box-sizing: border-box;
      position: relative;
    }

    .widget {
      background: #121212;
      border: 1px solid #333;
      display: flex;
      flex-direction: column;
      padding: 8px;
      position: relative;
      overflow: hidden;
    }

    .widget-header {
      display: flex;
      justify-content: space-between;
      border-bottom: 1px solid rgba(255,255,255,0.1);
      padding-bottom: 4px;
      margin-bottom: 8px;
      font-size: 10px;
      letter-spacing: 2px;
    }

    .widget-content {
      flex: 1;
      position: relative;
    }

    .graph-svg {
      width: 100%;
      height: 100%;
    }

    /* Effects */
    ${effects.vignette ? `
    .vignette {
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      box-shadow: inset 0 0 150px rgba(0,0,0,0.9); pointer-events: none; z-index: 10;
    }` : ''}

    ${effects.scanlines ? `
    .crt-overlay {
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%),
                  linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06));
      background-size: 100% 4px, 3px 100%; pointer-events: none; z-index: 11;
    }` : ''}

    ${effects.flicker ? `
    @keyframes scanline { 0% { transform: translateY(-100%); } 100% { transform: translateY(100%); } }
    @keyframes flicker { 0% { opacity: 0.98; } 100% { opacity: 1; } }
    .scanline {
      width: 100%; height: 100px; z-index: 12;
      background: linear-gradient(0deg, rgba(0, 0, 0, 0) 0%, rgba(255, 255, 255, 0.05) 50%, rgba(0, 0, 0, 0) 100%);
      opacity: 0.1; position: absolute; pointer-events: none;
      animation: scanline 10s linear infinite, flicker 0.1s infinite;
    }` : ''}
  </style>
</head>
<body>
  ${effects.vignette ? '<div class="vignette"></div>' : ''}
  ${effects.scanlines ? '<div class="crt-overlay"></div>' : ''}
  ${effects.flicker ? '<div class="scanline"></div>' : ''}

  <div class="dashboard">
    ${widgetsHtml}
  </div>

  <script>
    const widgets = document.querySelectorAll('.widget-container');

    widgets.forEach(container => {
      const type = container.dataset.type;
      const props = JSON.parse(container.dataset.props);
      const svg = container.querySelector('svg');

      if (type === 'PULSE') {
        const points = Array.from({length: 50}, (_, i) => ({x: (i/49)*100, y: 50}));
        let t = 0;
        function anim() {
          t += 0.1 * props.speed;
          for(let i=0; i<points.length-1; i++) points[i].y = points[i+1].y;
          let pulse = Math.sin(t) * props.amplitude;
          if (Math.random() > (1 - props.glitchFrequency)) pulse += (Math.random()-0.5)*60;
          points[points.length-1].y = 50 + pulse;

          const d = 'M ' + points.map(p => p.x + ',' + p.y).join(' L ');
          svg.innerHTML = \`<path d="\${d}" stroke="currentColor" fill="none" stroke-width="\${props.strokeWidth}" />\`;
          requestAnimationFrame(anim);
        }
        anim();
      }

      if (type === 'BARS') {
        function anim() {
          let html = '';
          const barWidth = 100 / props.barCount;
          for(let i=0; i<props.barCount; i++) {
            const h = Math.random() * 80 + 10;
            for(let s=0; s<props.segmentCount; s++) {
              const threshold = (props.segmentCount - s) * (100 / props.segmentCount);
              const active = h >= threshold;
              html += \`<rect x="\${i*barWidth + 1}" y="\${s*(100/props.segmentCount)}" width="\${barWidth-2}" height="\${(100/props.segmentCount)-2}" fill="currentColor" opacity="\${active ? 0.8 : 0.1}" />\`;
            }
          }
          svg.innerHTML = html;
          setTimeout(anim, 100 / props.speed);
        }
        anim();
      }

      if (type === 'GAUGE') {
        let rot = 0;
        function anim() {
          rot = (rot + 2 * props.speed) % 360;
          let html = '';
          for(let i=0; i<props.ringCount; i++) {
            html += \`<circle cx="50" cy="50" r="\${45-(i*(40/props.ringCount))}" fill="none" stroke="currentColor" stroke-width="0.5" opacity="0.1" />\`;
          }
          if(props.showRadarLine) {
            html += \`<line x1="50" y1="50" x2="50" y2="10" stroke="currentColor" stroke-width="1" transform="rotate(\${rot} 50 50)" />\`;
          }
          svg.innerHTML = html;
          requestAnimationFrame(anim);
        }
        anim();
      }

      if (type === 'TERMINAL') {
        const logs = ["> INIT...", "> LOADING..."];
        const possible = ["> DATA STREAM", "> ENCRYPTING", "> SYNCING"];
        function anim() {
          logs.push("> " + possible[Math.floor(Math.random()*possible.length)]);
          if(logs.length > 5) logs.shift();
          svg.innerHTML = \`<foreignObject x="0" y="0" width="100" height="100">
            <div style="font-size: 8px; color: inherit; font-family: monospace;">
              \${logs.map(l => \`<div>\${l}</div>\`).join('')}
            </div>
          </foreignObject>\`;
          setTimeout(anim, 2000 / props.speed);
        }
        anim();
      }
    });
  </script>
</body>
</html>
  `;
  return fullHtml;
};
