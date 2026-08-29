# Changelog

All notable changes to the Plynk desktop workspace will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2026-08-30

### Added
- **Kanban Workspace Architecture**: Multi-workspace project management with discrete boards, lists, and cards.
- **Fluid Drag and Drop**: Smooth card and column reordering with `@hello-pangea/dnd` and edge auto-scrolling.
- **Vector Whiteboard & Blackboard**: Infinite 2D vector canvas with pressure-sensitive pencil drawing, geometric shapes, sticky notes, and text labels.
- **Auto-Scaling Font Math**: Dynamic font size calculation on resize handles for text layers and sticky notes.
- **Live Toolbar Color Selector**: 10 preset palette swatches and custom HEX/RGB pipette color picker with real-time fill updates.
- **System Recycle Bin**: Complete soft delete and instant restore engine for workspaces, boards, whiteboards, lists, and cards.
- **Audit Activity Feed**: Chronological system audit logs tracking structural events, renames, status transitions, and user callsigns.
- **Local Backup & Restore**: Binary SQLite database snapshot export and restore to any local folder.
- **Middle-Click Pan Navigation**: Hold middle mouse button to pan across board layouts and infinite canvas viewports.
- **Dual Monochrome Themes**: Industrial Monochrome Dark (`#09090B`) and Monochrome Light (`#FFFFFF`) themes with theme-adaptive board labeling.
- **Keyboard Shortcuts**: `Ctrl+B` (Toggle Sidebar), `Ctrl+T` (Toggle Theme), `Ctrl+Z` / `Ctrl+Y` (Undo / Redo).
- **100% Offline & Embedded Storage**: Embedded SQLite engine (`plynk.db`) with zero cloud dependencies and zero telemetry.

---

[1.0.0]: https://github.com/TrisH0x2A/plynk/releases/tag/v1.0.0
