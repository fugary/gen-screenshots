<template>
  <div class="control-panel" v-if="store.activeSlide">
    <el-scrollbar>
      <div class="panel-inner">
        <el-tabs v-model="activeTab" class="custom-tabs">
          <!-- 1. Content & Text -->
          <el-tab-pane label="Text" name="text">
            <div class="settings-group">
              <div class="group-header">
                <el-icon><ChatDotRound /></el-icon>
                <span>Typography</span>
              </div>
              
              <div class="prop-item">
                <label>Title</label>
                <el-input 
                  v-model="activeSlideLocale.title" 
                  type="textarea" 
                  :rows="3"
                  class="glass-input"
                />
              </div>

              <div class="prop-item">
                <label>Subtitle</label>
                <el-input 
                  v-model="activeSlideLocale.subtitle" 
                  type="textarea" 
                  :rows="2"
                  class="glass-input"
                />
              </div>

              <div class="prop-grid">
                <div class="prop-item">
                  <label>Font Size</label>
                  <el-input-number v-model="store.activeSlide.fontSize" :min="40" :max="200" size="small" controls-position="right" />
                </div>
                <div class="prop-item">
                  <label>Text Color</label>
                  <el-color-picker v-model="store.activeSlide.textColor" size="small" />
                </div>
              </div>
            </div>

            <div class="settings-group">
              <div class="group-header">
                <el-icon><MagicStick /></el-icon>
                <span>Visuals</span>
              </div>
              <div class="prop-item">
                <label>Layout Flow</label>
                <el-radio-group v-model="store.activeSlide.layout" size="small">
                  <el-radio-button label="top">Title Top</el-radio-button>
                  <el-radio-button label="bottom">Title Bottom</el-radio-button>
                </el-radio-group>
              </div>
            </div>
          </el-tab-pane>

          <!-- 2. Device & Layers -->
          <el-tab-pane label="Device" name="device">
            <div class="settings-group">
              <div class="group-header">
                <el-icon><Monitor /></el-icon>
                <span>Layers</span>
                <el-button circle size="small" @click="store.addLayer()">
                  <el-icon><Plus /></el-icon>
                </el-button>
              </div>
              
              <div class="layer-strip">
                <div 
                  v-for="(layer, index) in store.activeSlide.layers" 
                  :key="layer.id"
                  class="layer-bar"
                  :class="{ active: activeLayerId === layer.id }"
                  @click="activeLayerId = layer.id"
                >
                  <div class="layer-num">{{ index + 1 }}</div>
                  <div class="layer-blob" :style="{ backgroundImage: layer.userImage ? `url(${layer.userImage})` : 'none' }"></div>
                  <el-button 
                    link 
                    type="danger" 
                    size="small" 
                    class="del-layer"
                    @click.stop="store.removeLayer(index)"
                    v-if="store.activeSlide.layers.length > 1"
                  >
                    <el-icon><Close /></el-icon>
                  </el-button>
                </div>
              </div>
            </div>

            <div v-if="activeLayer" class="selected-layer-settings">
              <div class="settings-group no-border">
                <div class="group-header">
                  <el-icon><Picture /></el-icon>
                  <span>Screenshot</span>
                </div>
                <el-upload
                  action="#"
                  :auto-upload="false"
                  :on-change="handleLayerUpload"
                  :show-file-list="false"
                  class="premium-uploader"
                >
                  <div v-if="activeLayer.userImage" class="layer-preview-big" :style="{ backgroundImage: `url(${activeLayer.userImage})` }">
                    <div class="upload-hover"><el-icon><Refresh /></el-icon></div>
                  </div>
                  <div v-else class="upload-placeholder-big">
                    <el-icon><UploadFilled /></el-icon>
                    <p>Drop screenshot here</p>
                  </div>
                </el-upload>
              </div>

              <div class="settings-group">
                <div class="group-header">
                  <el-icon><Connection /></el-icon>
                  <span>Transform</span>
                </div>
                <div class="transform-stack">
                  <div class="t-row">
                    <div class="t-label">Rotate Z <span>{{ activeLayer.rotateZ }}°</span></div>
                    <el-slider v-model="activeLayer.rotateZ" :min="-180" :max="180" size="small" />
                  </div>
                  <div class="t-row">
                    <div class="t-label">Tilt X <span>{{ activeLayer.rotateX }}°</span></div>
                    <el-slider v-model="activeLayer.rotateX" :min="-45" :max="45" size="small" />
                  </div>
                  <div class="t-row">
                    <div class="t-label">Tilt Y <span>{{ activeLayer.rotateY }}°</span></div>
                    <el-slider v-model="activeLayer.rotateY" :min="-45" :max="45" size="small" />
                  </div>
                  <div class="t-row">
                    <div class="t-label">Scale <span>{{ activeLayer.scale }}x</span></div>
                    <el-slider v-model="activeLayer.scale" :min="0.1" :max="2.0" :step="0.05" size="small" />
                  </div>
                  <div class="t-row">
                    <div class="t-label">X Offset <span>{{ activeLayer.x }}%</span></div>
                    <el-slider v-model="activeLayer.x" :min="0" :max="100" size="small" />
                  </div>
                  <div class="t-row">
                    <div class="t-label">Y Offset <span>{{ activeLayer.y }}%</span></div>
                    <el-slider v-model="activeLayer.y" :min="0" :max="100" size="small" />
                  </div>
                </div>
              </div>
            </div>

            <div class="settings-group">
              <div class="group-header">
                <el-icon><Monitor /></el-icon>
                <span>Device Frame Model</span>
              </div>
              <div class="prop-item">
                <el-select 
                  v-if="activeLayer"
                  v-model="activeLayer.frameStyle" 
                  size="small" 
                  class="glass-select"
                >
                  <el-option label="iPhone 16 Pro Max" value="iphone16-promax" />
                  <el-option label="iPhone 15 (6.7 inch)" value="iphone-6.7" />
                  <el-option label="iPhone 15 (6.5 inch)" value="iphone-6.5" />
                  <el-option label="iPhone 8 Plus (5.5 inch)" value="iphone-5.5" />
                  <el-option label="iPad Pro 13 inch" value="ipad-13" />
                  <el-option label="iPad Pro 11 inch" value="ipad-11" />
                </el-select>
              </div>
            </div>

            <div class="settings-group">
              <div class="group-header">
                <el-icon><Grid /></el-icon>
                <span>Layout Presets</span>
              </div>
              <div class="grid-presets">
                <div class="mini-preset" @click="store.applyLayoutPreset('tilted-duo')">
                  <div class="icon duo"></div>
                  <span>Duo</span>
                </div>
                <div class="mini-preset" @click="store.applyLayoutPreset('stacked-trio')">
                  <div class="icon trio"></div>
                  <span>Trio</span>
                </div>
                <div class="mini-preset" @click="store.applyLayoutPreset('center-hero')">
                  <div class="icon hero"></div>
                  <span>Hero</span>
                </div>
                <!-- Panorama -->
                <div class="mini-preset panorama" @click="store.applyLayoutPreset('panorama-start')">
                  <div class="icon pan-start"></div>
                  <span>Pan Start</span>
                </div>
                <div class="mini-preset panorama" @click="store.applyLayoutPreset('panorama-end')">
                  <div class="icon pan-end"></div>
                  <span>Pan End</span>
                </div>
              </div>
            </div>
          </el-tab-pane>

          <!-- 3. Style & Scene -->
          <el-tab-pane label="Style" name="style">
            <div class="settings-group">
              <div class="group-header">
                <el-icon><Brush /></el-icon>
                <span>Canvas Scene</span>
              </div>
              <div class="prop-item">
                <label>Export Ratio (Canvas Size)</label>
                <el-select v-model="store.activeSlide.frameStyle" size="small" class="glass-select">
                  <el-option label="iPhone 16 Pro Max (1320x2868)" value="iphone16-promax" />
                  <el-option label="iPhone 15 / 14 (1290x2796)" value="iphone-6.7" />
                  <el-option label="iPhone 13 / 12 (1242x2688)" value="iphone-6.5" />
                  <el-option label="iPhone 8 Plus (1242x2208)" value="iphone-5.5" />
                  <el-option label="iPad Pro 13 inch" value="ipad-13" />
                  <el-option label="iPad Pro 11 inch" value="ipad-11" />
                </el-select>
              </div>
              <div class="prop-item">
                <label>Gradient Colors</label>
                <div class="gradient-pickers">
                  <el-color-picker v-model="store.activeSlide.bgColor1" show-alpha />
                  <el-color-picker v-model="store.activeSlide.bgColor2" show-alpha />
                </div>
              </div>
              <div class="prop-item">
                <label>Grain / Noise</label>
                <el-slider v-model="store.activeSlide.noiseAmount" :min="0" :max="0.2" :step="0.01" size="small" />
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </el-scrollbar>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useScreenshotStore } from '../store/screenshot';
import { 
  ChatDotRound, MagicStick, Monitor, Plus, 
  Close, Picture, Refresh, UploadFilled,
  Connection, Grid, Brush
} from '@element-plus/icons-vue';
import { UploadFile } from 'element-plus';

const store = useScreenshotStore();
const activeTab = ref('text');
const activeLayerId = ref(store.activeSlide?.layers[0]?.id);

// Sync activeLayerId when slide changes
watch(() => store.activeSlideIndex, () => {
  activeLayerId.value = store.activeSlide?.layers[0]?.id;
}, { immediate: true });

// Also sync if slides array itself changes (Applying template)
watch(() => store.slides, () => {
  if (!store.activeSlide?.layers.some(l => l.id === activeLayerId.value)) {
    activeLayerId.value = store.activeSlide?.layers[0]?.id;
  }
}, { deep: true });

const activeSlideLocale = computed({
  get: () => store.activeSlide?.locales[store.activeSlide?.activeLocale] || { title: '', subtitle: '' },
  set: (val) => store.updateActiveSlideLocale(val)
});

const activeLayer = computed(() => {
  return store.activeSlide?.layers.find(l => l.id === activeLayerId.value) || store.activeSlide?.layers[0];
});

const handleLayerUpload = (file: UploadFile) => {
  const reader = new FileReader();
  reader.onload = (e) => {
    if (activeLayer.value) {
      store.updateLayer(activeLayer.value.id, { userImage: e.target?.result as string });
    }
  };
  reader.readAsDataURL(file.raw!);
};
</script>

<style scoped>
.control-panel {
  height: 100%;
  background: var(--glass-bg);
  border-radius: 16px;
  border: 1px solid var(--glass-border);
}

.panel-inner {
  padding: 0 20px 24px;
}

.custom-tabs :deep(.el-tabs__nav-wrap::after) {
  display: none;
}

.custom-tabs :deep(.el-tabs__header) {
  margin: 0;
  padding: 12px 0;
}

.settings-group {
  padding: 24px 0;
  border-bottom: 1px solid var(--glass-border);
}

.settings-group.no-border {
  border: none;
  padding-bottom: 12px;
}

.group-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
}

.group-header .el-icon {
  font-size: 16px;
  color: var(--accent-color);
}

.group-header span {
  font-size: 12px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: var(--text-main);
}

.prop-item {
  margin-bottom: 20px;
}

.prop-item label {
  display: block;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-muted);
  margin-bottom: 8px;
}

.prop-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.layer-strip {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  padding-bottom: 8px;
}

.layer-bar {
  flex: 0 0 54px;
  height: 70px;
  background: rgba(255,255,255,0.03);
  border: 1px solid var(--glass-border);
  border-radius: 10px;
  position: relative;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.layer-bar.active {
  background: rgba(var(--accent-color-rgb), 0.1);
  border-color: var(--accent-color);
  transform: translateY(-2px);
}

.layer-num {
  font-size: 10px;
  font-weight: 800;
  opacity: 0.5;
  margin-bottom: 4px;
}

.layer-blob {
  width: 24px;
  height: 38px;
  background-color: rgba(255,255,255,0.05);
  background-size: cover;
  background-position: center;
  border-radius: 3px;
  border: 1px solid var(--glass-border);
}

.del-layer {
  position: absolute;
  top: -6px;
  right: -6px;
  background: var(--glass-bg);
  box-shadow: 0 2px 8px rgba(0,0,0,0.3);
  opacity: 0;
}

.layer-bar:hover .del-layer {
  opacity: 1;
}

.premium-uploader {
  width: 100%;
}

.layer-preview-big {
  width: 100%;
  aspect-ratio: 9/16;
  max-height: 200px;
  border-radius: 12px;
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  background-color: rgba(0,0,0,0.2);
  position: relative;
  overflow: hidden;
  border: 1px solid var(--glass-border);
}

.upload-hover {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  opacity: 0;
  transition: opacity 0.2s;
  font-size: 24px;
}

.layer-preview-big:hover .upload-hover {
  opacity: 1;
}

.upload-placeholder-big {
  width: 100%;
  height: 120px;
  border: 1px dashed var(--glass-border);
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: var(--text-muted);
  background: rgba(255,255,255,0.02);
  cursor: pointer;
}

.upload-placeholder-big p {
  font-size: 11px;
  font-weight: 600;
}

.transform-stack {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.t-row {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.t-label {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  font-weight: 600;
  color: var(--text-muted);
}

.t-label span {
  color: var(--accent-color);
}

.grid-presets {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.mini-preset {
  background: rgba(255,255,255,0.02);
  border: 1px solid var(--glass-border);
  border-radius: 8px;
  padding: 12px 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.mini-preset:hover {
  background: rgba(255,255,255,0.08);
  border-color: var(--accent-color);
}

.mini-preset span {
  font-size: 10px;
  font-weight: 700;
  color: var(--text-muted);
}

.icon {
  width: 24px;
  height: 16px;
  background: var(--accent-color);
  opacity: 0.5;
  border-radius: 2px;
}

.icon.duo { clip-path: polygon(0 0, 40% 0, 40% 100%, 0 100%, 60% 0, 100% 0, 100% 100%, 60% 100%); }
.icon.trio { clip-path: polygon(0 0, 25% 0, 25% 100%, 0 100%, 40% 0, 60% 0, 60% 100%, 40% 100%, 75% 0, 100% 0, 100% 100%, 75% 100%); }
.icon.hero { width: 12px; }
.icon.pan-start { clip-path: polygon(70% 0, 100% 0, 100% 100%, 70% 100%); }
.icon.pan-end { clip-path: polygon(0 0, 30% 0, 30% 100%, 0 100%); }

.gradient-pickers {
  display: flex;
  gap: 12px;
}

.glass-input :deep(.el-textarea__inner) {
  background: rgba(255,255,255,0.03);
  border: 1px solid var(--glass-border);
  border-radius: 8px;
  color: var(--text-main);
}
</style>
