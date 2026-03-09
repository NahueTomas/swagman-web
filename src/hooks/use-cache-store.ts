import type { Value } from "@/shared/types/parameter-value";

import { create } from "zustand";
import { persist } from "zustand/middleware";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ParamEntry {
  value: Value | Value[];
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
  server?: string; // selected server URL for operation-level server override
}

// ---------------------------------------------------------------------------
// Store shape
// ---------------------------------------------------------------------------

interface CacheState {
  /** Nested: specKey → operationId → OperationCache */
  cache: Record<string, Record<string, OperationCache>>;
  /** Selected server URL per spec. Key: specKey, value: server URL. */
  servers: Record<string, string>;

  setParam: (
    specKey: string,
    operationId: string,
    location: string,
    name: string,
    value: Value | Value[],
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
    value: Value | Value[],
    included: boolean
  ) => void;

  getOperation: (
    specKey: string,
    operationId: string
  ) => OperationCache | undefined;

  clearSpec: (specKey: string) => void;

  setGlobalServer: (specKey: string, url: string) => void;
  setOperationServer: (
    specKey: string,
    operationId: string,
    url: string
  ) => void;
}

// ---------------------------------------------------------------------------
// Max body text size to cache (100 KB). Prevents filling localStorage with
// huge JSON payloads pasted into the body editor.
// ---------------------------------------------------------------------------
const MAX_BODY_TEXT_BYTES = 100 * 1024;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Deep-clone the cache and ensure the nested path exists. Returns both the
 *  cloned top-level object and the (possibly freshly created) operation entry
 *  so callers can mutate and return in one step. */
function cloneAndEnsure(
  cache: Record<string, Record<string, OperationCache>>,
  specKey: string,
  operationId: string
): [Record<string, Record<string, OperationCache>>, OperationCache] {
  const next = structuredClone(cache);

  if (!next[specKey]) next[specKey] = {};
  if (!next[specKey][operationId])
    next[specKey][operationId] = { params: {}, body: {} };

  return [next, next[specKey][operationId]];
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useCacheStore = create<CacheState>()(
  persist(
    (set, get) => ({
      cache: {},
      servers: {},

      setParam(specKey, operationId, location, name, value, included) {
        set((state) => {
          const [next, op] = cloneAndEnsure(state.cache, specKey, operationId);

          op.params[`${location}.${name}`] = { value, included };

          return { cache: next };
        });
      },

      setBodyText(specKey, operationId, mimeType, value) {
        // Skip entries that are too large for localStorage comfort
        if (value && new Blob([value]).size > MAX_BODY_TEXT_BYTES) return;

        set((state) => {
          const [next, op] = cloneAndEnsure(state.cache, specKey, operationId);

          op.body[mimeType] = { format: "text", value };

          return { cache: next };
        });
      },

      setBodyField(specKey, operationId, mimeType, fieldName, value, included) {
        set((state) => {
          const [next, op] = cloneAndEnsure(state.cache, specKey, operationId);

          const existing = op.body[mimeType];
          const formEntry: BodyFormEntry =
            existing?.format === "form"
              ? { ...existing, fields: { ...existing.fields } }
              : { format: "form", fields: {} };

          formEntry.fields[fieldName] = { value, included };
          op.body[mimeType] = formEntry;

          return { cache: next };
        });
      },

      getOperation(specKey, operationId) {
        return get().cache[specKey]?.[operationId];
      },

      clearSpec(specKey) {
        set((state) => {
          const next = { ...state.cache };
          const nextServers = { ...state.servers };

          delete next[specKey];
          delete nextServers[specKey];

          return { cache: next, servers: nextServers };
        });
      },

      setGlobalServer(specKey, url) {
        set((state) => ({ servers: { ...state.servers, [specKey]: url } }));
      },

      setOperationServer(specKey, operationId, url) {
        set((state) => {
          const [next, op] = cloneAndEnsure(state.cache, specKey, operationId);

          op.server = url;

          return { cache: next };
        });
      },
    }),
    {
      name: "swagman-cache",
      partialize: (state) => ({ cache: state.cache, servers: state.servers }),
    }
  )
);
