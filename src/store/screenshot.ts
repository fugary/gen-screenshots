import { defineStore } from 'pinia';

export interface Slide {
  id: string;
  name: string;
  title: string;
  subtitle: string;
  userImage: string | null;
  // Per-slide settings
  bgType: 'linear' | 'radial';
  bgColor1: string;
  bgColor2: string;
  bgImage: string | null;
  frameStyle: string;
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
}

const createDefaultSlide = (id: string, name: string): Slide => ({
  id,
  name,
  title: 'Premium\nScreenshots',
  subtitle: 'Professional & Elegant Assets',
  userImage: null,
  bgType: 'linear',
  bgColor1: '#1e293b',
  bgColor2: '#0f172a',
  bgImage: null,
  frameStyle: 'iphone-6.7',
  textColor: '#ffffff',
  glowColor: 'rgba(99, 102, 241, 0.4)',
  fontSize: 108,
  subtitleFontSize: 55,
  noiseAmount: 0.04,
  adaptiveText: true,
  layout: 'top'
});

export const useScreenshotStore = defineStore('screenshot', {
  state: () => ({
    slides: [
      createDefaultSlide('1', 'Slide 1')
    ],
    activeSlideIndex: 0,
    zoomLevel: 1.0,
    language: 'zh-CN' as 'zh-CN' | 'en-US',
    theme: 'dark' as 'dark' | 'light',
    currentTab: 'canvas',
    savedProjects: [] as { id: string; name: string; state: any }[]
  }),
  getters: {
    activeSlide: (state) => state.slides[state.activeSlideIndex] || state.slides[0],
    // Map active slide properties to top level for easy access
    title: (state) => state.slides[state.activeSlideIndex]?.title || '',
    subtitle: (state) => state.slides[state.activeSlideIndex]?.subtitle || '',
    userImage: (state) => state.slides[state.activeSlideIndex]?.userImage || null,
    bgType: (state) => state.slides[state.activeSlideIndex]?.bgType || 'linear',
    bgColor1: (state) => state.slides[state.activeSlideIndex]?.bgColor1 || '#1e293b',
    bgColor2: (state) => state.slides[state.activeSlideIndex]?.bgColor2 || '#0f172a',
    bgImage: (state) => state.slides[state.activeSlideIndex]?.bgImage || null,
    frameStyle: (state) => state.slides[state.activeSlideIndex]?.frameStyle || 'iphone-6.7',
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
    async batchAddSlides(images: string[]) {
      for (const img of images) {
        const newSlide = createDefaultSlide(Date.now().toString() + Math.random(), `Slide ${this.slides.length + 1}`);
        newSlide.userImage = img;
        this.slides.push(newSlide);
      }
      this.activeSlideIndex = this.slides.length - 1;
    },
    addSlide() {
      const newSlide = createDefaultSlide(Date.now().toString(), `Slide ${this.slides.length + 1}`);
      this.slides.push(newSlide);
      this.activeSlideIndex = this.slides.length - 1;
    },
    deleteSlide(index: number) {
      if (this.slides.length <= 1) return;
      this.slides.splice(index, 1);
      if (this.activeSlideIndex >= this.slides.length) {
        this.activeSlideIndex = this.slides.length - 1;
      }
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
        // Backward compatibility migration
        if (!state.slides) {
          const defaultSlide = createDefaultSlide('1', 'Imported Slide');
          Object.assign(defaultSlide, {
            title: state.title,
            subtitle: state.subtitle,
            userImage: state.userImage,
            bgType: state.bgType,
            bgColor1: state.bgColor1,
            bgColor2: state.bgColor2,
            bgImage: state.bgImage,
            frameStyle: state.frameStyle,
            textColor: state.textColor,
            glowColor: state.glowColor,
            fontSize: state.fontSize,
            subtitleFontSize: state.subtitleFontSize,
            noiseAmount: state.noiseAmount,
            adaptiveText: state.adaptiveText,
            layout: state.layout
          });
          state.slides = [defaultSlide];
          state.activeSlideIndex = 0;
        }
        Object.assign(this.$state, state);
      }
    },
    deleteProject(id: string) {
      this.savedProjects = this.savedProjects.filter(p => p.id !== id);
    }
  },
  persist: true
});
