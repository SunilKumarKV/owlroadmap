import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface PanelState {
  // Collapsed states
  builderCollapsed: boolean;
  previewCollapsed: boolean;
  markdownCollapsed: boolean;
  
  // Persisted panel sizes in percentages (totaling up to 100 or relative ratios)
  // Default: builder 30%, preview 40%, markdown 30%
  builderSize: number;
  previewSize: number;
  markdownSize: number;
  
  // Layout mode
  fullscreenPanel: 'builder' | 'preview' | 'markdown' | null;
  mobileViewMode: 'builder' | 'preview' | 'markdown';
  
  // Actions
  setBuilderCollapsed: (collapsed: boolean) => void;
  setPreviewCollapsed: (collapsed: boolean) => void;
  setMarkdownCollapsed: (collapsed: boolean) => void;
  setSizes: (builder: number, preview: number, markdown: number) => void;
  setFullscreenPanel: (panel: 'builder' | 'preview' | 'markdown' | null) => void;
  setMobileViewMode: (mode: 'builder' | 'preview' | 'markdown') => void;
  resetLayout: () => void;
}

export const usePanelStore = create<PanelState>()(
  persist(
    (set) => ({
      builderCollapsed: false,
      previewCollapsed: false,
      markdownCollapsed: false,
      
      builderSize: 32,
      previewSize: 38,
      markdownSize: 30,
      
      fullscreenPanel: null,
      mobileViewMode: 'builder',
      
      setBuilderCollapsed: (collapsed) => set({ builderCollapsed: collapsed }),
      setPreviewCollapsed: (collapsed) => set({ previewCollapsed: collapsed }),
      setMarkdownCollapsed: (collapsed) => set({ markdownCollapsed: collapsed }),
      
      setSizes: (builder, preview, markdown) => set({
        builderSize: builder,
        previewSize: preview,
        markdownSize: markdown
      }),
      
      setFullscreenPanel: (panel) => set({ fullscreenPanel: panel }),
      setMobileViewMode: (mode) => set({ mobileViewMode: mode }),
      
      resetLayout: () => set({
        builderCollapsed: false,
        previewCollapsed: false,
        markdownCollapsed: false,
        builderSize: 32,
        previewSize: 38,
        markdownSize: 30,
        fullscreenPanel: null,
        mobileViewMode: 'builder'
      }),
    }),
    {
      name: 'owlroadmap-panel-store',
    }
  )
);

export default usePanelStore;
