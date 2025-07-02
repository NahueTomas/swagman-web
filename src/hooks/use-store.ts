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

  // Cache para optimizar búsquedas
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
  sidebarWidth: 256, // Valor predeterminado igual a 'w-64' en Tailwind (16 * 16px)
  isOriginalUrlSectionVisible: true,
  isFocusModeEnabled: false,
  _operationsCache: new Map(),

  setSpec: (spec: SpecModel) => {
    set((state) => {
      // Limpiar cache cuando se cambia la spec
      state._operationsCache.clear();

      // Poblar cache con operaciones para búsquedas O(1)
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

      // Usar cache para búsqueda O(1) en lugar de O(n)
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
