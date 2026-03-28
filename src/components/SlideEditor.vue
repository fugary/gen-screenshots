<template>
  <div 
    class="slide-editor" 
    :class="{ active: store.activeSlideIndex === index }"
    :style="{ width: `${editorWidth}px` }"
    @click="store.activeSlideIndex = index"
  >
    <div class="editor-header">
      <div class="page-badge">PAGE {{ index + 1 }}</div>
      <div class="slide-name">{{ slide.name || 'Untitled' }}</div>
      <el-button 
        link 
        type="danger" 
        size="small" 
        class="delete-btn"
        @click.stop="store.deleteSlide(index)"
        v-if="store.slides.length > 1"
      >
        <el-icon><Delete /></el-icon>
      </el-button>
    </div>

    <div class="canvas-container">
      <div class="canvas-wrapper" :style="wrapperStyle">
        <ScreenshotCanvas :slide-id="slide.id" :index="index" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useScreenshotStore } from '../store/screenshot';
import { Delete } from '@element-plus/icons-vue';
import ScreenshotCanvas from './ScreenshotCanvas.vue';

const props = defineProps<{
  slide: any;
  index: number;
}>();


const store = useScreenshotStore();
const currentSlide = computed(() => props.slide);

const aspectRatio = computed(() => {
  const frame = props.slide?.frameStyle || 'iphone-6.7';
  if (frame.includes('ipad')) return 0.75; // 3:4
  if (frame.includes('iphone-5.5')) return 0.5625; // 9:16
  return 0.46; // 9:19.5 approx
});

const editorWidth = computed(() => {
  const height = 700; // Standardized vertical height
  return height * aspectRatio.value + 32; // + card padding
});

const wrapperStyle = computed(() => {
  const frame = currentSlide.value?.frameStyle || 'iphone-6.7';
  let w = 1290, h = 2796;
  if (frame.includes('ipad')) { w = 2048; h = 2732; }
  else if (frame === 'iphone-6.5') { w = 1242; h = 2688; }
  else if (frame === 'iphone-5.5') { w = 1242; h = 2208; }
  
  const scale = 600 / h; // Fit to 600px height
  return {
    width: `${w}px`,
    height: `${h}px`,
    transform: `scale(${scale})`,
    transformOrigin: 'top left'
  };
});
</script>

<style scoped>
.slide-editor {
  flex: 0 0 auto;
  height: 800px; /* Fixed height for the strip */
  padding: 16px;
  background: var(--glass-bg);
  border: 2px solid transparent;
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.slide-editor:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(var(--accent-color-rgb), 0.2);
}

.slide-editor.active {
  background: rgba(255, 255, 255, 0.08);
  border-color: var(--accent-color);
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.3);
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 10;
}

.page-badge {
  font-size: 10px;
  font-weight: 900;
  letter-spacing: 1.5px;
  color: var(--accent-color);
  background: rgba(var(--accent-color-rgb), 0.1);
  padding: 4px 8px;
  border-radius: 6px;
}

.slide-name {
  font-size: 13px;
  font-weight: 700;
  color: var(--text-main);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 200px;
}

.canvas-container {
  flex: 1;
  width: 100%;
  display: flex;
  justify-content: center;
  background: rgba(0,0,0,0.1);
  border-radius: 12px;
  overflow: hidden;
  position: relative;
}

.canvas-wrapper {
  /* Dynamic values from wrapperStyle */
}

.delete-btn {
  opacity: 0;
  transition: opacity 0.2s;
}

.slide-editor:hover .delete-btn {
  opacity: 1;
}
</style>
