import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface HistoryEntry {
  status: number;
  duration: number;
  timestamp: string;
  /** Persisted response data — allows restoring the response panel after reload. */
  response?: {
    data: string;
    body: Record<string, unknown> | string;
    headers: Record<string, string | string[]>;
    obj: Record<string, unknown> | string;
    ok: boolean;
    statusText: string;
    url: string;
  };
}

interface HistoryState {
  /** specKey -> operationId -> last execution */
  history: Record<string, Record<string, HistoryEntry>>;

  recordExecution: (
    specKey: string,
    operationId: string,
    entry: HistoryEntry
  ) => void;
  getLastExecution: (
    specKey: string,
    operationId: string
  ) => HistoryEntry | undefined;
}

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set, get) => ({
      history: {},

      recordExecution: (specKey, operationId, entry) => {
        set((state) => ({
          history: {
            ...state.history,
            [specKey]: {
              ...state.history[specKey],
              [operationId]: entry,
            },
          },
        }));
      },

      getLastExecution: (specKey, operationId) => {
        return get().history[specKey]?.[operationId];
      },
    }),
    {
      name: "swagman-history",
      partialize: (state) => ({ history: state.history }),
    }
  )
);
