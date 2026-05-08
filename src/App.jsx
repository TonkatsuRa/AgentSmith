import React, { useState, useEffect } from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout/legacy';
import {
  Plus, Trash2, Download, Settings, Terminal, Activity, BarChart3, Radio,
  Monitor, Eye, EyeOff, LayoutGrid, Sliders, Palette, Zap
} from 'lucide-react';
import _ from 'lodash';

import PulseLineChart from './components/widgets/PulseLineChart';
import BarChart from './components/widgets/BarChart';
import CircularGauge from './components/widgets/CircularGauge';
import TerminalStatus from './components/widgets/TerminalStatus';
import ExportModal from './components/ExportModal';

import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

const ResponsiveGridLayout = WidthProvider(Responsive);

const WIDGET_TYPES = {
  PULSE: {
    type: 'PULSE',
    name: 'Pulse Monitor',
    icon: Activity,
    component: PulseLineChart,
    defaultProps: { title: 'VITAL SIGNS', speed: 1.5, color: '#00ff41', amplitude: 10, strokeWidth: 1.5, glitchFrequency: 0.05 }
  },
  BARS: {
    type: 'BARS',
    name: 'Signal Equalizer',
    icon: BarChart3,
    component: BarChart,
    defaultProps: { title: 'SIGNAL FREQ', speed: 1, color: '#ffb000', barCount: 12, segmentCount: 10, showPeaks: true }
  },
  GAUGE: {
    type: 'GAUGE',
    name: 'Core Radar',
    icon: Radio,
    component: CircularGauge,
    defaultProps: { title: 'CORE STABILITY', speed: 1, color: '#00faff', showRadarLine: true, ringCount: 3, showPercentage: true }
  },
  TERMINAL: {
    type: 'TERMINAL',
    name: 'System Log',
    icon: Terminal,
    component: TerminalStatus,
    defaultProps: { title: 'SYSTEM LOG', speed: 1, color: '#00ff41' }
  },
};

const DEFAULT_LAYOUT = [
  { i: '1', x: 0, y: 0, w: 4, h: 4, type: 'PULSE', props: WIDGET_TYPES.PULSE.defaultProps },
  { i: '2', x: 4, y: 0, w: 4, h: 4, type: 'GAUGE', props: WIDGET_TYPES.GAUGE.defaultProps },
  { i: '3', x: 8, y: 0, w: 4, h: 4, type: 'BARS', props: WIDGET_TYPES.BARS.defaultProps },
  { i: '4', x: 0, y: 4, w: 6, h: 4, type: 'TERMINAL', props: WIDGET_TYPES.TERMINAL.defaultProps },
];

function App() {
  const [layout, setLayout] = useState(DEFAULT_LAYOUT);
  const [selectedId, setSelectedId] = useState(null);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isPreview, setIsPreview] = useState(false);
  const [activeTab, setActiveTab] = useState('modules'); // 'modules', 'global', 'inspector'

  // Global Effects
  const [effects, setEffects] = useState({
    scanlines: true,
    flicker: true,
    vignette: true,
    glow: true
  });

  const onLayoutChange = (currentLayout) => {
    const updatedLayout = layout.map(item => {
      const layoutInfo = currentLayout.find(l => l.i === item.i);
      return layoutInfo ? { ...item, ..._.pick(layoutInfo, ['x', 'y', 'w', 'h']) } : item;
    });
    setLayout(updatedLayout);
  };

  const addWidget = (type) => {
    const id = Date.now().toString();
    const newWidget = {
      i: id,
      x: (layout.length * 4) % 12,
      y: Infinity,
      w: 4,
      h: 4,
      type: type,
      props: { ...WIDGET_TYPES[type].defaultProps }
    };
    setLayout([...layout, newWidget]);
    setSelectedId(id);
    setActiveTab('inspector');
  };

  const removeWidget = (id) => {
    setLayout(layout.filter(w => w.i !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const updateWidgetProps = (id, newProps) => {
    setLayout(layout.map(w => w.i === id ? { ...w, props: { ...w.props, ...newProps } } : w));
  };

  const selectedWidget = layout.find(w => w.i === selectedId);

  return (
    <div className={`min-h-screen bg-terminal-bg text-terminal-green font-vt323 relative ${effects.glow ? 'glow-text-global' : ''}`}>
      {/* CRT Effects */}
      {effects.vignette && <div className="vignette" />}
      {effects.scanlines && <div className="crt-overlay" />}
      {effects.flicker && <div className="crt-scanline" />}

      {/* Header */}
      {!isPreview && (
        <header className="relative z-[100] border-b border-terminal-green/30 bg-terminal-bg/80 backdrop-blur-sm p-4 flex justify-between items-center glow-border">
          <div className="flex items-center gap-3">
            <Monitor className="w-8 h-8 animate-pulse text-terminal-amber" />
            <h1 className="text-2xl font-bold tracking-[0.2em] glow-text">AGENT_SMITH // DASHBOARD_GEN_V2</h1>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => setIsPreview(!isPreview)}
              className="flex items-center gap-2 px-4 py-2 border border-terminal-green text-terminal-green hover:bg-terminal-green/10 transition-all uppercase tracking-widest text-sm"
            >
              <Eye className="w-4 h-4" /> Preview Mode
            </button>
            <button
              onClick={() => setIsExportOpen(true)}
              className="flex items-center gap-2 px-4 py-2 border border-terminal-cyan text-terminal-cyan hover:bg-terminal-cyan/10 transition-all uppercase tracking-widest text-sm"
            >
              <Download className="w-4 h-4" /> Export Code
            </button>
          </div>
        </header>
      )}

      {isPreview && (
        <button
          onClick={() => setIsPreview(false)}
          className="fixed top-4 right-4 z-[200] p-2 bg-terminal-panel border border-terminal-green text-terminal-green hover:bg-terminal-green/20"
        >
          <EyeOff className="w-6 h-6" />
        </button>
      )}

      <main className="relative z-10 flex h-[calc(100vh-73px)] overflow-hidden">
        {/* Sidebar */}
        {!isPreview && (
          <aside className="w-80 border-r border-terminal-green/20 bg-terminal-panel flex flex-col">
            {/* Sidebar Tabs */}
            <div className="flex border-b border-terminal-green/20">
              <button
                onClick={() => setActiveTab('modules')}
                className={`flex-1 p-3 text-xs uppercase tracking-widest flex items-center justify-center gap-2 ${activeTab === 'modules' ? 'bg-terminal-green/10 text-terminal-green border-b-2 border-terminal-green' : 'opacity-50'}`}
              >
                <LayoutGrid className="w-3 h-3" /> Modules
              </button>
              <button
                onClick={() => setActiveTab('global')}
                className={`flex-1 p-3 text-xs uppercase tracking-widest flex items-center justify-center gap-2 ${activeTab === 'global' ? 'bg-terminal-green/10 text-terminal-green border-b-2 border-terminal-green' : 'opacity-50'}`}
              >
                <Zap className="w-3 h-3" /> Global
              </button>
              <button
                onClick={() => setActiveTab('inspector')}
                className={`flex-1 p-3 text-xs uppercase tracking-widest flex items-center justify-center gap-2 ${activeTab === 'inspector' ? 'bg-terminal-green/10 text-terminal-green border-b-2 border-terminal-green' : 'opacity-50'}`}
                disabled={!selectedWidget}
              >
                <Sliders className="w-3 h-3" /> Inspector
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
              {activeTab === 'modules' && (
                <div className="space-y-6">
                  <h2 className="text-xs uppercase opacity-50 tracking-tighter">Available Modules</h2>
                  <div className="grid grid-cols-1 gap-3">
                    {Object.values(WIDGET_TYPES).map(widget => (
                      <button
                        key={widget.type}
                        onClick={() => addWidget(widget.type)}
                        className="flex items-center gap-3 p-3 border border-terminal-green/30 hover:border-terminal-green hover:bg-terminal-green/5 transition-all text-left group"
                      >
                        <widget.icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        <span className="text-sm uppercase">{widget.name}</span>
                        <Plus className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'global' && (
                <div className="space-y-6">
                  <h2 className="text-xs uppercase opacity-50 tracking-tighter">Post-Processing Effects</h2>
                  <div className="space-y-4">
                    {Object.entries(effects).map(([key, val]) => (
                      <div key={key} className="flex justify-between items-center p-3 border border-terminal-green/20 bg-black/20">
                        <span className="text-sm uppercase tracking-widest">{key}</span>
                        <button
                          onClick={() => setEffects(prev => ({ ...prev, [key]: !prev[key] }))}
                          className={`w-12 h-6 rounded-full relative transition-colors ${val ? 'bg-terminal-green/50' : 'bg-gray-800'}`}
                        >
                          <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${val ? 'left-7' : 'left-1'}`} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'inspector' && selectedWidget && (
                <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-300">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xs uppercase text-terminal-amber tracking-widest flex items-center gap-2 font-bold">
                      <Sliders className="w-4 h-4" /> Module: {selectedWidget.type}
                    </h2>
                    <button onClick={() => removeWidget(selectedId)} className="text-terminal-red hover:bg-terminal-red/10 p-1 border border-terminal-red/30">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-5 text-xs uppercase">
                    {/* General Settings */}
                    <div className="space-y-3">
                      <label className="block text-terminal-green/50 text-[10px]">Display Label</label>
                      <input
                        type="text"
                        value={selectedWidget.props.title}
                        onChange={(e) => updateWidgetProps(selectedId, { title: e.target.value })}
                        className="w-full bg-black border border-terminal-green/30 p-2 focus:border-terminal-green outline-none text-terminal-green"
                      />
                    </div>

                    <div className="space-y-3">
                      <label className="block text-terminal-green/50 text-[10px]">Theme Color</label>
                      <div className="flex gap-2">
                        {['#00ff41', '#ffb000', '#00faff', '#ff0000', '#ffffff'].map(c => (
                          <button
                            key={c}
                            onClick={() => updateWidgetProps(selectedId, { color: c })}
                            className={`w-8 h-8 border-2 ${selectedWidget.props.color === c ? 'border-white' : 'border-transparent'}`}
                            style={{ backgroundColor: c }}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <label className="text-terminal-green/50 text-[10px]">Processing Speed</label>
                        <span className="text-terminal-green">{selectedWidget.props.speed.toFixed(1)}x</span>
                      </div>
                      <input
                        type="range" min="0.1" max="5" step="0.1"
                        value={selectedWidget.props.speed}
                        onChange={(e) => updateWidgetProps(selectedId, { speed: parseFloat(e.target.value) })}
                        className="w-full accent-terminal-green"
                      />
                    </div>

                    {/* Widget Specific Settings */}
                    <div className="pt-4 border-t border-terminal-green/10 space-y-4">
                      {selectedWidget.type === 'PULSE' && (
                        <>
                          <div className="space-y-3">
                            <div className="flex justify-between">
                              <label className="text-terminal-green/50 text-[10px]">Amplitude</label>
                              <span>{selectedWidget.props.amplitude}</span>
                            </div>
                            <input
                              type="range" min="1" max="40" step="1"
                              value={selectedWidget.props.amplitude}
                              onChange={(e) => updateWidgetProps(selectedId, { amplitude: parseInt(e.target.value) })}
                              className="w-full accent-terminal-green"
                            />
                          </div>
                          <div className="space-y-3">
                            <div className="flex justify-between">
                              <label className="text-terminal-green/50 text-[10px]">Glitch Freq</label>
                              <span>{(selectedWidget.props.glitchFrequency * 100).toFixed(0)}%</span>
                            </div>
                            <input
                              type="range" min="0" max="0.5" step="0.01"
                              value={selectedWidget.props.glitchFrequency}
                              onChange={(e) => updateWidgetProps(selectedId, { glitchFrequency: parseFloat(e.target.value) })}
                              className="w-full accent-terminal-green"
                            />
                          </div>
                        </>
                      )}

                      {selectedWidget.type === 'BARS' && (
                        <>
                          <div className="space-y-3">
                            <div className="flex justify-between">
                              <label className="text-terminal-green/50 text-[10px]">Segments</label>
                              <span>{selectedWidget.props.segmentCount}</span>
                            </div>
                            <input
                              type="range" min="2" max="20" step="1"
                              value={selectedWidget.props.segmentCount}
                              onChange={(e) => updateWidgetProps(selectedId, { segmentCount: parseInt(e.target.value) })}
                              className="w-full accent-terminal-green"
                            />
                          </div>
                          <div className="flex justify-between items-center">
                            <label className="text-terminal-green/50 text-[10px]">Show Peaks</label>
                            <input
                              type="checkbox"
                              checked={selectedWidget.props.showPeaks}
                              onChange={(e) => updateWidgetProps(selectedId, { showPeaks: e.target.checked })}
                              className="w-4 h-4 accent-terminal-green"
                            />
                          </div>
                        </>
                      )}

                      {selectedWidget.type === 'GAUGE' && (
                        <>
                          <div className="space-y-3">
                            <div className="flex justify-between">
                              <label className="text-terminal-green/50 text-[10px]">Ring Density</label>
                              <span>{selectedWidget.props.ringCount}</span>
                            </div>
                            <input
                              type="range" min="1" max="10" step="1"
                              value={selectedWidget.props.ringCount}
                              onChange={(e) => updateWidgetProps(selectedId, { ringCount: parseInt(e.target.value) })}
                              className="w-full accent-terminal-green"
                            />
                          </div>
                          <div className="flex justify-between items-center">
                            <label className="text-terminal-green/50 text-[10px]">Radar Sweep</label>
                            <input
                              type="checkbox"
                              checked={selectedWidget.props.showRadarLine}
                              onChange={(e) => updateWidgetProps(selectedId, { showRadarLine: e.target.checked })}
                              className="w-4 h-4 accent-terminal-green"
                            />
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </aside>
        )}

        {/* Canvas */}
        <section className={`flex-1 overflow-y-auto p-4 transition-all duration-500 ${isPreview ? 'p-10 bg-black' : 'bg-[url("https://www.transparenttextures.com/patterns/carbon-fibre.png")]'}`}>
          <ResponsiveGridLayout
            className="layout"
            layouts={{ lg: layout.map(l => ({ ...l })) }}
            breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
            cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
            rowHeight={30}
            isDraggable={!isPreview}
            isResizable={!isPreview}
            draggableHandle=".widget-handle"
            onLayoutChange={onLayoutChange}
          >
            {layout.map((widget) => {
              const WidgetComponent = WIDGET_TYPES[widget.type].component;
              return (
                <div
                  key={widget.i}
                  className={`group relative ${selectedId === widget.i && !isPreview ? 'ring-2 ring-terminal-green ring-offset-4 ring-offset-terminal-bg z-50' : ''}`}
                  onClick={(e) => {
                    if (isPreview) return;
                    e.stopPropagation();
                    setSelectedId(widget.i);
                    setActiveTab('inspector');
                  }}
                >
                  {!isPreview && (
                    <div className="widget-handle absolute top-0 left-0 right-0 h-6 z-20 cursor-move opacity-0 group-hover:opacity-100 transition-opacity bg-terminal-green/20 flex items-center justify-center">
                      <div className="w-12 h-[2px] bg-terminal-green/50" />
                    </div>
                  )}
                  <WidgetComponent {...widget.props} />
                </div>
              );
            })}
          </ResponsiveGridLayout>
        </section>
      </main>

      {isExportOpen && (
        <ExportModal
          layout={layout}
          widgetTypes={WIDGET_TYPES}
          effects={effects}
          onClose={() => setIsExportOpen(false)}
        />
      )}

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0, 255, 65, 0.2); }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(0, 255, 65, 0.5); }
        .glow-text-global { text-shadow: 0 0 2px rgba(0, 255, 65, 0.3); }
      `}</style>
    </div>
  );
}

export default App;
