import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type RoadmapField = 'title' | 'steps';

interface RoadmapState {
  title: string;
  steps: string[];
  setField: (field: RoadmapField, value: string | string[]) => void;
}

const useRoadmapStore = create<RoadmapState>()(
  persist(
    (set) => ({
      title: '',
      steps: [],
      setField: (field, value) => set({ [field]: value } as Partial<RoadmapState>),
    }),
    { name: 'roadmap-store' }
  )
);

export default useRoadmapStore;