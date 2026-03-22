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
            <div class="nav-item active">
              <el-icon><Picture /></el-icon>
            </div>
            <div class="nav-item">
              <el-icon><Collection /></el-icon>
            </div>
            <div class="nav-item">
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
            </div>
            <div class="toolbar-right">
              <el-button-group class="zoom-controls">
                <el-button size="small">
                  <el-icon><Minus /></el-icon>
                </el-button>
                <el-button size="small">
                  100%
                </el-button>
                <el-button size="small">
                  <el-icon><Plus /></el-icon>
                </el-button>
              </el-button-group>
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

          <el-main class="preview-workspace">
            <ScreenshotCanvas />
          </el-main>
        </el-container>

        <!-- 3. Right Properties Panel -->
        <el-aside
          width="320px"
          class="properties-panel glass"
        >
          <ControlPanel />
        </el-aside>
      </el-container>
    </div>
  </el-config-provider>
</template>

<script setup lang="ts">
import { useScreenshotStore } from './store/screenshot';
import { useI18n } from 'vue-i18n';
import zhCn from 'element-plus/es/locale/lang/zh-cn';
import en from 'element-plus/es/locale/lang/en';
import { 
  CameraFilled, Picture, Collection, Setting, 
  Sunny, Moon, Plus, Minus, Download 
} from '@element-plus/icons-vue';
import ScreenshotCanvas from './components/ScreenshotCanvas.vue';
import ControlPanel from './components/ControlPanel.vue';

const store = useScreenshotStore();
useI18n();

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
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  cursor: pointer;
  background: rgba(255,255,255,0.05);
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
  font-weight: 600;
  font-size: 16px;
}

.status-tag {
  border-radius: 6px;
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.preview-workspace {
  padding: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background: var(--workspace-bg);
  border-radius: 16px;
  position: relative;
  overflow: hidden;
}

.preview-workspace::before {
  content: "";
  position: absolute;
  width: 100%;
  height: 100%;
  background-image: radial-gradient(var(--text-main) 1px, transparent 1px);
  background-size: 32px 32px;
  opacity: 0.05;
  pointer-events: none;
}

/* Properties Panel */
.properties-panel {
  padding: 24px;
}
</style>
