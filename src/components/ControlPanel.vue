<template>
  <el-scrollbar class="control-panel">
    <!-- Main Properties (Formerly Canvas Tab) -->
    <div class="panel-content">
      <!-- Typography Section -->
      <div class="panel-section">
        <h3 class="section-title">
          {{ $t('controls.headline') }}
        </h3>
        <div class="locale-switcher-row" v-if="store.activeSlide && store.activeSlide.locales">
          <span class="sub-label">{{ $t('controls.contentLanguage') }}</span>
          <el-radio-group v-model="store.activeSlide.activeLocale" size="small">
            <el-radio-button 
              v-for="locale in (store.projectLocales || ['en-US'])" 
              :key="locale" 
              :value="locale"
            >
              {{ locale }}
            </el-radio-button>
          </el-radio-group>
        </div>
        <div class="text-inputs" v-if="store.activeSlide.locales[store.activeSlide.activeLocale]">
          <el-input
            v-model="store.activeSlide.locales[store.activeSlide.activeLocale].title"
            type="textarea"
            :rows="2"
            placeholder="Title..."
          />
          <el-input
            v-model="store.activeSlide.locales[store.activeSlide.activeLocale].subtitle"
            type="textarea"
            :rows="2"
            placeholder="Subtitle..."
          />
        </div>
        <div class="font-sliders">
          <div class="slider-item">
            <span>Title Size: {{ store.activeSlide.fontSize }}px</span>
            <el-slider
              v-model="store.activeSlide.fontSize"
              :min="80"
              :max="240"
              :show-tooltip="false"
            />
          </div>
          <div class="slider-item">
            <span>Sub Size: {{ store.activeSlide.subtitleFontSize }}px</span>
            <el-slider
              v-model="store.activeSlide.subtitleFontSize"
              :min="30"
              :max="120"
              :show-tooltip="false"
            />
          </div>
        </div>
      </div>

      <!-- Background Section -->
      <div class="panel-section">
        <div class="section-header">
          <h3 class="section-title">
            {{ $t('controls.background') }}
          </h3>
          <el-switch
            v-model="store.activeSlide.adaptiveText"
            size="small"
            active-text="Adaptive"
          />
        </div>
        <div class="bg-settings">
          <div class="presets-grid">
            <div
              v-for="p in presets"
              :key="p.c1" 
              class="preset-item" 
              :style="{ background: `linear-gradient(135deg, ${p.c1}, ${p.c2})` }"
              @click="applyPreset(p.c1, p.c2)"
            />
          </div>
          
          <div class="image-presets">
            <span class="sub-label">Image Assets</span>
            <div class="img-grid">
              <div
                v-for="img in bgImages"
                :key="img.name" 
                class="img-item" 
                :style="{ backgroundImage: `url(${img.url})` }"
                @click="store.updateActiveSlide({ bgImage: img.url })"
              />
              <el-upload
                action="#"
                :auto-upload="false"
                :on-change="handleBgUpload"
                :show-file-list="false"
                class="bg-uploader"
              >
                <el-icon><Plus /></el-icon>
              </el-upload>
            </div>
            <el-link
              v-if="store.activeSlide.bgImage"
              type="danger"
              :underline="false"
              @click="store.updateActiveSlide({ bgImage: null })"
            >
              Clear Image
            </el-link>
          </div>

          <el-radio-group
            v-model="store.activeSlide.bgType"
            size="small"
            class="custom-radio"
          >
            <el-radio-button value="linear">
              Linear
            </el-radio-button>
            <el-radio-button value="radial">
              Radial
            </el-radio-button>
          </el-radio-group>
          <div class="color-pickers">
            <el-color-picker
              v-model="store.activeSlide.bgColor1"
              show-alpha
            />
            <el-color-picker
              v-model="store.activeSlide.bgColor2"
              show-alpha
            />
          </div>
        </div>
      </div>

      <!-- Layout Section -->
      <div class="panel-section">
        <h3 class="section-title">
          {{ $t('controls.layout') }}
        </h3>
        <el-radio-group
          v-model="store.activeSlide.layout"
          size="small"
          class="custom-radio"
        >
          <el-radio-button value="top">
            Top
          </el-radio-button>
          <el-radio-button value="bottom">
            Bottom
          </el-radio-button>
        </el-radio-group>
      </div>

      <!-- Export Targets Section -->
      <div class="panel-section">
        <h3 class="section-title">
          {{ $t('controls.exportTargets') }}
        </h3>
        <el-checkbox-group v-model="store.targetDevices" class="device-checkbox-group" v-if="store.targetDevices">
          <el-checkbox label="iPhone 16 Pro Max" value="iphone16-promax" />
          <el-checkbox label="iPhone 6.7'" value="iphone-6.7" />
          <el-checkbox label="iPhone 6.5'" value="iphone-6.5" />
          <el-checkbox label="iPhone 5.5'" value="iphone-5.5" />
          <el-checkbox label="iPad Pro 13'" value="ipad-13" />
          <el-checkbox label="iPad Pro 11'" value="ipad-11" />
        </el-checkbox-group>
        <div class="preview-device-sel" v-if="store.activeSlide">
          <span class="sub-label">{{ $t('controls.previewDevice') }}</span>
          <el-select
            v-model="store.activeSlide.frameStyle"
            size="small"
            class="custom-select"
          >
            <el-option label="iPhone 16 Pro Max" value="iphone16-promax" />
            <el-option label="iPhone 6.7'" value="iphone-6.7" />
            <el-option label="iPhone 6.5'" value="iphone-6.5" />
            <el-option label="iPhone 5.5'" value="iphone-5.5" />
            <el-option label="iPad Pro 13'" value="ipad-13" />
            <el-option label="iPad Pro 11'" value="ipad-11" />
            <el-option label="None" value="none" />
          </el-select>
        </div>
      </div>

      <!-- Languages Manager Section -->
      <div class="panel-section">
        <h3 class="section-title">{{ $t('controls.projectLanguages') }}</h3>
        <div class="language-tags">
          <el-tag
            v-for="locale in (store.projectLocales || [])"
            :key="locale"
            closable
            :disable-transitions="false"
            @close="store.removeLocale(locale)"
            size="small"
            class="lang-tag"
          >
            {{ locale }}
          </el-tag>
          <el-dropdown trigger="click" @command="store.addLocale">
            <el-button size="small" circle icon="Plus"></el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="zh-CN">Chinese (zh-CN)</el-dropdown-item>
                <el-dropdown-item command="en-US">English (en-US)</el-dropdown-item>
                <el-dropdown-item command="ja-JP">Japanese (ja-JP)</el-dropdown-item>
                <el-dropdown-item command="ko-KR">Korean (ko-KR)</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>

      <!-- Layer Manager Section -->
      <div class="panel-section" v-if="store.activeSlide && store.activeSlide.layers">
        <div class="section-header">
          <h3 class="section-title">Layers</h3>
          <el-button size="small" circle icon="Plus" @click="store.addLayer()" />
        </div>
        <div class="layer-list">
          <div 
            v-for="(layer, idx) in store.activeSlide.layers" 
            :key="layer.id"
            class="layer-item-row"
            :class="{ active: selectedLayerIndex === idx }"
            @click="selectedLayerIndex = idx"
          >
            <el-icon class="layer-drag"><Menu /></el-icon>
            <span class="layer-name">Layer {{ idx + 1 }}</span>
            <el-button 
              v-if="store.activeSlide.layers.length > 1"
              circle size="small" type="danger" plain 
              icon="Delete" 
              @click.stop="store.removeLayer(idx)"
            />
          </div>
        </div>
      </div>

      <!-- Transformation Controls (for selected layer) -->
      <div class="panel-section" v-if="selectedLayer">
        <h3 class="section-title">Transformation</h3>
        <div class="slider-grid">
          <div class="slider-item">
            <span class="sub-label">Rotate: {{ selectedLayer.rotateZ }}°</span>
            <el-slider v-model="selectedLayer.rotateZ" :min="-180" :max="180" :show-tooltip="false" />
          </div>
          <div class="slider-item">
            <span class="sub-label">Scale: {{ selectedLayer.scale.toFixed(2) }}x</span>
            <el-slider v-model="selectedLayer.scale" :min="0.2" :max="2.0" :step="0.05" :show-tooltip="false" />
          </div>
          <div class="slider-item">
            <span class="sub-label">Position X: {{ selectedLayer.x }}%</span>
            <el-slider v-model="selectedLayer.x" :min="0" :max="100" :show-tooltip="false" />
          </div>
          <div class="slider-item">
            <span class="sub-label">Position Y: {{ selectedLayer.y }}%</span>
            <el-slider v-model="selectedLayer.y" :min="0" :max="100" :show-tooltip="false" />
          </div>
        </div>
      </div>

      <!-- Premium Layouts Gallery -->
      <div class="panel-section">
        <h3 class="section-title">Premium Layouts</h3>
        <div class="layout-presets-grid">
          <div class="layout-preset-btn" @click="store.applyLayoutPreset('tilted-duo')">
            <div class="layout-icon duo"></div>
            <span>Tilted Duo</span>
          </div>
          <div class="layout-preset-btn" @click="store.applyLayoutPreset('stacked-trio')">
            <div class="layout-icon trio"></div>
            <span>Stacked Trio</span>
          </div>
          <div class="layout-preset-btn" @click="store.applyLayoutPreset('offset-right')">
            <div class="layout-icon offset"></div>
            <span>Offset Focus</span>
          </div>
        </div>
      </div>

      <!-- Screenshot Image Section (Points to selected layer) -->
      <div class="panel-section" v-if="selectedLayer">
        <h3 class="section-title">Layer Image</h3>
        <el-upload
          action="#"
          :auto-upload="false"
          :on-change="handleUserImageUpload"
          :show-file-list="false"
          class="user-image-uploader"
        >
          <div v-if="selectedLayer.userImage" class="image-preview-container">
            <img :src="selectedLayer.userImage" class="user-image-preview" />
            <div class="image-overlay">
              <el-icon><Edit /></el-icon>
            </div>
          </div>
          <div v-else class="upload-placeholder">
            <el-icon class="upload-icon"><Plus /></el-icon>
            <span class="upload-text">Upload Screenshot</span>
          </div>
        </el-upload>
      </div>

      <!-- Effects Section -->
      <div class="panel-section">
        <h3 class="section-title">
          {{ $t('controls.effects') }}
        </h3>
        <div class="section-header">
          <span class="value-badge">{{ Math.round(store.activeSlide.noiseAmount * 100) }}%</span>
        </div>
        <el-slider
          v-model="store.activeSlide.noiseAmount"
          :min="0"
          :max="0.2"
          :step="0.01"
          :show-tooltip="false"
          class="custom-slider"
        />
      </div>

      <!-- Save Project (Persistence) -->
       <div class="panel-section project-manager">
        <h3 class="section-title">Save Design as Project</h3>
        <div class="project-save">
          <el-input
            v-model="newProjectName"
            placeholder="Project name..."
            size="small"
          >
            <template #append>
              <el-button @click="handleSaveProject">
                Save
              </el-button>
            </template>
          </el-input>
        </div>
        <div class="project-list" v-if="store.savedProjects.length">
          <div
            v-for="p in store.savedProjects"
            :key="p.id"
            class="project-item-row"
          >
            <span class="p-name">{{ p.name }}</span>
            <div class="p-actions">
              <el-button circle size="small" type="primary" @click="store.loadProject(p.id)">
                <el-icon><Refresh /></el-icon>
              </el-button>
              <el-button circle size="small" type="danger" @click="store.deleteProject(p.id)">
                <el-icon><Delete /></el-icon>
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </el-scrollbar>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useScreenshotStore } from '../store/screenshot';
import { UploadFile, ElMessage } from 'element-plus';
import { 
  UploadFilled, Refresh, Delete, Plus, 
  CopyDocument, Edit, Download, Menu
} from '@element-plus/icons-vue';

const store = useScreenshotStore();
const newProjectName = ref('');
const selectedLayerIndex = ref(0);

const selectedLayer = computed(() => {
  if (!store.activeSlide || !store.activeSlide.layers) return null;
  return store.activeSlide.layers[selectedLayerIndex.value] || store.activeSlide.layers[0] || null;
});

const bgImages = [
  { name: 'Aurora', url: '/presets/bg4.png' },
  { name: 'Sand', url: '/presets/bg5.png' },
  { name: 'Glass', url: '/presets/bg6.png' },
  { name: 'Midnight', url: '/presets/bg1.png' },
  { name: 'Soft Rose', url: '/presets/bg2.png' },
  { name: 'Ice Tech', url: '/presets/bg3.png' },
];

const presets = [
  { c1: '#6366f1', c2: '#a855f7' }, // Indigo
  { c1: '#0ea5e9', c2: '#22d3ee' }, // Sky
  { c1: '#f43f5e', c2: '#fb923c' }, // Sunset
  { c1: '#10b981', c2: '#34d399' }, // Emerald
  { c1: '#1e293b', c2: '#0f172a' }, // Midnight
];

const applyPreset = (c1: string, c2: string) => {
  store.updateActiveSlide({ bgColor1: c1, bgColor2: c2 });
};

const handleUserImageUpload = (uploadFile: UploadFile) => {
  const file = uploadFile.raw;
  if (file && selectedLayer.value) {
    const reader = new FileReader();
    reader.onload = (e) => {
      store.updateLayer(selectedLayer.value.id, { userImage: e.target?.result as string });
    };
    reader.readAsDataURL(file);
  }
};

const handleBgUpload = (uploadFile: UploadFile) => {
  const file = uploadFile.raw;
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      store.updateActiveSlide({ bgImage: e.target?.result as string });
    };
    reader.readAsDataURL(file);
  }
};

const handleSaveProject = () => {
  if (newProjectName.value.trim()) {
    store.saveProject(newProjectName.value.trim());
    newProjectName.value = '';
    ElMessage.success('Project saved!');
  }
};
</script>

<style scoped>
.control-panel {
  height: calc(100vh - 48px);
}

.panel-content {
  padding: 24px;
}

.panel-section {
  margin-bottom: 32px;
}

.section-title {
  font-size: 11px;
  font-weight: 700;
  margin-bottom: 16px;
  color: var(--accent-color);
  opacity: 0.9;
  letter-spacing: 1px;
  text-transform: uppercase;
}

.text-inputs {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
}

.font-sliders {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.slider-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.slider-item span {
  font-size: 12px;
  color: var(--text-muted);
}

.presets-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8px;
  margin-bottom: 16px;
}

.preset-item {
  aspect-ratio: 1;
  border-radius: 8px;
  cursor: pointer;
  border: 2px solid transparent;
  transition: all 0.2s;
}

.preset-item:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
}

.image-presets {
  margin-bottom: 16px;
}

.sub-label {
  display: block;
  font-size: 11px;
  color: var(--text-muted);
  margin-bottom: 8px;
  text-transform: uppercase;
}

.img-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  margin-bottom: 12px;
}

.img-item {
  aspect-ratio: 1;
  border-radius: 6px;
  background-size: cover;
  background-position: center;
  cursor: pointer;
  border: 1px solid var(--glass-border);
  transition: transform 0.2s;
}

.bg-uploader :deep(.el-upload) {
  width: 100%;
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px dashed var(--glass-border);
  border-radius: 6px;
  cursor: pointer;
  color: var(--text-muted);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.value-badge {
  font-size: 11px;
  background: rgba(var(--text-main-rgb), 0.1);
  padding: 2px 6px;
  border-radius: 4px;
}

.bg-settings {
  display: flex;
  flex-direction: column;
}

.color-pickers {
  display: flex;
  gap: 12px;
  margin-top: 12px;
}

.user-image-uploader :deep(.el-upload) {
  width: 100%;
  border: 1px dashed var(--glass-border);
  border-radius: 12px;
  background: rgba(var(--text-main-rgb), 0.03);
  overflow: hidden;
}

.image-preview-container {
  width: 100%;
  aspect-ratio: 9/16;
  position: relative;
}

.user-image-preview {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.image-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s;
  color: #fff;
}

.image-preview-container:hover .image-overlay {
  opacity: 1;
}

.upload-placeholder {
  padding: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: var(--text-muted);
}

.project-manager {
  border-top: 1px solid var(--glass-border);
  padding-top: 24px;
}

.project-list {
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.project-item-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: rgba(var(--text-main-rgb), 0.03);
  border-radius: 8px;
}

.p-name {
  font-size: 13px;
  font-weight: 500;
}

.locale-switcher-row {
  margin-bottom: 12px;
}

.device-checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

.device-checkbox-group :deep(.el-checkbox) {
  margin-right: 0;
  color: var(--text-muted);
}

.preview-device-sel {
  border-top: 1px solid var(--glass-border);
  padding-top: 12px;
}

.language-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.layer-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.layer-item-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  background: rgba(var(--text-main-rgb), 0.03);
  border: 1px solid var(--glass-border);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.layer-item-row.active {
  background: rgba(var(--accent-rgb), 0.1);
  border-color: var(--accent-color);
}

.layer-drag {
  color: var(--text-muted);
  cursor: grab;
}

.layer-name {
  flex-grow: 1;
  font-size: 13px;
  font-weight: 500;
}

.slider-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.layout-presets-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.layout-preset-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 12px 8px;
  background: rgba(var(--text-main-rgb), 0.03);
  border: 1px solid var(--glass-border);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
}

.layout-preset-btn:hover {
  background: rgba(var(--text-main-rgb), 0.06);
  transform: translateY(-2px);
}

.layout-preset-btn span {
  font-size: 10px;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
}

.layout-icon {
  width: 40px;
  height: 30px;
  background: var(--glass-border);
  border-radius: 4px;
  position: relative;
  overflow: hidden;
}

.layout-icon::after, .layout-icon::before {
  content: '';
  position: absolute;
  background: var(--accent-color);
  opacity: 0.6;
  border-radius: 1px;
}

.layout-icon.duo::before { width: 14px; height: 22px; left: 6px; top: 4px; transform: rotate(-10deg); }
.layout-icon.duo::after { width: 14px; height: 22px; right: 6px; top: 2px; transform: rotate(10deg); }

.layout-icon.trio::before { width: 10px; height: 18px; left: 4px; top: 6px; transform: rotate(-10deg); }
.layout-icon.trio::after { width: 10px; height: 18px; right: 4px; top: 6px; transform: rotate(10deg); }
.layout-icon.trio { background: linear-gradient(to bottom, var(--glass-border), var(--glass-border)) center no-repeat; background-size: 14px 22px; }

.layout-icon.offset::before { width: 20px; height: 32px; right: -5px; top: 2px; transform: rotate(-5deg); }

.lang-tag {
  background: rgba(var(--text-main-rgb), 0.05);
  border-color: var(--glass-border);
  color: var(--text-main);
}
</style>
