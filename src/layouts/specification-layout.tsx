import { useEffect, useState, useCallback } from "react";
import {
  Outlet,
  useParams,
  Link,
  useSearchParams,
  useNavigate,
} from "react-router-dom";
import { addToast } from "@heroui/toast";

import { ApiExplorer } from "@/features/api-explorer";
import { SpecModel } from "@/models/spec.model";
import { useStore } from "@/hooks/use-store";
import { Error as ErrorComponent } from "@/shared/components/ui/error";
import { Loading } from "@/features/specification/loading";
import { useRequestForms } from "@/hooks/use-request-forms";
import { ROUTES } from "@/shared/constants/constants";
import { escapeUrl } from "@/shared/utils/helpers";

export default function SpecificationLayout() {
  const { setSpec } = useStore();
  const { setSpecification } = useRequestForms();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const params = useParams();
  const specUrl = params.url;

  const loadLocalSpec = useCallback((): object | undefined => {
    try {
      // Check if window.LOCAL_SPEC exists
      if (!window.LOCAL_SPEC) {
        throw new Error(
          "No local spec found. Define window.LOCAL_SPEC with your OpenAPI specification."
        );
      }

      // Verificar que sea un objeto válido
      if (typeof window.LOCAL_SPEC !== "object" || window.LOCAL_SPEC === null) {
        throw new Error(
          "window.LOCAL_SPEC is not a valid object with the OpenAPI specification."
        );
      }

      return window.LOCAL_SPEC;
    } catch (error) {
      // Use toast to show error
      addToast({
        title: "Error loading local spec",
        description: error instanceof Error ? error.message : "Unknown error",
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
        setSpecification(url ? url : "");
      } catch (err: any) {
        setError(err.message || "Failed to load or process the specification.");
      } finally {
        setIsLoading(false);
      }
    },
    [setSpec, setSpecification, loadLocalSpec]
  );

  useEffect(() => {
    const urlParam = searchParams.get("url");

    if (urlParam) {
      navigate(`/${escapeUrl(urlParam)}`, { replace: true });
    } else {
      loadSpec(specUrl);
    }
  }, [specUrl, loadSpec]);

  return (
    <div className="flex h-dvh w-full">
      {!error && !isLoading && <ApiExplorer />}

      <main className="flex-1 w-full items-center justify-center overflow-hidden bg-content1 mt-4 mb-2 border border-divider border-r-0 rounded-l-lg">
        {error ? (
          <ErrorComponent message={error} title="Error to get specification">
            <Link
              className="mt-10 underline text-primary"
              to={ROUTES.SPECIFICATION_SELECTOR}
            >
              Go to select another specification
            </Link>
          </ErrorComponent>
        ) : isLoading ? (
          <Loading />
        ) : (
          <Outlet />
        )}
      </main>
    </div>
  );
}
