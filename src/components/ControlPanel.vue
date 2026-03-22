<template>
  <el-scrollbar class="control-panel">
    <div class="panel-section">
      <h3 class="section-title">
        {{ $t('controls.headline') }}
      </h3>
      <el-input 
        v-model="store.title" 
        type="textarea" 
        :rows="2" 
        placeholder="Enter your headline..."
        class="custom-input"
      />
    </div>

    <div class="panel-section">
      <h3 class="section-title">
        {{ $t('controls.background') }}
      </h3>
      <div class="bg-settings">
        <el-radio-group
          v-model="store.bgType"
          size="small"
          class="custom-radio"
        >
          <el-radio-button label="linear">
            Linear
          </el-radio-button>
          <el-radio-button label="radial">
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

    <div class="panel-section">
      <div class="section-header">
        <h3 class="section-title">
          {{ $t('controls.fontSize') }}
        </h3>
        <span class="value-badge">{{ store.fontSize }}px</span>
      </div>
      <el-slider
        v-model="store.fontSize"
        :min="80"
        :max="240"
        :show-tooltip="false"
        class="custom-slider"
      />
    </div>

    <div class="panel-section">
      <h3 class="section-title">
        {{ $t('controls.layout') }}
      </h3>
      <el-radio-group
        v-model="store.layout"
        size="small"
        class="custom-radio"
      >
        <el-radio-button label="top">
          Top
        </el-radio-button>
        <el-radio-button label="bottom">
          Bottom
        </el-radio-button>
      </el-radio-group>
    </div>

    <div class="panel-section">
      <h3 class="section-title">
        {{ $t('controls.device') }}
      </h3>
      <el-select
        v-model="store.frameStyle"
        class="custom-select"
      >
        <el-option
          label="iPhone 16 Pro (Black)"
          value="iphone16-jet"
        />
        <el-option
          label="iPhone 16 Pro (Gold)"
          value="iphone16-gold"
        />
        <el-option
          label="iPhone 16 Pro (Silver)"
          value="iphone16-silver"
        />
        <el-option
          label="None"
          value="none"
        />
      </el-select>
    </div>

    <div class="panel-section">
      <h3 class="section-title">
        Visual Effects
      </h3>
      <div class="effect-item">
        <span>Noise Intensity</span>
        <el-slider
          v-model="store.noiseAmount"
          :min="0"
          :max="0.2"
          :step="0.01"
          class="custom-slider"
        />
      </div>
    </div>

    <div class="panel-section">
      <h3 class="section-title">
        Screenshot
      </h3>
      <el-upload
        class="custom-upload"
        drag
        action="#"
        :auto-upload="false"
        :on-change="handleFileChange"
        :show-file-list="false"
      >
        <div
          v-if="!store.userImage"
          class="upload-placeholder"
        >
          <el-icon class="upload-icon">
            <UploadFilled />
          </el-icon>
          <p>Drop or click to upload</p>
        </div>
        <div
          v-else
          class="upload-preview"
        >
          <img
            :src="store.userImage"
            alt="Preview"
          >
          <div class="overlay">
            <el-icon><Refresh /></el-icon>
          </div>
        </div>
      </el-upload>
    </div>
  </el-scrollbar>
</template>

<script setup lang="ts">
import { useScreenshotStore } from '../store/screenshot';
import { UploadFile } from 'element-plus';
import { UploadFilled, Refresh } from '@element-plus/icons-vue';

const store = useScreenshotStore();

const handleFileChange = (uploadFile: UploadFile) => {
  const file = uploadFile.raw;
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      store.setProject({ userImage: e.target?.result as string });
    };
    reader.readAsDataURL(file);
  }
};
</script>

<style scoped>
.control-panel {
  height: calc(100vh - 48px);
}

.panel-section {
  margin-bottom: 32px;
}

.section-title {
  font-size: 13px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #64748b;
  margin-bottom: 12px;
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
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.08);
  color: #fff;
  border-radius: 8px;
}

:deep(.el-radio-button__inner) {
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.08);
  color: #94a3b8;
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
</style>
