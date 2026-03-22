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

const draw = () => {
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
    const bgImg = new Image();
    bgImg.crossOrigin = "anonymous";
    bgImg.onload = () => {
      ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
      drawLayers(ctx, canvas, true);
    };
    bgImg.src = store.bgImage;
  } else {
    drawLayers(ctx, canvas, false);
  }
};

const drawLayers = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, hasBgImg: boolean) => {
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

  let textColor = store.textColor;
  if (store.adaptiveText) {
    const lum = getLuminance(store.bgColor1);
    textColor = lum > 160 ? '#1e293b' : '#ffffff';
  }

  let frameW = 910;
  let frameH = 1970;
  let borderRadius = 100;
  const isIPad = store.frameStyle.startsWith('ipad');
  const is55 = store.frameStyle === 'iphone-5.5';

  if (isIPad) {
    frameW = 1500;
    frameH = 2100;
    borderRadius = 60;
  } else if (store.frameStyle === 'iphone16-promax') {
    frameW = 980;
    frameH = 2120;
    borderRadius = 110;
  } else if (is55) {
    frameW = 1000;
    frameH = 1780;
    borderRadius = 0;
  }

  const titleLines = store.title.split('\n');
  const subLines = store.subtitle.split('\n');
  const lineHeightTitle = store.fontSize * 1.1;
  const lineHeightSub = store.subtitleFontSize * 1.1;
  const titleH = titleLines.length * lineHeightTitle;
  const subH = subLines.length * lineHeightSub;
  const gapBetweenTitleSubtitle = 20; // Explicit smaller gap
  const gapBetweenTextAndDevice = 100; // Slightly tighter
  const totalContentH = titleH + subH + gapBetweenTitleSubtitle + gapBetweenTextAndDevice + frameH;
  
  const startY = (canvas.height - totalContentH) / 2;
  let textY = startY + (store.fontSize / 2);
  let deviceY = textY + titleH + subH + gapBetweenTitleSubtitle + gapBetweenTextAndDevice - (store.fontSize / 2);

  if (store.layout === 'bottom') {
    deviceY = startY;
    textY = deviceY + frameH + gapBetweenTextAndDevice + (store.fontSize / 2);
  }

  ctx.fillStyle = textColor;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.shadowColor = 'rgba(0,0,0,0.3)';
  ctx.shadowBlur = 25;
  ctx.shadowOffsetY = 10;

  // Title
  ctx.font = `bold ${store.fontSize}px 'Inter', -apple-system, sans-serif`;
  titleLines.forEach((line, i) => {
    ctx.fillText(line, canvas.width / 2, textY + (i * lineHeightTitle));
  });

  // Subtitle
  const subStartRow = titleLines.length;
  ctx.font = `500 ${store.subtitleFontSize}px 'Inter', -apple-system, sans-serif`;
  ctx.globalAlpha = 0.85;
  subLines.forEach((line, i) => {
    ctx.fillText(line, canvas.width / 2, textY + (subStartRow * lineHeightTitle) + (i * lineHeightSub) + gapBetweenTitleSubtitle);
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

  if (store.userImage) {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      ctx.save();
      if (is55) {
        ctx.beginPath(); ctx.rect(x, y, frameW, frameH); ctx.clip();
      } else {
        roundRect(ctx, x, y, frameW, frameH, borderRadius); ctx.clip();
      }
      ctx.drawImage(img, x, y, frameW, frameH);
      ctx.restore();
      drawDeviceBorder(ctx, x, y, frameW, frameH, borderRadius, isIPad, is55);
    };
    img.src = store.userImage;
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
  const borderGrad = ctx.createLinearGradient(x, y, x + frameW, y + frameH);
  let color = '#1c1c1e';
  if (store.frameStyle.includes('gold')) color = '#d4c5b9';
  if (store.frameStyle.includes('silver')) color = '#e3e3e8';
  
  borderGrad.addColorStop(0, color);
  borderGrad.addColorStop(0.5, lightenColor(color, 45));
  borderGrad.addColorStop(1, color);

  ctx.strokeStyle = borderGrad;
  ctx.lineWidth = borderThickness;
  if (is55) {
     ctx.lineWidth = 60;
     ctx.strokeStyle = '#1c1c1e';
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
    ctx.fillStyle = 'rgba(255,255,255,0.06)';
    ctx.beginPath(); ctx.arc(canvasWidth.value/2 + 65, y + 80, 10, 0, Math.PI * 2); ctx.fill();
  } else if (isIPad) {
    ctx.fillStyle = 'rgba(255,255,255,0.12)';
    ctx.beginPath(); ctx.arc(canvasWidth.value / 2, y + 16, 5, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
};

const lightenColor = (col: string, amt: number) => {
  let usePound = false;
  if (col[0] == '#') {
    col = col.slice(1);
    usePound = true;
  }
  const num = parseInt(col, 16);
  let r = (num >> 16) + amt;
  if (r > 255) r = 255;
  else if (r < 0) r = 0;
  let b = ((num >> 8) & 0x00ff) + amt;
  if (b > 255) b = 255;
  else if (b < 0) b = 0;
  let g = (num & 0x0000ff) + amt;
  if (g > 255) g = 255;
  else if (g < 0) g = 0;
  return (usePound ? '#' : '') + (g | (b << 8) | (r << 16)).toString(16).padStart(6, '0');
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
        defaultPath: 'screenshot.png'
      });

      if (path) {
        await writeFile(path, binaryData);
      }
    } else {
      const link = document.createElement('a');
      link.download = `screenshot-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    }
  } catch (err) {
    console.error('Export failed:', err);
  }
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
});

onUnmounted(() => {
  window.removeEventListener('export-canvas', handleExport);
});

watch(() => store.$state, draw, { deep: true });

defineExpose({ draw });
</script>

<style scoped>
.canvas-container {
  display: flex;
  justify-content: center;
  align-items: center;
  background: #111;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: inset 0 0 40px rgba(0, 0, 0, 0.5);
  padding: 20px;
  height: calc(100vh - 80px);
}
canvas {
  height: 100%;
  width: auto;
  border-radius: 8px;
  box-shadow: 0 40px 80px rgba(0, 0, 0, 0.8);
}
</style>
