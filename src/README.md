# TELEMETRY FORGE

## Overview
A visual editor for creating retro sci-fi telemetry dashboards.

## How to use
- Add widgets from the left library.
- Select a widget to edit its properties in the right inspector.
- Reorder widgets using the up/down buttons in the widget header.
- View and copy the generated code from the bottom export panel.

## Architecture
- `app.js`: Core logic and state management.
- `widgets.js`: Modular widget definitions.
- `export.js`: Code generation for standalone use.
- `styles.css`: Retro sci-fi styling and CRT effects.

## Adding a new widget
1. Define a class extending `BaseWidget` in `widgets.js`.
2. Implement the `render(time)` method.
3. Register the widget in `WIDGET_REGISTRY` with its category and properties.
