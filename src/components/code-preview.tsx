import { Button } from "@heroui/button";
import { Card } from "@heroui/card";

export type SupportedLanguage = "JavaScript" | "cURL";

interface CodePreviewProps {
  requestPreview: {
    url: string;
    method: string;
    headers: Record<string, string>;
    body: Record<string, any>;
  };
  language: SupportedLanguage;
}

export const CodePreview = ({ language, requestPreview }: CodePreviewProps) => {
  const isMultipartFormData = (): boolean => {
    const contentType =
      requestPreview.headers["Content-Type"] ||
      requestPreview.headers["content-type"];

    return contentType?.includes("multipart/form-data") ?? false;
  };

  const generateCode = (): string => {
    switch (language) {
      case "JavaScript":
        const formattedHeaders = JSON.stringify(requestPreview.headers, null, 2)
          .split("\n")
          .map((line, i) => (i === 0 ? line : `    ${line}`))
          .join("\n");

        return `async function execute${
          requestPreview.method.charAt(0).toUpperCase() +
          requestPreview.method.slice(1).toLowerCase()
        }Request() {
${
  isMultipartFormData()
    ? `  const formData = new FormData();
${Object.entries(requestPreview.body)
  .map(
    ([key, value]) =>
      `  formData.append("${key}", ${
        typeof value === "string"
          ? `"${value}"`
          : value && typeof value === "object" && "name" in value
            ? `/* File: ${(value as any).name} */`
            : JSON.stringify(value)
      });`
  )
  .join("\n")}`
    : ""
}
  const response = await fetch('${requestPreview.url}', {
    method: '${requestPreview.method}',
    headers: ${formattedHeaders}${
      requestPreview.body
        ? `,
    body: ${
      isMultipartFormData()
        ? "formData"
        : `JSON.stringify(${JSON.stringify(requestPreview.body, null, 2)
            .split("\n")
            .map((line, i) => (i === 0 ? line : `      ${line}`))
            .join("\n")})`
    }`
        : ""
    }
  });

  const data = await response.json();
  console.log(data);
  return data;
}`;

      case "cURL":
        return `curl -X ${requestPreview.method} "${requestPreview.url}" \\
${Object.entries(requestPreview.headers)
  .map(([key, value]) => `  -H "${key}: ${value}"`)
  .join(" \\\n")}${
          requestPreview.body
            ? `${
                isMultipartFormData()
                  ? ` \\\n${Object.entries(requestPreview.body)
                      .map(([key, value]) => {
                        if (
                          value &&
                          typeof value === "object" &&
                          "name" in value
                        ) {
                          return `  -F "${key}=@${(value as any).name}"`;
                        }

                        return `  -F "${key}=${value}"`;
                      })
                      .join(" \\\n")}`
                  : `\n  -d '${JSON.stringify(requestPreview.body)}'`
              }`
            : ""
        }`;

      default:
        return "Language not supported";
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generateCode());
  };

  const getLanguageTitle = (): string => {
    switch (language) {
      case "JavaScript":
        return "JavaScript (Fetch)";
      case "cURL":
        return "cURL";
      default:
        return language;
    }
  };

  const code = generateCode();
  const escapedCode = code
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  return (
    <div className="overflow-hidden flex flex-col gap-3">
      <div className="flex gap-3 justify-between items-center">
        <h6 className="text-xs font-medium">{getLanguageTitle()}</h6>
        <Button size="sm" variant="flat" onClick={handleCopy}>
          Copy
        </Button>
      </div>
      <Card className="border border-divider" shadow="none">
        <pre className="p-3 text-xs overflow-x-auto rounded-md leading-relaxed">
          <code dangerouslySetInnerHTML={{ __html: escapedCode }} />
        </pre>
      </Card>
    </div>
  );
};
