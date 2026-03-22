# Screenshot Pro (gen-screenshots)

Professional App Store Screenshot Generator built with **Tauri 2.0 + Vue 3 + Element Plus**.

![Screenshot Preview](https://github.com/fugary/gen-screenshots/raw/main/public/preview-placeholder.png)

## 🚀 Key Features

- **💎 Premium Aesthetics**: Focus on high-end visuals with gradients, subtle grain, and depth-rich shadows.
- **💾 Native Export**: Save directly to your local file system using Tauri's native dialogs.
- **📐 Realistic Frames**: Pixel-perfect iPhone 16 Pro templates with dynamic island details.
- **🌍 Multilingual**: Support for English and Chinese (i18n).
- **🌗 Theme Support**: Dark/Light modes integrated with macOS/Windows system settings.
- **⚡ Fast Development**: Powered by Vite 6 with HMR and Vitest for reliable testing.

## 🛠️ Requirements

- **Node.js**: v20+ (managed via nvm).
- **Rust**: Required for Tauri desktop builds.
- **Packages**: `npm install`.

## 📦 Setup & Development

1. **Install Dependencies**:
   ```bash
   npm install
   ```
2. **Start Web Dev (HMR)**:
   ```bash
   npm run dev
   ```
3. **Start Desktop Dev (Tauri)**:
   ```bash
   npm run tauri dev
   ```
4. **Run Tests**:
   ```bash
   npm run test
   ```
5. **Lint & Format**:
   ```bash
   npm run lint
   ```

## 🏗️ Project Structure

- `src-tauri/`: Native Rust source and Tauri configuration.
- `src/components/`: Core UI components (Canvas, Controls).
- `src/store/`: Pinia state management with persistence.
- `src/i18n/`: Localization messages.
- `src/assets/`: Device assets and premium presets.

## 🤝 Contribution

1. Always follow the guidelines in `AGENTS.md`.
2. Ensure all changes are recorded in `CHANGELOG.md`.
3. Verify that `npm run lint` and `npm run test` pass before committing.

---
Built with ❤️ by [fugary](https://github.com/fugary)
