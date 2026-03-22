import { defineStore } from 'pinia';

export interface Slide {
  id: string;
  title: string;
  subtitle: string;
  userImage: string | null;
  name: string;
}

export interface ProjectState {
  slides: Slide[];
  activeSlideIndex: number;
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
  zoomLevel: number;
  language: 'zh-CN' | 'en-US';
  theme: 'dark' | 'light';
  currentTab: string;
}

export const useScreenshotStore = defineStore('screenshot', {
  state: () => ({
    slides: [
      { id: '1', title: 'Premium\nScreenshots', subtitle: 'Professional & Elegant Assets', userImage: null as string | null, name: 'Slide 1' }
    ],
    activeSlideIndex: 0,
    bgType: 'linear' as 'linear' | 'radial',
    bgColor1: '#1e293b',
    bgColor2: '#0f172a',
    bgImage: null as string | null,
    frameStyle: 'iphone-6.7',
    textColor: '#ffffff',
    glowColor: 'rgba(99, 102, 241, 0.4)',
    fontSize: 108,
    subtitleFontSize: 55,
    noiseAmount: 0.04,
    adaptiveText: true,
    layout: 'top' as 'top' | 'bottom',
    zoomLevel: 1.0,
    language: 'zh-CN' as 'zh-CN' | 'en-US',
    theme: 'dark' as 'dark' | 'light',
    currentTab: 'canvas',
    savedProjects: [] as { id: string; name: string; state: any }[]
  }),
  getters: {
    activeSlide: (state) => state.slides[state.activeSlideIndex] || state.slides[0],
    title: (state) => state.slides[state.activeSlideIndex]?.title || '',
    subtitle: (state) => state.slides[state.activeSlideIndex]?.subtitle || '',
    userImage: (state) => state.slides[state.activeSlideIndex]?.userImage || null,
  },
  actions: {
    setProject(updates: Partial<any>) {
      Object.assign(this.$state, updates);
    },
    updateActiveSlide(updates: Partial<Slide>) {
      const slide = this.slides[this.activeSlideIndex];
      if (slide) Object.assign(slide, updates);
    },
    addSlide() {
      const newSlide: Slide = {
        id: Date.now().toString(),
        title: 'New Headline',
        subtitle: 'Enter description...',
        userImage: null,
        name: `Slide ${this.slides.length + 1}`
      };
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
      const copy = { ...source, id: Date.now().toString(), name: `${source.name} (Copy)` };
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
          state.slides = [
            { 
              id: '1', 
              title: state.title || 'Premium\nScreenshots', 
              subtitle: state.subtitle || 'Professional & Elegant Assets', 
              userImage: (state.userImage as string | null) || null, 
              name: 'Imported Slide' 
            }
          ];
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
