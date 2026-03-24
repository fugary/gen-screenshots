<template>
  <el-config-provider :locale="store.language === 'zh-CN' ? zhCn : en">
    <div
      class="app-wrapper"
      :class="{ 'dark': store.theme === 'dark' }"
    >
      <div class="bg-glow" />
      
      <div class="main-layout">
        <!-- 1. Sidebar (Fixed 80px) -->
        <aside class="sidebar-nav glass">
          <div class="nav-top">
            <div class="logo">
              <el-icon><CameraFilled /></el-icon>
            </div>
            
            <div class="nav-items">
              <div class="nav-item active" title="Editor">
                <el-icon><Edit /></el-icon>
              </div>
              <div class="nav-item" title="Apply Template" @click="applyDefaultTemplate">
                <el-icon><Grid /></el-icon>
              </div>
            </div>
          </div>
          
          <div class="nav-footer">
            <div class="theme-toggle" @click="toggleTheme" :title="$t('controls.theme')">
              <el-icon v-if="store.theme === 'dark'"><Sunny /></el-icon>
              <el-icon v-else><Moon /></el-icon>
            </div>
          </div>
        </aside>

        <!-- 2. Main content area (Liquid) -->
        <main class="main-content">
          <header class="top-bar glass">
            <div class="toolbar-left">
              <el-tag size="small" effect="dark" class="status-tag">V4 Pro</el-tag>
              <div class="project-title">{{ $t('app.title') }}</div>
            </div>
            
            <div class="toolbar-right">
              <div class="language-switcher">
                <el-radio-group v-model="store.language" size="small">
                  <el-radio-button value="zh-CN">ZH</el-radio-button>
                  <el-radio-button value="en-US">EN</el-radio-button>
                </el-radio-group>
              </div>
              
              <el-button type="primary" size="small" @click="handleExport">
                <el-icon><Download /></el-icon>
                {{ $t('controls.export') }}
              </el-button>
            </div>
          </header>

          <!-- V4 Horizontal Workspace -->
          <section class="workspace-scroll-area">
            <div class="slides-container">
              <SlideEditor 
                v-for="(slide, index) in store.slides" 
                :key="slide.id"
                :slide="slide"
                :index="index"
              />
              
              <!-- Add Page Button -->
              <div class="add-slide-card" @click="store.addSlide">
                <div class="add-inner glass">
                  <el-icon><Plus /></el-icon>
                  <span>Add Page</span>
                </div>
              </div>
            </div>
          </section>
        </main>

        <!-- 3. Properties (Fixed 360px) -->
        <aside class="right-panel-wrapper">
          <ControlPanel />
        </aside>
      </div>
    </div>
  </el-config-provider>
</template>

<script setup lang="ts">
import { useScreenshotStore } from './store/screenshot';
import { useI18n } from 'vue-i18n';
import zhCn from 'element-plus/es/locale/lang/zh-cn';
import en from 'element-plus/es/locale/lang/en';
import { 
  CameraFilled, Edit, Grid, Sunny, Moon, Download, Plus
} from '@element-plus/icons-vue';
import SlideEditor from './components/SlideEditor.vue';
import ControlPanel from './components/ControlPanel.vue';

const store = useScreenshotStore();
store.migrateState();
useI18n();

const toggleTheme = () => {
  store.setProject({ theme: store.theme === 'dark' ? 'light' : 'dark' });
};

const handleExport = () => {
  window.dispatchEvent(new CustomEvent('export-canvas'));
};

const applyDefaultTemplate = () => {
  store.applyTemplateSet('midnight-pro');
};
</script>

<style>
:root {
  --bg-color: #f8fafc;
  --text-main: #1e293b;
  --text-muted: #64748b;
  --accent-color: #6366f1;
  --accent-color-rgb: 99, 102, 241;
  --glass-bg: rgba(255, 255, 255, 0.7);
  --glass-border: rgba(0, 0, 0, 0.08);
  --workspace-bg: #f1f5f9;
}

.dark {
  --bg-color: #0f172a;
  --text-main: #f1f5f9;
  --text-muted: #94a3b8;
  --accent-color: #818cf8;
  --accent-color-rgb: 129, 140, 248;
  --glass-bg: rgba(15, 23, 42, 0.7);
  --glass-border: rgba(255, 255, 255, 0.1);
  --workspace-bg: #020617;
}

body {
  margin: 0;
  font-family: 'Inter', -apple-system, system-ui, sans-serif;
  background-color: var(--bg-color);
  color: var(--text-main);
  overflow: hidden;
}

.app-wrapper {
  width: 100vw;
  height: 100vh;
  position: relative;
  overflow: hidden;
}

.bg-glow {
  position: absolute;
  top: -10%;
  left: -10%;
  width: 120%;
  height: 120%;
  background: radial-gradient(circle at 50% 50%, rgba(var(--accent-color-rgb), 0.05) 0%, transparent 70%);
  pointer-events: none;
}

.main-layout {
  display: flex;
  width: 100%;
  height: 100%;
  position: relative;
  z-index: 1;
}

/* 1. Sidebar */
.sidebar-nav {
  width: 80px;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px 0;
  border-right: 1px solid var(--glass-border);
  background: var(--glass-bg);
  backdrop-filter: blur(20px);
}

.logo {
  font-size: 28px;
  color: var(--accent-color);
  margin-bottom: 40px;
}

.nav-items {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.nav-item {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  cursor: pointer;
  color: var(--text-muted);
  transition: all 0.3s;
}

.nav-item:hover {
  background: rgba(var(--accent-color-rgb), 0.1);
  color: var(--accent-color);
}

.nav-item.active {
  background: var(--accent-color);
  color: white;
  box-shadow: 0 8px 20px rgba(var(--accent-color-rgb), 0.3);
}

.nav-footer {
  margin-top: auto;
}

/* 2. Main Content */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 16px;
  gap: 16px;
}

.top-bar {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  border-radius: 16px;
  background: var(--glass-bg);
  backdrop-filter: blur(20px);
  border: 1px solid var(--glass-border);
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.project-title {
  font-weight: 800;
  font-size: 18px;
  letter-spacing: -0.5px;
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 24px;
}

/* V4 Workspace Scroll */
.workspace-scroll-area {
  flex: 1;
  width: 100%;
  overflow-x: auto;
  overflow-y: hidden;
  display: flex;
  align-items: stretch;
  padding: 20px 0;
  cursor: grab;
}

.workspace-scroll-area:active {
  cursor: grabbing;
}

.slides-container {
  display: flex;
  gap: 32px;
  padding: 0 40px;
  min-width: 100%;
}

.add-slide-card {
  flex: 0 0 320px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.add-inner {
  width: 100%;
  height: 200px;
  border: 2px dashed var(--glass-border);
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: var(--text-muted);
  cursor: pointer;
  transition: all 0.3s;
}

.add-inner:hover {
  border-color: var(--accent-color);
  color: var(--accent-color);
  background: rgba(var(--accent-color-rgb), 0.05);
}

/* 3. Properties */
.right-panel-wrapper {
  width: 360px;
  height: 100%;
  border-left: 1px solid var(--glass-border);
  background: var(--glass-bg);
  backdrop-filter: blur(20px);
  z-index: 10;
}

.glass {
  background: var(--glass-bg);
  backdrop-filter: blur(20px);
  border: 1px solid var(--glass-border);
}

/* Custom Scrollbar */
::-webkit-scrollbar {
  height: 8px;
  width: 8px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: var(--glass-border);
  border-radius: 10px;
}
::-webkit-scrollbar-thumb:hover {
  background: var(--text-muted);
}
</style>
