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

  setSpec: (spec: SpecModel) => {
    set(() => ({
      spec,
    }));
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
      if (!state.spec || !operationId) return { operationFocused: null };

      const operation: OperationModel | null =
        state.spec
          .getOperations()
          .find((op: OperationModel) => op.id === operationId) || null;

      return { operationFocused: operation };
    }),

  setOriginalUrlSectionVisible: (isVisible) =>
    set({ isOriginalUrlSectionVisible: isVisible }),

  toggleFocusMode: () =>
    set((state) => ({
      ...state,
      isFocusModeEnabled: !state.isFocusModeEnabled,
    })),
}));
