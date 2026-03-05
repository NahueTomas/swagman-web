import { create } from "zustand";
import { persist } from "zustand/middleware";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ParamEntry {
  value: any;
  included: boolean;
}

export interface BodyTextEntry {
  format: "text";
  value: string;
}

export interface BodyFormEntry {
  format: "form";
  fields: Record<string, ParamEntry>;
}

export type BodyEntry = BodyTextEntry | BodyFormEntry;

export interface OperationCache {
  params: Record<string, ParamEntry>; // key: `${location}.${name}`
  body: Record<string, BodyEntry>; // key: mimeType
}

// ---------------------------------------------------------------------------
// Store shape
// ---------------------------------------------------------------------------

interface CacheState {
  /** Nested: specKey → operationId → OperationCache */
  cache: Record<string, Record<string, OperationCache>>;

  setParam: (
    specKey: string,
    operationId: string,
    location: string,
    name: string,
    value: any,
    included: boolean
  ) => void;

  setBodyText: (
    specKey: string,
    operationId: string,
    mimeType: string,
    value: string
  ) => void;

  setBodyField: (
    specKey: string,
    operationId: string,
    mimeType: string,
    fieldName: string,
    value: any,
    included: boolean
  ) => void;

  getOperation: (
    specKey: string,
    operationId: string
  ) => OperationCache | undefined;
}

// ---------------------------------------------------------------------------
// Max body text size to cache (100 KB). Prevents filling localStorage with
// huge JSON payloads pasted into the body editor.
// ---------------------------------------------------------------------------
const MAX_BODY_TEXT_BYTES = 100 * 1024;

// ---------------------------------------------------------------------------
// Helper: safely get or create a nested path in the cache object
// ---------------------------------------------------------------------------
function ensureOperation(
  cache: Record<string, Record<string, OperationCache>>,
  specKey: string,
  operationId: string
): OperationCache {
  if (!cache[specKey]) cache[specKey] = {};
  if (!cache[specKey][operationId])
    cache[specKey][operationId] = { params: {}, body: {} };

  return cache[specKey][operationId];
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useCacheStore = create<CacheState>()(
  persist(
    (set, get) => ({
      cache: {},

      setParam(specKey, operationId, location, name, value, included) {
        set((state) => {
          const next = structuredClone(state.cache);
          const op = ensureOperation(next, specKey, operationId);

          op.params[`${location}.${name}`] = { value, included };

          return { cache: next };
        });
      },

      setBodyText(specKey, operationId, mimeType, value) {
        // Skip entries that are too large for localStorage comfort
        if (value && new Blob([value]).size > MAX_BODY_TEXT_BYTES) return;

        set((state) => {
          const next = structuredClone(state.cache);
          const op = ensureOperation(next, specKey, operationId);

          op.body[mimeType] = { format: "text", value };

          return { cache: next };
        });
      },

      setBodyField(specKey, operationId, mimeType, fieldName, value, included) {
        set((state) => {
          const next = structuredClone(state.cache);
          const op = ensureOperation(next, specKey, operationId);

          const existing = op.body[mimeType];
          const formEntry: BodyFormEntry =
            existing?.format === "form"
              ? {
                  ...(existing as BodyFormEntry),
                  fields: { ...(existing as BodyFormEntry).fields },
                }
              : { format: "form", fields: {} };

          formEntry.fields[fieldName] = { value, included };
          op.body[mimeType] = formEntry;

          return { cache: next };
        });
      },

      getOperation(specKey, operationId) {
        return get().cache[specKey]?.[operationId];
      },
    }),
    {
      name: "swagman-cache",
      partialize: (state) => ({ cache: state.cache }),
    }
  )
);
