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
      projects: 'Saved Projects',
      export: 'Export PNG',
      contentLanguage: 'Content Language',
      projectLanguages: 'Project Languages',
      exportTargets: 'Export Targets',
      previewDevice: 'Preview Device'
    }
  },
  'zh-CN': {
    app: {
      title: '截图标注 Pro',
      subtitle: '打造旗舰级商店素材'
    },
    controls: {
      headline: '主标题',
      background: '背景设置',
      fontSize: '字体大小',
      layout: '布局方式',
      device: '设备机型',
      effects: '视觉特效',
      noise: '噪点强度',
      screenshot: '屏幕截图',
      projects: '项目存档',
      export: '导出图片',
      contentLanguage: '文字内容语言',
      projectLanguages: '项目支持语言',
      exportTargets: '导出目标 (设备)',
      previewDevice: '预览设备尺寸'
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
