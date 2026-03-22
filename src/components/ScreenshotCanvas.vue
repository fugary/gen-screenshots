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

const getCanvasDimensions = () => {
  switch (store.frameStyle) {
    case 'iphone16-promax': return { width: 1320, height: 2868 }; // 6.9"
    case 'iphone-6.7': return { width: 1290, height: 2796 }; // 6.7"
    case 'iphone-6.5': return { width: 1242, height: 2688 }; // 6.5"
    case 'iphone-5.5': return { width: 1242, height: 2208 }; // 5.5"
    case 'ipad-13': return { width: 2048, height: 2732 };    // iPad Pro 12.9"/13"
    case 'ipad-11': return { width: 1668, height: 2388 };    // iPad Pro 11"
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

const draw = async () => {
  const canvas = canvasRef.value;
  if (!canvas) return;
  
  if (!ctxRef.value) {
    ctxRef.value = canvas.getContext('2d');
  }
  const ctx = ctxRef.value;
  if (!ctx) return;

  const dims = getCanvasDimensions();
  canvasWidth.value = dims.width;
  canvasHeight.value = dims.height;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  if (store.bgImage) {
    try {
      const bgImg = await loadImage(store.bgImage);
      ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
      await drawLayers(ctx, canvas, true);
    } catch (e) {
      console.error("Failed to load background image", e);
      await drawLayers(ctx, canvas, false);
    }
  } else {
    await drawLayers(ctx, canvas, false);
  }
};

const drawLayers = async (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, hasBgImg: boolean) => {
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

  // Adaptive Text Color
  const bgColor = store.bgImage ? '#000000' : store.bgColor1;
  const luminance = getLuminance(bgColor);
  const textColor = store.adaptiveText ? (luminance > 160 ? '#1e293b' : '#ffffff') : store.textColor;
  
  ctx.fillStyle = textColor;
  
  const isIPad = store.frameStyle.includes('ipad');
  const is55 = store.frameStyle === 'iphone-5.5';
  
  let frameW = isIPad ? canvas.width * 0.82 : canvas.width * 0.85;
  let frameH = isIPad ? frameW * 1.33 : frameW * 2.16;
  if (is55) {
      frameW = canvas.width * 0.8;
      frameH = frameW * 1.77;
  }
  
  const borderRadius = isIPad ? 45 : 80;

  // Content Grouping & Centering
  const titleLines = store.activeSlide.title.split('\n');
  const subLines = store.activeSlide.subtitle.split('\n');
  const lineHeightTitle = store.fontSize * 1.1;
  const lineHeightSub = store.subtitleFontSize * 1.3;
  const gapBetweenTitleSubtitle = 30;
  const gapBetweenTextAndDevice = 60;

  const totalTextHeight = (titleLines.length * lineHeightTitle) + (subLines.length * lineHeightSub) + gapBetweenTitleSubtitle;
  const totalContentHeight = totalTextHeight + gapBetweenTextAndDevice + frameH;
  
  const startY = (canvas.height - totalContentHeight) / 2;
  let textY = startY + (titleLines.length * lineHeightTitle / 2);
  let deviceY = startY + totalTextHeight + gapBetweenTextAndDevice;

  if (store.layout === 'bottom') {
    deviceY = startY;
    textY = startY + frameH + gapBetweenTextAndDevice + (titleLines.length * lineHeightTitle / 2);
  }

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.shadowColor = 'rgba(0,0,0,0.3)';
  ctx.shadowBlur = 25;
  ctx.shadowOffsetY = 10;

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
    ctx.fillText(line, canvas.width / 2, textY + (subLines.length > 0 ? (lineHeightTitle * titleLines.length / 2) + gapBetweenTitleSubtitle + (i * lineHeightSub) : 0));
  });
  ctx.globalAlpha = 1.0;
  ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;

  const x = (canvas.width - frameW) / 2;
  const y = deviceY;

  if (store.frameStyle !== 'none') {
    ctx.save();
    ctx.shadowColor = (textColor === '#ffffff') ? store.glowColor : 'rgba(0,0,0,0.15)';
    ctx.shadowBlur = 180;
    ctx.shadowOffsetY = 100;
    ctx.fillStyle = '#000000';
    if (is55) {
      ctx.fillRect(x, y, frameW, frameH);
    } else {
      roundRect(ctx, x, y, frameW, frameH, borderRadius);
      ctx.fill();
    }
    ctx.restore();
  }

  if (store.activeSlide.userImage) {
    try {
      const img = await loadImage(store.activeSlide.userImage);
      ctx.save();
      if (is55) {
        ctx.beginPath(); ctx.rect(x, y, frameW, frameH); ctx.clip();
      } else {
        roundRect(ctx, x, y, frameW, frameH, borderRadius); ctx.clip();
      }
      ctx.drawImage(img, x, y, frameW, frameH);
      ctx.restore();
      drawDeviceBorder(ctx, x, y, frameW, frameH, borderRadius, isIPad, is55);
    } catch (e) {
      console.error("Failed to load user image", e);
      drawDeviceBorder(ctx, x, y, frameW, frameH, borderRadius, isIPad, is55);
    }
  } else {
    ctx.save();
    ctx.fillStyle = '#111';
    if (is55) {
      ctx.fillRect(x, y, frameW, frameH);
    } else {
      roundRect(ctx, x, y, frameW, frameH, borderRadius); ctx.fill();
    }
    const screenGrad = ctx.createLinearGradient(x, y, x, y + frameH);
    screenGrad.addColorStop(0, 'rgba(255,255,255,0.06)');
    screenGrad.addColorStop(0.5, 'rgba(255,255,255,0)');
    screenGrad.addColorStop(1, 'rgba(255,255,255,0.03)');
    ctx.fillStyle = screenGrad;
    if (is55) {
      ctx.fillRect(x, y, frameW, frameH);
    } else {
      roundRect(ctx, x, y, frameW, frameH, borderRadius); ctx.fill();
    }
    ctx.restore();
    drawDeviceBorder(ctx, x, y, frameW, frameH, borderRadius, isIPad, is55);
  }
};

const drawDeviceBorder = (ctx: CanvasRenderingContext2D, x: number, y: number, frameW: number, frameH: number, borderRadius: number, isIPad: boolean, is55: boolean) => {
  if (store.frameStyle === 'none') return;
  
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
    roundRect(ctx, canvasWidth.value/2 - 130, y + 45, 260, 70, 35);
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

      if (path) {
        await writeFile(path, binaryData);
      }
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
  const originalIndex = store.activeSlideIndex;
  
  for (let i = 0; i < store.slides.length; i++) {
    store.activeSlideIndex = i;
    await draw();
    await new Promise(r => setTimeout(r, 100)); // Small buffer
    
    const canvas = canvasRef.value;
    if (!canvas) continue;

    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `${store.slides[i].name}.png`;
    link.href = dataUrl;
    link.click();
  }
  
  store.activeSlideIndex = originalIndex;
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
