<template>
  <div class="slide-strip glass">
    <div class="strip-header">
      <span class="strip-title">Storyboard</span>
      <el-tooltip content="Add Single Page" placement="right">
        <el-button 
          circle 
          size="small" 
          type="primary" 
          @click="store.addSlide"
        >
          <el-icon><Plus /></el-icon>
        </el-button>
      </el-tooltip>
    </div>

    <el-scrollbar class="strip-content">
      <div class="slide-list">
        <div 
          v-for="(slide, index) in store.slides" 
          :key="slide.id"
          class="slide-card"
          :class="{ active: store.activeSlideIndex === index }"
          @click="store.activeSlideIndex = index"
        >
          <div class="card-preview" :style="getThumbStyle(slide)">
            <!-- Layer Previews -->
            <div class="mini-layers">
              <div 
                v-for="layer in slide.layers.slice(0, 3)" 
                :key="layer.id"
                class="mini-layer"
                :style="{ backgroundImage: layer.userImage ? `url(${layer.userImage})` : 'none' }"
              ></div>
            </div>
            
            <div class="card-overlay">
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
          <span class="card-label">{{ slide.name || ('Page ' + (index + 1)) }}</span>
        </div>
      </div>
    </el-scrollbar>

    <div class="strip-footer">
      <el-button 
        type="primary" 
        plain
        size="small" 
        class="template-set-btn"
        @click="applyMidnightSet"
      >
        <el-icon><Collection /></el-icon>
        Midnight Set
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useScreenshotStore } from '../store/screenshot';
import { Plus, Delete, Collection } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';

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

const applyMidnightSet = () => {
  store.applyTemplateSet('midnight-pro');
  ElMessage.success('Professional Template Set Applied');
};
</script>

<style scoped>
.slide-strip {
  width: 180px;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 16px 12px;
  gap: 16px;
  border-radius: 16px;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
}

.strip-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.strip-title {
  font-size: 12px;
  font-weight: 800;
  text-transform: uppercase;
  color: var(--text-main);
  letter-spacing: 1px;
}

.strip-content {
  flex: 1;
}

.slide-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 4px;
}

.slide-card {
  display: flex;
  flex-direction: column;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.card-preview {
  width: 100%;
  aspect-ratio: 1242 / 2688;
  border-radius: 12px;
  border: 2px solid transparent;
  position: relative;
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(0,0,0,0.15);
  transition: inherit;
}

.slide-card:hover .card-preview {
  transform: translateY(-4px);
  border-color: rgba(var(--accent-color-rgb), 0.3);
  box-shadow: 0 12px 32px rgba(0,0,0,0.25);
}

.slide-card.active .card-preview {
  border-color: var(--accent-color);
  box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.2), 0 12px 32px rgba(0,0,0,0.25);
}

.mini-layers {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 10%;
}

.mini-layer {
  flex: 1;
  height: 60%;
  background-color: rgba(255,255,255,0.1);
  background-size: cover;
  background-position: center;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
}

.card-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s;
  z-index: 10;
}

.card-preview:hover .card-overlay {
  opacity: 1;
}

.card-label {
  font-size: 11px;
  color: var(--text-muted);
  font-weight: 600;
  text-align: center;
}

.strip-footer {
  padding-top: 16px;
  border-top: 1px solid var(--glass-border);
}

.template-set-btn {
  width: 100%;
  font-weight: 700;
  letter-spacing: 0.5px;
}
</style>
