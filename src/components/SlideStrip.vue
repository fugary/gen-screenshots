<template>
  <div class="slide-strip glass">
    <div class="strip-header">
      <span class="strip-title">{{ $t('controls.projects') || 'Slides' }}</span>
      <el-button 
        circle 
        size="small" 
        type="primary" 
        @click="store.addSlide"
      >
        <el-icon><Plus /></el-icon>
      </el-button>
    </div>

    <el-scrollbar class="strip-content">
      <div 
        class="drop-zone"
        @dragover.prevent
        @drop.prevent="handleDrop"
      >
        <div 
          v-for="(slide, index) in store.slides" 
          :key="slide.id"
          class="slide-tile"
          :class="{ active: store.activeSlideIndex === index }"
          @click="store.activeSlideIndex = index"
        >
          <div class="tile-preview" :style="getThumbStyle(slide)">
            <div v-if="!slide.userImage" class="tile-placeholder">
              <el-icon><Picture /></el-icon>
            </div>
            <div class="tile-overlay">
              <el-button 
                circle 
                size="small" 
                type="danger" 
                class="delete-btn"
                @click.stop="store.deleteSlide(index)"
                v-if="store.slides.length > 1"
              >
                <el-icon><Delete /></el-icon>
              </el-button>
            </div>
          </div>
          <span class="tile-label">{{ slide.name || ('Slide ' + (index + 1)) }}</span>
        </div>
        
        <el-upload
          action="#"
          multiple
          :auto-upload="false"
          :on-change="handleBatchUpload"
          :show-file-list="false"
          class="batch-uploader"
        >
          <div class="add-tile">
            <el-icon><Plus /></el-icon>
            <span>Batch Add</span>
          </div>
        </el-upload>
      </div>
    </el-scrollbar>

    <div class="strip-footer">
      <el-button 
        type="success" 
        size="small" 
        class="batch-export-btn"
        @click="dispatchBatchExport"
      >
        <el-icon><Download /></el-icon>
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useScreenshotStore } from '../store/screenshot';
import { Plus, Delete, Picture, Download } from '@element-plus/icons-vue';
import { UploadFile } from 'element-plus';

const store = useScreenshotStore();

const getThumbStyle = (slide: any) => {
  if (slide.bgImage) {
    return { backgroundImage: `url(${slide.bgImage})`, backgroundSize: 'cover' };
  }
  if (slide.bgType === 'linear') {
    return { background: `linear-gradient(135deg, ${slide.bgColor1}, ${slide.bgColor2})` };
  }
  return { background: `radial-gradient(circle, ${slide.bgColor1}, ${slide.bgColor2})` };
};

const handleBatchUpload = (file: UploadFile) => {
  const reader = new FileReader();
  reader.onload = (e) => {
    store.batchAddSlides([e.target?.result as string]);
  };
  reader.readAsDataURL(file.raw!);
};

const handleDrop = (e: DragEvent) => {
  const files = e.dataTransfer?.files;
  if (!files) return;

  const imageFiles = Array.from(files).filter(f => f.type.startsWith('image/'));
  if (imageFiles.length === 0) return;

  let loadedCount = 0;
  const results: string[] = [];

  imageFiles.forEach(file => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      results.push(ev.target?.result as string);
      loadedCount++;
      if (loadedCount === imageFiles.length) {
        store.batchAddSlides(results);
      }
    };
    reader.readAsDataURL(file);
  });
};

const dispatchBatchExport = () => {
  window.dispatchEvent(new CustomEvent('batch-export-canvas'));
};
</script>

<style scoped>
.slide-strip {
  width: 120px;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 16px 8px;
  gap: 16px;
  border-radius: 16px;
  background: rgba(0,0,0,0.2);
}

.strip-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 8px;
}

.strip-title {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--text-muted);
  letter-spacing: 0.5px;
}

.strip-content {
  flex: 1;
}

.drop-zone {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 8px 4px;
  min-height: 100%;
}

.slide-tile {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.tile-preview {
  width: 70px;
  aspect-ratio: 9/16;
  border-radius: 6px;
  border: 2px solid transparent;
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  transition: all 0.2s;
}

.slide-tile:hover .tile-preview {
  transform: translateY(-2px);
  border-color: rgba(255,255,255,0.2);
}

.slide-tile.active .tile-preview {
  border-color: var(--accent-color);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.3);
}

.tile-placeholder {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255,255,255,0.2);
  font-size: 20px;
}

.tile-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s;
}

.tile-preview:hover .tile-overlay {
  opacity: 1;
}

.tile-label {
  font-size: 10px;
  color: var(--text-muted);
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 90px;
}

.add-tile {
  width: 70px;
  aspect-ratio: 9/16;
  border: 1px dashed var(--glass-border);
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  color: var(--text-muted);
  transition: all 0.2s;
  cursor: pointer;
}

.add-tile:hover {
  border-color: var(--accent-color);
  color: var(--accent-color);
  background: rgba(99, 102, 241, 0.05);
}

.add-tile span {
  font-size: 9px;
  font-weight: 600;
}

.batch-uploader {
  align-self: center;
}

.strip-footer {
  padding-top: 12px;
  border-top: 1px solid var(--glass-border);
  display: flex;
  justify-content: center;
}

.batch-export-btn {
  width: 100%;
  height: 36px;
  border-radius: 8px;
}
</style>
