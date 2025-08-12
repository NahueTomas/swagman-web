import React, { useEffect, useState, useMemo, useCallback } from "react";
import { Chip } from "@heroui/chip";
import { Tabs, Tab } from "@heroui/tabs";

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

export const OperationTabs = React.memo(function OperationTabs({
  operation,
}: {
  operation: OperationModel;
}) {
  const [selectedTab, setSelectedTab] = useState("parameters");
  const [selectedResponseTab, setSelectedResponseTab] = useState("responses");

  const operationFocused = useStore((state) => state.operationFocused);
  const spec = useStore((state) => state.spec);

  // Memoize expensive operation data
  const operationData = useMemo(() => {
    const body = operation.getRequestBody();

    return {
      body,
      isBodyRequired: body?.required || false,
      bodyMimeTypes: body?.getMimeTypes() || [],
      queryParams: operation.getQueryParameters(),
      pathParams: operation.getPathParameters(),
      headerParams: operation.getHeaderParameters(),
    };
  }, [operation]);

  // Use specific selectors for useRequestForms
  const specificationUrl = useRequestForms((state) => state.specificationUrl);
  const specifications = useRequestForms((state) => state.specifications);
  const setFormValues = useRequestForms((state) => state.setFormValues);

  // Memoize the current form
  const currentForm = useMemo(() => {
    const formFromStore =
      specifications?.[specificationUrl || ""]?.forms?.[operation.id];

    if (formFromStore) return formFromStore;

    // Default form if it doesn't exist
    return {
      parameters: operation.getParameterDefaultValues(),
      contentType: operationData.bodyMimeTypes?.[0] || "",
      requestBody: operationData.body?.getFieldDefaultValues() || null,
    };
  }, [
    specifications,
    specificationUrl,
    operation.id,
    operation,
    operationData,
  ]);

  // Memoize the request preview
  const requestPreview = useMemo(() => {
    if (!operationFocused || !spec) return null;

    return spec.buildRequest(
      operationFocused,
      currentForm.requestBody?.[currentForm?.contentType || ""] || null,
      currentForm.parameters,
      currentForm.contentType
    );
  }, [operationFocused, spec, currentForm]);

  // Optimize handling of parameter changes
  const handleParameterChange = useCallback(
    (name: string, inType: string = "query", value: any, included: boolean) => {
      // Deep copy to avoid read-only errors
      const updatedForm = {
        ...currentForm,
        parameters: {
          ...currentForm.parameters,
          query: { ...currentForm.parameters.query },
          path: { ...currentForm.parameters.path },
          header: { ...currentForm.parameters.header },
        },
      };

      if (name === "Content-Type") {
        updatedForm.contentType = value;
      }

      // Update parameters according to the type
      if (inType === "query") {
        updatedForm.parameters.query[name] = { value, included };
      } else if (inType === "path") {
        updatedForm.parameters.path[name] = { value, included };
      } else if (inType === "header") {
        updatedForm.parameters.header[name] = { value, included };
      }

      setFormValues(specificationUrl || "", operation.id, updatedForm);
    },
    [currentForm, setFormValues, specificationUrl, operation.id]
  );

  // Optimize handling of Content-Type changes
  const handleContentTypeChange = useCallback(
    (contentType: string) => {
      // Deep copy to avoid read-only errors
      const updatedForm = {
        ...currentForm,
        parameters: {
          ...currentForm.parameters,
          query: { ...currentForm.parameters.query },
          path: { ...currentForm.parameters.path },
          header: { ...currentForm.parameters.header },
        },
      };

      if (
        contentType === currentForm.contentType &&
        !operationData.isBodyRequired
      ) {
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

      setFormValues(specificationUrl || "", operation.id, updatedForm);
    },
    [
      currentForm,
      operationData.isBodyRequired,
      setFormValues,
      specificationUrl,
      operation.id,
    ]
  );

  // Optimize body update
  const updateBody = useCallback(
    (bodyMediaType: string, bodyValues: any) => {
      if (!currentForm.requestBody) return;

      // Deep copy to avoid read-only errors
      const updatedForm = {
        ...currentForm,
        requestBody: {
          ...currentForm.requestBody,
          [bodyMediaType]: bodyValues,
        },
      };

      setFormValues(specificationUrl || "", operation.id, updatedForm);
    },
    [currentForm, setFormValues, specificationUrl, operation.id]
  );

  // Optimized effect to initialize the form
  useEffect(() => {
    // Only update if the form doesn't exist in the store
    if (!specifications?.[specificationUrl || ""]?.forms?.[operation.id]) {
      const defaultForm = {
        parameters: operation.getParameterDefaultValues(),
        contentType: operationData.bodyMimeTypes?.[0] || "",
        requestBody: operationData.body?.getFieldDefaultValues() || null,
      };

      setFormValues(specificationUrl || "", operation.id, defaultForm);
    }
  }, [
    operation.id,
    specifications,
    specificationUrl,
    setFormValues,
    operationData.bodyMimeTypes,
    operationData.body,
  ]);

  // Optimized effect to reset tabs
  useEffect(() => {
    if (!operationData.body) {
      setSelectedTab("parameters");
    }
    setSelectedResponseTab("responses");
  }, [operation.id, operationData.body]);

  if (!operationFocused) return null;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
      <div className="flex flex-col gap-4">
        <Tabs
          aria-label="Parameters, Headers and Body"
          classNames={{
            tabList:
              "gap-6 w-full relative rounded-none p-0 border-b border-content2",
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
            <div className="flex flex-col space-y-4">
              {operationData.pathParams.length > 0 && (
                <div className="space-y-2">
                  <Subtitle>Path Parameters</Subtitle>

                  <div className="border border-content2 rounded-lg">
                    {operationData.pathParams.map((param) => (
                      <OperationParameter
                        key={param.id}
                        included={
                          param.required
                            ? true
                            : !!currentForm?.parameters?.path?.[param.name]
                                ?.included
                        }
                        parameter={param}
                        value={
                          currentForm?.parameters?.path?.[param.name]?.value
                        }
                        onChange={handleParameterChange}
                      />
                    ))}
                  </div>
                </div>
              )}
              {operationData.queryParams.length > 0 && (
                <div className="space-y-2">
                  <Subtitle>Query Parameters</Subtitle>

                  <div className="border border-content2 rounded-lg">
                    {operationData.queryParams.map((param) => (
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
                </div>
              )}
              {operationData.pathParams.length === 0 &&
                operationData.queryParams.length === 0 && (
                  <div className="p-3 text-sm text-center border border-content2 rounded-lg">
                    No parameters defined for this operation
                  </div>
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
            {operationData.headerParams.length > 0 ? (
              <div className="space-y-2">
                <Subtitle>Header Parameters</Subtitle>

                <div className="border border-content2 rounded-lg">
                  {operationData.headerParams.map((param) => (
                    <OperationParameter
                      key={param.id}
                      included={
                        param.required
                          ? true
                          : !!currentForm?.parameters?.header?.[param.name]
                              ?.included
                      }
                      parameter={param}
                      value={
                        currentForm?.parameters?.header?.[param.name]?.value
                      }
                      onChange={handleParameterChange}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-3 text-sm text-center border border-content2 rounded-lg">
                No headers defined for this operation
              </div>
            )}
          </Tab>

          <Tab
            key="body"
            isDisabled={!operationData.body}
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
                    Body Content
                    {operationData.isBodyRequired && (
                      <Chip color="danger" size="sm" variant="flat">
                        Required
                      </Chip>
                    )}
                  </div>
                </Subtitle>

                {operationData.body && operationData.body.description && (
                  <span className="text-tiny font-semibold text-content4">
                    {operationData.body.description}
                  </span>
                )}

                <CardSelectableButtons
                  options={operationData.bodyMimeTypes.map((type) => ({
                    value: type,
                    selected: currentForm.contentType === type,
                  }))}
                  onClick={handleContentTypeChange}
                >
                  <>
                    <HeadersIcon className="size-4" />
                    Content-Type (Header):
                  </>
                </CardSelectableButtons>
              </div>

              <div className="space-y-2">
                {currentForm?.requestBody?.[currentForm.contentType] !==
                  undefined &&
                  currentForm?.requestBody?.[currentForm.contentType] !==
                    null && (
                    <RequestBody
                      bodyMediaType={operationData.body?.getMimeType(
                        currentForm.contentType
                      )}
                      currentValues={
                        currentForm.requestBody[currentForm.contentType]
                      }
                      updateBody={updateBody}
                    />
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
              "gap-6 w-full relative rounded-none p-0 border-b border-content2",
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
});
