import { defineStore } from 'pinia';

export interface ProjectState {
  id: string;
  name: string;
  title: string;
  subtitle: string;
  fontSize: number;
  subtitleFontSize: number;
  textColor: string;
  bgColor1: string;
  bgColor2: string;
  bgType: 'linear' | 'radial';
  bgImage: string | null;
  adaptiveText: boolean;
  noiseAmount: number;
  glowColor: string;
  layout: 'top' | 'bottom';
  frameStyle: string;
  userImage: string | null;
}

export const useScreenshotStore = defineStore('screenshot', {
  state: () => ({
    title: 'New App Store Screenshot',
    subtitle: 'Professional & Elegant Assets',
    fontSize: 130,
    subtitleFontSize: 60,
    textColor: '#ffffff',
    bgColor1: '#6366f1',
    bgColor2: '#a855f7',
    bgType: 'radial' as 'linear' | 'radial',
    bgImage: null as string | null,
    adaptiveText: true,
    noiseAmount: 0.05,
    glowColor: 'rgba(99, 102, 241, 0.5)',
    layout: 'top',
    frameStyle: 'iphone16-jet',
    userImage: null as string | null,
    language: 'zh-CN',
    theme: 'dark',
    zoomLevel: 1,
    currentTab: 'canvas',
    savedProjects: [] as ProjectState[]
  }),
  actions: {
    setProject(data: Partial<any>) {
      Object.assign(this.$state, data);
    },
    resetProject() {
      this.title = 'New App Store Screenshot';
      this.subtitle = 'Professional & Elegant Assets';
      this.userImage = null;
      this.bgImage = null;
    },
    saveProject(name: string) {
      const id = Date.now().toString();
      const currentConfig = { ...this.$state } as any;
      delete currentConfig.savedProjects;
      delete currentConfig.zoomLevel;
      delete currentConfig.currentTab;
      delete currentConfig.language;
      delete currentConfig.theme;
      
      this.savedProjects.push({
        id,
        name,
        ...currentConfig
      });
    },
    loadProject(id: string) {
      const project = this.savedProjects.find(p => p.id === id);
      if (project) {
        const { id: _, name: __, ...data } = project;
        Object.assign(this.$state, data);
      }
    },
    deleteProject(id: string) {
      this.savedProjects = this.savedProjects.filter(p => p.id !== id);
    }
  },
  persist: true
});
