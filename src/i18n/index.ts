import { createI18n } from 'vue-i18n';

const messages = {
  'en-US': {
    app: {
      title: 'Screenshot Pro',
      subtitle: 'Premium App Store Assets'
    },
    controls: {
      headline: 'Headline',
      background: 'Background',
      fontSize: 'Font Size',
      layout: 'Layout',
      device: 'Device',
      effects: 'Visual Effects',
      noise: 'Noise Intensity',
      screenshot: 'Screenshot',
      export: 'Export PNG'
    }
  },
  'zh-CN': {
    app: {
      title: '截图标注 Pro',
      subtitle: '打造旗舰级商店素材'
    },
    controls: {
      headline: '主标题',
      background: '背景背景',
      fontSize: '字体大小',
      layout: '布局方式',
      device: '设备机型',
      effects: '视觉特效',
      noise: '噪点强度',
      screenshot: '屏幕截图',
      export: '导出图片'
    }
  }
};

const i18n = createI18n({
  legacy: false,
  locale: 'zh-CN',
  fallbackLocale: 'en-US',
  messages
});

export default i18n;
