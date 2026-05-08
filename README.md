# TELEMETRY FORGE
### Retro Sci-Fi Telemetry Widget Builder

TELEMETRY FORGE is a browser-based visual editor that allows you to modularly create, configure, preview, and export retro sci-fi telemetry display widgets for use in any HTML/CSS/JS project. Inspired by industrial SCADA/HMI dashboards and classic sci-fi terminals (Alien, Blade Runner, Fallout).

## Features

- **16+ Modular Widgets**: From Strip Charts and PPI Radars to Mimic Diagrams and Oscilloscopes.
- **Visual Editor**: Real-time property inspection (colors, thresholds, animation speeds, glitch effects).
- **Retro Aesthetic**: Integrated CRT effects including scanlines, flicker, noise, and phosphor glow.
- **Themes**: Multiple presets (Phosphor Green, Amber, Cyan, Combat Red).
- **Zero-Dependency Export**: Generates standalone HTML/CSS/JS code that works in any modern browser without external libraries.
- **Persistence**: Automatically saves your dashboard state to `localStorage`.

## Getting Started

### Running Locally

1. Clone the repository.
2. Install dependencies (optional, only needed for the development server):
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open the provided URL (usually `http://localhost:5173`).

Alternatively, since the builder uses ES Modules, it requires a local web server (like Vite or Live Server) to run correctly. The final **exported code**, however, can be opened directly as a standalone file in any modern browser.

## How to Use

### Using the Builder
1. **Add Widgets**: Select a widget from the Left Panel categories.
2. **Configure**: Click a widget in the Preview Canvas to select it. Use the Right Panel (Inspector) to modify its properties.
3. **Organize**: Use the arrow buttons on widgets to reorder them or adjust their `Gridspan` to change their width.
4. **Duplicate/Delete**: Use the toolbar buttons on each widget to quickly manage your layout.

### Exporting Widgets
1. Navigate to the **Bottom Panel (Code Export)**.
2. Choose your preferred tab:
   - **Combined**: A single-file HTML solution.
   - **HTML/CSS/JS**: Individual blocks for integration into existing projects.
3. Click **Copy Code** or **Download HTML**.
4. The exported code includes all necessary logic to animate and style the widgets exactly as seen in the builder.

## Architecture

### Adding a New Widget Type
To add a new widget, follow these steps in `src/widgets.js`:
1. Create a class that extends `BaseWidget`.
2. Implement the `renderCanvas(ctx, width, height)` method to draw your telemetry.
3. Define its unique properties in the `TelemetryForge.registry` within `src/app.js`.
4. The system will automatically handle its lifecycle, inspector controls, and export logic.

### Browser APIs Used
- **Canvas API**: For high-performance rendering of animated telemetry and waveforms.
- **RequestAnimationFrame**: For smooth, synchronized 60FPS animations.
- **LocalStorage API**: For persisting user-created dashboards.
- **ResizeObserver**: For responsive canvas scaling.
- **CSS Grid/Flexbox**: For the modular dashboard layout.

## License
MIT
