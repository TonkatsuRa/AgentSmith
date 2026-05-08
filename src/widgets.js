const COMMON_PROPS = {
    color: { type: 'color' },
    speed: { type: 'range', min: 0.1, max: 5, step: 0.1 },
    glowIntensity: { type: 'range', min: 0, max: 30, step: 1 },
    visualDensity: { type: 'select', options: ['minimal', 'normal', 'dense'] },
    scanlineEffect: { type: 'select', options: ['OFF', 'ON'] },
    glitchEffect: { type: 'select', options: ['OFF', 'ON'] },
    noiseEffect: { type: 'select', options: ['OFF', 'ON'] }
};

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

    applyEffects(ctx, canvas, settings) {
        // Subtle Noise effect
        if (settings.noiseEffect === 'ON') {
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;
            for (let i = 0; i < data.length; i += 4) {
                if (data[i+3] > 0) { // Only noise where there's content
                    const noise = (Math.random() - 0.5) * 20;
                    data[i] = Math.max(0, Math.min(255, data[i] + noise));
                    data[i+1] = Math.max(0, Math.min(255, data[i+1] + noise));
                    data[i+2] = Math.max(0, Math.min(255, data[i+2] + noise));
                }
            }
            ctx.putImageData(imageData, 0, 0);
        }

        // Glitch effect
        if (settings.glitchEffect === 'ON' && Math.random() > 0.98) {
            const sliceY = Math.random() * canvas.height;
            const sliceH = 5 + Math.random() * 15;
            const offset = (Math.random() - 0.5) * 20;
            const imageData = ctx.getImageData(0, sliceY, canvas.width, sliceH);
            ctx.putImageData(imageData, offset, sliceY);
        }

        // Scanlines overlay
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
        this.maxPoints = settings.visualDensity === 'dense' ? 200 : (settings.visualDensity === 'minimal' ? 50 : 100);

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
        const gridLines = settings.visualDensity === 'dense' ? 8 : 4;
        for (let i = 0; i < gridLines; i++) {
            const y = (canvas.height / gridLines) * i;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();
        }

        // Draw line
        ctx.strokeStyle = settings.color;
        ctx.lineWidth = settings.visualDensity === 'dense' ? 1 : 2;
        this.drawGlow(ctx, settings.color, settings.glowIntensity);
        ctx.beginPath();

        const step = canvas.width / (this.maxPoints - 1);
        this.data.forEach((val, i) => {
            const x = i * step;
            const y = canvas.height - (val * canvas.height);
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });
        ctx.stroke();
        this.clearGlow(ctx);

        // Draw fill
        ctx.lineTo( (this.data.length-1) * step, canvas.height);
        ctx.lineTo(0, canvas.height);
        ctx.fillStyle = this.hexToRgba(settings.color, 0.05);
        ctx.fill();

        this.applyEffects(ctx, canvas, settings);
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

        const numLines = settings.visualDensity === 'dense' ? 5 : (settings.visualDensity === 'minimal' ? 2 : 3);
        this.maxPoints = settings.visualDensity === 'dense' ? 100 : 60;

        for (let li = 0; li < numLines; li++) {
            if (!this.lines[li]) {
                this.lines[li] = { data: [], offset: li * 1000, color: li % 2 === 0 ? settings.color : '#ffffff' };
            }
            const line = this.lines[li];
            const t = (time + line.offset) * 0.001 * (settings.speed || 1);
            const val = Math.sin(t) * 0.3 + Math.cos(t * 0.5) * 0.2 + 0.5;
            line.data.push(val);
            if (line.data.length > this.maxPoints) line.data.shift();

            ctx.strokeStyle = li === 0 ? settings.color : (li === 1 ? '#ffffff' : this.hexToRgba(settings.color, 0.5));
            ctx.lineWidth = li === 0 ? 2 : 1;
            this.drawGlow(ctx, ctx.strokeStyle, settings.glowIntensity / 2);
            ctx.beginPath();
            const step = canvas.width / (this.maxPoints - 1);
            line.data.forEach((v, i) => {
                const x = i * step;
                const y = canvas.height - (v * canvas.height);
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            });
            ctx.stroke();
            this.clearGlow(ctx);
        }
        this.applyEffects(ctx, canvas, settings);
    }
}

class SparklineCard extends BaseWidget {
    render(time) {
        const { ctx, canvas, settings } = this;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const val = (Math.sin(time * 0.002 * (settings.speed || 1)) * 0.5 + 0.5) * 100;

        this.drawGlow(ctx, settings.color, settings.glowIntensity);
        ctx.fillStyle = settings.color;
        ctx.font = settings.visualDensity === 'dense' ? '24px VT323' : '32px VT323';
        ctx.fillText(val.toFixed(1) + (settings.units || '%'), 10, 40);
        this.clearGlow(ctx);

        ctx.font = '10px Fira Code';
        ctx.globalAlpha = 0.5;
        ctx.fillText(settings.title || 'STATUS CARD', 10, 60);
        ctx.globalAlpha = 1.0;

        // Sparkline
        ctx.strokeStyle = settings.color;
        this.drawGlow(ctx, settings.color, settings.glowIntensity / 2);
        ctx.beginPath();
        const points = settings.visualDensity === 'dense' ? 40 : 20;
        for(let i=0; i<points; i++) {
            const x = (canvas.width * 0.5) + i * (canvas.width * 0.4 / points);
            const y = 30 + Math.sin(time * 0.005 + i * 0.5) * 10;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();
        this.clearGlow(ctx);
        this.applyEffects(ctx, canvas, settings);
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
        const gridStep = settings.visualDensity === 'dense' ? 10 : 20;
        ctx.beginPath();
        for(let x=0; x<canvas.width; x+=gridStep) { ctx.moveTo(x,0); ctx.lineTo(x,canvas.height); }
        for(let y=0; y<canvas.height; y+=gridStep) { ctx.moveTo(0,y); ctx.lineTo(canvas.width,y); }
        ctx.stroke();

        // Waveform
        ctx.strokeStyle = color;
        ctx.lineWidth = settings.visualDensity === 'dense' ? 1 : 2;
        this.drawGlow(ctx, color, settings.glowIntensity);
        ctx.beginPath();

        const res = settings.visualDensity === 'dense' ? 1 : 2;
        for(let x=0; x<canvas.width; x+=res) {
            const t = time * 0.005 * speed + x * 0.05;
            const y = (canvas.height/2) + Math.sin(t) * (canvas.height/3) * (Math.sin(time*0.001)*0.2 + 0.8);
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();
        this.clearGlow(ctx);
        this.applyEffects(ctx, canvas, settings);
    }
}

class SpectrumAnalyzer extends BaseWidget {
    render(time) {
        const { ctx, canvas, settings } = this;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const bars = settings.visualDensity === 'dense' ? 40 : (settings.visualDensity === 'minimal' ? 10 : 20);
        const gap = settings.visualDensity === 'dense' ? 2 : 4;
        const barWidth = (canvas.width - (bars - 1) * gap) / bars;

        ctx.fillStyle = settings.color;
        this.drawGlow(ctx, settings.color, settings.glowIntensity);
        for(let i=0; i<bars; i++) {
            const noise = Math.random() * 0.2;
            const h = (Math.sin(time * 0.002 * (settings.speed || 1) + i * 0.3) * 0.4 + 0.5 + noise) * canvas.height;
            ctx.fillRect(i * (barWidth + gap), canvas.height - h, barWidth, h);

            // Peak indicator
            ctx.globalAlpha = 0.5;
            ctx.fillRect(i * (barWidth + gap), canvas.height - h - 5, barWidth, 2);
            ctx.globalAlpha = 1.0;
        }
        this.clearGlow(ctx);
        this.applyEffects(ctx, canvas, settings);
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
        this.maxRows = settings.visualDensity === 'dense' ? 60 : 30;

        if (Math.random() > (settings.visualDensity === 'dense' ? 0.6 : 0.8)) {
            const row = [];
            const cols = settings.visualDensity === 'dense' ? 80 : 40;
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
                ctx.fillRect(ci * colWidth, ri * rowHeight, Math.ceil(colWidth), Math.ceil(rowHeight));
            });
        });
        this.applyEffects(ctx, canvas, settings);
    }
}

class ArcGauge extends BaseWidget {
    render() {
        const { ctx, canvas, settings } = this;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const cx = canvas.width / 2;
        const cy = canvas.height * 0.7;
        const r = Math.min(canvas.width, canvas.height) * 0.4;
        const val = (settings.value || 0) / 100;

        // Track
        ctx.strokeStyle = this.hexToRgba(settings.color, 0.1);
        ctx.lineWidth = settings.visualDensity === 'dense' ? 25 : 15;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.arc(cx, cy, r, Math.PI, 0);
        ctx.stroke();

        // Warning/Critical highlights
        const warn = (settings.warningThreshold || 70) / 100;
        const crit = (settings.criticalThreshold || 90) / 100;

        // Value
        ctx.strokeStyle = settings.color;
        if (settings.value > settings.criticalThreshold) ctx.strokeStyle = '#ff0000';
        else if (settings.value > settings.warningThreshold) ctx.strokeStyle = '#ffb000';

        this.drawGlow(ctx, ctx.strokeStyle, settings.glowIntensity);
        ctx.beginPath();
        ctx.arc(cx, cy, r, Math.PI, Math.PI + val * Math.PI);
        ctx.stroke();
        this.clearGlow(ctx);

        // Text
        ctx.fillStyle = ctx.strokeStyle;
        ctx.font = '24px VT323';
        ctx.textAlign = 'center';
        ctx.fillText((settings.value || 0).toFixed(0) + (settings.units || '%'), cx, cy - 10);

        this.applyEffects(ctx, canvas, settings);
    }
}

class LinearMeter extends BaseWidget {
    render() {
        const { ctx, canvas, settings } = this;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const segments = settings.visualDensity === 'dense' ? 40 : 20;
        const margin = 10;
        const w = (canvas.width - margin * 2);
        const h = settings.visualDensity === 'dense' ? 12 : 20;
        const segW = (w - (segments - 1) * 2) / segments;
        const val = (settings.value || 0) / 100;

        for(let i=0; i<segments; i++) {
            const active = (i / segments) < val;
            const currentVal = (i / segments) * 100;

            let color = settings.color;
            if (currentVal > (settings.criticalThreshold || 90)) color = '#ff0000';
            else if (currentVal > (settings.warningThreshold || 70)) color = '#ffb000';

            ctx.fillStyle = active ? color : this.hexToRgba(color, 0.1);
            if (active) this.drawGlow(ctx, color, settings.glowIntensity / 2);
            ctx.fillRect(margin + i * (segW + 2), canvas.height/2 - h/2, segW, h);
            this.clearGlow(ctx);
        }

        ctx.fillStyle = settings.color;
        ctx.font = '10px Fira Code';
        ctx.fillText(settings.title + ': ' + (settings.value || 0).toFixed(0) + (settings.units || '%'), margin, canvas.height/2 + h + 10);
        this.applyEffects(ctx, canvas, settings);
    }
}

class NumericReadout extends BaseWidget {
    render(time) {
        const { ctx, canvas, settings } = this;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const val = (settings.value || 0) + Math.sin(time * 0.01) * (settings.jitter || 0);

        this.drawGlow(ctx, settings.color, settings.glowIntensity);
        ctx.fillStyle = settings.color;
        ctx.font = settings.visualDensity === 'dense' ? '36px VT323' : '48px VT323';
        ctx.textAlign = 'center';
        ctx.fillText(val.toFixed(settings.precision || 0), canvas.width/2, canvas.height/2 + 10);
        this.clearGlow(ctx);

        ctx.font = '12px Fira Code';
        ctx.globalAlpha = 0.5;
        ctx.fillText(settings.units || 'UNITS', canvas.width/2, canvas.height/2 + 30);
        this.applyEffects(ctx, canvas, settings);
    }
}

class StatusMatrix extends BaseWidget {
    render(time) {
        const { ctx, canvas, settings } = this;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const rows = settings.visualDensity === 'dense' ? 8 : 4;
        const cols = settings.visualDensity === 'dense' ? 16 : 8;
        const size = settings.visualDensity === 'dense' ? 8 : 15;
        const gap = settings.visualDensity === 'dense' ? 3 : 5;
        const offsetX = (canvas.width - (cols * (size + gap))) / 2;
        const offsetY = (canvas.height - (rows * (size + gap))) / 2;

        for(let r=0; r<rows; r++) {
            for(let c=0; c<cols; c++) {
                const seed = r * cols + c;
                const active = Math.sin(time * 0.001 + seed) > 0;
                ctx.fillStyle = active ? settings.color : this.hexToRgba(settings.color, 0.1);
                if (active) this.drawGlow(ctx, settings.color, settings.glowIntensity / 2);
                ctx.fillRect(offsetX + c * (size + gap), offsetY + r * (size + gap), size, size);
                this.clearGlow(ctx);
                if (active && settings.visualDensity !== 'dense') {
                    ctx.strokeStyle = '#fff';
                    ctx.lineWidth = 1;
                    ctx.strokeRect(offsetX + c * (size + gap), offsetY + r * (size + gap), size, size);
                }
            }
        }
        this.applyEffects(ctx, canvas, settings);
    }
}

class AlarmBanner extends BaseWidget {
    render(time) {
        const { ctx, canvas, settings } = this;
        const active = Math.sin(time * 0.005) > 0;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (active) {
            ctx.fillStyle = this.hexToRgba(settings.color || '#ff0000', 0.2);
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            this.drawGlow(ctx, settings.color || '#ff0000', settings.glowIntensity);
            ctx.fillStyle = settings.color || '#ff0000';
            ctx.font = settings.visualDensity === 'dense' ? 'bold 14px Fira Code' : 'bold 20px Fira Code';
            ctx.textAlign = 'center';
            ctx.fillText('ALARM: ' + (settings.message || 'CRITICAL SYSTEM FAILURE'), canvas.width/2, canvas.height/2 + 7);
            this.clearGlow(ctx);
        }
        this.applyEffects(ctx, canvas, settings);
    }
}

class EventLog extends BaseWidget {
    constructor(container, settings) {
        super(container, settings);
        this.logs = ['SYSTEM INITIALIZED', 'SCANNING SECTORS...', 'NO THREATS DETECTED'];
    }
    render() {
        const { ctx, canvas, settings } = this;
        const maxLogs = settings.visualDensity === 'dense' ? 20 : 10;
        if (Math.random() > 0.98) {
            const msgs = ['PACKET RECEIVED', 'ENCRYPTION ACTIVE', 'BUFFER OVERFLOW PREVENTED', 'NODE STABILIZED', 'SIGNAL LOST', 'RECONNECTING...'];
            this.logs.push(msgs[Math.floor(Math.random() * msgs.length)]);
            if (this.logs.length > maxLogs) this.logs.shift();
        }
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = settings.color;
        ctx.font = settings.visualDensity === 'dense' ? '8px Fira Code' : '10px Fira Code';
        this.logs.forEach((log, i) => {
            const opacity = (i + 1) / this.logs.length;
            ctx.globalAlpha = opacity;
            ctx.fillText(`> [${new Date().toLocaleTimeString()}] ${log}`, 10, 20 + i * (settings.visualDensity === 'dense' ? 10 : 15));
        });
        ctx.globalAlpha = 1.0;
        this.applyEffects(ctx, canvas, settings);
    }
}

class PPIRadar extends BaseWidget {
    constructor(container, settings) {
        super(container, settings);
        this.blips = [];
        for(let i=0; i<10; i++) this.blips.push({ r: Math.random(), angle: Math.random() * Math.PI * 2, size: 2 + Math.random() * 3 });
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
        const rings = settings.visualDensity === 'dense' ? 6 : 3;
        for(let i=1; i<=rings; i++) {
            ctx.beginPath(); ctx.arc(cx, cy, (r/rings)*i, 0, Math.PI*2); ctx.stroke();
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
        const blipCount = settings.visualDensity === 'dense' ? 10 : 5;
        this.blips.slice(0, blipCount).forEach(blip => {
            const angleDiff = (sweepAngle - blip.angle + Math.PI*2) % (Math.PI*2);
            const opacity = Math.max(0, 1 - angleDiff * 1.5);
            if (opacity > 0) {
                ctx.fillStyle = settings.color;
                this.drawGlow(ctx, settings.color, settings.glowIntensity);
                ctx.globalAlpha = opacity;
                ctx.beginPath();
                ctx.arc(cx + Math.cos(blip.angle) * blip.r * r, cy + Math.sin(blip.angle) * blip.r * r, blip.size, 0, Math.PI*2);
                ctx.fill();
                this.clearGlow(ctx);
            }
        });
        ctx.globalAlpha = 1.0;
        this.applyEffects(ctx, canvas, settings);
    }
}

class TargetReticle extends BaseWidget {
    render(time) {
        const { ctx, canvas, settings } = this;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const cx = canvas.width/2, cy = canvas.height/2;
        const size = (settings.visualDensity === 'dense' ? 40 : 60) + Math.sin(time * 0.01) * 5;

        ctx.strokeStyle = settings.color;
        ctx.lineWidth = 2;
        this.drawGlow(ctx, settings.color, settings.glowIntensity);

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
        this.clearGlow(ctx);

        // Text
        ctx.fillStyle = settings.color;
        ctx.font = '10px Fira Code';
        ctx.fillText('LOCK: ' + (Math.sin(time*0.005) > 0.5 ? 'ACTIVE' : 'SEARCHING'), cx + size + 5, cy - size);
        ctx.fillText('DIST: ' + (1240 + Math.random()*10).toFixed(0) + 'm', cx + size + 5, cy - size + 15);
        this.applyEffects(ctx, canvas, settings);
    }
}

class NodeTopology extends BaseWidget {
    constructor(container, settings) {
        super(container, settings);
        this.nodes = [];
        for(let i=0; i<12; i++) this.nodes.push({ x: Math.random(), y: Math.random(), vx: (Math.random()-0.5)*0.001, vy: (Math.random()-0.5)*0.001 });
    }
    render(time) {
        const { ctx, canvas, settings } = this;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const margin = 40;
        const w = canvas.width - margin*2, h = canvas.height - margin*2;

        const nodeCount = settings.visualDensity === 'dense' ? 12 : 6;

        ctx.strokeStyle = this.hexToRgba(settings.color, 0.3);
        ctx.beginPath();
        for(let i=0; i<nodeCount; i++) {
            const n = this.nodes[i];
            for(let j=i+1; j<nodeCount; j++) {
                const n2 = this.nodes[j];
                const dist = Math.hypot(n.x - n2.x, n.y - n2.y);
                if (dist < 0.5) {
                    ctx.globalAlpha = 1 - (dist / 0.5);
                    ctx.moveTo(margin + n.x * w, margin + n.y * h);
                    ctx.lineTo(margin + n2.x * w, margin + n2.y * h);
                }
            }
        }
        ctx.stroke();
        ctx.globalAlpha = 1.0;

        for(let i=0; i<nodeCount; i++) {
            const n = this.nodes[i];
            const x = margin + n.x * w + Math.sin(time * 0.001 + n.x) * 5;
            const y = margin + n.y * h + Math.cos(time * 0.001 + n.y) * 5;

            ctx.fillStyle = settings.color;
            this.drawGlow(ctx, settings.color, settings.glowIntensity / 2);
            ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI*2); ctx.fill();
            this.clearGlow(ctx);

            if (settings.visualDensity !== 'minimal') {
                ctx.strokeStyle = '#fff'; ctx.lineWidth = 1; ctx.stroke();
            }
        }
        this.applyEffects(ctx, canvas, settings);
    }
}

class MimicDiagram extends BaseWidget {
    render(time) {
        const { ctx, canvas, settings } = this;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const cx = canvas.width/2, cy = canvas.height/2;

        ctx.strokeStyle = settings.color;
        ctx.lineWidth = 2;
        this.drawGlow(ctx, settings.color, settings.glowIntensity / 2);

        // Simple tank and pipes
        ctx.strokeRect(cx - 40, cy - 60, 80, 120);
        ctx.beginPath();
        ctx.moveTo(cx - 100, cy - 40); ctx.lineTo(cx - 40, cy - 40);
        ctx.moveTo(cx + 40, cy + 40); ctx.lineTo(cx + 100, cy + 40);
        ctx.stroke();

        // Flow animation
        const flow = (time * 0.05 * (settings.speed || 1)) % 20;
        ctx.setLineDash([5, 5]);
        ctx.lineDashOffset = -flow;
        ctx.beginPath();
        ctx.moveTo(cx - 100, cy - 40); ctx.lineTo(cx - 40, cy - 40);
        ctx.moveTo(cx + 40, cy + 40); ctx.lineTo(cx + 100, cy + 40);
        ctx.stroke();
        ctx.setLineDash([]);
        this.clearGlow(ctx);

        // Fill level
        const level = 0.5 + Math.sin(time * 0.001) * 0.2;
        ctx.fillStyle = this.hexToRgba(settings.color, 0.3);
        ctx.fillRect(cx - 40, cy + 60, 80, -120 * level);

        ctx.fillStyle = settings.color;
        ctx.font = '10px Fira Code';
        ctx.fillText('TANK_01: ' + (level * 100).toFixed(1) + '%', cx - 35, cy - 70);
        this.applyEffects(ctx, canvas, settings);
    }
}

export const WIDGET_REGISTRY = {
    stripChart: {
        name: 'Strip Chart',
        category: 'time-series',
        icon: 'activity',
        Class: StripChart,
        defaultSettings: { title: 'STRIP CHART', color: '#00ff41', speed: 1, ...COMMON_DEFAULTS },
        propertyConfig: {
            ...COMMON_PROPS
        }
    },
    multiLine: {
        name: 'Multi-Line Plot',
        category: 'time-series',
        icon: 'trending-up',
        Class: MultiLinePlot,
        defaultSettings: { title: 'TELEMETRY PLOT', color: '#00ff41', speed: 1, ...COMMON_DEFAULTS },
        propertyConfig: {
            ...COMMON_PROPS
        }
    },
    sparkline: {
        name: 'Sparkline Card',
        category: 'time-series',
        icon: 'layout',
        Class: SparklineCard,
        defaultSettings: { title: 'STATUS CARD', color: '#00faff', speed: 1, units: '%', ...COMMON_DEFAULTS },
        propertyConfig: {
            ...COMMON_PROPS,
            units: { type: 'text' }
        }
    },
    oscilloscope: {
        name: 'Oscilloscope',
        category: 'signal',
        icon: 'zap',
        Class: Oscilloscope,
        defaultSettings: { title: 'SIGNAL TRACE', color: '#00ff41', speed: 1, ...COMMON_DEFAULTS },
        propertyConfig: {
            ...COMMON_PROPS
        }
    },
    spectrum: {
        name: 'Spectrum Analyzer',
        category: 'signal',
        icon: 'bar-chart-2',
        Class: SpectrumAnalyzer,
        defaultSettings: { title: 'FREQ ANALYSIS', color: '#ffb000', speed: 1, ...COMMON_DEFAULTS },
        propertyConfig: {
            ...COMMON_PROPS
        }
    },
    waterfall: {
        name: 'Waterfall Display',
        category: 'signal',
        icon: 'layers',
        Class: WaterfallDisplay,
        defaultSettings: { title: 'SIGNAL HISTORY', color: '#00faff', speed: 1, ...COMMON_DEFAULTS },
        propertyConfig: {
            ...COMMON_PROPS
        }
    },
    arcGauge: {
        name: 'Arc Gauge',
        category: 'gauges',
        icon: 'circle-dot',
        Class: ArcGauge,
        defaultSettings: { title: 'ARC GAUGE', color: '#00faff', value: 75, warningThreshold: 70, criticalThreshold: 90, units: '%', ...COMMON_DEFAULTS },
        propertyConfig: {
            ...COMMON_PROPS,
            value: { type: 'range', min: 0, max: 100 },
            warningThreshold: { type: 'range', min: 0, max: 100 },
            criticalThreshold: { type: 'range', min: 0, max: 100 },
            units: { type: 'text' }
        }
    },
    linearMeter: {
        name: 'Linear Meter',
        category: 'gauges',
        icon: 'align-left',
        Class: LinearMeter,
        defaultSettings: { title: 'SEGMENTED METER', color: '#00ff41', value: 45, warningThreshold: 70, criticalThreshold: 90, units: '%', ...COMMON_DEFAULTS },
        propertyConfig: {
            ...COMMON_PROPS,
            value: { type: 'range', min: 0, max: 100 },
            warningThreshold: { type: 'range', min: 0, max: 100 },
            criticalThreshold: { type: 'range', min: 0, max: 100 },
            units: { type: 'text' }
        }
    },
    numericReadout: {
        name: 'Numeric Readout',
        category: 'gauges',
        icon: 'hash',
        Class: NumericReadout,
        defaultSettings: { title: 'DATA READOUT', color: '#ffb000', value: 1240, jitter: 5, precision: 1, units: 'kW', ...COMMON_DEFAULTS },
        propertyConfig: {
            ...COMMON_PROPS,
            value: { type: 'number' },
            jitter: { type: 'number' },
            precision: { type: 'number', min: 0, max: 5 },
            units: { type: 'text' }
        }
    },
    statusMatrix: {
        name: 'Status Matrix',
        category: 'status',
        icon: 'grid',
        Class: StatusMatrix,
        defaultSettings: { title: 'NODE STATUS', color: '#00ff41', ...COMMON_DEFAULTS },
        propertyConfig: {
            ...COMMON_PROPS
        }
    },
    alarmBanner: {
        name: 'Alarm Banner',
        category: 'status',
        icon: 'alert-triangle',
        Class: AlarmBanner,
        defaultSettings: { title: 'ALARM SYSTEM', color: '#ff0000', message: 'CORE TEMPERATURE OVER LIMIT', ...COMMON_DEFAULTS },
        propertyConfig: {
            ...COMMON_PROPS,
            message: { type: 'text' }
        }
    },
    eventLog: {
        name: 'Event Log',
        category: 'status',
        icon: 'list',
        Class: EventLog,
        defaultSettings: { title: 'EVENT LOG', color: '#00ff41', ...COMMON_DEFAULTS },
        propertyConfig: {
            ...COMMON_PROPS
        }
    },
    ppiRadar: {
        name: 'PPI Radar',
        category: 'spatial',
        icon: 'radar',
        Class: PPIRadar,
        defaultSettings: { title: 'TACTICAL SWEEP', color: '#00ff41', speed: 1, ...COMMON_DEFAULTS },
        propertyConfig: {
            ...COMMON_PROPS
        }
    },
    targetReticle: {
        name: 'Target Reticle',
        category: 'spatial',
        icon: 'crosshair',
        Class: TargetReticle,
        defaultSettings: { title: 'WEAPON LOCK', color: '#ff0000', ...COMMON_DEFAULTS },
        propertyConfig: {
            ...COMMON_PROPS
        }
    },
    nodeTopology: {
        name: 'Node Topology',
        category: 'spatial',
        icon: 'share-2',
        Class: NodeTopology,
        defaultSettings: { title: 'NETWORK TOPOLOGY', color: '#00faff', ...COMMON_DEFAULTS },
        propertyConfig: {
            ...COMMON_PROPS
        }
    },
    mimicDiagram: {
        name: 'Mimic Diagram',
        category: 'spatial',
        icon: 'activity',
        Class: MimicDiagram,
        defaultSettings: { title: 'PROCESS FLOW', color: '#ffb000', ...COMMON_DEFAULTS },
        propertyConfig: {
            ...COMMON_PROPS
        }
    }
};
