# Changelog

All notable changes to this project will be documented in this file.

## [0.4.1] - 2026-03-22

### Fixed
- **UI Visibility**: Significantly improved contrast for property panel labels and section titles in dark mode.
- **Label Clarity**: "Adaptive" switch and "Image Assets" labels are now high-contrast white/gray for better readability.

## [0.4.0] - 2026-03-22

## [0.3.0] - 2026-03-22

### Added
- **Multi-Level Typography**: Added support for subtitles with independent font size control.
- **iPad Pro Support**: Introduced 11-inch and 13-inch iPad Pro frames with realistic aspect ratios.
- **Functional Zoom**: Activated header buttons for real-time canvas preview scaling (0.2x to 2x).
- **Sidebar Navigation**: Implemented tab-based navigation for Canvas, Presets, and Settings.
- **Quick Presets**: Added a curated background color grid for instant styling.

### Changed
- **Sleeker Borders**: Reduced device border thickness from 44px to 28px for a more modern, minimal look.
- **Device Info**: Displays exact screen dimensions (e.g., 6.3", 11", 13") in the device selector.

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
