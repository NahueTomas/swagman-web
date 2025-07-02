import React, { useEffect, useState, useMemo, useCallback } from "react";
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

export const OperationTabs = React.memo(function OperationTabs({
  operation,
}: {
  operation: OperationModel;
}) {
  const [selectedTab, setSelectedTab] = useState("parameters");
  const [selectedResponseTab, setSelectedResponseTab] = useState("responses");

  // Usar selectores específicos para evitar loops infinitos
  const operationFocused = useStore((state) => state.operationFocused);
  const spec = useStore((state) => state.spec);

  // Memoizar datos costosos de la operación
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

  // Usar selectores específicos para useRequestForms también
  const specificationUrl = useRequestForms((state) => state.specificationUrl);
  const specifications = useRequestForms((state) => state.specifications);
  const setFormValues = useRequestForms((state) => state.setFormValues);

  // Memoizar el formulario actual
  const currentForm = useMemo(() => {
    const formFromStore =
      specifications?.[specificationUrl || ""]?.forms?.[operation.id];

    if (formFromStore) return formFromStore;

    // Default form si no existe
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

  // Memoizar la vista previa de la solicitud
  const requestPreview = useMemo(() => {
    if (!operationFocused || !spec) return null;

    return spec.buildRequest(
      operationFocused,
      currentForm.requestBody?.[currentForm?.contentType || ""] || null,
      currentForm.parameters,
      currentForm.contentType
    );
  }, [operationFocused, spec, currentForm]);

  // Optimizar manejo de cambios de parámetros
  const handleParameterChange = useCallback(
    (name: string, inType: string = "query", value: any, included: boolean) => {
      const updatedForm = { ...currentForm };

      if (name === "Content-Type") {
        updatedForm.contentType = value;
      }

      // Actualizar parámetros según el tipo
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

  // Optimizar manejo de cambios de Content-Type
  const handleContentTypeChange = useCallback(
    (contentType: string) => {
      const updatedForm = { ...currentForm };

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

  // Optimizar actualización del body
  const updateBody = useCallback(
    (bodyMediaType: string, bodyValues: any) => {
      if (!currentForm.requestBody) return;

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

  // Efecto optimizado para inicializar el formulario
  useEffect(() => {
    // Solo actualizar si no existe el formulario en el store
    if (!specifications?.[specificationUrl || ""]?.forms?.[operation.id]) {
      setFormValues(specificationUrl || "", operation.id, currentForm);
    }
  }, [
    operation.id,
    specifications,
    specificationUrl,
    setFormValues,
    currentForm,
  ]);

  // Efecto optimizado para resetear tabs
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
              {operationData.pathParams.length > 0 && (
                <div className="space-y-2">
                  <Subtitle>
                    <div className="flex items-center gap-2">
                      <Chip color="secondary" size="sm" variant="flat">
                        Path
                      </Chip>
                      Parameters
                    </div>
                  </Subtitle>

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
                      value={currentForm?.parameters?.path?.[param.name]?.value}
                      onChange={handleParameterChange}
                    />
                  ))}
                </div>
              )}
              {operationData.queryParams.length > 0 && (
                <div className="space-y-2">
                  <Subtitle>
                    <div className="flex items-center gap-2">
                      <Chip color="primary" size="sm" variant="flat">
                        Query
                      </Chip>
                      Parameters
                    </div>
                  </Subtitle>

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
              )}
              {operationData.pathParams.length === 0 &&
                operationData.queryParams.length === 0 && (
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
            {operationData.headerParams.length > 0 ? (
              <div className="space-y-2">
                <Subtitle>
                  <div className="flex items-center gap-2">
                    <Chip color="success" size="sm" variant="flat">
                      Header
                    </Chip>
                    Parameters
                  </div>
                </Subtitle>

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
                    <Chip color="warning" size="sm" variant="flat">
                      Body
                    </Chip>
                    Content
                    {operationData.isBodyRequired && (
                      <Chip color="danger" size="sm" variant="flat">
                        Required
                      </Chip>
                    )}
                  </div>
                </Subtitle>

                {operationData.body && operationData.body.description && (
                  <span className="text-xs text-zinc-500">
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
                        bodyMediaType={operationData.body?.getMimeType(
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
});
