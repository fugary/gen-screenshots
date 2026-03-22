import { describe, it, expect, beforeEach } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { useScreenshotStore } from '@/store/screenshot';

describe('Screenshot Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('should have initial state', () => {
    const store = useScreenshotStore();
    expect(store.title).toBe('New App Store Screenshot');
    expect(store.fontSize).toBe(130);
  });

  it('should update project data', () => {
    const store = useScreenshotStore();
    store.setProject({ title: 'Updated Title', fontSize: 150 });
    expect(store.title).toBe('Updated Title');
    expect(store.fontSize).toBe(150);
  });
});
