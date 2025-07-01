import { Code } from "@/shared/components/ui/code";

export type SupportedLanguage =
  | "JavaScript"
  | "TypeScript"
  | "Python"
  | "cURL"
  | "PHP";

interface CodePreviewProps {
  requestPreview: {
    url: string;
    method: string;
    headers: Record<string, string>;
    body: Record<string, any>;
  };
  language: SupportedLanguage;
}

export const OperationCodePreview = ({
  language,
  requestPreview,
}: CodePreviewProps) => {
  const isMultipartFormData = (): boolean => {
    const contentType =
      requestPreview.headers["Content-Type"] ||
      requestPreview.headers["content-type"];

    return contentType?.includes("multipart/form-data") ?? false;
  };

  const hasBody = (): boolean => {
    return requestPreview.body && Object.keys(requestPreview.body).length > 0;
  };

  const escapeString = (str: string): string => {
    return str.replace(/'/g, "\\'").replace(/"/g, '\\"');
  };

  const getBodyForRequest = (body: any, indentSize: number = 8): string => {
    const contentType =
      requestPreview.headers["Content-Type"] ||
      requestPreview.headers["content-type"] ||
      "";
    const isJsonContent = contentType.toLowerCase().includes("json");

    if (typeof body === "string") {
      if (isJsonContent) {
        // For JSON content-type, parse and stringify properly
        try {
          const parsed = JSON.parse(body);

          return `JSON.stringify(${JSON.stringify(parsed, null, 2)
            .split("\n")
            .map((line, i) =>
              i === 0 ? line : `${" ".repeat(indentSize)}${line}`
            )
            .join("\n")})`;
        } catch {
          // If can't parse, treat as raw JSON string
          return `JSON.stringify(${JSON.stringify(body, null, 2)})`;
        }
      } else {
        // For non-JSON content-type, use template literal
        return `\`${body}\``;
      }
    }

    // If body is an object, stringify it
    return `JSON.stringify(${JSON.stringify(body, null, 2)
      .split("\n")
      .map((line, i) => (i === 0 ? line : `${" ".repeat(indentSize)}${line}`))
      .join("\n")})`;
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
  try {
${
  isMultipartFormData() && hasBody()
    ? `    const formData = new FormData();
${Object.entries(requestPreview.body)
  .map(
    ([key, value]) =>
      `    formData.append("${key}", ${
        typeof value === "string"
          ? `"${escapeString(value)}"`
          : value && typeof value === "object" && "name" in value
            ? `/* File: ${(value as any).name} */`
            : JSON.stringify(value)
      });`
  )
  .join("\n")}
`
    : ""
}
    const response = await fetch('${requestPreview.url}', {
      method: '${requestPreview.method}',
      headers: ${formattedHeaders}${
        hasBody()
          ? `,
      body: ${
        isMultipartFormData()
          ? "formData"
          : getBodyForRequest(requestPreview.body, 8)
      }`
          : ""
      }
    });

    if (!response.ok) {
      throw new Error(\`HTTP error! status: \${response.status}\`);
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      console.log('Response:', data);
      return data;
    } else {
      const text = await response.text();
      console.log('Response:', text);
      return text;
    }
  } catch (error) {
    console.error('Request failed:', error);
    throw error;
  }
}

// Usage:
// execute${
          requestPreview.method.charAt(0).toUpperCase() +
          requestPreview.method.slice(1).toLowerCase()
        }Request().then(result => {
//   console.log('Success:', result);
// }).catch(error => {
//   console.error('Error:', error);
// });`;

      case "TypeScript":
        const tsFormattedHeaders = JSON.stringify(
          requestPreview.headers,
          null,
          2
        )
          .split("\n")
          .map((line, i) => (i === 0 ? line : `    ${line}`))
          .join("\n");

        return `interface ApiResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
}

async function execute${
          requestPreview.method.charAt(0).toUpperCase() +
          requestPreview.method.slice(1).toLowerCase()
        }Request<T = any>(): Promise<ApiResponse<T>> {
  try {
${
  isMultipartFormData() && hasBody()
    ? `    const formData = new FormData();
${Object.entries(requestPreview.body)
  .map(
    ([key, value]) =>
      `    formData.append("${key}", ${
        typeof value === "string"
          ? `"${escapeString(value)}"`
          : value && typeof value === "object" && "name" in value
            ? `/* File: ${(value as any).name} */ file`
            : JSON.stringify(value)
      });`
  )
  .join("\n")}
`
    : ""
}
    const response: Response = await fetch('${requestPreview.url}', {
      method: '${requestPreview.method}',
      headers: ${tsFormattedHeaders}${
        hasBody()
          ? `,
      body: ${
        isMultipartFormData()
          ? "formData"
          : getBodyForRequest(requestPreview.body, 8)
      }`
          : ""
      }
    });

    if (!response.ok) {
      throw new Error(\`HTTP error! status: \${response.status} - \${response.statusText}\`);
    }

    const contentType = response.headers.get('content-type');
    let data: T;
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text() as T;
    }

    return {
      data,
      status: response.status,
      statusText: response.statusText
    };
  } catch (error) {
    console.error('Request failed:', error);
    throw error;
  }
}

// Usage:
// execute${
          requestPreview.method.charAt(0).toUpperCase() +
          requestPreview.method.slice(1).toLowerCase()
        }Request<YourResponseType>()
//   .then(result => console.log('Success:', result.data))
//   .catch(error => console.error('Error:', error));`;

      case "Python":
        return `import requests
import json
from typing import Dict, Any, Optional

def execute_${requestPreview.method.toLowerCase()}_request() -> Optional[Dict[str, Any]]:
    """
    Execute ${requestPreview.method} request to ${requestPreview.url}
    """
    url = "${requestPreview.url}"
    headers = ${JSON.stringify(requestPreview.headers, null, 4).replace(/"/g, '"')}
    
    try:
${
  hasBody()
    ? isMultipartFormData()
      ? `        # Multipart form data
        files = {}
        data = {}
        
${Object.entries(requestPreview.body)
  .map(([key, value]) => {
    if (value && typeof value === "object" && "name" in value) {
      return `        files["${key}"] = open("${(value as any).name}", "rb")  # Replace with actual file path`;
    }

    return `        data["${key}"] = ${JSON.stringify(value)}`;
  })
  .join("\n")}
        
        response = requests.${requestPreview.method.toLowerCase()}(
            url=url,
            headers=headers,
            files=files,
            data=data
        )`
      : typeof requestPreview.body === "string"
        ? (() => {
            const contentType =
              requestPreview.headers["Content-Type"] ||
              requestPreview.headers["content-type"] ||
              "";
            const isJsonContent = contentType.toLowerCase().includes("json");

            if (isJsonContent) {
              try {
                const parsed = JSON.parse(requestPreview.body as string);

                return `        data = ${JSON.stringify(parsed, null, 8)}
        
        response = requests.${requestPreview.method.toLowerCase()}(
            url=url,
            headers=headers,
            json=data
        )`;
              } catch {
                return `        data = """${requestPreview.body}"""
        
        response = requests.${requestPreview.method.toLowerCase()}(
            url=url,
            headers=headers,
            data=data
        )`;
              }
            } else {
              return `        data = """${requestPreview.body}"""
        
        response = requests.${requestPreview.method.toLowerCase()}(
            url=url,
            headers=headers,
            data=data
        )`;
            }
          })()
        : `        data = ${JSON.stringify(requestPreview.body, null, 8)}
        
        response = requests.${requestPreview.method.toLowerCase()}(
            url=url,
            headers=headers,
            json=data
        )`
    : `        response = requests.${requestPreview.method.toLowerCase()}(
            url=url,
            headers=headers
        )`
}
        
        # Raise an exception for bad status codes
        response.raise_for_status()
        
        # Try to parse JSON response
        try:
            result = response.json()
            print(f"Success: {result}")
            return result
        except json.JSONDecodeError:
            result = response.text
            print(f"Success: {result}")
            return {"text": result}
            
    except requests.exceptions.RequestException as e:
        print(f"Request failed: {e}")
        return None
    except Exception as e:
        print(f"Unexpected error: {e}")
        return None
${
  isMultipartFormData() && hasBody()
    ? `    finally:
        # Close file handles
        for file_handle in files.values():
            if hasattr(file_handle, 'close'):
                file_handle.close()`
    : ""
}

# Usage:
if __name__ == "__main__":
    result = execute_${requestPreview.method.toLowerCase()}_request()
    if result:
        print("Request completed successfully")
    else:
        print("Request failed")`;

      case "PHP":
        return `<?php

function execute${
          requestPreview.method.charAt(0).toUpperCase() +
          requestPreview.method.slice(1).toLowerCase()
        }Request() {
    $url = "${requestPreview.url}";
    $headers = [
${Object.entries(requestPreview.headers)
  .map(([key, value]) => `        "${key}: ${value}"`)
  .join(",\n")}
    ];
    
    $ch = curl_init();
    
    // Basic cURL options
    curl_setopt_array($ch, [
        CURLOPT_URL => $url,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_CUSTOMREQUEST => "${requestPreview.method}",
        CURLOPT_HTTPHEADER => $headers,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_TIMEOUT => 30,
        CURLOPT_SSL_VERIFYPEER => false, // Only for development
    ]);
    
${
  hasBody()
    ? isMultipartFormData()
      ? `    // Multipart form data
    $postData = [
${Object.entries(requestPreview.body)
  .map(([key, value]) => {
    if (value && typeof value === "object" && "name" in value) {
      return `        "${key}" => new CURLFile("${(value as any).name}") // Replace with actual file path`;
    }

    return `        "${key}" => ${JSON.stringify(value)}`;
  })
  .join(",\n")}
    ];
    curl_setopt($ch, CURLOPT_POSTFIELDS, $postData);`
      : (() => {
          const contentType =
            requestPreview.headers["Content-Type"] ||
            requestPreview.headers["content-type"] ||
            "";
          const isJsonContent = contentType.toLowerCase().includes("json");

          if (typeof requestPreview.body === "string") {
            if (isJsonContent) {
              try {
                const parsed = JSON.parse(requestPreview.body);

                return `    // JSON data
    $postData = json_encode(${JSON.stringify(parsed, null, 4)});
    curl_setopt($ch, CURLOPT_POSTFIELDS, $postData);`;
              } catch {
                return `    // Raw JSON string
    $postData = '${(requestPreview.body as string).replace(/'/g, "\\'")}';
    curl_setopt($ch, CURLOPT_POSTFIELDS, $postData);`;
              }
            } else {
              return `    // Raw data (XML or text)
    $postData = '${(requestPreview.body as string).replace(/'/g, "\\'")}';
    curl_setopt($ch, CURLOPT_POSTFIELDS, $postData);`;
            }
          } else {
            return `    // JSON data
    $postData = json_encode(${JSON.stringify(requestPreview.body, null, 4)});
    curl_setopt($ch, CURLOPT_POSTFIELDS, $postData);`;
          }
        })()
    : ""
}
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    
    curl_close($ch);
    
    if ($error) {
        throw new Exception("cURL Error: " . $error);
    }
    
    if ($httpCode >= 400) {
        throw new Exception("HTTP Error: " . $httpCode);
    }
    
    // Try to decode JSON response
    $decodedResponse = json_decode($response, true);
    
    if (json_last_error() === JSON_ERROR_NONE) {
        return $decodedResponse;
    }
    
    // Return raw response if not JSON
    return $response;
}

// Usage:
try {
    $result = execute${
      requestPreview.method.charAt(0).toUpperCase() +
      requestPreview.method.slice(1).toLowerCase()
    }Request();
    echo "Success: " . json_encode($result) . PHP_EOL;
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . PHP_EOL;
}

?>`;

      case "cURL":
        const curlHeaders = Object.entries(requestPreview.headers)
          .map(([key, value]) => `  -H "${key}: ${value}"`)
          .join(" \\\n");

        return `curl -X ${requestPreview.method} \\
  "${requestPreview.url}" \\
${curlHeaders}${
          hasBody()
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

                        return `  -F "${key}=${escapeString(String(value))}"`;
                      })
                      .join(" \\\n")}`
                  : ` \\\n  -d '${(() => {
                      const contentType =
                        requestPreview.headers["Content-Type"] ||
                        requestPreview.headers["content-type"] ||
                        "";
                      const isJsonContent = contentType
                        .toLowerCase()
                        .includes("json");

                      if (typeof requestPreview.body === "string") {
                        if (isJsonContent) {
                          try {
                            const parsed = JSON.parse(requestPreview.body);

                            return JSON.stringify(parsed);
                          } catch {
                            return requestPreview.body;
                          }
                        } else {
                          return requestPreview.body;
                        }
                      } else {
                        return JSON.stringify(requestPreview.body);
                      }
                    })()}'`
              }`
            : ""
        } \\
  --compressed \\
  --location \\
  --max-time 30 \\
  --show-error \\
  --silent \\
  --write-out "\\nHTTP Status: %{http_code}\\nTotal Time: %{time_total}s\\n"`;

      default:
        return "Language not supported";
    }
  };

  const getCodeLanguage = ():
    | "javascript"
    | "typescript"
    | "plaintext"
    | "json"
    | "xml"
    | "html"
    | "css"
    | "yaml"
    | "sql" => {
    switch (language) {
      case "JavaScript":
        return "javascript";
      case "TypeScript":
        return "typescript";
      case "Python":
        return "plaintext"; // Python syntax highlighting not supported, use plaintext
      case "PHP":
        return "plaintext"; // PHP syntax highlighting not supported, use plaintext
      case "cURL":
        return "plaintext";
      default:
        return "plaintext";
    }
  };

  return (
    <Code
      height="400px"
      language={getCodeLanguage()}
      readOnly={true}
      value={generateCode()}
    />
  );
};
