import { create } from "zustand";
import { persist } from "zustand/middleware";

interface PinState {
  /** specKey -> Set of pinned operation IDs (stored as arrays for serialization) */
  pins: Record<string, string[]>;

  togglePin: (specKey: string, operationId: string) => void;
  isPinned: (specKey: string, operationId: string) => boolean;
  getPins: (specKey: string) => string[];
  clearPins: (specKey: string) => void;
}

export const usePinStore = create<PinState>()(
  persist(
    (set, get) => ({
      pins: {},

      togglePin: (specKey, operationId) => {
        set((state) => {
          const current = state.pins[specKey] || [];
          const exists = current.includes(operationId);
          const next = exists
            ? current.filter((id) => id !== operationId)
            : [...current, operationId];

          return {
            pins: { ...state.pins, [specKey]: next },
          };
        });
      },

      isPinned: (specKey, operationId) => {
        const current = get().pins[specKey] || [];

        return current.includes(operationId);
      },

      getPins: (specKey) => {
        return get().pins[specKey] || [];
      },

      clearPins: (specKey) => {
        set((state) => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { [specKey]: _, ...rest } = state.pins;

          return { pins: rest };
        });
      },
    }),
    {
      name: "swagman-pins",
      partialize: (state) => ({ pins: state.pins }),
    }
  )
);
