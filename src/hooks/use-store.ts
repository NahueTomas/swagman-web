import { create } from "zustand";

import { OperationModel } from "../models/operation.model";
import { SpecModel } from "../models/spec.model";

interface StoreState {
  spec: SpecModel | null;
  parametersValues: { name: string; value: any }[];
  operationsTabs: { id: string; title: string; method: string }[];
  operationFocused: OperationModel | null;
  isSidebarCollapsed: boolean;
  sidebarWidth: number;
  isOriginalUrlSectionVisible: boolean;
  isFocusModeEnabled: boolean;

  // Cache
  _operationsCache: Map<string, OperationModel>;

  setSpec: (spec: SpecModel) => void;
  toggleSidebar: () => void;
  setSidebarWidth: (width: number) => void;
  focusOperation: (operationId: string | null) => void;
  setOriginalUrlSectionVisible: (isVisible: boolean) => void;
  toggleFocusMode: () => void;
}

export const useStore = create<StoreState>((set) => ({
  spec: null,
  parametersValues: [],
  operationsTabs: [],
  operationFocused: null,
  isSidebarCollapsed: false,
  sidebarWidth: 256, // Default value equal to 'w-64' in Tailwind (16 * 16px)
  isOriginalUrlSectionVisible: true,
  isFocusModeEnabled: false,
  _operationsCache: new Map(),

  setSpec: (spec: SpecModel) => {
    set((state) => {
      // Clear cache when spec changes
      state._operationsCache.clear();

      // Populate cache with operations for O(1) searches
      const operations = spec.getOperations();
      const cache = new Map<string, OperationModel>();

      operations.forEach((op) => cache.set(op.id, op));

      return {
        spec,
        _operationsCache: cache,
        operationFocused: null, // Reset focused operation
      };
    });
  },

  toggleSidebar: () =>
    set((state) => ({
      isSidebarCollapsed: !state.isSidebarCollapsed,
    })),

  setSidebarWidth: (width: number) =>
    set(() => ({
      sidebarWidth: width,
    })),

  focusOperation: (operationId) =>
    set((state) => {
      if (!operationId) return { operationFocused: null };

      // Use cache for O(1) search instead of O(n)
      const operation = state._operationsCache.get(operationId) || null;

      return { operationFocused: operation };
    }),

  setOriginalUrlSectionVisible: (isVisible) =>
    set(() => ({ isOriginalUrlSectionVisible: isVisible })),

  toggleFocusMode: () =>
    set((state) => ({
      isFocusModeEnabled: !state.isFocusModeEnabled,
    })),
}));
