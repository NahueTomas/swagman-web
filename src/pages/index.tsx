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
    <section className="flex flex-col items-center justify-center gap-6 py-8 md:py-10 max-w-4xl mx-auto px-4">
      {/* Manual URL Input */}
      <Card className="w-full max-w-md">
        <CardHeader>
          <h1>OpenAPI Specification</h1>
        </CardHeader>
        <Divider />
        <CardBody>
          <Input
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
        </CardBody>
        <CardFooter>
          <Button
            color="primary"
            isDisabled={!specificationLink}
            onPress={handleManualSubmit}
          >
            Load Specification
          </Button>
        </CardFooter>
      </Card>

      {/* Navigation to local */}
      <Card className="w-full max-w-md">
        <CardHeader>
          <h2>Local Specification</h2>
        </CardHeader>
        <Divider />
        <CardBody>
          <p className="text-sm text-foreground-600 mb-3">
            Use a locally defined specification (window.LOCAL_SPEC)
          </p>
          <Button color="success" variant="flat" onPress={() => navigate("/")}>
            Go to Local Specification
          </Button>
        </CardBody>
      </Card>
    </section>
  );
}
