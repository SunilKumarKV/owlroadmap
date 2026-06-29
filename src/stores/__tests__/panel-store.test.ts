import { describe, it, expect, beforeEach } from 'vitest';
import { usePanelStore } from '../panel-store';

describe('panel store tests', () => {
  beforeEach(() => {
    usePanelStore.getState().resetLayout();
  });

  it('should initialize with default layout values', () => {
    const state = usePanelStore.getState();
    expect(state.builderCollapsed).toBe(false);
    expect(state.previewCollapsed).toBe(false);
    expect(state.markdownCollapsed).toBe(false);
    expect(state.builderSize).toBe(32);
    expect(state.previewSize).toBe(38);
    expect(state.markdownSize).toBe(30);
    expect(state.fullscreenPanel).toBeNull();
    expect(state.mobileViewMode).toBe('builder');
  });

  it('should support collapsing and expanding panels', () => {
    const store = usePanelStore.getState();
    
    store.setBuilderCollapsed(true);
    expect(usePanelStore.getState().builderCollapsed).toBe(true);

    store.setMarkdownCollapsed(true);
    expect(usePanelStore.getState().markdownCollapsed).toBe(true);

    store.setPreviewCollapsed(true);
    expect(usePanelStore.getState().previewCollapsed).toBe(true);
  });

  it('should support updating panel sizes', () => {
    const store = usePanelStore.getState();
    store.setSizes(25, 50, 25);
    
    const state = usePanelStore.getState();
    expect(state.builderSize).toBe(25);
    expect(state.previewSize).toBe(50);
    expect(state.markdownSize).toBe(25);
  });

  it('should set fullscreen panel', () => {
    const store = usePanelStore.getState();
    store.setFullscreenPanel('preview');
    expect(usePanelStore.getState().fullscreenPanel).toBe('preview');
  });

  it('should set mobile view mode', () => {
    const store = usePanelStore.getState();
    store.setMobileViewMode('markdown');
    expect(usePanelStore.getState().mobileViewMode).toBe('markdown');
  });
});
