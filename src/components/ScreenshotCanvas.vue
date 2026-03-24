<template>
  <div class="canvas-container" ref="containerRef">
    <canvas 
      ref="canvasRef" 
      :width="canvasWidth" 
      :height="canvasHeight"
    ></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed } from 'vue';
import { useScreenshotStore } from '../store/screenshot';

const props = defineProps<{
  slideId?: string;
  index?: number;
}>();

const store = useScreenshotStore();
const canvasRef = ref<HTMLCanvasElement | null>(null);
const containerRef = ref<HTMLDivElement | null>(null);
const ctxRef = ref<CanvasRenderingContext2D | null>(null);

const currentSlide = computed(() => {
  if (props.slideId) {
    return store.slides.find(s => s.id === props.slideId) || store.activeSlide;
  }
  return store.activeSlide;
});

const canvasWidth = ref(1290);
const canvasHeight = ref(2796);

const getCanvasDimensions = (style?: string) => {
  const slide = currentSlide.value;
  const frame = style || (slide ? slide.frameStyle : store.frameStyle);
  switch (frame) {
    case 'iphone16-promax': return { width: 1320, height: 2868 }; 
    case 'iphone-6.7': return { width: 1290, height: 2796 }; 
    case 'iphone-6.5': return { width: 1242, height: 2688 }; 
    case 'iphone-5.5': return { width: 1242, height: 2208 }; 
    case 'ipad-13': return { width: 2048, height: 2732 };    
    case 'ipad-11': return { width: 1668, height: 2388 };    
    default: return { width: 1290, height: 2796 };
  }
};

const getLuminance = (hex: string) => {
  const rgb = parseInt(hex.slice(1), 16);
  const r = (rgb >> 16) & 0xff;
  const g = (rgb >>  8) & 0xff;
  const b = (rgb >>  0) & 0xff;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

const loadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
};

const frameCache = new Map<string, HTMLImageElement>();
const getFrameImage = async (style: string): Promise<HTMLImageElement | null> => {
  if (frameCache.has(style)) return frameCache.get(style)!;
  try {
    const img = await loadImage(`/frames/${style}.png`);
    frameCache.set(style, img);
    return img;
  } catch (e) {
    return null;
  }
};

async function drawDeviceLayer(ctx: CanvasRenderingContext2D, layer: any, slide: any) {
  if (!layer || layer.frameStyle === 'none') return;
  const frameImg = await getFrameImage(layer.frameStyle);
  if (!frameImg) return;

  ctx.save();
  const centerX = (layer.x / 100) * canvasWidth.value;
  const centerY = (layer.y / 100) * canvasHeight.value;
  
  ctx.translate(centerX, centerY);
  ctx.rotate((layer.rotateZ * Math.PI) / 180);
  ctx.scale(layer.scale, layer.scale);

  // Screenshot
  if (layer.userImage) {
    try {
      const userImg = await loadImage(layer.userImage);
      const padding = layer.frameStyle.includes('ipad') ? 60 : 40;
      ctx.drawImage(userImg, -frameImg.width/2 + padding, -frameImg.height/2 + padding, frameImg.width - padding*2, frameImg.height - padding*2);
    } catch (e) {}
  }

  // Frame
  ctx.drawImage(frameImg, -frameImg.width/2, -frameImg.height/2, frameImg.width, frameImg.height);
  ctx.restore();
}

async function render() {
  if (!canvasRef.value || !ctxRef.value || !currentSlide.value) return;
  const ctx = ctxRef.value;
  const slide = currentSlide.value;

  const dims = getCanvasDimensions();
  canvasWidth.value = dims.width;
  canvasHeight.value = dims.height;

  // BG
  if (slide.bgImage) {
    try {
      const bgImg = await loadImage(slide.bgImage);
      ctx.drawImage(bgImg, 0, 0, canvasWidth.value, canvasHeight.value);
    } catch (e) {}
  } else {
    const grad = slide.bgType === 'linear' 
      ? ctx.createLinearGradient(0, 0, 0, canvasHeight.value)
      : ctx.createRadialGradient(canvasWidth.value/2, canvasHeight.value/2, 0, canvasWidth.value/2, canvasHeight.value/2, canvasHeight.value);
    grad.addColorStop(0, slide.bgColor1);
    grad.addColorStop(1, slide.bgColor2);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvasWidth.value, canvasHeight.value);
  }

  // Text
  const locale = slide.locales?.[slide.activeLocale] || { title: '', subtitle: '' };
  const isDark = getLuminance(slide.bgColor1) < 128;
  const textColor = slide.adaptiveText ? (isDark ? '#FFFFFF' : '#000000') : (slide.textColor || '#FFFFFF');
  
  ctx.textAlign = 'center';
  ctx.fillStyle = textColor;
  ctx.textBaseline = 'middle';

  const titleY = slide.layout === 'top' ? 400 : canvasHeight.value - 600;
  ctx.font = `bold ${slide.fontSize}px Inter, sans-serif`;
  ctx.fillText(locale.title, canvasWidth.value/2, titleY);

  const subY = titleY + (slide.fontSize * 0.8) + 40;
  ctx.font = `500 ${slide.subtitleFontSize || 60}px Inter, sans-serif`;
  ctx.globalAlpha = 0.8;
  ctx.fillText(locale.subtitle, canvasWidth.value/2, subY);
  ctx.globalAlpha = 1.0;

  // Layers
  if (slide.layers) {
    for (const layer of slide.layers) {
      await drawDeviceLayer(ctx, layer, slide);
    }
  }
}

let animId: number;
const frameFunc = () => {
  render();
  animId = requestAnimationFrame(frameFunc);
};

onMounted(() => {
  if (canvasRef.value) {
    ctxRef.value = canvasRef.value.getContext('2d');
    frameFunc();
  }
});

onUnmounted(() => {
  cancelAnimationFrame(animId);
});
</script>

<style scoped>
.canvas-container {
  width: 100%;
  height: 100%;
}
canvas {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
</style>
