import { useEffect, useState, useCallback } from "react";
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
// Rename the import to avoid conflict with native 'Error'
import { Error as SpecError } from "@/features/specification/error";

export default function SpecificationLayout() {
  const { setSpec } = useStore();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const params = useParams();
  const specUrl = params.url;

  const loadLocalSpec = useCallback((): object | undefined => {
    try {
      if (!window.LOCAL_SPEC) {
        // Native Error constructor works now
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
        // Ensure SpecModel has a 'processSpec' method and is a class
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

  useEffect(() => {
    const urlParam = searchParams.get("url");

    if (urlParam) {
      navigate(`/${escapeUrl(urlParam)}`, { replace: true });
    } else {
      loadSpec(specUrl);
    }
  }, [specUrl, loadSpec, navigate, searchParams]);

  return (
    <div className="flex p-4 h-dvh w-full bg-background-700 text-foreground-300 gap-4">
      {/* Hide Sidebar only if error exists AND we aren't loading */}
      {!error && !isLoading && <ApiExplorer />}

      <main className="flex-1 w-full bg-background-500 border border-divider flex items-center justify-center overflow-hidden rounded-md relative">
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
