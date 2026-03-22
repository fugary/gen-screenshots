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
      background: '背景颜色',
      fontSize: '字体大小',
      layout: '页面布局',
      device: '设备模板',
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
