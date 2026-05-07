import React, { useState, useEffect } from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout/legacy';
import { Plus, Trash2, Download, Settings, Terminal, Activity, BarChart3, Radio } from 'lucide-react';
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
  PULSE: { type: 'PULSE', name: 'Pulse Monitor', icon: Activity, component: PulseLineChart },
  BARS: { type: 'BARS', name: 'Signal Equalizer', icon: BarChart3, component: BarChart },
  GAUGE: { type: 'GAUGE', name: 'Core Radar', icon: Radio, component: CircularGauge },
  TERMINAL: { type: 'TERMINAL', name: 'System Log', icon: Terminal, component: TerminalStatus },
};

const DEFAULT_LAYOUT = [
  { i: '1', x: 0, y: 0, w: 4, h: 4, type: 'PULSE', props: { title: 'VITAL SIGNS', speed: 1.5, color: '#00ff41' } },
  { i: '2', x: 4, y: 0, w: 4, h: 4, type: 'GAUGE', props: { title: 'CORE STABILITY', speed: 1, color: '#00faff' } },
  { i: '3', x: 8, y: 0, w: 4, h: 4, type: 'BARS', props: { title: 'SIGNAL FREQ', speed: 1, color: '#ffb000' } },
  { i: '4', x: 0, y: 4, w: 6, h: 4, type: 'TERMINAL', props: { title: 'SYSTEM LOG', speed: 1, color: '#00ff41' } },
];

function App() {
  const [layout, setLayout] = useState(DEFAULT_LAYOUT);
  const [selectedId, setSelectedId] = useState(null);
  const [isExportOpen, setIsExportOpen] = useState(false);

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
      props: {
        title: WIDGET_TYPES[type].name.toUpperCase(),
        speed: 1,
        color: type === 'PULSE' ? '#00ff41' : type === 'GAUGE' ? '#00faff' : '#ffb000'
      }
    };
    setLayout([...layout, newWidget]);
    setSelectedId(id);
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
    <div className="min-h-screen bg-terminal-bg text-terminal-green font-vt323 relative">
      {/* CRT Effects */}
      <div className="crt-overlay" />
      <div className="crt-scanline" />

      {/* Header */}
      <header className="relative z-10 border-b border-terminal-green/30 bg-terminal-bg/80 backdrop-blur-sm p-4 flex justify-between items-center glow-border">
        <div className="flex items-center gap-3">
          <Terminal className="w-8 h-8 animate-pulse" />
          <h1 className="text-2xl font-bold tracking-[0.2em] glow-text">AGENT_SMITH // DASHBOARD_GEN</h1>
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => setIsExportOpen(true)}
            className="flex items-center gap-2 px-4 py-2 border border-terminal-cyan text-terminal-cyan hover:bg-terminal-cyan/10 transition-all uppercase tracking-widest text-sm"
          >
            <Download className="w-4 h-4" /> Export Code
          </button>
        </div>
      </header>

      <main className="relative z-10 flex h-[calc(100vh-73px)] overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 border-r border-terminal-green/20 bg-terminal-panel p-4 flex flex-col gap-6">
          <div>
            <h2 className="text-xs uppercase opacity-50 mb-4 tracking-tighter">Available Modules</h2>
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

          {selectedWidget && (
            <div className="mt-auto border-t border-terminal-green/20 pt-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xs uppercase text-terminal-amber tracking-tighter flex items-center gap-2">
                  <Settings className="w-3 h-3" /> Module Inspector
                </h2>
                <button onClick={() => removeWidget(selectedId)} className="text-terminal-red hover:bg-terminal-red/10 p-1">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4 text-xs uppercase">
                <div>
                  <label className="block mb-1 opacity-70">Label</label>
                  <input
                    type="text"
                    value={selectedWidget.props.title}
                    onChange={(e) => updateWidgetProps(selectedId, { title: e.target.value })}
                    className="w-full bg-terminal-bg border border-terminal-green/30 p-2 focus:border-terminal-green outline-none"
                  />
                </div>
                <div>
                  <label className="block mb-1 opacity-70">Frequency / Speed</label>
                  <input
                    type="range" min="0.1" max="5" step="0.1"
                    value={selectedWidget.props.speed}
                    onChange={(e) => updateWidgetProps(selectedId, { speed: parseFloat(e.target.value) })}
                    className="w-full accent-terminal-green"
                  />
                </div>
                <div>
                  <label className="block mb-1 opacity-70">Color Matrix</label>
                  <div className="flex gap-2">
                    {['#00ff41', '#ffb000', '#00faff', '#ff0000'].map(c => (
                      <button
                        key={c}
                        onClick={() => updateWidgetProps(selectedId, { color: c })}
                        className={`w-6 h-6 border ${selectedWidget.props.color === c ? 'border-white scale-110' : 'border-transparent'}`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </aside>

        {/* Canvas */}
        <section className="flex-1 overflow-y-auto p-4 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]">
          <ResponsiveGridLayout
            className="layout"
            layouts={{ lg: layout.map(l => ({ ...l })) }}
            breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
            cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
            rowHeight={30}
            draggableHandle=".widget-handle"
            onLayoutChange={onLayoutChange}
          >
            {layout.map((widget) => {
              const WidgetComponent = WIDGET_TYPES[widget.type].component;
              return (
                <div
                  key={widget.i}
                  className={`group relative ${selectedId === widget.i ? 'ring-1 ring-terminal-green ring-offset-2 ring-offset-terminal-bg' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedId(widget.i);
                  }}
                >
                  <div className="widget-handle absolute top-0 left-0 right-0 h-6 z-20 cursor-move opacity-0 group-hover:opacity-100 transition-opacity bg-terminal-green/10 flex items-center justify-center">
                    <div className="w-8 h-1 border-y border-terminal-green/30" />
                  </div>
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
          onClose={() => setIsExportOpen(false)}
        />
      )}
    </div>
  );
}

export default App;
