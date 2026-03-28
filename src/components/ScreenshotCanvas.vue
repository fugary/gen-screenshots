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
import { ref, onMounted, onUnmounted, computed } from 'vue';
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

// Generate a realistic device frame using SVG to ensure no missing assets
function getFrameSVG(id: string) {
  let width = 1290, height = 2796;
  let cornerRadius = 240;
  let bezel = 60;
  let isIPad = id.includes('ipad');

  if (isIPad) {
    width = 2048; height = 2732;
    cornerRadius = 100;
    bezel = 80;
  } else if (id.includes('iphone-5.5')) {
    width = 1242; height = 2208;
    cornerRadius = 200;
  }

  const svg = `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bezelGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#444;stop-opacity:1" />
          <stop offset="50%" style="stop-color:#111;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#333;stop-opacity:1" />
        </linearGradient>
      </defs>
      <!-- Outer Bezel -->
      <path d="M ${cornerRadius},0 H ${width - cornerRadius} A ${cornerRadius},${cornerRadius} 0 0 1 ${width},${cornerRadius} V ${height - cornerRadius} A ${cornerRadius},${cornerRadius} 0 0 1 ${width - cornerRadius},${height} H ${cornerRadius} A ${cornerRadius},${cornerRadius} 0 0 1 0,${height - cornerRadius} V ${cornerRadius} A ${cornerRadius},${cornerRadius} 0 0 1 ${cornerRadius},0 Z M ${bezel},${bezel + cornerRadius - bezel} V ${height - bezel - (cornerRadius - bezel)} A ${cornerRadius - bezel},${cornerRadius - bezel} 0 0 0 ${bezel + (cornerRadius - bezel)},${height - bezel} H ${width - bezel - (cornerRadius - bezel)} A ${cornerRadius - bezel},${cornerRadius - bezel} 0 0 0 ${width - bezel},${height - bezel - (cornerRadius - bezel)} V ${bezel + (cornerRadius - bezel)} A ${cornerRadius - bezel},${cornerRadius - bezel} 0 0 0 ${width - bezel - (cornerRadius - bezel)},${bezel} H ${bezel + (cornerRadius - bezel)} A ${cornerRadius - bezel},${cornerRadius - bezel} 0 0 0 ${bezel},${bezel + (cornerRadius - bezel)} Z" fill="url(#bezelGrad)" />
      
      <!-- Surface reflections / Highlights -->
      <rect x="0" y="0" width="${width}" height="${height}" rx="${cornerRadius}" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="4"/>
      
      <!-- Dynamic Island (drawn on top) -->
      ${isIPad ? '' : `<rect x="${width/2 - 150}" y="100" width="300" height="80" rx="40" fill="#000" stroke="#333" stroke-width="2"/>`}
    </svg>
  `;
  return 'data:image/svg+xml;base64,' + btoa(svg.trim());
}

const frameImageCache = new Map<string, HTMLImageElement>();
const userImageCache = new Map<string, HTMLImageElement>();
const loadingUserImages = new Set<string>();

async function getFrameImage(id: string) {
  if (frameImageCache.has(id)) return frameImageCache.get(id);
  if (id === 'none') return null;
  
  const src = getFrameSVG(id);
  const img = await loadImage(src);
  frameImageCache.set(id, img);
  return img;
}

async function drawDeviceLayer(ctx: CanvasRenderingContext2D, layer: any) {
  if (!layer || layer.frameStyle === 'none') return;
  const frameImg = await getFrameImage(layer.frameStyle);
  if (!frameImg) return;

  ctx.save();
  const centerX = (layer.x / 100) * canvasWidth.value;
  const centerY = (layer.y / 100) * canvasHeight.value;
  
  ctx.translate(centerX, centerY);
  
  // Apply 3D-like Perspective Simulation
  const radX = (layer.rotateX || 0) * (Math.PI / 180);
  const radY = (layer.rotateY || 0) * (Math.PI / 180);
  const radZ = (layer.rotateZ || 0) * (Math.PI / 180);

  // Combine transforms
  ctx.rotate(radZ);
  // Simulating 3D tilt using skew and non-uniform scale
  ctx.transform(1, Math.tan(radX), Math.tan(radY), 1, 0, 0);
  ctx.scale(layer.scale * Math.cos(radY), layer.scale * Math.cos(radX));

  // Shadow
  ctx.shadowColor = 'rgba(0,0,0,0.5)';
  ctx.shadowBlur = layer.shadowBlur || 100;
  ctx.shadowOffsetY = 40;

  // Rendering Pipeline: Screenshot first, Frame last (as overlay)
  const isIPad = layer.frameStyle.includes('ipad');
  const bezel = isIPad ? 80 : 60;
  const screenW = frameImg.width - bezel * 2;
  const screenH = frameImg.height - bezel * 2;

  // 1. Draw Black Base (for empty screen)
  ctx.fillStyle = '#000';
  ctx.fillRect(-frameImg.width/2 + bezel, -frameImg.height/2 + bezel, screenW, screenH);

  // 2. Draw User Screenshot (if exists)
  if (layer.userImage) {
    const userImg = userImageCache.get(layer.userImage);
    if (userImg) {
      ctx.drawImage(userImg, -frameImg.width/2 + bezel, -frameImg.height/2 + bezel, screenW, screenH);
    } else if (!loadingUserImages.has(layer.userImage)) {
      loadingUserImages.add(layer.userImage);
      loadImage(layer.userImage).then(img => {
        userImageCache.set(layer.userImage, img);
        loadingUserImages.delete(layer.userImage);
      });
    }
  }

  // 3. Draw the Frame Overlay (Bezel + Notch/Island)
  ctx.shadowBlur = 0; 
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
      await drawDeviceLayer(ctx, layer);
    }
  }
}

let animId: number;
let isRendering = false;

const frameFunc = async () => {
  if (!isRendering) {
    isRendering = true;
    try {
      await render();
    } catch (e) {
      console.error('Render error:', e);
    }
    isRendering = false;
  }
  animId = requestAnimationFrame(frameFunc);
};

onMounted(() => {
  if (canvasRef.value) {
    ctxRef.value = canvasRef.value.getContext('2d');
    frameFunc();
    
    // Mouse Interaction
    canvasRef.value.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  }
});

onUnmounted(() => {
  cancelAnimationFrame(animId);
  if (canvasRef.value) {
    canvasRef.value.removeEventListener('mousedown', handleMouseDown);
  }
  window.removeEventListener('mousemove', handleMouseMove);
  window.removeEventListener('mouseup', handleMouseUp);
});

const isDragging = ref(false);
const dragLayerId = ref<string | null>(null);
const lastMousePos = ref({ x: 0, y: 0 });

function handleMouseDown(e: MouseEvent) {
  if (!canvasRef.value || !currentSlide.value) return;
  const rect = canvasRef.value.getBoundingClientRect();
  const mouseX = ((e.clientX - rect.left) / rect.width) * 100;
  const mouseY = ((e.clientY - rect.top) / rect.height) * 100;

  // Find topmost layer closest to mouse
  const layers = [...currentSlide.value.layers].reverse();
  for (const layer of layers) {
    const dist = Math.sqrt(Math.pow(layer.x - mouseX, 2) + Math.pow(layer.y - mouseY, 2));
    if (dist < 15) { // Radius of sensitivity
      isDragging.value = true;
      dragLayerId.value = layer.id;
      // Also update store's active slide/layer if needed
      store.activeSlideIndex = props.index ?? store.activeSlideIndex;
      lastMousePos.value = { x: mouseX, y: mouseY };
      return;
    }
  }
}

function handleMouseMove(e: MouseEvent) {
  if (!isDragging.value || !dragLayerId.value || !canvasRef.value) return;
  const rect = canvasRef.value.getBoundingClientRect();
  const mouseX = ((e.clientX - rect.left) / rect.width) * 100;
  const mouseY = ((e.clientY - rect.top) / rect.height) * 100;

  const dx = mouseX - lastMousePos.value.x;
  const dy = mouseY - lastMousePos.value.y;

  const layer = currentSlide.value.layers.find(l => l.id === dragLayerId.value);
  if (layer) {
    store.updateLayer(layer.id, {
      x: Math.max(0, Math.min(100, layer.x + dx)),
      y: Math.max(0, Math.min(100, layer.y + dy))
    });
  }

  lastMousePos.value = { x: mouseX, y: mouseY };
}

function handleMouseUp() {
  isDragging.value = false;
  dragLayerId.value = null;
}
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
