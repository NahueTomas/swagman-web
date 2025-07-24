import { useState, useEffect } from "react";
import { Card, CardBody, CardFooter, CardHeader } from "@heroui/card";
import { Divider } from "@heroui/divider";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { useSearchParams, useNavigate } from "react-router-dom";

import { escapeUrl } from "@/shared/utils/helpers";

export default function IndexPage() {
  const [specificationLink, setSpecificationLink] = useState<string>("");
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const urlParam = searchParams.get("url");

    if (urlParam) {
      navigate(`/${escapeUrl(urlParam)}`, { replace: true });
    }
  }, [searchParams, navigate]);

  // Handle manual URL submission
  const handleManualSubmit = () => {
    if (specificationLink) {
      navigate(`/${escapeUrl(specificationLink)}`);
    }
  };

  return (
    <main className="flex flex-col items-center justify-center gap-6 py-8 md:py-10 max-w-4xl mx-auto px-4">
      {/* Manual URL Input */}
      <Card
        aria-labelledby="url-form-title"
        className="w-full max-w-md"
        role="form"
      >
        <CardHeader>
          <h1 id="url-form-title">OpenAPI Specification</h1>
        </CardHeader>
        <Divider />
        <CardBody>
          <Input
            aria-describedby="url-input-help"
            label="Specification URL"
            placeholder="https://example.com/openapi.json"
            value={specificationLink}
            onChange={(e) => setSpecificationLink(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                handleManualSubmit();
              }
            }}
          />
          <div className="sr-only" id="url-input-help">
            Enter the URL of an OpenAPI specification to load and explore
          </div>
        </CardBody>
        <CardFooter>
          <Button
            aria-describedby="load-button-help"
            color="primary"
            isDisabled={!specificationLink}
            onPress={handleManualSubmit}
          >
            Load Specification
          </Button>
          <div className="sr-only" id="load-button-help">
            This will navigate to the API explorer for the provided
            specification
          </div>
        </CardFooter>
      </Card>

      {/* Navigation to local */}
      <Card aria-labelledby="local-spec-title" className="w-full max-w-md">
        <CardHeader>
          <h2 id="local-spec-title">Local Specification</h2>
        </CardHeader>
        <Divider />
        <CardBody>
          <p className="text-sm text-foreground-600 mb-3">
            Use a locally defined specification (window.LOCAL_SPEC)
          </p>
          <Button
            aria-label="Navigate to local specification explorer"
            color="success"
            variant="flat"
            onPress={() => navigate("/local")}
          >
            Go to Local Specification
          </Button>
        </CardBody>
      </Card>
    </main>
  );
}
