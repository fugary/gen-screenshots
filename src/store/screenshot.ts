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
    noiseAmount: 0.04,
    adaptiveText: true,
    layout: 'top'
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
    activeSlide: (state) => state.slides[state.activeSlideIndex] || state.slides[0],
    
    title: (state) => {
      const slide = state.slides[state.activeSlideIndex];
      return slide?.locales[slide.activeLocale]?.title || '';
    },
    subtitle: (state) => {
      const slide = state.slides[state.activeSlideIndex];
      return slide?.locales[slide.activeLocale]?.subtitle || '';
    },

    // First layer properties for easy access (legacy components)
    userImage: (state) => state.slides[state.activeSlideIndex]?.layers[0]?.userImage || null,
    frameStyle: (state) => state.slides[state.activeSlideIndex]?.layers[0]?.frameStyle || 'iphone-6.7',
    
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
      const slide = this.activeSlide;
      if (!slide) return;
      
      switch (presetId) {
        case 'tilted-duo':
          if (slide.layers.length < 2) this.addLayer();
          slide.layers[0] = { ...slide.layers[0], x: 35, y: 65, rotateZ: -12, scale: 0.9 };
          slide.layers[1] = { ...slide.layers[1], x: 65, y: 55, rotateZ: 12, scale: 0.9 };
          break;
        case 'stacked-trio':
          while (slide.layers.length < 3) this.addLayer();
          slide.layers[0] = { ...slide.layers[0], x: 50, y: 60, rotateZ: 0, scale: 1.0 };
          slide.layers[1] = { ...slide.layers[1], x: 25, y: 65, rotateZ: -10, scale: 0.85 };
          slide.layers[2] = { ...slide.layers[2], x: 75, y: 65, rotateZ: 10, scale: 0.85 };
          break;
        case 'offset-right':
          slide.layers[0] = { ...slide.layers[0], x: 70, y: 60, rotateZ: -8, scale: 1.1 };
          break;
      }
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
