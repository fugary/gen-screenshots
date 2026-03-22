# Changelog

All notable changes to this project will be documented in this file.

## [0.2.0] - 2026-03-22

### Added
- **Premium Interface**: Redesigned the entire UI with a three-pane layout (Sidebar, Workspace, Properties).
- **Glassmorphism**: Integrated real-time blur and translucent panels for a modern desktop feel.
- **Radial Gradients**: Added support for radial background gradients on the canvas.
- **Noise Grain Texture**: Added a professional grain overlay for high-end aesthetics.
- **Floating Controls**: Improved sidebar and property panel interactions.

### Changed
- **Default Theme**: Switched to a deep indigo/slate dark-first theme.
- **Typography**: Integrated 'Inter' as the primary font for both UI and Canvas.

## [0.1.0] - 2026-03-22

### Added
- **Tauri Native Export**: Integrated `@tauri-apps/plugin-dialog` and `@tauri-apps/plugin-fs` for local file saving.
- **Testing Framework**: Integrated **Vitest** for frontend unit testing.
- **Modern Linting**: Migrated to **ESLint Flat Config** (v10) for better TypeScript and Vue 3 support.
- **Canvas Aesthetics**: Added premium effects including background grain, text shadows, and border gradients.
- **Device Frames**: Support for iPhone 16 Pro (Jet Black, Gold, Silver) with realistic proportions.
- **i18n**: Multilingual support for English (en-US) and Chinese (zh-CN).

### Fixed
- **i18n Key Mismatch**: Resolved issue where "Headline" label was not showing correctly.
- **State Persistence**: Ensured all project settings are saved between sessions.

### Changed
- **Node Environment**: Configured automatic `nvm` sourcing in `.zshrc`.
