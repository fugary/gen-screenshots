# PROJECT AGENTS SPECIFICATION (AGENTS.md)

## 1. Project Overview
- **Name**: gen-screenshots
- **Platform**: Desktop (macOS, Windows, Linux) via **Tauri**.
- **Objective**: Create professional App Store screenshots with device frames, text overlays, and beauty-driven presets.

## 2. Technical Stack
- **Framework**: Vue 3 (Composition API) + Vite.
- **Backend**: Tauri (Rust).
- **UI Architecture**: Element Plus + Tailwind CSS (Optional/Custom).
- **State Management**: Pinia + `pinia-plugin-persistedstate`.
- **I18n**: `vue-i18n`.
- **Theme**: Dark/Light mode support via Element Plus.

## 3. Specification-Driven Development (SDD)
- **Principle**: All major logic and state changes must be derived from this specification.
- **Agent Rules**:
  - Always check `AGENTS.md` before making architectural changes.
  - Follow the Component-Store-View (C-S-V) pattern.
  - Documentation and code must be kept in sync.

## 4. Directory Structure Conventions
- `@/components/`: Atomic components (Canvas, Form items).
- `@/store/`: Logic for state and persistence.
- `@/i18n/`: Translation keys for locales (`zh-CN`, `en-US`).
- `@/assets/`: Premium device assets and presets.

## 5. State Management Rules (Pinia)
Store should handle:
- `currentProject`: UI config (colors, text, layout).
- `appSettings`: Theme, Language, Export settings.
- Persistence: `appSettings` must be persisted.

## 6. Internationalization Workflow
- Use `$t('key.path')` in templates.
- Maintain `en-US.json` and `zh-CN.json` synchronously.

## 7. UI/UX Standards
- **Aesthetics**: Premium, Glassmorphism, Vibrant Gradients.
- **Responsive**: Sidebar width is fixed (380px), Canvas area is liquid.
- **Icons**: Use `@element-plus/icons-vue`.

## 8. Development Commands
- `npm run dev`: Start web dev server.
- `npm run tauri dev`: Start desktop dev environment.
- `npm run build`: Build production web app.
- `npm run tauri build`: Build platform-specific binaries.
