import { create } from "zustand";
import { persist } from "zustand/middleware";

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
      // Forms data by operation ID
      forms: Record<string, OperationFormState>;

      // Global selected server
      selectedServer: string;
      selectedServerVariables: { [key: string]: OpenAPIServerVariable };

      // Response by operation ID
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

/**
 * Hook for managing request forms state
 * Provides persistent storage of form values, server selection, and server variables
 */
export const useRequestForms = create<RequestFormsState>()(
  persist(
    (set, get) => ({
      // Initial state
      specificationUrl: null,
      specifications: {},

      /**
       * Set form values for a specific operation
       */
      setFormValues: (specificationUrl, operationId, data) =>
        set((state) => {
          if (!specificationUrl) return state;
          // Ensure specifications object exists
          const specs = state.specifications || {};

          // Ensure specification URL entry exists with default values
          const currentSpec = specs[specificationUrl] || {
            forms: {},
            selectedServer: "",
            selectedServerVariables: {},
            responses: {},
          };

          // Get current forms or initialize
          const currentForms = currentSpec.forms || {};

          // Get current form or initialize with defaults
          const currentForm = currentForms[operationId] || {
            parameters: {
              path: {},
              query: {},
              header: {},
              cookie: {},
            },
            contentType: null,
            requestBody: null,
          };

          return {
            specifications: {
              ...specs,
              [specificationUrl]: {
                ...currentSpec,
                forms: {
                  ...currentForms,
                  [operationId]: {
                    ...currentForm,
                    ...data,
                  },
                },
              },
            },
          };
        }),

      setSpecification: (specificationUrl: string | null) =>
        set((state) => {
          if (!specificationUrl) return state;

          const specs = state.specifications || {};
          // Initialize with default structure if it doesn't exist
          const currentSpec = specs[specificationUrl || ""] || {
            forms: {},
            selectedServer: "",
            selectedServerVariables: {},
            responses: {},
          };

          return {
            specificationUrl,
            specifications: {
              ...specs,
              [specificationUrl || ""]: currentSpec,
            },
          };
        }),

      /**
       * Clear form values for a specific operation
       */
      clearForm: (specificationUrl, operationId) =>
        set((state) => {
          if (!specificationUrl) return state;

          const forms = {
            ...state.specifications[specificationUrl].forms,
          };

          delete forms[operationId];

          return {
            specifications: {
              ...state.specifications,
              [specificationUrl]: {
                ...state.specifications[specificationUrl],
                forms,
              },
            },
          };
        }),

      /**
       * Set the global selected server and its variables
       */
      setSelectedServer: (
        specificationUrl,
        selectedServer,
        selectedServerVariables
      ) => {
        set((state) => {
          if (!specificationUrl) return state;

          return {
            specifications: {
              ...state.specifications,
              [specificationUrl || ""]: {
                ...state.specifications[specificationUrl || ""],
                selectedServer,
                selectedServerVariables,
              },
            },
          };
        });
      },

      /**
       * Set the selected server and its variables for a specific operation
       */
      setOperationServer: (
        specificationUrl,
        operationId,
        selectedServer,
        selectedServerVariables
      ) => {
        set((state) => {
          if (!specificationUrl) return state;

          const existingForm = state.specifications[specificationUrl].forms[
            operationId
          ] || {
            parameters: {
              path: {},
              query: {},
              header: {},
              cookie: {},
            },
            contentType: "none",
            requestBody: null,
          };

          return {
            specifications: {
              ...state.specifications,
              [specificationUrl]: {
                ...state.specifications[specificationUrl],
                forms: {
                  ...state.specifications[specificationUrl].forms,
                  [operationId]: {
                    ...existingForm,
                    selectedServer,
                    selectedServerVariables,
                  },
                },
              },
            },
          };
        });
      },

      getResponse: (specificationUrl, operationId) => {
        if (!specificationUrl) return null;

        const state = get();
        const specs = state.specifications || {};
        const currentSpec = specs[specificationUrl];

        if (!currentSpec || !currentSpec.responses) {
          return { loading: false, data: null };
        }

        return (
          currentSpec.responses[operationId] || { loading: false, data: null }
        );
      },

      setResponseLoading: (specificationUrl, operationId) => {
        set((state) => {
          if (!specificationUrl) return state;

          // Ensure specifications object exists
          const specs = state.specifications || {};

          // Ensure specification URL entry exists with default values
          const currentSpec = specs[specificationUrl] || {
            forms: {},
            selectedServer: "",
            selectedServerVariables: {},
            responses: {},
          };

          // Get current responses or initialize
          const currentResponses = currentSpec.responses || {};

          // Get current response data if it exists
          const currentResponseData =
            currentSpec.responses?.[operationId]?.data || null;

          return {
            specifications: {
              ...specs,
              [specificationUrl]: {
                ...currentSpec,
                responses: {
                  ...currentResponses,
                  [operationId]: {
                    loading: true,
                    data: currentResponseData,
                  },
                },
              },
            },
          };
        });
      },

      setResponseSuccess: (
        specificationUrl,
        operationId,
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
      ) => {
        set((state) => {
          if (!specificationUrl) return state;

          // Ensure specifications object exists
          const specs = state.specifications || {};

          // Ensure specification URL entry exists with default values
          const currentSpec = specs[specificationUrl] || {
            forms: {},
            selectedServer: "",
            selectedServerVariables: {},
            responses: {},
          };

          // Get current responses or initialize
          const currentResponses = currentSpec.responses || {};

          return {
            specifications: {
              ...specs,
              [specificationUrl]: {
                ...currentSpec,
                responses: {
                  ...currentResponses,
                  [operationId]: { loading: false, data },
                },
              },
            },
          };
        });
      },
    }),
    {
      name: "request-forms-storage",
      storage: {
        getItem: (name) => {
          try {
            const str = localStorage.getItem(name);

            if (!str) return null;

            return JSON.parse(str);
          } catch (error) {
            return error;
          }
        },
        setItem: (name, value) => {
          try {
            localStorage.setItem(name, JSON.stringify(value));
          } catch (error) {
            return error;
          }
        },
        removeItem: (name) => {
          try {
            localStorage.removeItem(name);
          } catch (error) {
            return error;
          }
        },
      },
    }
  )
);
