import { useEffect, useState, useCallback, useRef } from "react";
import {
  Outlet,
  useParams,
  useSearchParams,
  useNavigate,
} from "react-router-dom";

import { ApiExplorer } from "@/features/api-explorer";
import { SpecModel } from "@/models/spec.model";
import { useStore } from "@/hooks/use-store";
import { Loading } from "@/features/specification/loading";
import { escapeUrl } from "@/shared/utils/helpers";
import { applySharePayload, decodeShare } from "@/shared/utils/share-url";
// Rename the import to avoid conflict with native 'Error'
import { Error as SpecError } from "@/features/specification/error";

// ---------------------------------------------------------------------------
// Hash URL helpers — manipulate ?op= inside the hash without triggering
// react-router re-renders (uses replaceState directly).
// ---------------------------------------------------------------------------
function getHashOpParam(): string | null {
  const hash = window.location.hash.slice(1); // strip "#"
  const qIdx = hash.indexOf("?");

  if (qIdx === -1) return null;

  return new URLSearchParams(hash.slice(qIdx + 1)).get("op");
}

function setHashOpParam(opId: string | null): void {
  const hash = window.location.hash.slice(1);
  const qIdx = hash.indexOf("?");
  const path = qIdx === -1 ? hash : hash.slice(0, qIdx);
  const params = new URLSearchParams(qIdx === -1 ? "" : hash.slice(qIdx + 1));

  if (opId) {
    params.set("op", opId);
  } else {
    params.delete("op");
  }

  const search = params.toString();
  const newHash = search ? `${path}?${search}` : path;

  window.history.replaceState(null, "", `#${newHash}`);
}

export default function SpecificationLayout() {
  const { setSpec, focusOperation, spec, operationFocused } = useStore(
    (state) => state
  );
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /** operationId to auto-focus once the spec finishes loading.
   *  Eagerly read from hash ?op= so it's captured before any effect runs. */
  const pendingOpIdRef = useRef<string | null>(getHashOpParam());
  /** Prevents the main load effect from firing while a share redirect is pending */
  const pendingShareRef = useRef(false);
  /** True once the first spec load has completed.
   *  The sync effect is suppressed until this is true so that mount-time
   *  renders (where operationFocused is null) don't wipe ?op= from the URL. */
  const readyRef = useRef(false);

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const params = useParams();
  const specUrl = params.url;

  const loadLocalSpec = useCallback((): object | undefined => {
    try {
      if (!window.LOCAL_SPEC) {
        throw new Error("No local spec found. Define window.LOCAL_SPEC.");
      }

      if (typeof window.LOCAL_SPEC !== "object" || window.LOCAL_SPEC === null) {
        throw new Error("window.LOCAL_SPEC is not a valid object.");
      }

      return window.LOCAL_SPEC;
    } catch (err: any) {
      // eslint-disable-next-line no-console
      console.log({
        title: "Error loading local spec",
        description: err instanceof Error ? err.message : "Unknown error",
        color: "danger",
      });
    }
  }, []);

  // Mount-only effect: handle a base URL ?share=<token> link.
  // Apply cache values first, then redirect to the spec's hash route.

  useEffect(() => {
    const baseParams = new URLSearchParams(window.location.search);
    const shareToken = baseParams.get("share");

    if (!shareToken) return;

    const payload = decodeShare(shareToken);

    if (!payload?.spec) return;

    applySharePayload(payload.spec, payload);
    pendingOpIdRef.current = payload.op ?? null;
    pendingShareRef.current = true;

    window.history.replaceState(null, "", window.location.pathname);

    const route =
      payload.spec === "local" ? "/" : `/${escapeUrl(payload.spec)}`;

    navigate(route, { replace: true });
  }, []);

  // Mount-only: handle legacy ?url= query param redirect.

  useEffect(() => {
    const urlParam = searchParams.get("url");

    if (urlParam) {
      navigate(`/${escapeUrl(urlParam)}`, { replace: true });
    }
  }, []);

  // Main load effect.
  // Uses a stale flag so StrictMode's double-mount only applies the last result.
  useEffect(() => {
    if (pendingShareRef.current) {
      pendingShareRef.current = false;

      return;
    }

    let stale = false;

    const load = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const newSpec = new SpecModel();

        if (!specUrl) {
          const localSpec = loadLocalSpec();

          if (localSpec) await newSpec.processSpec(localSpec);
        } else {
          await newSpec.processSpec(specUrl);
        }

        if (!stale) setSpec(newSpec);
      } catch (err: any) {
        if (!stale) setError(err.message || "Failed to load specification.");
      } finally {
        if (!stale) setIsLoading(false);
      }
    };

    load();

    return () => {
      stale = true;
    };
  }, [specUrl, setSpec, loadLocalSpec]);

  // Once the spec has loaded, focus the pending operation (from share link or URL ?op=).
  useEffect(() => {
    if (!spec) return;

    const opId = pendingOpIdRef.current;

    pendingOpIdRef.current = null;
    readyRef.current = true;

    if (opId) {
      focusOperation(opId);
    }
  }, [spec, focusOperation]);

  // Sync store → URL: update ?op= whenever the focused operation changes.
  // Suppressed until the first spec load completes (readyRef) so that
  // mount-time null values don't wipe the URL.
  useEffect(() => {
    if (!readyRef.current) return;

    setHashOpParam(operationFocused?.id ?? null);
  }, [operationFocused]);

  return (
    <div className="flex h-dvh w-full bg-background text-foreground-300 overflow-hidden">
      {!error && !isLoading && (
        <div className="border-r border-divider/40 bg-background-600/30 flex-shrink-0 z-10 w-fit h-full">
          <ApiExplorer />
        </div>
      )}

      <main className="flex-1 w-full bg-background relative flex flex-col h-full overflow-hidden">
        {error ? (
          <SpecError
            message={error}
            onRedirect={(newUrl: string) => navigate(`/${escapeUrl(newUrl)}`)}
          />
        ) : isLoading ? (
          <Loading />
        ) : (
          <Outlet />
        )}
      </main>
    </div>
  );
}
