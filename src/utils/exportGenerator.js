/**
 * Generates a standalone HTML snippet for a single widget or the entire dashboard.
 */
export const generateStandaloneCode = (layout, widgetTypes) => {
  const widgetsHtml = layout.map(w => {
    return `
    <div class="widget" style="grid-area: ${w.y + 1} / ${w.x + 1} / span ${w.h} / span ${w.w}; color: ${w.props.color};">
      <!-- ${w.type} Widget: ${w.props.title} -->
      <div class="widget-container">
        <div class="widget-header">
          <span class="widget-title">${w.props.title}</span>
          <span class="widget-status">ACTIVE</span>
        </div>
        <div class="widget-content" id="widget-${w.i}">
           <!-- SVG content will be injected or rendered here -->
           <svg viewBox="0 0 100 100" preserveAspectRatio="none" class="graph-svg">
             <path class="graph-path" d="" stroke="currentColor" fill="none" />
           </svg>
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
    }

    .widget {
      background: #121212;
      border: 1px solid #333;
      display: flex;
      flex-direction: column;
      padding: 8px;
      position: relative;
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

    /* CRT Overlay */
    .crt::before {
      content: " ";
      display: block;
      position: absolute;
      top: 0; left: 0; bottom: 0; right: 0;
      background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%),
                  linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06));
      z-index: 2;
      background-size: 100% 2px, 3px 100%;
      pointer-events: none;
    }

    @keyframes scanline {
      0% { transform: translateY(-100%); }
      100% { transform: translateY(100%); }
    }

    .scanline {
      width: 100%;
      height: 100px;
      z-index: 3;
      background: linear-gradient(0deg, rgba(0, 0, 0, 0) 0%, rgba(255, 255, 255, 0.05) 50%, rgba(0, 0, 0, 0) 100%);
      opacity: 0.1;
      position: absolute;
      bottom: 100%;
      animation: scanline 10s linear infinite;
    }
  </style>
</head>
<body class="crt">
  <div class="scanline"></div>
  <div class="dashboard">
    ${widgetsHtml}
  </div>

  <script>
    // Simple animation script for the exported widgets
    function animate() {
      // In a real export, we would include the specific JS for each widget type
      // For this demo, we'll just log that it's running
      requestAnimationFrame(animate);
    }
    animate();
  </script>
</body>
</html>
  `;
  return fullHtml;
};
