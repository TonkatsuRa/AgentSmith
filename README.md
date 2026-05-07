# AgentSmith // Retro Telemetry Dashboard

A highly customizable, drag-and-drop web application for creating and exporting animated SVG telemetry graphs with a retro sci-fi terminal aesthetic.

## Features

- **Retro Aesthetic**: CRT scanlines, flicker effects, and neon glow.
- **Drag-and-Drop Layout**: Built with `react-grid-layout` for flexible dashboard design.
- **Animated SVG Widgets**:
  - Pulse Monitor (Waveforms)
  - Signal Equalizer (Bar Charts)
  - Core Radar (Circular Gauges)
  - System Log (Scrolling Terminals)
- **Export System**: Generate standalone HTML/CSS/JS snippets to use in other projects.

## Tech Stack

- React 19
- Vite
- Tailwind CSS
- Lucide React (Icons)
- React Grid Layout

## Getting Started

### Prerequisites
- Node.js (v22 recommended)
- npm

### Installation
1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## Deployment to GitHub Pages

This project is configured for easy deployment to GitHub Pages.

### Automatic Deployment (GitHub Actions)
The included GitHub Actions workflow (`.github/workflows/deploy.yml`) will automatically build and deploy the dashboard whenever you push to the `main` branch.

### Manual Deployment
1. Build the project:
   ```bash
   npm run build
   ```
2. The production-ready files will be in the `dist/` directory.
3. You can serve this directory using any static web server (e.g., `npx serve dist`).

## License
MIT
