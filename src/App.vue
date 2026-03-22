<template>
  <el-config-provider :locale="store.language === 'zh-CN' ? zhCn : en">
    <div
      class="app-wrapper"
      :class="{ dark: store.theme === 'dark' }"
    >
      <el-container class="main-container">
        <!-- Sidebar -->
        <el-aside
          width="380px"
          class="sidebar"
        >
          <div class="sidebar-header">
            <el-icon :size="24">
              <Camera />
            </el-icon>
            <h2>{{ $t('app.title') }}</h2>
          </div>

          <ControlPanel />

          <div class="sidebar-footer">
            <el-button-group>
              <el-button
                :type="store.theme === 'dark' ? 'primary' : ''"
                @click="store.setProject({ theme: 'dark' })"
              >
                <el-icon><Moon /></el-icon>
              </el-button>
              <el-button
                :type="store.theme === 'light' ? 'primary' : ''"
                @click="store.setProject({ theme: 'light' })"
              >
                <el-icon><Sunny /></el-icon>
              </el-button>
            </el-button-group>

            <el-select
              v-model="store.language"
              size="small"
              style="width: 100px"
              @change="handleLangChange"
            >
              <el-option
                label="中文"
                value="zh-CN"
              />
              <el-option
                label="English"
                value="en-US"
              />
            </el-select>
          </div>
        </el-aside>

        <!-- Main Preview -->
        <el-main class="preview-area">
          <ScreenshotCanvas />
        </el-main>
      </el-container>
    </div>
  </el-config-provider>
</template>

<script setup lang="ts">
import { useScreenshotStore } from './store/screenshot';
import { useI18n } from 'vue-i18n';
import zhCn from 'element-plus/es/locale/lang/zh-cn';
import en from 'element-plus/es/locale/lang/en';
import ScreenshotCanvas from './components/ScreenshotCanvas.vue';
import ControlPanel from './components/ControlPanel.vue';

const store = useScreenshotStore();
const { locale } = useI18n();

const handleLangChange = (val: string) => {
  locale.value = val;
};
</script>

<style>
:root {
  --sidebar-bg: #ffffff;
  --preview-bg: #f5f5f7;
}

.dark {
  --sidebar-bg: #1c1c1e;
  --preview-bg: #000000;
  color: #f5f5f7;
}

body {
  margin: 0;
  overflow: hidden;
}

.app-wrapper {
  height: 100vh;
  display: flex;
}

.main-container {
  height: 100%;
}

.sidebar {
  background: var(--sidebar-bg);
  border-right: 1px solid rgba(128, 128, 128, 0.2);
  display: flex;
  flex-direction: column;
  padding: 20px;
}

.sidebar-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 30px;
}

.sidebar-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}

.preview-area {
  background: var(--preview-bg);
  padding: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.sidebar-footer {
  margin-top: auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 20px;
  border-top: 1px solid rgba(128, 128, 128, 0.2);
}
</style>
