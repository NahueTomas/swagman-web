import { Button } from "@heroui/button";
import { Card } from "@heroui/card";

export type SupportedLanguage = "JavaScript" | "Python" | "cURL" | "PHP";

interface CodePreviewProps {
  requestPreview: {
    url: string;
    method: string;
    headers: Record<string, string>;
    body: Record<string, string>;
  };
  language: SupportedLanguage;
}

export const CodePreview = ({ language, requestPreview }: CodePreviewProps) => {
  const generateCode = (): string => {
    switch (language) {
      case "JavaScript":
        return `async function execute${
          requestPreview.method.charAt(0).toUpperCase() +
          requestPreview.method.slice(1).toLowerCase()
        }Request() {
  try {
    const response = await fetch('${requestPreview.url}', {
      method: '${requestPreview.method}',
      headers: ${JSON.stringify(requestPreview.headers, null, 2)}${
        requestPreview.body
          ? `,
      body: ${
        typeof requestPreview.body === "string"
          ? `"${requestPreview.body}"`
          : `JSON.stringify(${JSON.stringify(requestPreview.body, null, 2)})`
      }`
          : ""
      }
    });
    
    const data = await response.json();
    console.log(data);
    return data;
  } catch (error) {
    console.error("Error:", error);
  }
}`;

      case "Python":
        return `import requests
import json

url = "${requestPreview.url}"
headers = ${JSON.stringify(requestPreview.headers, null, 2)}
${
  requestPreview.body
    ? `
payload = ${JSON.stringify(requestPreview.body, null, 2)}

response = requests.${requestPreview.method.toLowerCase()}(
    url,
    headers=headers,
    json=payload
)`
    : `
response = requests.${requestPreview.method.toLowerCase()}(
    url,
    headers=headers
)`
}

print(response.status_code)
print(response.json())`;

      case "cURL":
        return `curl -X ${requestPreview.method} "${requestPreview.url}" \\
${Object.entries(requestPreview.headers)
  .map(([key, value]) => `  -H "${key}: ${value}" \\`)
  .join("\n")}${
          requestPreview.body
            ? `
  -d '${JSON.stringify(requestPreview.body)}'`
            : ""
        }`;

      case "PHP":
        return `<?php

$curl = curl_init();

curl_setopt_array($curl, [
  CURLOPT_URL => "${requestPreview.url}",
  CURLOPT_RETURNTRANSFER => true,
  CURLOPT_CUSTOMREQUEST => "${requestPreview.method}",
  CURLOPT_HTTPHEADER => [
${Object.entries(requestPreview.headers)
  .map(([key, value]) => `    "${key}: ${value}"`)
  .join(",\n")}
  ]${
    requestPreview.body
      ? `,
  CURLOPT_POSTFIELDS => json_encode(${JSON.stringify(
    requestPreview.body,
    null,
    4
  )})`
      : ""
  }
]);

$response = curl_exec($curl);
$err = curl_error($curl);

curl_close($curl);

if ($err) {
  echo "cURL Error #:" . $err;
} else {
  echo $response;
}
?>`;

      default:
        return "Lenguaje no soportado";
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generateCode());
  };

  const getLanguageTitle = (): string => {
    switch (language) {
      case "JavaScript":
        return "JavaScript (Fetch)";
      case "Python":
        return "Python (requests)";
      case "cURL":
        return "cURL";
      case "PHP":
        return "PHP";
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
