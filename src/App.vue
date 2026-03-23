<template>
  <el-config-provider :locale="store.language === 'zh-CN' ? zhCn : en">
    <div
      class="app-wrapper"
      :class="{ 'dark': store.theme === 'dark' }"
    >
      <!-- Background Glow -->
      <div class="bg-glow" />
      
      <el-container class="main-layout">
        <!-- 1. Left Navigation Sidebar -->
        <el-aside
          width="80px"
          class="nav-sidebar glass"
        >
          <div class="logo">
            <el-icon :size="28">
              <CameraFilled />
            </el-icon>
          </div>
          <div class="nav-items">
            <div 
              class="nav-item" 
              :class="{ active: store.currentTab === 'canvas' }"
              @click="store.setProject({ currentTab: 'canvas' })"
            >
              <el-icon><CameraFilled /></el-icon>
            </div>
            <div 
              class="nav-item" 
              :class="{ active: store.currentTab === 'image' }"
              @click="store.setProject({ currentTab: 'image' })"
            >
              <el-icon><Picture /></el-icon>
            </div>
            <div 
              class="nav-item"
              :class="{ active: store.currentTab === 'presets' }"
              @click="store.setProject({ currentTab: 'presets' })"
            >
              <el-icon><Collection /></el-icon>
            </div>
            <div 
              class="nav-item"
              :class="{ active: store.currentTab === 'settings' }"
              @click="store.setProject({ currentTab: 'settings' })"
            >
              <el-icon><Setting /></el-icon>
            </div>
          </div>
          <div class="nav-footer">
            <div
              class="theme-toggle"
              @click="toggleTheme"
            >
              <el-icon v-if="store.theme === 'dark'">
                <Sunny />
              </el-icon>
              <el-icon v-else>
                <Moon />
              </el-icon>
            </div>
          </div>
        </el-aside>

        <!-- 2. Main Content Area -->
        <el-container class="content-area">
          <el-header
            height="64px"
            class="top-bar glass"
          >
            <div class="toolbar-left">
              <span class="project-name">{{ $t('app.title') }}</span>
              <el-tag
                size="small"
                type="info"
                effect="plain"
                class="status-tag"
              >
                Draft
              </el-tag>
              
              <div class="project-title-input" v-if="store.activeSlide">
                <el-input 
                  v-model="store.activeSlide.name" 
                  size="small"
                  placeholder="Slide name"
                  class="glass-input"
                >
                  <template #prefix>
                    <el-icon><EditPen /></el-icon>
                  </template>
                </el-input>
              </div>
            </div>
            <div class="toolbar-right">
              <el-button-group class="zoom-controls">
                <el-button
                  size="small"
                  @click="adjustZoom(-0.1)"
                >
                  <el-icon><Minus /></el-icon>
                </el-button>
                <el-button
                  size="small"
                  class="zoom-value"
                >
                  {{ Math.round(store.zoomLevel * 100) }}%
                </el-button>
                <el-button
                  size="small"
                  @click="adjustZoom(0.1)"
                >
                  <el-icon><Plus /></el-icon>
                </el-button>
              </el-button-group>
              <div class="language-switcher">
                <el-radio-group
                  v-model="store.language"
                  size="small"
                  class="custom-radio"
                >
                  <el-radio-button label="zh-CN">
                    ZH
                  </el-radio-button>
                  <el-radio-button label="en-US">
                    EN
                  </el-radio-button>
                </el-radio-group>
              </div>
              <el-button
                type="primary"
                class="export-btn"
                @click="handleExport"
              >
                <el-icon class="el-icon--left">
                  <Download />
                </el-icon>
                {{ $t('controls.export') }}
              </el-button>
            </div>
          </el-header>

          <el-main class="main-workspace">
            <SlideStrip />
            <div class="canvas-area">
              <div
                class="canvas-viewport"
                :style="{ transform: `scale(${store.zoomLevel})` }"
              >
                <ScreenshotCanvas />
              </div>
            </div>
            <div class="right-panel-wrapper">
              <ControlPanel />
            </div>
          </el-main>
        </el-container>
      </el-container>
    </div>
  </el-config-provider>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useScreenshotStore } from './store/screenshot';
import { useI18n } from 'vue-i18n';
import zhCn from 'element-plus/es/locale/lang/zh-cn';
import en from 'element-plus/es/locale/lang/en';
import { 
  CameraFilled, Picture, Collection, Setting, 
  Sunny, Moon, Plus, Minus, Download,
  EditPen
} from '@element-plus/icons-vue';
import ScreenshotCanvas from './components/ScreenshotCanvas.vue';
import ControlPanel from './components/ControlPanel.vue';
import SlideStrip from './components/SlideStrip.vue';

const store = useScreenshotStore();
store.migrateState();
useI18n();

onMounted(() => {
  // Any secondary mounting logic
});

const adjustZoom = (delta: number) => {
  const newZoom = Math.max(0.2, Math.min(2, store.zoomLevel + delta));
  store.setProject({ zoomLevel: newZoom });
};

const toggleTheme = () => {
  store.setProject({ theme: store.theme === 'dark' ? 'light' : 'dark' });
};

const handleExport = () => {
  window.dispatchEvent(new CustomEvent('export-canvas'));
};
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

:root {
  --app-bg: #f8fafc;
  --glass-bg: rgba(255, 255, 255, 0.7);
  --glass-border: rgba(0, 0, 0, 0.05);
  --accent-color: #6366f1;
  --text-main: #1e293b;
  --text-main-rgb: 30, 41, 59;
  --text-muted: #64748b;
  --workspace-bg: radial-gradient(circle at center, #f1f5f9 0%, #e2e8f0 100%);
}

.dark {
  --app-bg: #0f172a;
  --glass-bg: rgba(30, 41, 59, 0.7);
  --glass-border: rgba(255, 255, 255, 0.1);
  --text-main: #f8fafc;
  --text-main-rgb: 248, 250, 252;
  --text-muted: #94a3b8;
  --workspace-bg: radial-gradient(circle at center, #1e293b 0%, #0f172a 100%);
}

body {
  margin: 0;
  font-family: 'Inter', -apple-system, sans-serif;
  background-color: var(--app-bg);
  color: var(--text-main);
  overflow: hidden;
}

/* Custom Scrollbar Styles */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: rgba(var(--text-main-rgb), 0.1);
  border-radius: 10px;
  transition: background 0.2s;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(var(--text-main-rgb), 0.2);
}

.dark ::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
}

.dark ::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.2);
}

/* For el-scrollbar */
:deep(.el-scrollbar__bar) {
  opacity: 1 !important;
}

:deep(.el-scrollbar__thumb) {
  background-color: rgba(var(--text-main-rgb), 0.1) !important;
  width: 4px !important;
}

.dark :deep(.el-scrollbar__thumb) {
  background-color: rgba(255, 255, 255, 0.1) !important;
}

.app-wrapper {
  height: 100vh;
  position: relative;
  overflow: hidden;
}

.bg-glow {
  position: absolute;
  top: -20%;
  right: -10%;
  width: 60%;
  height: 60%;
  background: radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 70%);
  filter: blur(80px);
  z-index: 0;
  pointer-events: none;
}

.main-layout {
  height: 100%;
  position: relative;
  z-index: 1;
  padding: 12px;
  gap: 12px;
}

.glass {
  background: var(--glass-bg);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--glass-border);
  border-radius: 16px;
}

/* Nav Sidebar */
.nav-sidebar {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px 0;
}

.logo {
  color: var(--accent-color);
  margin-bottom: 40px;
}

.nav-items {
  display: flex;
  flex-direction: column;
  gap: 20px;
  flex: 1;
}

.nav-item {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  color: var(--text-muted);
}

.nav-item:hover {
  background: rgba(0, 0, 0, 0.05);
  color: var(--text-main);
}

.dark .nav-item:hover {
  background: rgba(255, 255, 255, 0.05);
}

.nav-item.active {
  background: var(--accent-color);
  color: #fff;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

.nav-footer {
  margin-top: auto;
}

.theme-toggle {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  cursor: pointer;
  background: rgba(var(--text-main-rgb), 0.08);
  color: var(--text-main);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid var(--glass-border);
}

.theme-toggle:hover {
  background: var(--accent-color);
  color: #fff;
  transform: rotate(45deg);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
}

/* Content Area */
.content-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.project-name {
  font-weight: 700;
  font-size: 18px;
  letter-spacing: -0.5px;
  background: linear-gradient(135deg, var(--text-main) 0%, var(--accent-color) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));
}

.status-tag {
  border-radius: 6px;
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.language-switcher {
  margin-right: 8px;
}

.main-workspace {
  flex: 1;
  display: flex;
  overflow: hidden;
  background: var(--workspace-bg);
  border-radius: 16px;
  position: relative;
}

.canvas-area {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  overflow: hidden;
  padding: 40px;
}

.canvas-area::before {
  content: "";
  position: absolute;
  inset: 0;
  background-image: radial-gradient(var(--text-main) 1px, transparent 1px);
  background-size: 32px 32px;
  opacity: 0.05;
  pointer-events: none;
}

.canvas-viewport {
  transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  transform-origin: center center;
  display: flex;
}

.right-panel-wrapper {
  width: 380px;
  background: var(--glass-bg);
  backdrop-filter: blur(20px);
  border-left: 1px solid var(--glass-border);
  display: flex;
  flex-direction: column;
}
</style>
