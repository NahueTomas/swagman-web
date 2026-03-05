import type { SpecModel } from "@/models/spec.model";
import type { Value } from "@/shared/types/parameter-value";

import { useCacheStore } from "@/hooks/use-cache-store";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Data captured for a single operation. */
export interface OperationShareData {
  /** "location.name" → [value, included] */
  p?: Record<string, [Value | Value[], boolean]>;
  /** body text: mimeType → raw string value */
  bt?: Record<string, string>;
  /** body form fields: mimeType → fieldName → [value, included] */
  bf?: Record<string, Record<string, [Value | Value[], boolean]>>;
  /** selected server URL (only for operations that define their own servers) */
  sv?: string;
}

export interface SharePayload {
  v: 1;
  /** specKey: URL string for remote specs, "local" for inline specs */
  spec: string;
  /** operationId to auto-focus after applying the payload (optional) */
  op?: string;
  /** selected global server URL */
  sv?: string;
  /** All operations' captured values, keyed by operationId */
  ops?: Record<string, OperationShareData>;
}

// ---------------------------------------------------------------------------
// Encode / Decode
// ---------------------------------------------------------------------------

export function encodeShare(payload: SharePayload): string {
  return btoa(JSON.stringify(payload))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

export function decodeShare(token: string): SharePayload | null {
  try {
    const padded = token.replace(/-/g, "+").replace(/_/g, "/");
    const remainder = padded.length % 4;
    const padding = remainder === 0 ? "" : "=".repeat(4 - remainder);

    return JSON.parse(atob(padded + padding)) as SharePayload;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Returns true when the object has at least one own key. */
function hasEntries(obj: Record<string, unknown>): boolean {
  return Object.keys(obj).length > 0;
}

// ---------------------------------------------------------------------------
// URL building
// Generates a clean base URL share link: http://host/?share=<token>
// The spec URL is encoded inside the token.
// On load the app reads this, applies cache values, then redirects to /#/<specUrl>.
// ---------------------------------------------------------------------------

export function buildShareUrl(payload: SharePayload): string {
  const token = encodeShare(payload);
  const url = new URL(window.location.origin);

  url.searchParams.set("share", token);

  return url.toString();
}

// ---------------------------------------------------------------------------
// Build payload from a live SpecModel (all operations, no file / auth fields)
// ---------------------------------------------------------------------------

export function buildSharePayload(
  spec: SpecModel,
  focusedOpId?: string
): SharePayload {
  const ops: Record<string, OperationShareData> = {};

  spec.getOperations().forEach((operation) => {
    const opData: OperationShareData = {};
    const p: Record<string, [Value | Value[], boolean]> = {};
    const bt: Record<string, string> = {};
    const bf: Record<string, Record<string, [Value | Value[], boolean]>> = {};

    // Parameters — SecurityModel instances are not ParameterModel, so naturally excluded
    operation.getParameters().forEach((param) => {
      p[`${param.getIn()}.${param.name}`] = [param.value, param.included];
    });

    // Request body
    const requestBody = operation.getRequestBody();

    if (requestBody) {
      requestBody.getMimeTypes().forEach((mime) => {
        const mediaType = requestBody.getMimeType(mime);

        if (!mediaType) return;

        if (mediaType.getMediaTypeFormat() === "text" && mediaType.value) {
          bt[mime] = mediaType.value;
        } else if (
          mediaType.getMediaTypeFormat() === "form" &&
          mediaType.fields
        ) {
          const fields: Record<string, [Value | Value[], boolean]> = {};

          mediaType.fields.forEach((field) => {
            if (field.schema?.format === "binary") return;
            fields[field.name] = [field.value, field.included];
          });

          if (hasEntries(fields)) bf[mime] = fields;
        }
      });
    }

    if (hasEntries(p)) opData.p = p;
    if (hasEntries(bt)) opData.bt = bt;
    if (hasEntries(bf)) opData.bf = bf;

    // Operation-level server (only when the operation defines its own servers)
    const opServer = operation.getSelectedServer();

    if (opServer && (operation.getServers()?.length ?? 0) > 0) {
      opData.sv = opServer.getUrl();
    }

    if (opData.p || opData.bt || opData.bf || opData.sv) {
      ops[operation.id] = opData;
    }
  });

  const payload: SharePayload = { v: 1, spec: spec.specKey };

  if (focusedOpId) payload.op = focusedOpId;

  // Global selected server
  const globalServer = spec.getSelectedServer();

  if (globalServer) payload.sv = globalServer.getUrl();

  if (hasEntries(ops)) payload.ops = ops;

  return payload;
}

// ---------------------------------------------------------------------------
// Apply a share payload into the cache store so model constructors pick it up.
// Call this BEFORE processSpec / before models are constructed.
// ---------------------------------------------------------------------------

export function applySharePayload(
  specKey: string,
  payload: SharePayload
): void {
  const {
    setParam,
    setBodyText,
    setBodyField,
    setGlobalServer,
    setOperationServer,
  } = useCacheStore.getState();

  // Global server
  if (payload.sv) setGlobalServer(specKey, payload.sv);

  if (!payload.ops) return;

  Object.entries(payload.ops).forEach(([operationId, opData]) => {
    if (opData.p) {
      Object.entries(opData.p).forEach(([key, [value, included]]) => {
        const dotIndex = key.indexOf(".");
        const location = key.slice(0, dotIndex);
        const name = key.slice(dotIndex + 1);

        setParam(specKey, operationId, location, name, value, included);
      });
    }

    if (opData.bt) {
      Object.entries(opData.bt).forEach(([mime, value]) => {
        setBodyText(specKey, operationId, mime, value);
      });
    }

    if (opData.bf) {
      Object.entries(opData.bf).forEach(([mime, fields]) => {
        Object.entries(fields).forEach(([fieldName, [value, included]]) => {
          setBodyField(specKey, operationId, mime, fieldName, value, included);
        });
      });
    }

    // Operation-level server
    if (opData.sv) setOperationServer(specKey, operationId, opData.sv);
  });
}
