<template>
  <div
    ref="containerRef"
    class="canvas-container"
  >
    <canvas
      ref="canvasRef"
      :width="canvasWidth"
      :height="canvasHeight"
    />
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

const canvasWidth = 1290;
const canvasHeight = 2796;

const draw = () => {
  const canvas = canvasRef.value;
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 1. Background
  if (store.bgType === 'radial') {
    const grad = ctx.createRadialGradient(
      canvas.width / 2, canvas.height / 2, 0,
      canvas.width / 2, canvas.height / 2, canvas.height
    );
    grad.addColorStop(0, store.bgColor1);
    grad.addColorStop(1, store.bgColor2);
    ctx.fillStyle = grad;
  } else {
    const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    grad.addColorStop(0, store.bgColor1);
    grad.addColorStop(1, store.bgColor2);
    ctx.fillStyle = grad;
  }
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Noise Texture
  if (store.noiseAmount > 0) {
    ctx.save();
    ctx.globalAlpha = store.noiseAmount;
    ctx.globalCompositeOperation = 'overlay';
    for (let i = 0; i < 5000; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const size = Math.random() * 2 + 1;
      ctx.fillStyle = Math.random() > 0.5 ? '#fff' : '#000';
      ctx.fillRect(x, y, size, size);
    }
    ctx.restore();
  }

  // 2. Text
  ctx.fillStyle = store.textColor;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `bold ${store.fontSize}px 'Inter', -apple-system, sans-serif`;
  
  // High-end Text Shadow
  ctx.shadowColor = 'rgba(0,0,0,0.3)';
  ctx.shadowBlur = 20;
  ctx.shadowOffsetY = 10;

  const lines = store.title.split('\n');
  let textY = (store.layout === 'bottom') ? 2450 : 380;
  lines.forEach((line, i) => {
    ctx.fillText(line, canvas.width / 2, textY + (i * store.fontSize * 1.15));
  });
  ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;

  // 3. Image & Frame logic
  if (store.userImage) {
    const img = new Image();
    img.onload = () => {
      ctx.save();
      let frameW = 910;
      let frameH = 1970;
      let x = (canvas.width - frameW) / 2;
      let y = (store.layout === 'bottom') ? 350 : 680;

      // Realistic Device Glow
      ctx.shadowColor = store.glowColor;
      ctx.shadowBlur = 150;
      ctx.shadowOffsetY = 80;

      ctx.save();
      roundRect(ctx, x, y, frameW, frameH, 100);
      ctx.clip();
      ctx.drawImage(img, x, y, frameW, frameH);
      ctx.restore();

      // Device Border
      if (store.frameStyle !== 'none') {
        ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
        
        const borderGrad = ctx.createLinearGradient(x, y, x + frameW, y + frameH);
        let color = '#1c1c1e';
        if (store.frameStyle === 'iphone16-gold') color = '#d4c5b9';
        if (store.frameStyle === 'iphone16-silver') color = '#e3e3e8';
        
        borderGrad.addColorStop(0, color);
        borderGrad.addColorStop(0.5, lightenColor(color, 40));
        borderGrad.addColorStop(1, color);

        ctx.strokeStyle = borderGrad;
        ctx.lineWidth = 44;
        roundRect(ctx, x - 22, y - 22, frameW + 44, frameH + 44, 125);
        ctx.stroke();

        // Screen Bezel
        ctx.strokeStyle = 'rgba(255,255,255,0.15)';
        ctx.lineWidth = 2;
        roundRect(ctx, x - 2, y - 2, frameW + 4, frameH + 4, 102);
        ctx.stroke();

        // Dynamic Island
        ctx.fillStyle = '#000000';
        roundRect(ctx, canvas.width/2 - 150, y + 40, 300, 80, 40);
        ctx.fill();
        
        // Sensor details
        ctx.fillStyle = 'rgba(255,255,255,0.1)';
        ctx.beginPath();
        ctx.arc(canvas.width/2 + 80, y + 80, 10, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    };
    img.src = store.userImage;
  }
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
  return (usePound ? '#' : '') + (g | (b << 8) | (r << 16)).toString(16);
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
        filters: [
          {
            name: 'PNG Image',
            extensions: ['png']
          }
        ],
        defaultPath: 'screenshot.png'
      });

      if (path) {
        await writeFile(path, binaryData);
      }
    } else {
      // Browser Fallback
      const link = document.createElement('a');
      link.download = `screenshot-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    }
  } catch (err) {
    console.error('Export failed:', err);
  }
};

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
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
  draw();
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
