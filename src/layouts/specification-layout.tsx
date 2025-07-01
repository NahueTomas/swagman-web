import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Divider } from "@heroui/divider";

import { ApiExplorer } from "@/features/api-explorer";
import { SpecModel } from "@/models/spec.model";
import { useStore } from "@/hooks/use-store";
import { Error } from "@/shared/components/ui/error";
import { Loading } from "@/features/specification/loading";
import { unescapeUrl } from "@/shared/utils/helpers";
import { useRequestForms } from "@/hooks/use-request-forms";

export default function SpecificationLayout() {
  const { setSpec } = useStore();
  const { setSpecification } = useRequestForms();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { pathname } = useLocation();

  useEffect(() => {
    const pathParts = pathname.split("/");
    const urlIndex = pathParts.indexOf("specification") + 1;
    const specUrl = unescapeUrl(urlIndex > 0 ? pathParts[urlIndex] : "");

    const spec = new SpecModel();

    setSpecification(specUrl);

    spec
      .processSpec(specUrl)
      .then(() => {
        setSpec(spec);
        setError(null);
      })
      .catch((err) => {
        setError(err.message || "Failed to load or process the specification.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  return (
    <div className="flex h-dvh w-full">
      {!error && !isLoading && (
        <div className="flex flex-row h-full">
          <ApiExplorer />
          <Divider orientation="vertical" />
        </div>
      )}

      <main className="flex-1 w-full items-center justify-center bg-content1/15 overflow-hidden">
        {error ? (
          <Error message={error} title="Error to get specification" />
        ) : isLoading ? (
          <Loading />
        ) : (
          <Outlet />
        )}
      </main>
    </div>
  );
}
