import { useEffect, useState } from "react";
import { Chip } from "@heroui/chip";
import { Tabs, Tab } from "@heroui/tabs";
import { Card } from "@heroui/card";

import { OperationParameter } from "./operation-parameter";
import { OperationResponse } from "./operation-response";
import { OperationCode } from "./operation-code";

import { Subtitle } from "@/shared/components/ui/subtitle";
import { CardSelectableButtons } from "@/shared/components/ui/card-selectable-buttons";
import { RequestBody } from "@/features/request-body/request-body";
import { OperationModel } from "@/models/operation.model";
import { useStore } from "@/hooks/use-store";
import { useRequestForms } from "@/hooks/use-request-forms";
import {
  BodyIcon,
  CodeIcon,
  DocumentTextIcon,
  HeadersIcon,
  ParametersIcon,
} from "@/shared/components/ui/icons";

export const OperationTabs = ({ operation }: { operation: OperationModel }) => {
  const [selectedTab, setSelectedTab] = useState("parameters");
  const [selectedResponseTab, setSelectedResponseTab] = useState("responses");
  const { operationFocused, spec } = useStore((state) => state);

  const body = operation.getRequestBody();
  const isBodyRequired = body?.required || false;
  const bodyMimeTypes = body?.getMimeTypes() || [];

  // Get form state from Zustand store and initialize it or create a new one
  const { specificationUrl, specifications, setFormValues } = useRequestForms(
    (state) => state
  );
  const currentForm = specifications?.[specificationUrl || ""]?.forms?.[
    operation.id
  ] || {
    parameters: operation.getParameterDefaultValues(),
    contentType: bodyMimeTypes?.[0] || "",
    requestBody: body?.getFieldDefaultValues() || null,
  };

  // Initialize parameters and headers
  const queryParams = operation.getQueryParameters();
  const pathParams = operation.getPathParameters();
  const headerParams = operation.getHeaderParameters();

  useEffect(() => {
    // Update form state
    setFormValues(specificationUrl || "", operation.id, { ...currentForm });

    // Generate and set the request preview
    // TODO: Ensure the request preview
  }, [operation.id]);

  useEffect(() => {
    // Reset tabs when operation changes
    if (!body) {
      setSelectedTab("parameters");
    }
    setSelectedResponseTab("responses");
  }, [operation.id, body]);

  const handleParameterChange = (
    name: string,
    inType: string = "query",
    value: any,
    included: boolean
  ) => {
    if (name === "Content-Type") currentForm.contentType = value;

    // Asegurarse de que inType es una clave válida
    if (inType === "query") {
      currentForm.parameters.query[name] = { value, included };
    } else if (inType === "path") {
      currentForm.parameters.path[name] = { value, included };
    } else if (inType === "header") {
      currentForm.parameters.header[name] = { value, included };
    }

    // Update Zustand store with new form values
    const updatedForm = {
      contentType: currentForm.contentType,
      parameters: currentForm.parameters,
      requestBody: currentForm.requestBody,
    };

    setFormValues(specificationUrl || "", operation.id, updatedForm);
  };

  const handleContentTypeChange = (contentType: string) => {
    // Create a copy of current form to update
    const updatedForm = { ...currentForm };

    // Update contentType in form
    if (contentType === currentForm.contentType && !isBodyRequired) {
      updatedForm.contentType = "";
      updatedForm.parameters.header["Content-Type"] = {
        value: "",
        included: false,
      };
    } else {
      updatedForm.contentType = contentType;
      updatedForm.parameters.header["Content-Type"] = {
        value: contentType,
        included: true,
      };
    }

    // Update form in store
    setFormValues(specificationUrl || "", operation.id, updatedForm);
  };

  const updateBody = (bodyMediaType: string, bodyValues: any) => {
    if (!currentForm.requestBody) return null;

    // Create a copy of current form to update
    const updatedForm = {
      ...currentForm,
      requestBody: {
        ...currentForm.requestBody,
        [bodyMediaType]: bodyValues,
      },
    };

    setFormValues(specificationUrl || "", operation.id, updatedForm);
  };

  if (!operationFocused) return null;

  const requestPreview = spec?.buildRequest(
    operationFocused,
    currentForm.requestBody?.[currentForm?.contentType || ""] || null,
    currentForm.parameters,
    currentForm.contentType
  );

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
      <div className="flex flex-col gap-4">
        <Tabs
          aria-label="Parameters, Headers and Body"
          classNames={{
            tabList:
              "gap-6 w-full relative rounded-none p-0 border-b border-divider",
            panel: "p-0",
            cursor: "w-full",
            tab: "max-w-fit px-0 h-12",
          }}
          color="default"
          selectedKey={selectedTab}
          size="lg"
          variant="underlined"
          onSelectionChange={(key) => setSelectedTab(key.toString())}
        >
          <Tab
            key="parameters"
            title={
              <div className="flex items-center gap-2">
                <ParametersIcon className="size-4" />
                Parameters
              </div>
            }
          >
            <div className="flex flex-col space-y-6">
              {pathParams.length > 0 && (
                <div className="space-y-2">
                  <Subtitle>
                    <div className="flex items-center gap-2">
                      <Chip color="secondary" size="sm" variant="flat">
                        Path
                      </Chip>
                      Parameters
                    </div>
                  </Subtitle>

                  {pathParams.map((param) => (
                    <OperationParameter
                      key={param.id}
                      included={
                        param.required
                          ? true
                          : !!currentForm?.parameters?.path?.[param.name]
                              ?.included
                      }
                      parameter={param}
                      value={currentForm?.parameters?.path?.[param.name]?.value}
                      onChange={handleParameterChange}
                    />
                  ))}
                </div>
              )}
              {queryParams.length > 0 && (
                <div className="space-y-2">
                  <Subtitle>
                    <div className="flex items-center gap-2">
                      <Chip color="primary" size="sm" variant="flat">
                        Query
                      </Chip>
                      Parameters
                    </div>
                  </Subtitle>

                  {queryParams.map((param) => (
                    <OperationParameter
                      key={param.id}
                      included={
                        param.required
                          ? true
                          : !!currentForm?.parameters?.query?.[param.name]
                              ?.included
                      }
                      parameter={param}
                      value={
                        currentForm?.parameters?.query?.[param.name]?.value
                      }
                      onChange={handleParameterChange}
                    />
                  ))}
                </div>
              )}
              {pathParams.length === 0 && queryParams.length === 0 && (
                <Card
                  className="p-3 text-sm text-center bg-content1/10 border border-divider"
                  shadow="none"
                >
                  No parameters defined for this operation
                </Card>
              )}
            </div>
          </Tab>

          <Tab
            key="headers"
            title={
              <div className="flex items-center gap-2">
                <HeadersIcon className="size-4" />
                Headers
              </div>
            }
          >
            {headerParams.length > 0 ? (
              <div className="space-y-2">
                <Subtitle>
                  <div className="flex items-center gap-2">
                    <Chip color="success" size="sm" variant="flat">
                      Header
                    </Chip>
                    Parameters
                  </div>
                </Subtitle>

                {headerParams.map((param) => (
                  <OperationParameter
                    key={param.id}
                    included={
                      param.required
                        ? true
                        : !!currentForm?.parameters?.header?.[param.name]
                            ?.included
                    }
                    parameter={param}
                    value={currentForm?.parameters?.header?.[param.name]?.value}
                    onChange={handleParameterChange}
                  />
                ))}
              </div>
            ) : (
              <Card
                className="p-3 text-sm text-center bg-content1/10 border border-divider"
                shadow="none"
              >
                No headers defined for this operation
              </Card>
            )}
          </Tab>

          <Tab
            key="body"
            isDisabled={!body}
            title={
              <div className="flex items-center gap-2">
                <BodyIcon className="size-4" />
                Body
              </div>
            }
          >
            <div className="flex flex-col space-y-4">
              <div className="space-y-2">
                <Subtitle>
                  <div className="flex items-center gap-2">
                    <Chip color="warning" size="sm" variant="flat">
                      Body
                    </Chip>
                    Content
                    {isBodyRequired && (
                      <Chip color="danger" size="sm" variant="flat">
                        Required
                      </Chip>
                    )}
                  </div>
                </Subtitle>

                {body && body.description && (
                  <span className="text-xs text-zinc-500">
                    {body.description}
                  </span>
                )}

                <CardSelectableButtons
                  options={bodyMimeTypes.map((type) => ({
                    value: type,
                    selected: currentForm.contentType === type,
                  }))}
                  onClick={handleContentTypeChange}
                >
                  <>
                    <HeadersIcon className="size-4" />
                    Content-Type:
                  </>
                </CardSelectableButtons>
              </div>

              <div className="space-y-2">
                {currentForm?.requestBody?.[currentForm.contentType] !==
                  undefined &&
                  currentForm?.requestBody?.[currentForm.contentType] !==
                    null && (
                    <>
                      <Subtitle>Body content</Subtitle>

                      <RequestBody
                        bodyMediaType={body?.getMimeType(
                          currentForm.contentType
                        )}
                        currentValues={
                          currentForm.requestBody[currentForm.contentType]
                        }
                        updateBody={updateBody}
                      />
                    </>
                  )}
              </div>
            </div>
          </Tab>
        </Tabs>
      </div>

      <div className="flex flex-col gap-4">
        <Tabs
          aria-label="Responses and Code"
          classNames={{
            tabList:
              "gap-6 w-full relative rounded-none p-0 border-b border-divider",
            panel: "p-0",
            cursor: "w-full",
            tab: "max-w-fit px-0 h-12",
          }}
          color="default"
          selectedKey={selectedResponseTab}
          size="lg"
          variant="underlined"
          onSelectionChange={(key) => setSelectedResponseTab(key.toString())}
        >
          <Tab
            key="responses"
            title={
              <div className="flex items-center gap-2">
                <DocumentTextIcon className="size-4" />
                Responses
              </div>
            }
          >
            <OperationResponse
              acceptHeader={
                (currentForm?.parameters?.header?.["Accept"]
                  ?.value as string) || ""
              }
              operation={operation}
            />
          </Tab>

          <Tab
            key="code"
            title={
              <div className="flex items-center gap-2">
                <CodeIcon className="size-4" />
                Code
              </div>
            }
          >
            <OperationCode
              requestPreview={{
                url: requestPreview.url,
                method: requestPreview.method,
                headers: requestPreview.headers,
                body: requestPreview.body,
              }}
            />
          </Tab>
        </Tabs>
      </div>
    </div>
  );
};
