class BaseWidget {
    constructor(container, settings) {
        this.container = container;
        this.settings = settings;
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.container.appendChild(this.canvas);

        this.handleResize = () => this.resize();
        window.addEventListener('resize', this.handleResize);

        // Resize observer for the container
        this.ro = new ResizeObserver(() => this.resize());
        this.ro.observe(this.container);

        this.resize();
    }

    resize() {
        const rect = this.container.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return;
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
    }

    update(settings) {
        this.settings = { ...this.settings, ...settings };
    }

    destroy() {
        this.ro.disconnect();
        window.removeEventListener('resize', this.handleResize);
        if (this.canvas && this.canvas.parentNode) {
            this.canvas.parentNode.removeChild(this.canvas);
        }
    }

    hexToRgba(hex, alpha = 1) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
}

class StripChart extends BaseWidget {
    constructor(container, settings) {
        super(container, settings);
        this.data = [];
        this.maxPoints = 100;
    }

    render() {
        const { ctx, canvas, settings } = this;

        // Add new data point
        if (Math.random() > 0.5) {
            const lastVal = this.data.length > 0 ? this.data[this.data.length - 1] : 0.5;
            let newVal = lastVal + (Math.random() - 0.5) * 0.1;
            newVal = Math.max(0.1, Math.min(0.9, newVal));
            this.data.push(newVal);
            if (this.data.length > this.maxPoints) this.data.shift();
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw grid
        ctx.strokeStyle = this.hexToRgba(settings.color, 0.1);
        ctx.lineWidth = 1;
        for (let i = 0; i < 4; i++) {
            const y = (canvas.height / 4) * i;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();
        }

        // Draw line
        ctx.strokeStyle = settings.color;
        ctx.lineWidth = 2;
        ctx.shadowBlur = 10;
        ctx.shadowColor = settings.color;
        ctx.beginPath();

        const step = canvas.width / (this.maxPoints - 1);
        this.data.forEach((val, i) => {
            const x = i * step;
            const y = canvas.height - (val * canvas.height);
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Draw fill
        ctx.lineTo( (this.data.length-1) * step, canvas.height);
        ctx.lineTo(0, canvas.height);
        ctx.fillStyle = this.hexToRgba(settings.color, 0.05);
        ctx.fill();
    }
}

class MultiLinePlot extends BaseWidget {
    constructor(container, settings) {
        super(container, settings);
        this.lines = [
            { data: [], offset: 0, color: settings.color },
            { data: [], offset: 1000, color: '#ffffff' },
            { data: [], offset: 2000, color: settings.color + '88' }
        ];
        this.maxPoints = 60;
    }

    render(time) {
        const { ctx, canvas, settings } = this;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        this.lines.forEach((line, li) => {
            const t = (time + line.offset) * 0.001 * (settings.speed || 1);
            const val = Math.sin(t) * 0.3 + Math.cos(t * 0.5) * 0.2 + 0.5;
            line.data.push(val);
            if (line.data.length > this.maxPoints) line.data.shift();

            ctx.strokeStyle = li === 0 ? settings.color : (li === 1 ? '#ffffff' : this.hexToRgba(settings.color, 0.5));
            ctx.lineWidth = li === 0 ? 2 : 1;
            ctx.beginPath();
            const step = canvas.width / (this.maxPoints - 1);
            line.data.forEach((v, i) => {
                const x = i * step;
                const y = canvas.height - (v * canvas.height);
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            });
            ctx.stroke();
        });
    }
}

class SparklineCard extends BaseWidget {
    render(time) {
        const { ctx, canvas, settings } = this;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const val = (Math.sin(time * 0.002 * (settings.speed || 1)) * 0.5 + 0.5) * 100;

        ctx.fillStyle = settings.color;
        ctx.font = '32px VT323';
        ctx.fillText(val.toFixed(1) + (settings.units || '%'), 10, 40);

        ctx.font = '10px Fira Code';
        ctx.globalAlpha = 0.5;
        ctx.fillText('STABILITY INDEX', 10, 60);
        ctx.globalAlpha = 1.0;

        // Sparkline
        ctx.strokeStyle = settings.color;
        ctx.beginPath();
        for(let i=0; i<20; i++) {
            const x = 150 + i * 5;
            const y = 30 + Math.sin(time * 0.005 + i * 0.5) * 10;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();
    }
}

class Oscilloscope extends BaseWidget {
    render(time) {
        const { ctx, canvas, settings } = this;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const speed = settings.speed || 1;
        const color = settings.color;

        // Background grid
        ctx.strokeStyle = this.hexToRgba(color, 0.1);
        ctx.beginPath();
        for(let x=0; x<canvas.width; x+=20) { ctx.moveTo(x,0); ctx.lineTo(x,canvas.height); }
        for(let y=0; y<canvas.height; y+=20) { ctx.moveTo(0,y); ctx.lineTo(canvas.width,y); }
        ctx.stroke();

        // Waveform
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.shadowBlur = 15;
        ctx.shadowColor = color;
        ctx.beginPath();

        for(let x=0; x<canvas.width; x++) {
            const t = time * 0.005 * speed + x * 0.05;
            const y = (canvas.height/2) + Math.sin(t) * (canvas.height/3) * (Math.sin(time*0.001)*0.2 + 0.8);
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.shadowBlur = 0;
    }
}

class SpectrumAnalyzer extends BaseWidget {
    render(time) {
        const { ctx, canvas, settings } = this;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const bars = 20;
        const gap = 4;
        const barWidth = (canvas.width - (bars - 1) * gap) / bars;

        ctx.fillStyle = settings.color;
        for(let i=0; i<bars; i++) {
            const noise = Math.random() * 0.2;
            const h = (Math.sin(time * 0.002 * (settings.speed || 1) + i * 0.3) * 0.4 + 0.5 + noise) * canvas.height;
            ctx.fillRect(i * (barWidth + gap), canvas.height - h, barWidth, h);

            // Peak indicator
            ctx.globalAlpha = 0.5;
            ctx.fillRect(i * (barWidth + gap), canvas.height - h - 5, barWidth, 2);
            ctx.globalAlpha = 1.0;
        }
    }
}

class WaterfallDisplay extends BaseWidget {
    constructor(container, settings) {
        super(container, settings);
        this.rows = [];
        this.maxRows = 30;
    }

    render(time) {
        const { ctx, canvas, settings } = this;

        if (Math.random() > 0.8) {
            const row = [];
            const cols = 40;
            for(let i=0; i<cols; i++) {
                row.push(Math.sin(time * 0.01 + i * 0.2) * 0.5 + 0.5 + Math.random() * 0.2);
            }
            this.rows.unshift(row);
            if (this.rows.length > this.maxRows) this.rows.pop();
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const rowHeight = canvas.height / this.maxRows;
        this.rows.forEach((row, ri) => {
            const colWidth = canvas.width / row.length;
            row.forEach((val, ci) => {
                ctx.fillStyle = this.hexToRgba(settings.color, val * (1 - ri/this.maxRows));
                ctx.fillRect(ci * colWidth, ri * rowHeight, colWidth, rowHeight);
            });
        });
    }
}

export const WIDGET_REGISTRY = {
    stripChart: {
        name: 'Strip Chart',
        category: 'time-series',
        icon: 'activity',
        Class: StripChart,
        defaultSettings: { title: 'STRIP CHART', color: '#00ff41', speed: 1 },
        propertyConfig: {
            speed: { type: 'range', min: 0.1, max: 5, step: 0.1 },
            color: { type: 'color' }
        }
    },
    multiLine: {
        name: 'Multi-Line Plot',
        category: 'time-series',
        icon: 'trending-up',
        Class: MultiLinePlot,
        defaultSettings: { title: 'TELEMETRY PLOT', color: '#00ff41', speed: 1 },
        propertyConfig: {
            speed: { type: 'range', min: 0.1, max: 5, step: 0.1 },
            color: { type: 'color' }
        }
    },
    sparkline: {
        name: 'Sparkline Card',
        category: 'time-series',
        icon: 'layout',
        Class: SparklineCard,
        defaultSettings: { title: 'STATUS CARD', color: '#00faff', speed: 1, units: '%' },
        propertyConfig: {
            speed: { type: 'range', min: 0.1, max: 5, step: 0.1 },
            units: { type: 'text' },
            color: { type: 'color' }
        }
    },
    oscilloscope: {
        name: 'Oscilloscope',
        category: 'signal',
        icon: 'zap',
        Class: Oscilloscope,
        defaultSettings: { title: 'SIGNAL TRACE', color: '#00ff41', speed: 1 },
        propertyConfig: {
            speed: { type: 'range', min: 0.1, max: 5, step: 0.1 },
            color: { type: 'color' }
        }
    },
    spectrum: {
        name: 'Spectrum Analyzer',
        category: 'signal',
        icon: 'bar-chart-2',
        Class: SpectrumAnalyzer,
        defaultSettings: { title: 'FREQ ANALYSIS', color: '#ffb000', speed: 1 },
        propertyConfig: {
            speed: { type: 'range', min: 0.1, max: 5, step: 0.1 },
            color: { type: 'color' }
        }
    },
    waterfall: {
        name: 'Waterfall Display',
        category: 'signal',
        icon: 'layers',
        Class: WaterfallDisplay,
        defaultSettings: { title: 'SIGNAL HISTORY', color: '#00faff', speed: 1 },
        propertyConfig: {
            speed: { type: 'range', min: 0.1, max: 5, step: 0.1 },
            color: { type: 'color' }
        }
    },
    arcGauge: {
        name: 'Arc Gauge',
        category: 'gauges',
        icon: 'circle-dot',
        Class: class ArcGauge extends BaseWidget {
            render() {
                const { ctx, canvas, settings } = this;
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                const cx = canvas.width / 2;
                const cy = canvas.height * 0.7;
                const r = Math.min(canvas.width, canvas.height) * 0.4;
                const val = (settings.value || 0) / 100;

                // Track
                ctx.strokeStyle = this.hexToRgba(settings.color, 0.1);
                ctx.lineWidth = 15;
                ctx.lineCap = 'round';
                ctx.beginPath();
                ctx.arc(cx, cy, r, Math.PI, 0);
                ctx.stroke();

                // Value
                ctx.strokeStyle = settings.color;
                ctx.shadowBlur = 10;
                ctx.shadowColor = settings.color;
                ctx.beginPath();
                ctx.arc(cx, cy, r, Math.PI, Math.PI + val * Math.PI);
                ctx.stroke();
                ctx.shadowBlur = 0;

                // Text
                ctx.fillStyle = settings.color;
                ctx.font = '24px VT323';
                ctx.textAlign = 'center';
                ctx.fillText((settings.value || 0).toFixed(0) + '%', cx, cy - 10);
            }
        },
        defaultSettings: { title: 'ARC GAUGE', color: '#00faff', value: 75 },
        propertyConfig: {
            value: { type: 'range', min: 0, max: 100 },
            color: { type: 'color' }
        }
    },
    linearMeter: {
        name: 'Linear Meter',
        category: 'gauges',
        icon: 'align-left',
        Class: class LinearMeter extends BaseWidget {
            render() {
                const { ctx, canvas, settings } = this;
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                const segments = 20;
                const margin = 10;
                const w = (canvas.width - margin * 2);
                const h = 20;
                const segW = (w - (segments - 1) * 2) / segments;
                const val = (settings.value || 0) / 100;

                for(let i=0; i<segments; i++) {
                    const active = (i / segments) < val;
                    ctx.fillStyle = active ? settings.color : this.hexToRgba(settings.color, 0.1);
                    if (active && i > segments * 0.8) ctx.fillStyle = '#ff0000';
                    ctx.fillRect(margin + i * (segW + 2), canvas.height/2 - h/2, segW, h);
                }

                ctx.fillStyle = settings.color;
                ctx.font = '10px Fira Code';
                ctx.fillText('OUTPUT LEVEL: ' + (settings.value || 0).toFixed(0) + '%', margin, canvas.height/2 + h + 10);
            }
        },
        defaultSettings: { title: 'SEGMENTED METER', color: '#00ff41', value: 45 },
        propertyConfig: {
            value: { type: 'range', min: 0, max: 100 },
            color: { type: 'color' }
        }
    },
    numericReadout: {
        name: 'Numeric Readout',
        category: 'gauges',
        icon: 'hash',
        Class: class NumericReadout extends BaseWidget {
            render(time) {
                const { ctx, canvas, settings } = this;
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                const val = (settings.value || 0) + Math.sin(time * 0.01) * (settings.jitter || 0);

                ctx.fillStyle = settings.color;
                ctx.font = '48px VT323';
                ctx.textAlign = 'center';
                ctx.fillText(val.toFixed(settings.precision || 0), canvas.width/2, canvas.height/2 + 10);

                ctx.font = '12px Fira Code';
                ctx.globalAlpha = 0.5;
                ctx.fillText(settings.units || 'UNITS', canvas.width/2, canvas.height/2 + 30);
            }
        },
        defaultSettings: { title: 'DATA READOUT', color: '#ffb000', value: 1240, jitter: 5, precision: 1, units: 'kW' },
        propertyConfig: {
            value: { type: 'number' },
            jitter: { type: 'number' },
            precision: { type: 'number', min: 0, max: 5 },
            units: { type: 'text' },
            color: { type: 'color' }
        }
    },
    statusMatrix: {
        name: 'Status Matrix',
        category: 'status',
        icon: 'grid',
        Class: class StatusMatrix extends BaseWidget {
            render(time) {
                const { ctx, canvas, settings } = this;
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                const rows = 4, cols = 8;
                const size = 15, gap = 5;
                const offsetX = (canvas.width - (cols * (size + gap))) / 2;
                const offsetY = (canvas.height - (rows * (size + gap))) / 2;

                for(let r=0; r<rows; r++) {
                    for(let c=0; c<cols; c++) {
                        const seed = r * cols + c;
                        const active = Math.sin(time * 0.001 + seed) > 0;
                        ctx.fillStyle = active ? settings.color : this.hexToRgba(settings.color, 0.1);
                        ctx.fillRect(offsetX + c * (size + gap), offsetY + r * (size + gap), size, size);
                        if (active) {
                            ctx.strokeStyle = '#fff';
                            ctx.strokeRect(offsetX + c * (size + gap), offsetY + r * (size + gap), size, size);
                        }
                    }
                }
            }
        },
        defaultSettings: { title: 'NODE STATUS', color: '#00ff41' },
        propertyConfig: {
            color: { type: 'color' }
        }
    },
    alarmBanner: {
        name: 'Alarm Banner',
        category: 'status',
        icon: 'alert-triangle',
        Class: class AlarmBanner extends BaseWidget {
            render(time) {
                const { ctx, canvas, settings } = this;
                const active = Math.sin(time * 0.005) > 0;
                ctx.clearRect(0, 0, canvas.width, canvas.height);

                if (active) {
                    ctx.fillStyle = this.hexToRgba(settings.color || '#ff0000', 0.2);
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    ctx.fillStyle = settings.color || '#ff0000';
                    ctx.font = 'bold 20px Fira Code';
                    ctx.textAlign = 'center';
                    ctx.fillText('ALARM: ' + (settings.message || 'CRITICAL SYSTEM FAILURE'), canvas.width/2, canvas.height/2 + 7);
                }
            }
        },
        defaultSettings: { title: 'ALARM SYSTEM', color: '#ff0000', message: 'CORE TEMPERATURE OVER LIMIT' },
        propertyConfig: {
            message: { type: 'text' },
            color: { type: 'color' }
        }
    },
    eventLog: {
        name: 'Event Log',
        category: 'status',
        icon: 'list',
        Class: class EventLog extends BaseWidget {
            constructor(container, settings) {
                super(container, settings);
                this.logs = ['SYSTEM INITIALIZED', 'SCANNING SECTORS...', 'NO THREATS DETECTED'];
            }
            render() {
                const { ctx, canvas, settings } = this;
                if (Math.random() > 0.98) {
                    const msgs = ['PACKET RECEIVED', 'ENCRYPTION ACTIVE', 'BUFFER OVERFLOW PREVENTED', 'NODE STABILIZED', 'SIGNAL LOST', 'RECONNECTING...'];
                    this.logs.push(msgs[Math.floor(Math.random() * msgs.length)]);
                    if (this.logs.length > 10) this.logs.shift();
                }
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.fillStyle = settings.color;
                ctx.font = '10px Fira Code';
                this.logs.forEach((log, i) => {
                    const opacity = (i + 1) / this.logs.length;
                    ctx.globalAlpha = opacity;
                    ctx.fillText(`> [${new Date().toLocaleTimeString()}] ${log}`, 10, 20 + i * 15);
                });
                ctx.globalAlpha = 1.0;
            }
        },
        defaultSettings: { title: 'EVENT LOG', color: '#00ff41' },
        propertyConfig: {
            color: { type: 'color' }
        }
    },
    ppiRadar: {
        name: 'PPI Radar',
        category: 'spatial',
        icon: 'radar',
        Class: class PPIRadar extends BaseWidget {
            constructor(container, settings) {
                super(container, settings);
                this.blips = [];
                for(let i=0; i<5; i++) this.blips.push({ r: Math.random(), angle: Math.random() * Math.PI * 2, size: 2 + Math.random() * 3 });
            }
            render(time) {
                const { ctx, canvas, settings } = this;
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                const cx = canvas.width/2, cy = canvas.height/2;
                const r = Math.min(canvas.width, canvas.height) * 0.4;
                const sweepAngle = (time * 0.002 * (settings.speed || 1)) % (Math.PI * 2);

                // Rings
                ctx.strokeStyle = this.hexToRgba(settings.color, 0.2);
                ctx.lineWidth = 1;
                for(let i=1; i<=3; i++) {
                    ctx.beginPath(); ctx.arc(cx, cy, (r/3)*i, 0, Math.PI*2); ctx.stroke();
                }
                ctx.beginPath(); ctx.moveTo(cx-r, cy); ctx.lineTo(cx+r, cy); ctx.stroke();
                ctx.beginPath(); ctx.moveTo(cx, cy-r); ctx.lineTo(cx, cy+r); ctx.stroke();

                // Sweep
                const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
                gradient.addColorStop(0, this.hexToRgba(settings.color, 0));
                gradient.addColorStop(1, this.hexToRgba(settings.color, 0.4));

                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.moveTo(cx, cy);
                ctx.arc(cx, cy, r, sweepAngle - 0.2, sweepAngle);
                ctx.fill();

                // Blips
                this.blips.forEach(blip => {
                    const angleDiff = (sweepAngle - blip.angle + Math.PI*2) % (Math.PI*2);
                    const opacity = Math.max(0, 1 - angleDiff * 1.5);
                    if (opacity > 0) {
                        ctx.fillStyle = settings.color;
                        ctx.globalAlpha = opacity;
                        ctx.beginPath();
                        ctx.arc(cx + Math.cos(blip.angle) * blip.r * r, cy + Math.sin(blip.angle) * blip.r * r, blip.size, 0, Math.PI*2);
                        ctx.fill();
                    }
                });
                ctx.globalAlpha = 1.0;
            }
        },
        defaultSettings: { title: 'TACTICAL SWEEP', color: '#00ff41', speed: 1 },
        propertyConfig: {
            speed: { type: 'range', min: 0.1, max: 5, step: 0.1 },
            color: { type: 'color' }
        }
    },
    targetReticle: {
        name: 'Target Reticle',
        category: 'spatial',
        icon: 'crosshair',
        Class: class TargetReticle extends BaseWidget {
            render(time) {
                const { ctx, canvas, settings } = this;
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                const cx = canvas.width/2, cy = canvas.height/2;
                const size = 60 + Math.sin(time * 0.01) * 5;

                ctx.strokeStyle = settings.color;
                ctx.lineWidth = 2;

                // Brackets
                const b = 20;
                // TL
                ctx.beginPath(); ctx.moveTo(cx-size, cy-size+b); ctx.lineTo(cx-size, cy-size); ctx.lineTo(cx-size+b, cy-size); ctx.stroke();
                // TR
                ctx.beginPath(); ctx.moveTo(cx+size-b, cy-size); ctx.lineTo(cx+size, cy-size); ctx.lineTo(cx+size, cy-size+b); ctx.stroke();
                // BL
                ctx.beginPath(); ctx.moveTo(cx-size, cy+size-b); ctx.lineTo(cx-size, cy+size); ctx.lineTo(cx-size+b, cy+size); ctx.stroke();
                // BR
                ctx.beginPath(); ctx.moveTo(cx+size-b, cy+size); ctx.lineTo(cx+size, cy+size); ctx.lineTo(cx+size, cy+size-b); ctx.stroke();

                // Crosshair
                ctx.beginPath(); ctx.moveTo(cx-10, cy); ctx.lineTo(cx+10, cy); ctx.moveTo(cx, cy-10); ctx.lineTo(cx, cy+10); ctx.stroke();

                // Text
                ctx.fillStyle = settings.color;
                ctx.font = '10px Fira Code';
                ctx.fillText('LOCK: ' + (Math.sin(time*0.005) > 0.5 ? 'ACTIVE' : 'SEARCHING'), cx + size + 5, cy - size);
                ctx.fillText('DIST: ' + (1240 + Math.random()*10).toFixed(0) + 'm', cx + size + 5, cy - size + 15);
            }
        },
        defaultSettings: { title: 'WEAPON LOCK', color: '#ff0000' },
        propertyConfig: {
            color: { type: 'color' }
        }
    },
    nodeTopology: {
        name: 'Node Topology',
        category: 'spatial',
        icon: 'share-2',
        Class: class NodeTopology extends BaseWidget {
            constructor(container, settings) {
                super(container, settings);
                this.nodes = [];
                for(let i=0; i<6; i++) this.nodes.push({ x: Math.random(), y: Math.random() });
            }
            render(time) {
                const { ctx, canvas, settings } = this;
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                const margin = 40;
                const w = canvas.width - margin*2, h = canvas.height - margin*2;

                ctx.strokeStyle = this.hexToRgba(settings.color, 0.3);
                ctx.beginPath();
                this.nodes.forEach((n, i) => {
                    this.nodes.forEach((n2, j) => {
                        if (i < j && Math.hypot(n.x - n2.x, n.y - n2.y) < 0.5) {
                            ctx.moveTo(margin + n.x * w, margin + n.y * h);
                            ctx.lineTo(margin + n2.x * w, margin + n2.y * h);
                        }
                    });
                });
                ctx.stroke();

                this.nodes.forEach(n => {
                    const x = margin + n.x * w + Math.sin(time * 0.001 + n.x) * 5;
                    const y = margin + n.y * h + Math.cos(time * 0.001 + n.y) * 5;
                    ctx.fillStyle = settings.color;
                    ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI*2); ctx.fill();
                    ctx.strokeStyle = '#fff'; ctx.lineWidth = 1; ctx.stroke();
                });
            }
        },
        defaultSettings: { title: 'NETWORK TOPOLOGY', color: '#00faff' },
        propertyConfig: {
            color: { type: 'color' }
        }
    },
    mimicDiagram: {
        name: 'Mimic Diagram',
        category: 'spatial',
        icon: 'activity',
        Class: class MimicDiagram extends BaseWidget {
            render(time) {
                const { ctx, canvas, settings } = this;
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                const cx = canvas.width/2, cy = canvas.height/2;

                ctx.strokeStyle = settings.color;
                ctx.lineWidth = 2;

                // Simple tank and pipes
                ctx.strokeRect(cx - 40, cy - 60, 80, 120);
                ctx.beginPath();
                ctx.moveTo(cx - 100, cy - 40); ctx.lineTo(cx - 40, cy - 40);
                ctx.moveTo(cx + 40, cy + 40); ctx.lineTo(cx + 100, cy + 40);
                ctx.stroke();

                // Flow animation
                const flow = (time * 0.05) % 20;
                ctx.setLineDash([5, 5]);
                ctx.lineDashOffset = -flow;
                ctx.beginPath();
                ctx.moveTo(cx - 100, cy - 40); ctx.lineTo(cx - 40, cy - 40);
                ctx.moveTo(cx + 40, cy + 40); ctx.lineTo(cx + 100, cy + 40);
                ctx.stroke();
                ctx.setLineDash([]);

                // Fill level
                const level = 0.5 + Math.sin(time * 0.001) * 0.2;
                ctx.fillStyle = this.hexToRgba(settings.color, 0.3);
                ctx.fillRect(cx - 40, cy + 60, 80, -120 * level);

                ctx.fillStyle = settings.color;
                ctx.font = '10px Fira Code';
                ctx.fillText('TANK_01: ' + (level * 100).toFixed(1) + '%', cx - 35, cy - 70);
            }
        },
        defaultSettings: { title: 'PROCESS FLOW', color: '#ffb000' },
        propertyConfig: {
            color: { type: 'color' }
        }
    }
};
