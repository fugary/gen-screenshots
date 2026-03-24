import { defineStore } from 'pinia';

export interface DeviceLayer {
  id: string;
  userImage: string | null;
  frameStyle: string;
  rotateZ: number; // Degrees
  scale: number;   // 0.1 to 2.0
  x: number;       // Percent of canvas width (0-100)
  y: number;       // Percent of canvas height (0-100)
  shadowBlur: number;
  opacity: number;
}

export interface Slide {
  id: string;
  name: string;
  locales: Record<string, { title: string; subtitle: string }>;
  activeLocale: string;
  
  // Design Layers
  layers: DeviceLayer[];
  
  // Legacy / Common settings
  bgType: 'linear' | 'radial';
  bgColor1: string;
  bgColor2: string;
  bgImage: string | null;
  textColor: string;
  glowColor: string;
  fontSize: number;
  subtitleFontSize: number;
  noiseAmount: number;
  adaptiveText: boolean;
  layout: 'top' | 'bottom';
  frameStyle: string; // Default frame for this slide
}

export interface ProjectState {
  slides: Slide[];
  activeSlideIndex: number;
  zoomLevel: number;
  language: 'zh-CN' | 'en-US';
  theme: 'dark' | 'light';
  currentTab: string;
  projectLocales: string[];
  targetDevices: string[];
}

const createDefaultLayer = (id: string, image: string | null = null, style: string = 'iphone-6.7'): DeviceLayer => ({
  id,
  userImage: image,
  frameStyle: style,
  rotateZ: 0,
  scale: 1.0,
  x: 50, // Center
  y: 60, // Lower center to make room for text
  shadowBlur: 100,
  opacity: 1.0
});

const createDefaultSlide = (id: string, name: string, defaultLocale: string = 'en-US'): Slide => {
  const locales: Record<string, { title: string; subtitle: string }> = {};
  locales[defaultLocale] = {
    title: 'Premium\nScreenshots',
    subtitle: 'Professional & Elegant Assets'
  };

  return {
    id,
    name,
    locales,
    activeLocale: defaultLocale,
    layers: [createDefaultLayer('layer-1')],
    bgType: 'linear',
    bgColor1: '#1e293b',
    bgColor2: '#0f172a',
    bgImage: null,
    textColor: '#ffffff',
    glowColor: 'rgba(99, 102, 241, 0.4)',
    fontSize: 108,
    subtitleFontSize: 55,
    noiseAmount: 0.05,
    adaptiveText: true,
    layout: 'top',
    frameStyle: 'iphone-6.7'
  };
};

export const useScreenshotStore = defineStore('screenshot', {
  state: () => ({
    slides: [
      createDefaultSlide('1', 'Slide 1', 'en-US')
    ],
    activeSlideIndex: 0,
    zoomLevel: 1.0,
    language: 'en-US' as 'zh-CN' | 'en-US',
    theme: 'dark' as 'dark' | 'light',
    currentTab: 'canvas',
    projectLocales: ['en-US'],
    targetDevices: ['iphone-6.7'],
    savedProjects: [] as { id: string; name: string; state: any }[]
  }),
  getters: {
    activeSlide: (state) => {
      return state.slides[state.activeSlideIndex] || state.slides[0] || null;
    },
    
    title: (state) => {
      const slide = state.slides[state.activeSlideIndex];
      return slide?.locales?.[slide.activeLocale]?.title || '';
    },
    subtitle: (state) => {
      const slide = state.slides[state.activeSlideIndex];
      return slide?.locales?.[slide.activeLocale]?.subtitle || '';
    },

    // First layer properties for easy access (legacy components)
    userImage: (state) => {
      const slide = state.slides[state.activeSlideIndex];
      return slide?.layers?.[0]?.userImage || null;
    },
    frameStyle: (state) => {
      const slide = state.slides[state.activeSlideIndex];
      return slide?.layers?.[0]?.frameStyle || 'iphone-6.7';
    },
    
    bgType: (state) => state.slides[state.activeSlideIndex]?.bgType || 'linear',
    bgColor1: (state) => state.slides[state.activeSlideIndex]?.bgColor1 || '#1e293b',
    bgColor2: (state) => state.slides[state.activeSlideIndex]?.bgColor2 || '#0f172a',
    bgImage: (state) => state.slides[state.activeSlideIndex]?.bgImage || null,
    textColor: (state) => state.slides[state.activeSlideIndex]?.textColor || '#ffffff',
    glowColor: (state) => state.slides[state.activeSlideIndex]?.glowColor || 'rgba(99, 102, 241, 0.4)',
    fontSize: (state) => state.slides[state.activeSlideIndex]?.fontSize || 108,
    subtitleFontSize: (state) => state.slides[state.activeSlideIndex]?.subtitleFontSize || 55,
    noiseAmount: (state) => state.slides[state.activeSlideIndex]?.noiseAmount || 0.04,
    adaptiveText: (state) => state.slides[state.activeSlideIndex]?.adaptiveText ?? true,
    layout: (state) => (state.slides[state.activeSlideIndex]?.layout || 'top') as 'top' | 'bottom',
  },
  actions: {
    setProject(updates: Partial<any>) {
      Object.assign(this.$state, updates);
    },
    updateActiveSlide(updates: Partial<Slide>) {
      const slide = this.slides[this.activeSlideIndex];
      if (slide) Object.assign(slide, updates);
    },
    updateActiveSlideLocale(data: Partial<{ title: string; subtitle: string }>) {
      const slide = this.slides[this.activeSlideIndex];
      if (slide && slide.locales[slide.activeLocale]) {
        Object.assign(slide.locales[slide.activeLocale], data);
      }
    },
    
    // Layer Actions
    addLayer(image: string | null = null) {
      const slide = this.activeSlide;
      if (slide) {
        slide.layers.push(createDefaultLayer(Date.now().toString(), image));
      }
    },
    updateLayer(layerId: string, updates: Partial<DeviceLayer>) {
      const slide = this.activeSlide;
      if (slide) {
        const layer = slide.layers.find(l => l.id === layerId);
        if (layer) Object.assign(layer, updates);
      }
    },
    removeLayer(index: number) {
      const slide = this.activeSlide;
      if (slide && slide.layers.length > 1) {
        slide.layers.splice(index, 1);
      }
    },

    // Layout Presets
    applyLayoutPreset(presetId: string) {
      if (!this.activeSlide) return;
      const slide = this.activeSlide;
      
      switch (presetId) {
        case 'tilted-duo':
          slide.layers = [
            { id: crypto.randomUUID(), x: 30, y: 55, scale: 0.8, rotateZ: -15, userImage: slide.layers[0]?.userImage || null, frameStyle: slide.frameStyle || 'iphone-6.7', shadowBlur: 100, opacity: 1.0 },
            { id: crypto.randomUUID(), x: 75, y: 55, scale: 0.8, rotateZ: -15, userImage: slide.layers[1]?.userImage || null, frameStyle: slide.frameStyle || 'iphone-6.7', shadowBlur: 100, opacity: 1.0 }
          ];
          break;
        case 'stacked-trio':
          slide.layers = [
            { id: crypto.randomUUID(), x: 20, y: 60, scale: 0.7, rotateZ: -10, userImage: slide.layers[0]?.userImage || null, frameStyle: slide.frameStyle || 'iphone-6.7', shadowBlur: 100, opacity: 1.0 },
            { id: crypto.randomUUID(), x: 50, y: 55, scale: 0.8, rotateZ: 0, userImage: slide.layers[1]?.userImage || null, frameStyle: slide.frameStyle || 'iphone-6.7', shadowBlur: 100, opacity: 1.0 },
            { id: crypto.randomUUID(), x: 80, y: 60, scale: 0.7, rotateZ: 10, userImage: slide.layers[2]?.userImage || null, frameStyle: slide.frameStyle || 'iphone-6.7', shadowBlur: 100, opacity: 1.0 }
          ];
          break;
        case 'center-hero':
          slide.layers = [{ id: crypto.randomUUID(), x: 50, y: 55, scale: 0.9, rotateZ: 0, userImage: slide.layers[0]?.userImage || null, frameStyle: slide.frameStyle || 'iphone-6.7', shadowBlur: 100, opacity: 1.0 }];
          break;
        case 'panorama-start':
          // Device peaks from the right edge
          slide.layers = [{ id: crypto.randomUUID(), x: 100, y: 55, scale: 1.0, rotateZ: 0, userImage: slide.layers[0]?.userImage || null, frameStyle: slide.frameStyle || 'iphone-6.7', shadowBlur: 100, opacity: 1.0 }];
          break;
        case 'panorama-end':
          // Device peaks from the left edge
          slide.layers = [{ id: crypto.randomUUID(), x: 0, y: 55, scale: 1.0, rotateZ: 0, userImage: slide.layers[0]?.userImage || null, frameStyle: slide.frameStyle || 'iphone-6.7', shadowBlur: 100, opacity: 1.0 }];
          break;
        case 'offset-right':
          slide.layers = [{ id: crypto.randomUUID(), x: 70, y: 60, rotateZ: -8, scale: 1.1, userImage: slide.layers[0]?.userImage || null, frameStyle: slide.frameStyle || 'iphone-6.7', shadowBlur: 100, opacity: 1.0 }];
          break;
        case 'feature-left':
          slide.layers = [{ id: crypto.randomUUID(), x: 30, y: 60, rotateZ: 5, scale: 0.9, userImage: slide.layers[0]?.userImage || null, frameStyle: slide.frameStyle || 'iphone-6.7', shadowBlur: 100, opacity: 1.0 }];
          break;
      }
    },

    applyTemplateSet(setId: string) {
      this.slides = []; // Clear current slides
      const defaultLocale = this.projectLocales[0] || 'en-US';
      
      if (setId === 'midnight-pro') {
        // 1. Intro Center
        const s1 = createDefaultSlide(Date.now().toString() + '1', 'Intro', defaultLocale);
        s1.bgColor1 = '#1e1e2e'; s1.bgColor2 = '#11111b';
        s1.layers[0] = { ...s1.layers[0], x: 50, y: 55, rotateZ: 0, scale: 1.05 };
        this.slides.push(s1);

        // 2. Feature Right
        const s2 = createDefaultSlide(Date.now().toString() + '2', 'Features', defaultLocale);
        s2.bgColor1 = '#1e1e2e'; s2.bgColor2 = '#11111b';
        s2.layers[0] = { ...s2.layers[0], x: 75, y: 60, rotateZ: -5, scale: 1.0 };
        this.slides.push(s2);

        // 3. Tilted Duo
        const s3 = createDefaultSlide(Date.now().toString() + '3', 'Comparison', defaultLocale);
        s3.bgColor1 = '#1e1e2e'; s3.bgColor2 = '#11111b';
        s3.layers = [createDefaultLayer('l1'), createDefaultLayer('l2')];
        s3.layers[0] = { ...s3.layers[0], x: 35, y: 65, rotateZ: -12, scale: 0.9 };
        s3.layers[1] = { ...s3.layers[1], x: 65, y: 55, rotateZ: 12, scale: 0.9 };
        this.slides.push(s3);

        // 4. Stacked Trio
        const s4 = createDefaultSlide(Date.now().toString() + '4', 'Gallery', defaultLocale);
        s4.bgColor1 = '#1e1e2e'; s4.bgColor2 = '#11111b';
        s4.layers = [createDefaultLayer('l1'), createDefaultLayer('l2'), createDefaultLayer('l3')];
        s4.layers[0] = { ...s4.layers[0], x: 50, y: 60, rotateZ: 0, scale: 1.05 };
        s4.layers[1] = { ...s4.layers[1], x: 20, y: 65, rotateZ: -10, scale: 0.85 };
        s4.layers[2] = { ...s4.layers[2], x: 80, y: 65, rotateZ: 10, scale: 0.85 };
        this.slides.push(s4);

        // 5. Outro Zoom
        const s5 = createDefaultSlide(Date.now().toString() + '5', 'Download', defaultLocale);
        s5.bgColor1 = '#1e1e2e'; s5.bgColor2 = '#11111b';
        s5.layers[0] = { ...s5.layers[0], x: 50, y: 80, rotateZ: 0, scale: 1.4 };
        this.slides.push(s5);
      }
      
      this.activeSlideIndex = 0;
    },

    addLocale(locale: string) {
      if (!this.projectLocales.includes(locale)) {
        this.projectLocales.push(locale);
        this.slides.forEach(slide => {
          if (!slide.locales[locale]) slide.locales[locale] = { title: '', subtitle: '' };
        });
      }
    },
    removeLocale(locale: string) {
      if (this.projectLocales.length <= 1) return;
      this.projectLocales = this.projectLocales.filter(l => l !== locale);
      this.slides.forEach(slide => {
        delete slide.locales[locale];
        if (slide.activeLocale === locale) slide.activeLocale = this.projectLocales[0];
      });
    },

    async batchAddSlides(images: string[]) {
      for (const img of images) {
        const newSlide = createDefaultSlide(Date.now().toString() + Math.random(), `Slide ${this.slides.length + 1}`, this.projectLocales[0]);
        newSlide.layers[0].userImage = img;
        this.slides.push(newSlide);
      }
      this.activeSlideIndex = this.slides.length - 1;
    },
    addSlide() {
      const newSlide = createDefaultSlide(Date.now().toString(), `Slide ${this.slides.length + 1}`, this.projectLocales[0]);
      this.slides.push(newSlide);
      this.activeSlideIndex = this.slides.length - 1;
    },
    deleteSlide(index: number) {
      if (this.slides.length <= 1) return;
      this.slides.splice(index, 1);
      if (this.activeSlideIndex >= this.slides.length) this.activeSlideIndex = this.slides.length - 1;
    },
    duplicateSlide(index: number) {
      const source = this.slides[index];
      const copy = JSON.parse(JSON.stringify(source));
      copy.id = Date.now().toString();
      copy.name = `${source.name} (Copy)`;
      this.slides.splice(index + 1, 0, copy);
      this.activeSlideIndex = index + 1;
    },
    saveProject(name: string) {
      const stateToSave = { ...this.$state };
      delete (stateToSave as any).savedProjects;
      this.savedProjects.push({
        id: Date.now().toString(),
        name,
        state: JSON.parse(JSON.stringify(stateToSave))
      });
    },
    loadProject(id: string) {
      const p = this.savedProjects.find(i => i.id === id);
      if (p) {
        const state = JSON.parse(JSON.stringify(p.state));
        
        // Comprehensive Migration
        if (state.slides) {
          state.slides.forEach((slide: any) => {
            // Language Migration
            if (!slide.locales) {
              const oldTitle = slide.title || '';
              const oldSubtitle = slide.subtitle || '';
              slide.locales = {
                'en-US': { title: oldTitle, subtitle: oldSubtitle },
                'zh-CN': { title: oldTitle, subtitle: oldSubtitle }
              };
              slide.activeLocale = 'en-US';
            }
            
            // Layer Migration
            if (!slide.layers) {
              slide.layers = [createDefaultLayer('layer-1', slide.userImage, slide.frameStyle || 'iphone-6.7')];
              delete slide.userImage;
              delete slide.frameStyle;
            }
          });
        }
        
        Object.assign(this.$state, state);
      }
    },
    migrateState() {
      if (this.slides) {
        this.slides.forEach((slide: any) => {
          // Language Migration
          if (!slide.locales) {
            const oldTitle = slide.title || '';
            const oldSubtitle = slide.subtitle || '';
            slide.locales = {
              'en-US': { title: oldTitle, subtitle: oldSubtitle },
              'zh-CN': { title: oldTitle, subtitle: oldSubtitle }
            };
            slide.activeLocale = 'en-US';
            delete slide.title;
            delete slide.subtitle;
          }
          
          // Layer Migration
          if (!slide.layers) {
            slide.layers = [{
              id: 'layer-1',
              userImage: slide.userImage || null,
              frameStyle: slide.frameStyle || 'iphone-6.7',
              rotateZ: 0,
              scale: 1.0,
              x: 50,
              y: 60,
              shadowBlur: 100,
              opacity: 1.0
            }];
            delete slide.userImage;
            delete slide.frameStyle;
          }
        });
      }
      
      if (!this.projectLocales) this.projectLocales = ['en-US'];
      if (!this.targetDevices) {
        const firstFrame = this.slides[0]?.layers?.[0]?.frameStyle || 'iphone-6.7';
        this.targetDevices = [firstFrame];
      }
    },
    deleteProject(id: string) {
      this.savedProjects = this.savedProjects.filter(p => p.id !== id);
    }
  },
  persist: true
});
