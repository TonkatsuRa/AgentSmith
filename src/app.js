import { WIDGET_REGISTRY } from './widgets.js';
import { generateExport } from './export.js';

class TelemetryForge {
    constructor() {
        this.state = {
            theme: 'phosphor-green',
            widgets: []
        };
        this.selectedId = null;
        this.canvas = document.getElementById('preview-canvas');
        this.library = document.getElementById('widget-library');
        this.inspector = document.getElementById('inspector-content');
        this.exportBlock = document.getElementById('export-code-block');
        this.activeWidgets = new Map(); // id -> widget instance

        this.init();
    }

    init() {
        this.loadState();
        this.renderLibrary();
        this.setupEventListeners();
        this.applyTheme(this.state.theme);
        this.renderDashboard();
        this.startRenderingLoop();
        this.updateExport();
    }

    loadState() {
        const saved = localStorage.getItem('telemetry_forge_state');
        if (saved) {
            try {
                this.state = JSON.parse(saved);
            } catch (e) {
                console.error('Failed to load state', e);
            }
        }

        if (this.state.widgets.length === 0) {
            this.loadDemoLayout();
        }
    }

    saveState() {
        localStorage.setItem('telemetry_forge_state', JSON.stringify(this.state));
        this.updateExport();
    }

    loadDemoLayout() {
        this.state.widgets = [
            {
                id: 'demo_1',
                type: 'ppiRadar',
                settings: { title: 'TACTICAL SWEEP', color: '#00ff41', speed: 1 }
            },
            {
                id: 'demo_2',
                type: 'oscilloscope',
                settings: { title: 'CORE VIBRATION', color: '#00faff', speed: 1.2 }
            },
            {
                id: 'demo_3',
                type: 'stripChart',
                settings: { title: 'ENERGY OUTPUT', color: '#ffb000', speed: 1.5 }
            },
            {
                id: 'demo_4',
                type: 'statusMatrix',
                settings: { title: 'NODE GRID', color: '#00ff41' }
            },
            {
                id: 'demo_5',
                type: 'arcGauge',
                settings: { title: 'STABILITY', color: '#00faff', value: 82 }
            },
            {
                id: 'demo_6',
                type: 'eventLog',
                settings: { title: 'SYSTEM LOG', color: '#ffb000' }
            }
        ];
    }

    applyTheme(theme) {
        document.body.className = `crt-enabled ${theme}`;
        this.state.theme = theme;
        document.getElementById('theme-selector').value = theme;
        this.saveState();
    }

    renderLibrary() {
        const categories = {};
        Object.entries(WIDGET_REGISTRY).forEach(([type, config]) => {
            if (!categories[config.category]) categories[config.category] = [];
            categories[config.category].push({ type, ...config });
        });

        this.library.innerHTML = Object.entries(categories).map(([cat, widgets]) => `
            <div class="library-category">
                <div class="category-title">${cat.toUpperCase()}</div>
                <div class="library-items">
                    ${widgets.map(w => `
                        <div class="library-item" data-type="${w.type}">
                            <i data-lucide="${w.icon || 'activity'}"></i>
                            <span>${w.name}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('');

        if (window.lucide) window.lucide.createIcons({ scope: this.library });

        this.library.querySelectorAll('.library-item').forEach(item => {
            item.onclick = () => this.addWidget(item.dataset.type);
        });
    }

    addWidget(type) {
        const config = WIDGET_REGISTRY[type];
        const id = 'widget_' + Date.now();
        const newWidget = {
            id,
            type,
            settings: { ...config.defaultSettings }
        };
        this.state.widgets.push(newWidget);
        this.renderWidget(newWidget);
        this.selectWidget(id);
        this.saveState();
    }

    moveWidget(id, direction) {
        const index = this.state.widgets.findIndex(w => w.id === id);
        if (index === -1) return;
        const newIndex = index + direction;
        if (newIndex >= 0 && newIndex < this.state.widgets.length) {
            const temp = this.state.widgets[index];
            this.state.widgets[index] = this.state.widgets[newIndex];
            this.state.widgets[newIndex] = temp;
            this.renderDashboard();
            this.saveState();
        }
    }

    duplicateWidget(id) {
        const widget = this.state.widgets.find(w => w.id === id);
        if (widget) {
            const newWidget = JSON.parse(JSON.stringify(widget));
            newWidget.id = 'widget_' + Date.now();
            newWidget.settings.title += ' (COPY)';
            this.state.widgets.push(newWidget);
            this.renderDashboard();
            this.selectWidget(newWidget.id);
            this.saveState();
        }
    }

    removeWidget(id) {
        const index = this.state.widgets.findIndex(w => w.id === id);
        if (index !== -1) {
            this.state.widgets.splice(index, 1);
            const instance = this.activeWidgets.get(id);
            if (instance && instance.destroy) instance.destroy();
            this.activeWidgets.delete(id);
            const el = document.getElementById(id);
            if (el) el.remove();
            if (this.selectedId === id) this.selectWidget(null);
            this.saveState();
        }
    }

    selectWidget(id) {
        this.selectedId = id;
        document.querySelectorAll('.widget-container').forEach(el => {
            el.classList.toggle('selected', el.id === id);
        });
        this.renderInspector();
    }

    renderDashboard() {
        // Correctly destroy existing widgets to prevent memory leaks
        this.activeWidgets.forEach(instance => {
            if (instance && instance.destroy) instance.destroy();
        });
        this.activeWidgets.clear();
        this.canvas.innerHTML = '';
        this.state.widgets.forEach(w => this.renderWidget(w));
    }

    renderWidget(widgetData) {
        const config = WIDGET_REGISTRY[widgetData.type];
        const container = document.createElement('div');
        container.id = widgetData.id;
        container.className = 'widget-container';
        if (this.selectedId === widgetData.id) container.classList.add('selected');

        // Apply grid span and height
        if (widgetData.settings.gridSpan) container.style.gridColumn = `span ${widgetData.settings.gridSpan}`;
        if (widgetData.settings.minHeight) container.style.minHeight = `${widgetData.settings.minHeight}px`;

        container.innerHTML = `
            <div class="widget-header">
                <div class="header-main">
                    <span class="live-indicator">LIVE</span>
                    <span class="widget-title">${widgetData.settings.title || config.name}</span>
                </div>
                <div class="widget-controls">
                    <button class="widget-control-btn move-up-btn" title="Move Up"><i data-lucide="chevron-up"></i></button>
                    <button class="widget-control-btn move-down-btn" title="Move Down"><i data-lucide="chevron-down"></i></button>
                    <button class="widget-control-btn duplicate-btn" title="Duplicate"><i data-lucide="copy"></i></button>
                    <button class="widget-control-btn delete-btn" title="Delete"><i data-lucide="trash-2"></i></button>
                </div>
            </div>
            <div class="widget-content"></div>
        `;

        container.onclick = (e) => {
            e.stopPropagation();
            this.selectWidget(widgetData.id);
        };

        container.querySelector('.delete-btn').onclick = (e) => {
            e.stopPropagation();
            this.removeWidget(widgetData.id);
        };

        container.querySelector('.duplicate-btn').onclick = (e) => {
            e.stopPropagation();
            this.duplicateWidget(widgetData.id);
        };

        container.querySelector('.move-up-btn').onclick = (e) => {
            e.stopPropagation();
            this.moveWidget(widgetData.id, -1);
        };

        container.querySelector('.move-down-btn').onclick = (e) => {
            e.stopPropagation();
            this.moveWidget(widgetData.id, 1);
        };

        this.canvas.appendChild(container);
        if (window.lucide) window.lucide.createIcons({ scope: container });

        const content = container.querySelector('.widget-content');
        const instance = new config.Class(content, widgetData.settings);
        this.activeWidgets.set(widgetData.id, instance);
    }

    renderInspector() {
        if (!this.selectedId) {
            this.inspector.innerHTML = '<div class="empty-state">SELECT A WIDGET TO EDIT PROPERTIES</div>';
            return;
        }

        const widgetData = this.state.widgets.find(w => w.id === this.selectedId);
        const config = WIDGET_REGISTRY[widgetData.type];

        const commonProps = {
            gridSpan: { type: 'range', min: 1, max: 4, step: 1 },
            minHeight: { type: 'number' }
        };

        const properties = { ...commonProps, ...config.propertyConfig };

        // Group properties
        const groups = {
            IDENTIFICATION: ['title'],
            LAYOUT: ['gridSpan', 'minHeight'],
            VISUALS: ['color', 'glowIntensity', 'visualDensity'],
            ANIMATION: ['speed', 'jitter'],
            DATA: ['value', 'warningThreshold', 'criticalThreshold', 'units', 'precision', 'message'],
            EFFECTS: ['scanlineEffect', 'glitchEffect', 'noiseEffect']
        };

        let html = '';
        Object.entries(groups).forEach(([groupName, props]) => {
            const groupProps = Object.entries(properties).filter(([p]) => props.includes(p));
            if (props.includes('title')) groupProps.unshift(['title', { type: 'text' }]);

            if (groupProps.length > 0) {
                html += `<div class="inspector-section">
                    <div class="section-title">${groupName}</div>
                    ${groupProps.map(([prop, cfg]) => `
                        <div class="inspector-group">
                            <label class="inspector-label">${prop.toUpperCase()}</label>
                            ${this.renderInspectorInput(prop, cfg, widgetData.settings[prop] || (prop === 'gridSpan' ? 1 : (prop === 'minHeight' ? 180 : '')))}
                        </div>
                    `).join('')}
                </div>`;
            }
        });

        this.inspector.innerHTML = html;

        this.inspector.querySelectorAll('.inspector-input').forEach(input => {
            input.oninput = (e) => {
                const prop = e.target.dataset.prop;
                let val = e.target.value;
                if (e.target.type === 'number' || e.target.type === 'range') val = parseFloat(val);
                this.updateWidgetProperty(this.selectedId, prop, val);
            };
        });
    }

    renderInspectorInput(prop, cfg, value) {
        if (cfg.type === 'number' || cfg.type === 'range') {
            return `<input type="${cfg.type}" class="inspector-input" data-prop="${prop}"
                value="${value}" min="${cfg.min || 0}" max="${cfg.max || 100}" step="${cfg.step || 1}">`;
        }
        if (cfg.type === 'color') {
            return `<input type="color" class="inspector-input" data-prop="${prop}" value="${value}">`;
        }
        if (cfg.type === 'select') {
            return `
                <select class="inspector-input" data-prop="${prop}">
                    ${cfg.options.map(opt => `<option value="${opt}" ${value === opt ? 'selected' : ''}>${opt.toUpperCase()}</option>`).join('')}
                </select>
            `;
        }
        return `<input type="text" class="inspector-input" data-prop="${prop}" value="${value || ''}">`;
    }

    updateWidgetProperty(id, prop, value) {
        const widgetData = this.state.widgets.find(w => w.id === id);
        if (widgetData) {
            widgetData.settings[prop] = value;
            const instance = this.activeWidgets.get(id);
            if (instance && instance.update) instance.update(widgetData.settings);

            const el = document.getElementById(id);
            if (el) {
                if (prop === 'title') {
                    el.querySelector('.widget-title').textContent = value;
                }
                if (prop === 'gridSpan') {
                    el.style.gridColumn = `span ${value}`;
                }
                if (prop === 'minHeight') {
                    el.style.minHeight = `${value}px`;
                }
            }
            this.saveState();
        }
    }

    setupEventListeners() {
        document.getElementById('theme-selector').onchange = (e) => this.applyTheme(e.target.value);
        document.getElementById('clear-canvas').onclick = () => {
            if (confirm('Clear all widgets?')) {
                this.state.widgets = [];
                this.renderDashboard();
                this.selectWidget(null);
                this.saveState();
            }
        };
        document.getElementById('reset-demo').onclick = () => {
            this.loadDemoLayout();
            this.renderDashboard();
            this.selectWidget(null);
            this.saveState();
        };

        const tabButtons = document.querySelectorAll('.tab-button');
        tabButtons.forEach(btn => {
            btn.onclick = () => {
                tabButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.updateExport(btn.dataset.tab);
            };
        });

        document.getElementById('copy-code').onclick = () => {
            const code = this.exportBlock.textContent;
            navigator.clipboard.writeText(code).then(() => {
                const btn = document.getElementById('copy-code');
                const originalText = btn.textContent;
                btn.textContent = 'COPIED!';
                setTimeout(() => btn.textContent = originalText, 2000);
            });
        };

        document.getElementById('download-html').onclick = () => {
            const code = generateExport(this.state, 'combined');
            const blob = new Blob([code], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'telemetry-forge-export.html';
            a.click();
        };
    }

    updateExport(mode = 'combined') {
        const activeTab = document.querySelector('.tab-button.active');
        const currentMode = mode || (activeTab ? activeTab.dataset.tab : 'combined');
        const code = generateExport(this.state, currentMode);
        this.exportBlock.textContent = code;
    }

    startRenderingLoop() {
        const loop = (time) => {
            this.activeWidgets.forEach(instance => {
                if (instance.render) instance.render(time);
            });
            requestAnimationFrame(loop);
        };
        requestAnimationFrame(loop);
    }
}

window.addEventListener('DOMContentLoaded', () => {
    new TelemetryForge();
});
