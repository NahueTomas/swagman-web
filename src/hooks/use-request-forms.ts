import { create } from "zustand";
import { persist, subscribeWithSelector } from "zustand/middleware";
import { produce } from "immer";

import { OpenAPIServerVariable } from "@/shared/types/openapi";

/**
 * Interface for form field structure
 */
interface FormField {
  [name: string]: {
    value: string | number | string[] | number[];
    included: boolean;
  };
}

/**
 * Interface for request body structure
 */
export interface RequestBody {
  [mimeType: string]:
    | {
        [name: string]: { value: any | any[]; included: boolean };
      }
    | string;
}

/**
 * Interface for parameter types (path, query, header, cookie)
 */
export interface ParameterType {
  path: FormField;
  query: FormField;
  header: FormField;
  cookie: FormField;
}

/**
 * Interface for operation form state
 */
export interface OperationFormState {
  parameters: ParameterType;
  contentType: string;
  requestBody: RequestBody | null;
  selectedServer?: string;
  selectedServerVariables?: { [key: string]: string };
}

/**
 * Interface for request forms global state
 */
export interface RequestFormsState {
  specificationUrl: string | null;
  specifications: {
    [specificationUrl: string]: {
      forms: Record<string, OperationFormState>;
      selectedServer: string;
      selectedServerVariables: { [key: string]: OpenAPIServerVariable };
      responses: {
        [operationId: string]: {
          loading: boolean;
          data: {
            body: { [key: string]: any } | string;
            data: string;
            headers: { [key: string]: string | string[] };
            obj: { [key: string]: any } | string;
            ok: boolean;
            status: number;
            statusText: string;
            text: string;
            url: string;
            date: string;
          } | null;
        };
      };
    };
  };

  // Actions
  setFormValues: (
    specificationUrl: string,
    operationId: string,
    data: Partial<OperationFormState>
  ) => void;
  clearForm: (specificationUrl: string, operationId: string) => void;
  setSelectedServer: (
    specificationUrl: string,
    server: string,
    serverVariables: { [key: string]: OpenAPIServerVariable }
  ) => void;
  setOperationServer: (
    specificationUrl: string,
    operationId: string,
    server: string,
    serverVariables: { [key: string]: string }
  ) => void;
  setResponseLoading: (specificationUrl: string, operationId: string) => void;
  setResponseSuccess: (
    specificationUrl: string,
    operationId: string,
    data: {
      body: { [key: string]: any } | string;
      data: string;
      headers: { [key: string]: string | string[] };
      obj: { [key: string]: any } | string;
      ok: boolean;
      status: number;
      statusText: string;
      text: string;
      url: string;
      date: string;
    } | null
  ) => void;
  setSpecification: (specificationUrl: string | null) => void;
  getResponse: (
    specificationUrl: string,
    operationId: string
  ) => {
    loading: boolean;
    data: {
      body: { [key: string]: any } | string;
      data: string;
      headers: { [key: string]: string | string[] };
      obj: { [key: string]: any } | string;
      ok: boolean;
      status: number;
      statusText: string;
      text: string;
      url: string;
      date: string;
    } | null;
  } | null;
}

// Helper function to initialize specification
const initializeSpecification = () => ({
  forms: {},
  selectedServer: "",
  selectedServerVariables: {},
  responses: {},
});

// Helper function to initialize form
const initializeForm = (): OperationFormState => ({
  parameters: {
    path: {},
    query: {},
    header: {},
    cookie: {},
  },
  contentType: "",
  requestBody: null,
});

/**
 * Hook for managing request forms state
 * Optimized with Immer for immutable mutations and better performance
 */
export const useRequestForms = create<RequestFormsState>()(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        // Initial state
        specificationUrl: null,
        specifications: {},

        /**
         * Set form values for a specific operation - Optimizado con Immer
         */
        setFormValues: (specificationUrl, operationId, data) =>
          set(
            produce((state: RequestFormsState) => {
              if (!specificationUrl) return;

              // Initialize specification if it doesn't exist
              if (!state.specifications[specificationUrl]) {
                state.specifications[specificationUrl] =
                  initializeSpecification();
              }

              const spec = state.specifications[specificationUrl];

              // Initialize form if it doesn't exist
              if (!spec.forms[operationId]) {
                spec.forms[operationId] = initializeForm();
              }

              // Apply changes using Immer draft (direct mutation but immutable)
              Object.assign(spec.forms[operationId], data);
            })
          ),

        setSpecification: (specificationUrl: string | null) =>
          set(
            produce((state: RequestFormsState) => {
              state.specificationUrl = specificationUrl;

              // Initialize specification if it doesn't exist
              if (specificationUrl && !state.specifications[specificationUrl]) {
                state.specifications[specificationUrl] =
                  initializeSpecification();
              }
            })
          ),

        /**
         * Clear form values for a specific operation
         */
        clearForm: (specificationUrl, operationId) =>
          set(
            produce((state: RequestFormsState) => {
              if (!specificationUrl || !state.specifications[specificationUrl])
                return;

              delete state.specifications[specificationUrl].forms[operationId];
            })
          ),

        /**
         * Set the global selected server and its variables
         */
        setSelectedServer: (
          specificationUrl,
          selectedServer,
          selectedServerVariables
        ) =>
          set(
            produce((state: RequestFormsState) => {
              if (!specificationUrl) return;

              if (!state.specifications[specificationUrl]) {
                state.specifications[specificationUrl] =
                  initializeSpecification();
              }

              const spec = state.specifications[specificationUrl];

              spec.selectedServer = selectedServer;
              spec.selectedServerVariables = selectedServerVariables;
            })
          ),

        /**
         * Set the selected server and its variables for a specific operation
         */
        setOperationServer: (
          specificationUrl,
          operationId,
          selectedServer,
          selectedServerVariables
        ) =>
          set(
            produce((state: RequestFormsState) => {
              if (!specificationUrl) return;

              if (!state.specifications[specificationUrl]) {
                state.specifications[specificationUrl] =
                  initializeSpecification();
              }

              const spec = state.specifications[specificationUrl];

              if (!spec.forms[operationId]) {
                spec.forms[operationId] = initializeForm();
              }

              const form = spec.forms[operationId];

              form.selectedServer = selectedServer;
              form.selectedServerVariables = selectedServerVariables;
            })
          ),

        /**
         * Get response data
         */
        getResponse: (specificationUrl, operationId) => {
          if (!specificationUrl) return null;

          const state = get();
          const spec = state.specifications[specificationUrl];

          if (!spec?.responses?.[operationId]) {
            return { loading: false, data: null };
          }

          return spec.responses[operationId];
        },

        /**
         * Set response loading state
         */
        setResponseLoading: (specificationUrl, operationId) =>
          set(
            produce((state: RequestFormsState) => {
              if (!specificationUrl) return;

              if (!state.specifications[specificationUrl]) {
                state.specifications[specificationUrl] =
                  initializeSpecification();
              }

              const spec = state.specifications[specificationUrl];

              if (!spec.responses[operationId]) {
                spec.responses[operationId] = { loading: false, data: null };
              }

              spec.responses[operationId].loading = true;
            })
          ),

        /**
         * Set response success data
         */
        setResponseSuccess: (specificationUrl, operationId, data) =>
          set(
            produce((state: RequestFormsState) => {
              if (!specificationUrl) return;

              if (!state.specifications[specificationUrl]) {
                state.specifications[specificationUrl] =
                  initializeSpecification();
              }

              const spec = state.specifications[specificationUrl];

              spec.responses[operationId] = { loading: false, data };
            })
          ),
      }),
      {
        name: "request-forms-storage",
        // Optimize persistence excluding temporary data
        partialize: (state) => ({
          specificationUrl: state.specificationUrl,
          specifications: Object.fromEntries(
            Object.entries(state.specifications).map(([url, spec]) => [
              url,
              {
                ...spec,
                // Don't persist responses to reduce storage size
                responses: {},
              },
            ])
          ),
        }),
      }
    )
  )
);
