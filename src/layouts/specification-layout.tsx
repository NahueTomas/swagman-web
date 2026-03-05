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

export default function SpecificationLayout() {
  const { setSpec, focusOperation, spec } = useStore((state) => state);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /** operationId to auto-focus once the spec finishes loading from a share link */
  const sharedOpIdRef = useRef<string | null>(null);
  /** Prevents the main load effect from firing while a share redirect is pending */
  const pendingShareRef = useRef(false);

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

  const loadSpec = useCallback(
    async (url: string | undefined) => {
      setIsLoading(true);
      setError(null);

      try {
        const spec = new SpecModel();

        if (!url) {
          const localSpec = loadLocalSpec();

          if (localSpec) await spec.processSpec(localSpec);
        } else {
          await spec.processSpec(url);
        }

        setSpec(spec);
      } catch (err: any) {
        setError(err.message || "Failed to load specification.");
      } finally {
        setIsLoading(false);
      }
    },
    [setSpec, loadLocalSpec]
  );

  // Mount-only effect: handle a base URL ?share=<token> link.
  // Apply cache values first, then redirect to the spec's hash route.
  // The pendingShareRef prevents the main load effect from firing prematurely.

  useEffect(() => {
    const baseParams = new URLSearchParams(window.location.search);
    const shareToken = baseParams.get("share");

    if (!shareToken) return;

    const payload = decodeShare(shareToken);

    if (!payload?.spec) return;

    // Write values to cache before models are constructed
    applySharePayload(payload.spec, payload);
    sharedOpIdRef.current = payload.op ?? null;
    pendingShareRef.current = true;

    // Remove ?share= from the base URL so it doesn't persist or confuse the router
    window.history.replaceState(null, "", window.location.pathname);

    // Navigate to the spec's hash route
    const route =
      payload.spec === "local" ? "/" : `/${escapeUrl(payload.spec)}`;

    navigate(route, { replace: true });
  }, []);

  // Main load effect: fires when specUrl or searchParams change.
  // Skip if a share redirect is still pending (handled above).
  useEffect(() => {
    if (pendingShareRef.current) {
      pendingShareRef.current = false;

      return;
    }

    const urlParam = searchParams.get("url");

    if (urlParam) {
      navigate(`/${escapeUrl(urlParam)}`, { replace: true });

      return;
    }

    loadSpec(specUrl);
  }, [specUrl, loadSpec, navigate, searchParams]);

  // Once the spec has loaded and we have a pending shared operationId, focus it.
  useEffect(() => {
    if (!spec || !sharedOpIdRef.current) return;

    focusOperation(sharedOpIdRef.current);
    sharedOpIdRef.current = null;
  }, [spec, focusOperation]);

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
