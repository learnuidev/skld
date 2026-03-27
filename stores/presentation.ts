import { create } from "zustand";
import { persist } from "zustand/middleware";

interface PresentationSlideState {
  currentIndex: number;
  slideSteps: Record<number, number>;
}

interface PresentationState {
  presentationStates: Record<string, PresentationSlideState>;

  setPresentationState: (
    contentId: string,
    state: PresentationSlideState,
  ) => void;
  getPresentationState: (contentId: string) => PresentationSlideState | null;
  clearPresentationState: (contentId: string) => void;
}

const defaultState: PresentationSlideState = {
  currentIndex: -1,
  slideSteps: {},
};

export const usePresentationStore = create<PresentationState>()(
  persist(
    (set, get) => ({
      presentationStates: {},

      setPresentationState: (
        contentId: string,
        state: PresentationSlideState,
      ) => {
        set({
          presentationStates: {
            ...get().presentationStates,
            [contentId]: state,
          },
        });
      },

      getPresentationState: (contentId: string) => {
        return get().presentationStates[contentId] || null;
      },

      clearPresentationState: (contentId: string) => {
        const states = get().presentationStates;
        const updatedStates = { ...states };
        delete updatedStates[contentId];

        set({
          presentationStates: updatedStates,
        });
      },
    }),
    {
      name: "presentation-storage",
    },
  ),
);
