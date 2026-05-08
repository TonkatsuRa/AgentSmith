import { WIDGET_REGISTRY } from './widgets.js';

export function generateExport(state, mode) {
    const cssVariables = `
:root {
    --terminal-green: #00ff41;
    --terminal-amber: #ffb000;
    --terminal-cyan: #00faff;
    --terminal-red: #ff0000;
    --bg-color: #050505;
    --panel-color: #0c0c0c;
    --theme-color: ${getThemeHex(state.theme)};
    --font-main: 'Fira Code', monospace;
    --font-display: 'VT323', monospace;
}
`;

    const commonStyles = `
body {
    background-color: var(--bg-color);
    color: var(--theme-color);
    font-family: var(--font-main);
    margin: 0;
    padding: 20px;
}
.dashboard {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
}
@media (max-width: 1200px) { .dashboard { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 600px) { .dashboard { grid-template-columns: 1fr; } }
.widget-container {
    border: 1px solid rgba(255,255,255,0.1);
    background: var(--panel-color);
    display: flex;
    flex-direction: column;
    min-height: 180px;
}
.widget-header {
    padding: 5px 10px;
    background: rgba(255, 255, 255, 0.05);
    font-size: 10px;
    font-family: var(--font-display);
    letter-spacing: 1px;
}
.widget-content {
    flex: 1;
}
canvas {
    display: block;
    width: 100%;
    height: 100%;
}
`;

    const widgetClassesList = Object.entries(WIDGET_REGISTRY).map(([type, config]) => {
        const exportClassName = type.charAt(0).toUpperCase() + type.slice(1);
        let classStr = config.Class.toString();

        classStr = classStr.replace(/^const\s+\w+\s*=\s*/, '');

        classStr = classStr.replace(/class\s*(\w+)?\s+extends\s+\w+/, `class ${exportClassName} extends BaseWidget`);

        return `const ${exportClassName} = ${classStr};`;
    });

    const widgetClasses = `
const COMMON_DEFAULTS = {
    glowIntensity: 10,
    visualDensity: 'normal',
    scanlineEffect: 'OFF',
    glitchEffect: 'OFF',
    noiseEffect: 'OFF'
};

class BaseWidget {
    constructor(container, settings) {
        this.container = container;
        this.settings = { ...COMMON_DEFAULTS, ...settings };
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.container.appendChild(this.canvas);
        this.resize();
        this.ro = new ResizeObserver(() => this.resize());
        this.ro.observe(this.container);
    }
    resize() {
        const rect = this.container.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
    }
    update(settings) { this.settings = { ...this.settings, ...settings }; }
    applyEffects(ctx, canvas, settings) {
        if (settings.noiseEffect === 'ON') {
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;
            for (let i = 0; i < data.length; i += 4) {
                if (data[i+3] > 0) {
                    const noise = (Math.random() - 0.5) * 20;
                    data[i] = Math.max(0, Math.min(255, data[i] + noise));
                    data[i+1] = Math.max(0, Math.min(255, data[i+1] + noise));
                    data[i+2] = Math.max(0, Math.min(255, data[i+2] + noise));
                }
            }
            ctx.putImageData(imageData, 0, 0);
        }
        if (settings.glitchEffect === 'ON' && Math.random() > 0.98) {
            const sliceY = Math.random() * canvas.height;
            const sliceH = 5 + Math.random() * 15;
            const offset = (Math.random() - 0.5) * 20;
            const imageData = ctx.getImageData(0, sliceY, canvas.width, sliceH);
            ctx.putImageData(imageData, offset, sliceY);
        }
        if (settings.scanlineEffect === 'ON') {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
            const step = settings.visualDensity === 'dense' ? 2 : 4;
            for (let y = 0; y < canvas.height; y += step) {
                ctx.fillRect(0, y, canvas.width, 1);
            }
        }
    }
    drawGlow(ctx, color, intensity = 10) {
        ctx.shadowBlur = intensity;
        ctx.shadowColor = color;
    }
    clearGlow(ctx) {
        ctx.shadowBlur = 0;
    }
    hexToRgba(hex, alpha = 1) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return \`rgba(\${r}, \${g}, \${b}, \${alpha})\`;
    }
}
${widgetClassesList.join('\n')}
`;

    const initScript = `
const WIDGET_MAP = {
    ${state.widgets.map(w => {
        const exportClassName = w.type.charAt(0).toUpperCase() + w.type.slice(1);
        return `"${w.id}": { type: ${exportClassName}, settings: ${JSON.stringify(w.settings)} }`;
    }).join(',\n    ')}
};

function initDashboard() {
    const instances = [];
    Object.entries(WIDGET_MAP).forEach(([id, config]) => {
        const el = document.getElementById(id);
        if (el) {
            const content = el.querySelector('.widget-content');
            instances.push(new config.type(content, config.settings));
        }
    });

    function loop(time) {
        instances.forEach(i => i.render && i.render(time));
        requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
}
window.addEventListener('DOMContentLoaded', initDashboard);
`;

    const htmlContent = `
<div class="dashboard">
    ${state.widgets.map(w => `
    <div id="${w.id}" class="widget-container" style="${w.settings.gridSpan ? `grid-column: span ${w.settings.gridSpan};` : ''} ${w.settings.minHeight ? `min-height: ${w.settings.minHeight}px;` : ''}">
        <div class="widget-header">${w.settings.title || w.type.toUpperCase()}</div>
        <div class="widget-content"></div>
    </div>`).join('')}
</div>
`;

    if (mode === 'html') return htmlContent;
    if (mode === 'css') return cssVariables + commonStyles;
    if (mode === 'js') return widgetClasses + initScript;

    const fullHTML = `<!DOCTYPE html>
<html>
<head>
    <title>TELEMETRY EXPORT</title>
    <link href="https://fonts.googleapis.com/css2?family=Fira+Code&family=VT323&display=swap" rel="stylesheet">
    <style>
        ${cssVariables}
        ${commonStyles}
    </style>
</head>
<body>
    ${htmlContent}
    <script>
        ${widgetClasses}
        ${initScript}
    </script>
</body>
</html>`;
    return fullHTML;
}

function getThemeHex(theme) {
    const themes = {
        'phosphor-green': '#00ff41',
        'amber-classic': '#ffb000',
        'cyan-protocol': '#00faff',
        'combat-red': '#ff0000'
    };
    return themes[theme] || '#00ff41';
}
