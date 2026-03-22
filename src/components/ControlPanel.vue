<template>
  <el-scrollbar class="control-panel">
    <!-- Canvas Settings Tab -->
    <div v-if="store.currentTab === 'canvas'">
      <!-- Typography Section -->
      <div class="panel-section">
        <h3 class="section-title">
          {{ $t('controls.headline') }}
        </h3>
        <div class="text-inputs">
          <el-input
            v-model="store.activeSlide.title"
            type="textarea"
            :rows="2"
            placeholder="Title..."
          />
          <el-input
            v-model="store.activeSlide.subtitle"
            type="textarea"
            :rows="2"
            placeholder="Subtitle..."
          />
        </div>
        <div class="font-sliders">
          <div class="slider-item">
            <span>Title Size: {{ store.fontSize }}px</span>
            <el-slider
              v-model="store.fontSize"
              :min="80"
              :max="240"
              :show-tooltip="false"
            />
          </div>
          <div class="slider-item">
            <span>Sub Size: {{ store.subtitleFontSize }}px</span>
            <el-slider
              v-model="store.subtitleFontSize"
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
            v-model="store.adaptiveText"
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
                @click="store.setProject({ bgImage: img.url })"
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
              v-if="store.bgImage"
              type="danger"
              :underline="false"
              @click="store.setProject({ bgImage: null })"
            >
              Clear Image
            </el-link>
          </div>

          <el-radio-group
            v-model="store.bgType"
            size="small"
            class="custom-radio"
          >
            <el-radio-button :value="'linear'">
              Linear
            </el-radio-button>
            <el-radio-button :value="'radial'">
              Radial
            </el-radio-button>
          </el-radio-group>
          <div class="color-pickers">
            <el-color-picker
              v-model="store.bgColor1"
              show-alpha
            />
            <el-color-picker
              v-model="store.bgColor2"
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
          v-model="store.layout"
          size="small"
          class="custom-radio"
        >
          <el-radio-button :value="'top'">
            Top
          </el-radio-button>
          <el-radio-button :value="'bottom'">
            Bottom
          </el-radio-button>
        </el-radio-group>
      </div>

      <!-- Device Section -->
      <div class="panel-section">
        <h3 class="section-title">
          {{ $t('controls.device') }}
        </h3>
        <el-select
          v-model="store.frameStyle"
          class="custom-select"
        >
          <el-option-group label="iPhone (Bezel-less)">
            <el-option label="iPhone 16 Pro Max (6.9')" value="iphone16-promax" />
            <el-option label="iPhone 16 / 15 Pro Max (6.7')" value="iphone-6.7" />
            <el-option label="iPhone 11 Pro Max / XS Max (6.5')" value="iphone-6.5" />
          </el-option-group>
          <el-option-group label="iPhone (Classic)">
            <el-option label="iPhone 8 Plus / 7 Plus (5.5')" value="iphone-5.5" />
          </el-option-group>
          <el-option-group label="iPad">
            <el-option label="iPad Pro 13' (12.9')" value="ipad-13" />
            <el-option label="iPad Pro 11'" value="ipad-11" />
          </el-option-group>
          <el-option label="None" value="none" />
        </el-select>
      </div>

      <!-- Effects Section -->
      <div class="panel-section">
        <h3 class="section-title">
          {{ $t('controls.effects') }}
        </h3>
        <div class="section-header">
          <span class="value-badge">{{ Math.round(store.noiseAmount * 100) }}%</span>
        </div>
        <el-slider
          v-model="store.noiseAmount"
          :min="0"
          :max="0.2"
          :step="0.01"
          :show-tooltip="false"
          class="custom-slider"
        />
      </div>

      <!-- Project Persistence Section -->
      <div class="panel-section project-manager">
        <h3 class="section-title">
          {{ $t('controls.projects') }}
        </h3>
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
              <el-button
                circle
                size="small"
                type="primary"
                @click="store.loadProject(p.id)"
              >
                <el-icon><Refresh /></el-icon>
              </el-button>
              <el-button
                circle
                size="small"
                type="danger"
                @click="store.deleteProject(p.id)"
              >
                <el-icon><Delete /></el-icon>
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Slides (Image Assets) Tab -->
    <div
      v-else-if="store.currentTab === 'image'"
      class="tab-content"
    >
      <div class="panel-header-row">
        <h3 class="section-title">
          {{ $t('controls.screenshot') }}
        </h3>
        <el-button 
          type="primary" 
          size="small" 
          plain 
          @click="store.addSlide"
        >
          <el-icon class="el-icon--left"><Plus /></el-icon>
          Add Slide
        </el-button>
      </div>

      <div class="slides-list">
        <div 
          v-for="(slide, index) in store.slides" 
          :key="slide.id"
          class="slide-entry"
          :class="{ active: store.activeSlideIndex === index }"
          @click="store.activeSlideIndex = index"
        >
          <div class="slide-info">
            <span class="slide-name">{{ slide.name }}</span>
            <span class="slide-subtitle-preview">{{ slide.title.slice(0, 20) }}...</span>
          </div>
          <div class="slide-controls">
            <el-button 
              link 
              size="small" 
              @click.stop="store.duplicateSlide(index)"
            >
              <el-icon><CopyDocument /></el-icon>
            </el-button>
            <el-button 
              link 
              size="small" 
              type="danger" 
              @click.stop="store.deleteSlide(index)"
              v-if="store.slides.length > 1"
            >
              <el-icon><Delete /></el-icon>
            </el-button>
          </div>
        </div>
      </div>

      <div class="active-slide-details panel-section">
        <span class="sub-label">Active Slide Content</span>
        <el-upload
          action="#"
          :auto-upload="false"
          :on-change="handleUserImageUpload"
          :show-file-list="false"
          class="user-image-uploader"
        >
          <div v-if="store.activeSlide.userImage" class="image-preview-container">
            <img :src="store.activeSlide.userImage" class="user-image-preview" />
            <div class="image-overlay">
              <el-icon><Edit /></el-icon>
            </div>
          </div>
          <div v-else class="upload-placeholder">
            <el-icon class="upload-icon"><Plus /></el-icon>
            <span class="upload-text">Upload Screenshot</span>
          </div>
        </el-upload>
        <div v-if="store.activeSlide.userImage" class="image-actions">
          <el-button 
            type="danger" 
            plain 
            size="small" 
            @click="store.updateActiveSlide({ userImage: null })"
          >
            Remove Image
          </el-button>
        </div>
      </div>

      <div class="batch-actions panel-section">
        <el-button 
          type="success" 
          class="batch-btn" 
          @click="handleBatchExport"
        >
          <el-icon class="el-icon--left"><Download /></el-icon>
          Export All Slides ({{ store.slides.length }})
        </el-button>
      </div>
    </div>

    <!-- Presets Tab -->
    <div
      v-else-if="store.currentTab === 'presets'"
      class="tab-content"
    >
      <h3 class="section-title">
        Design Presets
      </h3>
      <p class="tab-note">
        Coming soon: Curated design templates for one-click professional styling.
      </p>
    </div>

    <!-- Settings Tab -->
    <div
      v-else-if="store.currentTab === 'settings'"
      class="tab-content"
    >
      <h3 class="section-title">
        App Settings
      </h3>
      <div class="panel-section">
        <p class="tab-note">
          Gen-Screenshots Pro v0.2.0
        </p>
        <p class="tab-note">
          Premium Desktop Edition
        </p>
      </div>
    </div>
  </el-scrollbar>
</template>

<script setup lang="ts">
import { useScreenshotStore } from '../store/screenshot';
import { UploadFile, ElMessage } from 'element-plus';
import { 
  UploadFilled, Refresh, Delete, Plus, 
  CopyDocument, Edit, Download 
} from '@element-plus/icons-vue';

const store = useScreenshotStore();

const newProjectName = ref('');

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
  store.setProject({ bgColor1: c1, bgColor2: c2 });
};

const handleUserImageUpload = (uploadFile: UploadFile) => {
  const file = uploadFile.raw;
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      store.updateActiveSlide({ userImage: e.target?.result as string });
    };
    reader.readAsDataURL(file);
  }
};

const handleBgUpload = (uploadFile: UploadFile) => {
  const file = uploadFile.raw;
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      store.setProject({ bgImage: e.target?.result as string });
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

const handleBatchExport = () => {
  window.dispatchEvent(new CustomEvent('batch-export-canvas'));
};
</script>

<style scoped>
.control-panel {
  height: calc(100vh - 48px);
}

.project-manager {
  border-top: 1px solid var(--glass-border);
  margin-top: 20px;
  padding-top: 20px;
}

.project-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 16px;
}

.project-item-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(255,255,255,0.03);
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid var(--glass-border);
}

.p-name {
  font-size: 13px;
  color: var(--text-main);
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 160px;
}

.p-actions {
  display: flex;
  gap: 4px;
}

.text-inputs {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

.font-sliders {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.slider-item {
  display: flex;
  flex-direction: column;
}

.section-title {
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 16px;
  color: #fff;
  opacity: 0.9;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

.sub-label {
  display: block;
  font-size: 11px;
  color: #a1a1aa;
  margin-bottom: 8px;
  text-transform: uppercase;
  font-weight: 500;
}

.tab-note {
  color: #a1a1aa;
  font-size: 13px;
  line-height: 1.6;
}

.slider-item span {
  font-size: 11px;
  color: var(--text-muted);
}

.image-presets {
  margin-bottom: 24px;
}

.img-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  margin-bottom: 12px;
}

.img-item {
  aspect-ratio: 16/10;
  border-radius: 6px;
  background-size: cover;
  background-position: center;
  cursor: pointer;
  border: 1px solid var(--glass-border);
  transition: transform 0.2s;
}

.img-item:hover {
  transform: scale(1.05);
}

.bg-uploader :deep(.el-upload) {
  width: 100%;
  aspect-ratio: 16/10;
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
  margin-bottom: 8px;
}

.value-badge {
  font-size: 11px;
  background: rgba(255,255,255,0.05);
  padding: 2px 6px;
  border-radius: 4px;
  color: #94a3b8;
}

.bg-settings {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.color-pickers {
  display: flex;
  gap: 12px;
}

/* Custom Element Plus Styling overrides */
:deep(.el-textarea__inner) {
  background: rgba(var(--text-main-rgb), 0.03);
  border: 1px solid var(--glass-border);
  color: var(--text-main);
  border-radius: 8px;
}

:deep(.el-radio-button__inner) {
  background: transparent;
  border: 1px solid var(--glass-border);
  color: var(--text-muted);
}

:deep(.el-radio-button__orig-radio:checked + .el-radio-button__inner) {
  background: #6366f1;
  border-color: #6366f1;
}

:deep(.el-color-picker__trigger) {
  border: 1px solid rgba(255,255,255,0.08);
  background: rgba(255,255,255,0.03);
}

:deep(.el-select .el-input__wrapper) {
  background: rgba(255,255,255,0.03);
  box-shadow: 0 0 0 1px rgba(255,255,255,0.08) inset;
}

.custom-upload {
  width: 100%;
}

:deep(.el-upload-dragger) {
  background: rgba(255,255,255,0.02);
  border: 1px dashed rgba(255,255,255,0.1);
  padding: 20px;
  border-radius: 12px;
}

.upload-placeholder {
  color: #64748b;
}

.upload-icon {
  font-size: 32px;
  margin-bottom: 8px;
}

.upload-preview {
  position: relative;
  height: 120px;
  border-radius: 8px;
  overflow: hidden;
}

.upload-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.upload-preview .overlay {
  position: absolute;
  top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s;
}

.upload-preview:hover .overlay {
  opacity: 1;
}

.effect-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.effect-item span {
  font-size: 12px;
  color: #94a3b8;
}

/* Image Assets Tab Styles */
.user-image-uploader :deep(.el-upload) {
  width: 100%;
  display: block;
  cursor: pointer;
  border: 1px dashed var(--glass-border);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.02);
  transition: all 0.2s ease;
  overflow: hidden;
}

.user-image-uploader :deep(.el-upload:hover) {
  border-color: #6366f1;
  background: rgba(99, 102, 241, 0.05);
}

.image-preview-container {
  position: relative;
  width: 100%;
  aspect-ratio: 9/16;
  background: #000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-image-preview {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.image-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s;
  color: #fff;
  font-size: 24px;
}

.image-preview-container:hover .image-overlay {
  opacity: 1;
}

.upload-placeholder {
  padding: 40px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  color: #64748b;
}

.upload-icon {
  font-size: 32px;
  margin-bottom: 4px;
}

.upload-text {
  font-size: 13px;
  color: #94a3b8;
}

.image-actions {
  margin-top: 16px;
  display: flex;
  justify-content: center;
}

/* Slide Manager Styles */
.panel-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.slides-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 24px;
}

.slide-entry {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--glass-border);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.slide-entry:hover {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.2);
}

.slide-entry.active {
  background: rgba(99, 102, 241, 0.1);
  border-color: var(--el-color-primary);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.15);
}

.slide-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.slide-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-main);
}

.slide-subtitle-preview {
  font-size: 11px;
  color: var(--text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 150px;
}

.slide-controls {
  display: flex;
  gap: 4px;
}

.active-slide-details {
  border-top: 1px solid var(--glass-border);
  padding-top: 20px;
}

.batch-actions {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid var(--glass-border);
}

.batch-btn {
  width: 100%;
  height: 44px;
  font-weight: 600;
  border-radius: 12px;
}
</style>
