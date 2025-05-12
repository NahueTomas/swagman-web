import { create } from "zustand";
import { persist } from "zustand/middleware";

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
 * Interface for request preview data
 */
export interface RequestPreview {
  url: string;
  method: string;
  headers: { [key: string]: string };
  body?: string | { [key: string]: any } | null;
}

/**
 * Interface for request forms global state
 */
interface RequestFormsState {
  // Forms data by operation ID
  forms: Record<string, OperationFormState>;

  // Global selected server
  selectedServer: string;
  selectedServerVariables: { [key: string]: string };

  // Request previews by operation ID
  requestPreviews: Record<string, RequestPreview>;

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
        date: Date;
      } | null;
    };
  };

  // Actions
  setFormValues: (
    operationId: string,
    data: Partial<OperationFormState>
  ) => void;
  clearForm: (operationId: string) => void;
  setSelectedServer: (
    server: string,
    serverVariables: { [key: string]: string }
  ) => void;
  setOperationServer: (
    operationId: string,
    server: string,
    serverVariables: { [key: string]: string }
  ) => void;
  setRequestPreview: (operationId: string, preview: RequestPreview) => void;
  getRequestPreview: (operationId: string) => RequestPreview | null;
  setResponseLoading: (operationId: string) => void;
  setResponseSuccess: (
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
      date: Date;
    } | null
  ) => void;
  getResponse: (operationId: string) => {
    loading: boolean;
    data: object | null;
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
      forms: {},
      selectedServer: "",
      selectedServerVariables: {},
      requestPreviews: {},
      responses: {},

      /**
       * Set form values for a specific operation
       */
      setFormValues: (operationId, data) =>
        set((state) => ({
          forms: {
            ...state.forms,
            [operationId]: {
              ...(state.forms[operationId] || {
                parameters: {
                  path: {},
                  query: {},
                  header: {},
                  cookie: {},
                },
                contentType: "none",
                requestBody: null,
              }),
              ...data,
            },
          },
        })),

      /**
       * Clear form values for a specific operation
       */
      clearForm: (operationId) =>
        set((state) => {
          const forms = { ...state.forms };

          delete forms[operationId];

          return { forms };
        }),

      /**
       * Set the global selected server and its variables
       */
      setSelectedServer: (selectedServer, selectedServerVariables) => {
        set((state) => ({
          selectedServer,
          selectedServerVariables,
          forms: state.forms,
        }));
      },

      /**
       * Set the selected server and its variables for a specific operation
       */
      setOperationServer: (
        operationId,
        selectedServer,
        selectedServerVariables
      ) => {
        set((state) => {
          const existingForm = state.forms[operationId] || {
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
            forms: {
              ...state.forms,
              [operationId]: {
                ...existingForm,
                selectedServer,
                selectedServerVariables,
              },
            },
          };
        });
      },

      /**
       * Set the request preview for a specific operation
       */
      setRequestPreview: (operationId, preview) => {
        set((state) => ({
          requestPreviews: {
            ...state.requestPreviews,
            [operationId]: preview,
          },
        }));
      },

      /**
       * Get the request preview for a specific operation
       */
      getRequestPreview: (operationId) => {
        return get().requestPreviews[operationId] || null;
      },

      getResponse: (operationId: string) => {
        return get().responses[operationId] || null;
      },

      setResponseLoading: (operationId: string) => {
        set((state) => ({
          responses: {
            ...state.responses,
            [operationId]: {
              loading: true,
              data: state?.responses?.[operationId]?.data || null,
            },
          },
        }));
      },

      setResponseSuccess: (
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
          date: Date;
        } | null
      ) => {
        set((state) => ({
          responses: {
            ...state.responses,
            [operationId]: { loading: false, data },
          },
        }));
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
