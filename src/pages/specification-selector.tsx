import { useState } from "react";
import { Card, CardBody, CardFooter, CardHeader } from "@heroui/card";
import { Divider } from "@heroui/divider";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import { useNavigate } from "react-router-dom";

import { escapeUrl } from "@/shared/utils/helpers";
import {
  DocumentTextIcon,
  AnchorIcon,
  ServerIcon,
  ThunderIcon,
} from "@/shared/components/ui/icons";
import { ROUTES } from "@/shared/constants/constants";

export default function SpecificationSelectorPage() {
  const [specificationLink, setSpecificationLink] = useState<string>("");
  const navigate = useNavigate();

  // Handle manual URL submission
  const handleManualSubmit = () => {
    if (specificationLink.trim()) {
      navigate(`/${escapeUrl(specificationLink)}`);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <main className="w-full max-w-4xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <div className="p-6 bg-primary/10 rounded-2xl border border-primary/20">
              <ThunderIcon className="w-16 h-16 text-primary" />
            </div>
          </div>
          <div>
            <h1 className="font-bold text-4xl mb-4">API Explorer</h1>
            <p className="text-lg text-default-600 max-w-2xl mx-auto">
              Load and explore your OpenAPI specifications with our interactive
              documentation viewer.
            </p>
          </div>
        </div>

        <Divider className="bg-content1" />

        {/* Cards Container */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Remote URL Input */}
          <Card className="border border-divider">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
                  <AnchorIcon className="size-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Remote Specification</h2>
                  <p className="text-sm text-default-500">Load from URL</p>
                </div>
              </div>
            </CardHeader>

            <Divider className="bg-divider" />

            <CardBody className="space-y-6">
              <Input
                classNames={{
                  inputWrapper: "border-divider",
                }}
                label="Specification URL"
                placeholder="https://api.example.com/openapi.json"
                size="lg"
                startContent={
                  <AnchorIcon className="size-4 text-default-400" />
                }
                value={specificationLink}
                variant="bordered"
                onChange={(e) => setSpecificationLink(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    handleManualSubmit();
                  }
                }}
              />

              <div className="p-4 border border-divider rounded-lg space-y-3">
                <div className="flex items-center gap-2">
                  <DocumentTextIcon className="size-4" />
                  <span className="text-sm font-medium">Supported Formats</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Chip color="primary" size="sm" variant="flat">
                    JSON
                  </Chip>
                  <Chip color="primary" size="sm" variant="flat">
                    YAML
                  </Chip>
                  <Chip color="secondary" size="sm" variant="flat">
                    OpenAPI 3.x
                  </Chip>
                </div>
              </div>
            </CardBody>

            <CardFooter>
              <Button
                className="w-full font-medium"
                color="primary"
                isDisabled={!specificationLink.trim()}
                size="lg"
                startContent={<AnchorIcon className="size-4" />}
                variant="flat"
                onPress={handleManualSubmit}
              >
                Load Remote Specification
              </Button>
            </CardFooter>
          </Card>

          {/* Local Specification */}
          <Card className="border border-divider">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-success/10 rounded-lg border border-success/20">
                  <ServerIcon className="size-6 text-success" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Local Specification</h2>
                  <p className="text-sm text-default-500">
                    Use pre-loaded spec
                  </p>
                </div>
              </div>
            </CardHeader>

            <Divider className="bg-divider" />

            <CardBody className="space-y-6">
              <p className="text-sm text-default-600">
                Access a specification that&apos;s been pre-loaded in your
                application via{" "}
                <code className="bg-divider px-2 py-1 rounded text-xs font-mono">
                  window.LOCAL_SPEC
                </code>
              </p>

              <div className="p-4 border border-divider rounded-lg space-y-3">
                <div className="flex items-center gap-2">
                  <ServerIcon className="size-4" />
                  <span className="text-sm font-medium">
                    Local Specification
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  {window.LOCAL_SPEC ? (
                    <>
                      <div className="w-2 h-2 bg-success rounded-full" />
                      <span className="text-success">Ready to use</span>
                    </>
                  ) : (
                    <>
                      <div className="w-2 h-2 bg-warning rounded-full" />
                      <span className="text-warning">
                        There is not specification, please check
                      </span>
                    </>
                  )}
                </div>
              </div>
            </CardBody>

            <CardFooter>
              <Button
                className="w-full font-medium"
                color="success"
                size="lg"
                startContent={<ServerIcon className="size-4" />}
                variant="flat"
                onPress={() => navigate(ROUTES.APP)}
              >
                Use Local Specification
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center space-y-4">
          <Divider className="bg-content1" />
          <p className="text-sm text-default-500">
            Need help? Make sure your OpenAPI specification follows the{" "}
            <a
              className="hover:underline inline-flex items-center gap-1"
              href="https://swagger.io/specification/"
              rel="noopener noreferrer"
              target="_blank"
            >
              OpenAPI 3.0 standard
              <AnchorIcon className="size-3" />
            </a>
          </p>
          <p className="text-sm text-default-500">
            In any case, if the specification is less than 3.x.x it will be
            automatically transformed to 3.x.x
          </p>
        </div>
      </main>
    </div>
  );
}
