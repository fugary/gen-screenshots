import { defineStore } from 'pinia';

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
    noiseAmount: 0.05,
    glowColor: 'rgba(99, 102, 241, 0.5)',
    layout: 'top',
    frameStyle: 'iphone16-jet',
    userImage: null as string | null,
    language: 'zh-CN',
    theme: 'dark',
    zoomLevel: 1,
    currentTab: 'canvas'
  }),
  actions: {
    setProject(data: Partial<any>) {
      Object.assign(this.$state, data);
    },
    resetProject() {
      this.$state.title = 'New App Store Screenshot';
      this.$state.userImage = null;
    }
  },
  persist: true
});
