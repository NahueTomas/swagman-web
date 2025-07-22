import React from "react";
import ReactDOM from "react-dom/client";

import { AppProviders } from "@/app/providers/app-providers.tsx";
import App from "@/app/app-main";
import { OpenAPISpec } from "@/shared/types/openapi";
import { sanitizeSpecInput, isValidContainer } from "@/shared/utils/openapi";

import "@/shared/styles/globals.css";

interface SwagmanEmbedOptions {
  spec?: OpenAPISpec;
  defaultSpec?: string;
}

// Function for embedded usage
const renderSwagman = async (
  container: HTMLElement,
  options: SwagmanEmbedOptions
) => {
  // Validate container
  if (!isValidContainer(container)) {
    throw new Error("Invalid container element provided to renderSwagman");
  }

  // If user passes definition or spec, validate and sanitize it
  if (options.spec) {
    const sanitizedSpec = sanitizeSpecInput(options.spec);

    if (sanitizedSpec) {
      window.LOCAL_SPEC = sanitizedSpec;
      // eslint-disable-next-line no-console
      console.log("📝 window.LOCAL_SPEC updated with provided specification");
    } else {
      // eslint-disable-next-line no-console
      console.error("Invalid OpenAPI specification provided to renderSwagman");
      throw new Error("Invalid OpenAPI specification provided");
    }
  }

  // Mount the normal application (no changes)
  const root = ReactDOM.createRoot(container);

  root.render(
    <React.StrictMode>
      <AppProviders>
        <App />
      </AppProviders>
    </React.StrictMode>
  );

  return {
    unmount: () => root.unmount(),
  };
};

// Main logic
const rootElement =
  document.getElementById("swagman-web") || document.getElementById("root");

if (rootElement) {
  // Add dark class to root element
  document.querySelector("html")?.classList.add("dark");

  // NORMAL MODE: Standalone web app
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <AppProviders>
        <App />
      </AppProviders>
    </React.StrictMode>
  );
} else {
  // EMBEDDED MODE: Expose global function
  if (typeof window !== "undefined") {
    window.renderSwagman = renderSwagman;
    window.SwagmanWeb = { render: renderSwagman };
    // eslint-disable-next-line no-console
    console.log("✅ Swagman embedded loaded successfully");
  }
}

// Global types
declare global {
  interface Window {
    renderSwagman: typeof renderSwagman;
    SwagmanWeb: { render: typeof renderSwagman };
    LOCAL_SPEC?: OpenAPISpec;
  }
}

export { renderSwagman };
