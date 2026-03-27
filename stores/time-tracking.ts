import { create } from "zustand";
import { persist } from "zustand/middleware";

type ViewMode = "content" | "knowledge-graph" | "presentation" | null;

interface ContentTimeTracking {
  elapsedTime: number;
  lastPauseTime: number | null;
}

interface TimeTrackingState {
  activeContentId: string | null;
  activeViewMode: ViewMode;
  startTime: number | null;
  contentTracking: Record<string, ContentTimeTracking>;
  isTracking: boolean;

  startTracking: (contentId: string, viewMode: ViewMode) => void;
  stopTracking: () => void;
  pauseTracking: () => void;
  resumeTracking: () => void;
  getTotalTime: () => number;
  resetTracking: () => void;
  clearContentTime: (contentId: string) => void;
}

export const useTimeTrackingStore = create<TimeTrackingState>()(
  persist(
    (set, get) => ({
      activeContentId: null,
      activeViewMode: null,
      startTime: null,
      contentTracking: {},
      isTracking: false,

      startTracking: (contentId: string, viewMode: ViewMode) => {
        const { contentTracking } = get();
        const existing = contentTracking[contentId] || {
          elapsedTime: 0,
          lastPauseTime: null,
        };

        set({
          activeContentId: contentId,
          activeViewMode: viewMode,
          startTime: Date.now(),
          contentTracking: {
            ...contentTracking,
            [contentId]: existing,
          },
          isTracking: true,
        });
      },

      stopTracking: () => {
        set({
          activeContentId: null,
          activeViewMode: null,
          startTime: null,
          isTracking: false,
        });
      },

      pauseTracking: () => {
        const { activeContentId, startTime, contentTracking } = get();
        if (startTime && activeContentId) {
          const sessionTime = Date.now() - startTime;
          const existing = contentTracking[activeContentId] || {
            elapsedTime: 0,
            lastPauseTime: null,
          };

          set({
            contentTracking: {
              ...contentTracking,
              [activeContentId]: {
                elapsedTime: existing.elapsedTime + sessionTime,
                lastPauseTime: Date.now(),
              },
            },
            startTime: null,
            isTracking: false,
          });
        }
      },

      resumeTracking: () => {
        const { activeContentId, activeViewMode, isTracking, startTime } =
          get();
        if (!isTracking && activeContentId) {
          const now = Date.now();
          const { contentTracking } = get();
          const existing = contentTracking[activeContentId] || {
            elapsedTime: 0,
            lastPauseTime: null,
          };

          const shouldResetStartTime =
            startTime && now - startTime > 5 * 60 * 1000;

          set({
            startTime: shouldResetStartTime ? now : startTime || now,
            isTracking: true,
          });
        }
      },

      getTotalTime: () => {
        const { activeContentId, startTime, contentTracking } = get();
        if (!activeContentId) return 0;

        const existing = contentTracking[activeContentId] || {
          elapsedTime: 0,
          lastPauseTime: null,
        };

        const sessionTime = startTime ? Date.now() - startTime : 0;
        return existing.elapsedTime + sessionTime;
      },

      resetTracking: () => {
        set({
          activeContentId: null,
          activeViewMode: null,
          startTime: null,
          isTracking: false,
        });
      },

      clearContentTime: (contentId: string) => {
        const { contentTracking } = get();
        const updatedTracking = { ...contentTracking };
        delete updatedTracking[contentId];

        set({
          contentTracking: updatedTracking,
        });
      },
    }),
    {
      name: "time-tracking-storage",
    },
  ),
);
