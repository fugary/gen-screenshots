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
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { useScreenshotStore } from '../store/screenshot';
import { save } from '@tauri-apps/plugin-dialog';
import { writeFile } from '@tauri-apps/plugin-fs';

const store = useScreenshotStore();
const canvasRef = ref<HTMLCanvasElement | null>(null);
const containerRef = ref<HTMLDivElement | null>(null);
const ctxRef = ref<CanvasRenderingContext2D | null>(null);

const getCanvasDimensions = (style?: string) => {
  const frame = style || store.frameStyle;
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

const canvasWidth = ref(1290);
const canvasHeight = ref(2796);

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

const draw = async (overrideStyle?: string) => {
  const canvas = canvasRef.value;
  if (!canvas) return;
  
  if (!ctxRef.value) {
    ctxRef.value = canvas.getContext('2d');
  }
  const ctx = ctxRef.value;
  if (!ctx) return;

  const dims = getCanvasDimensions(overrideStyle);
  canvasWidth.value = dims.width;
  canvasHeight.value = dims.height;
  
  await new Promise(r => setTimeout(r, 0));

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  if (store.bgImage) {
    try {
      const bgImg = await loadImage(store.bgImage);
      ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
      await drawLayers(ctx, canvas, true, overrideStyle);
    } catch (e) {
      console.error("Failed to load background image", e);
      await drawLayers(ctx, canvas, false, overrideStyle);
    }
  } else {
    await drawLayers(ctx, canvas, false, overrideStyle);
  }
};

async function drawLayers(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, hasBgImg: boolean, overrideStyle?: string) {
  if (!store.activeSlide || !store.activeSlide.layers) return;
  // 1. Draw Background & Noise
  if (!hasBgImg) {
    if (store.bgType === 'linear') {
      const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      grad.addColorStop(0, store.bgColor1);
      grad.addColorStop(1, store.bgColor2);
      ctx.fillStyle = grad;
    } else {
      const grad = ctx.createRadialGradient(canvas.width / 2, canvas.height / 2, 0, canvas.width / 2, canvas.height / 2, canvas.width);
      grad.addColorStop(0, store.bgColor1);
      grad.addColorStop(1, store.bgColor2);
      ctx.fillStyle = grad;
    }
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  if (store.noiseAmount > 0) {
    ctx.save();
    ctx.globalCompositeOperation = 'overlay';
    for (let i = 0; i < canvas.width; i += 4) {
      for (let j = 0; j < canvas.height; j += 4) {
        if (Math.random() < store.noiseAmount) {
          ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.2})`;
          ctx.fillRect(i, j, 2, 2);
        }
      }
    }
    ctx.restore();
  }

  // 2. Adaptive Text Color Calculation
  const bgColor = store.bgImage ? '#000000' : store.bgColor1;
  const luminance = getLuminance(bgColor);
  const textColor = store.adaptiveText ? (luminance > 160 ? '#1e293b' : '#ffffff') : store.textColor;
  
  // 3. Draw Device Layers
  const layers = store.activeSlide.layers;
  for (const layer of layers) {
    await drawDeviceLayer(ctx, canvas, layer, textColor, overrideStyle);
  }

  // 4. Draw Typography (Top Level Overlay)
  await drawTypography(ctx, canvas, textColor);
}

async function drawTypography(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, textColor: string) {
  ctx.save();
  ctx.fillStyle = textColor;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.shadowColor = 'rgba(0,0,0,0.3)';
  ctx.shadowBlur = 25;
  ctx.shadowOffsetY = 10;

  const titleLines = store.title.split('\n');
  const subLines = store.subtitle.split('\n');
  const lineHeightTitle = store.fontSize * 1.1;
  const lineHeightSub = store.subtitleFontSize * 1.3;
  const gapBetweenTitleSubtitle = 30;

  let textY = canvas.height * 0.15; // Default Top
  if (store.layout === 'bottom') {
    textY = canvas.height * 0.85;
  }

  // Title
  ctx.font = `bold ${store.fontSize}px 'Inter', -apple-system, sans-serif`;
  titleLines.forEach((line, i) => {
    ctx.fillText(line, canvas.width / 2, textY + (i * lineHeightTitle) - (titleLines.length * lineHeightTitle / 2));
  });

  // Subtitle
  const subStartRow = titleLines.length;
  ctx.font = `500 ${store.subtitleFontSize}px 'Inter', -apple-system, sans-serif`;
  ctx.globalAlpha = 0.85;
  subLines.forEach((line, i) => {
    ctx.fillText(line, canvas.width / 2, textY + (titleLines.length * lineHeightTitle / 2) + gapBetweenTitleSubtitle + (i * lineHeightSub));
  });
  ctx.restore();
}

async function drawDeviceLayer(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, layer: any, textColor: string, overrideStyle?: string) {
  const frameStyle = overrideStyle || layer.frameStyle;
  if (frameStyle === 'none') return;

  const isIPad = frameStyle.includes('ipad');
  const is55 = frameStyle === 'iphone-5.5';
  
  let frameW = isIPad ? canvas.width * 0.82 : canvas.width * 0.85;
  let frameH = isIPad ? frameW * 1.33 : frameW * 2.16;
  if (is55) {
      frameW = canvas.width * 0.8;
      frameH = frameW * 1.77;
  }
  
  const borderRadius = isIPad ? 45 : 80;

  ctx.save();
  // Apply Transformations
  ctx.translate(canvas.width * (layer.x / 100), canvas.height * (layer.y / 100));
  ctx.rotate(layer.rotateZ * Math.PI / 180);
  ctx.scale(layer.scale, layer.scale);
  ctx.globalAlpha = layer.opacity || 1.0;

  const x = -frameW / 2;
  const y = -frameH / 2;

  // Shadow
  ctx.save();
  ctx.shadowColor = (textColor === '#ffffff') ? store.glowColor : 'rgba(0,0,0,0.15)';
  ctx.shadowBlur = layer.shadowBlur || 100;
  ctx.shadowOffsetY = 100;
  ctx.fillStyle = '#000000';
  if (is55) {
    ctx.fillRect(x, y, frameW, frameH);
  } else {
    roundRect(ctx, x, y, frameW, frameH, borderRadius);
    ctx.fill();
  }
  ctx.restore();

  // Screen Image
  if (layer.userImage) {
    try {
      const img = await loadImage(layer.userImage);
      ctx.save();
      if (is55) {
        ctx.beginPath(); ctx.rect(x, y, frameW, frameH); ctx.clip();
      } else {
        roundRect(ctx, x, y, frameW, frameH, borderRadius); ctx.clip();
      }
      ctx.drawImage(img, x, y, frameW, frameH);
      ctx.restore();
      drawDeviceBorderSingle(ctx, x, y, frameW, frameH, borderRadius, isIPad, is55, frameStyle);
    } catch (e) {
      drawDeviceBorderSingle(ctx, x, y, frameW, frameH, borderRadius, isIPad, is55, frameStyle);
    }
  } else {
    ctx.save();
    ctx.fillStyle = '#111';
    if (is55) {
      ctx.fillRect(x, y, frameW, frameH);
    } else {
      roundRect(ctx, x, y, frameW, frameH, borderRadius); ctx.fill();
    }
    ctx.restore();
    drawDeviceBorderSingle(ctx, x, y, frameW, frameH, borderRadius, isIPad, is55, frameStyle);
  }

  ctx.restore();
}

const drawDeviceBorderSingle = (ctx: CanvasRenderingContext2D, x: number, y: number, frameW: number, frameH: number, borderRadius: number, isIPad: boolean, is55: boolean, frameStyle: string) => {
  ctx.save();
  const borderThickness = 30;
  ctx.strokeStyle = '#1c1c1e';
  ctx.lineWidth = borderThickness;
  
  if (is55) {
     ctx.lineWidth = 60;
     ctx.strokeRect(x - 30, y - 180, frameW + 60, frameH + 360);
     ctx.strokeStyle = 'rgba(255,255,255,0.1)';
     ctx.lineWidth = 4;
     ctx.beginPath();
     ctx.arc(x + frameW/2, y + frameH + 90, 45, 0, Math.PI * 2);
     ctx.stroke();
  } else {
    roundRect(ctx, x - borderThickness/2, y - borderThickness/2, frameW + borderThickness, frameH + borderThickness, borderRadius + borderThickness/2);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 2.5;
    roundRect(ctx, x - 2, y - 2, frameW + 4, frameH + 4, borderRadius + 3);
    ctx.stroke();
  }

  if (!isIPad && !is55) {
    ctx.fillStyle = '#000000';
    roundRect(ctx, -130, y + 45, 260, 70, 35);
    ctx.fill();
  }
  ctx.restore();
};

const handleExport = async () => {
  const canvas = canvasRef.value;
  if (!canvas) return;
  try {
    const dataUrl = canvas.toDataURL('image/png');
    const base64Data = dataUrl.split(',')[1];
    const binaryData = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));
    if ((window as any).__TAURI_INTERNALS__) {
      const path = await save({
        filters: [{ name: 'PNG Image', extensions: ['png'] }],
        defaultPath: `${store.activeSlide.name}.png`
      });
      if (path) await writeFile(path, binaryData);
    } else {
      const link = document.createElement('a');
      link.download = `${store.activeSlide.name}-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    }
  } catch (err) {
    console.error('Export failed:', err);
  }
};

const handleBatchExport = async () => {
  const originalSlideIndex = store.activeSlideIndex;
  for (let i = 0; i < store.slides.length; i++) {
    store.activeSlideIndex = i;
    const originalLocale = store.activeSlide.activeLocale;
    for (const locale of store.projectLocales) {
      store.activeSlide.activeLocale = locale;
      for (const device of store.targetDevices) {
        await draw(device);
        await new Promise(r => setTimeout(r, 150)); 
        const canvas = canvasRef.value;
        if (!canvas) continue;
        const dataUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `${store.slides[i].name}_${locale}_${device}.png`;
        link.href = dataUrl;
        link.click();
      }
    }
    store.activeSlide.activeLocale = originalLocale;
  }
  store.activeSlideIndex = originalSlideIndex;
  await draw();
};

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

onMounted(() => {
  setTimeout(draw, 100);
  window.addEventListener('export-canvas', handleExport);
  window.addEventListener('batch-export-canvas', handleBatchExport);
});

onUnmounted(() => {
  window.removeEventListener('export-canvas', handleExport);
  window.removeEventListener('batch-export-canvas', handleBatchExport);
});

watch(() => store.$state, () => {
  draw();
}, { deep: true });

defineExpose({ draw });
</script>

<style scoped>
.canvas-container {
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
}
canvas {
  height: auto;
  max-width: 100%;
  max-height: 85vh;
  border-radius: 8px;
  box-shadow: 0 40px 80px rgba(0, 0, 0, 0.6);
}
</style>
