import React from "react";
import ReactDOM from "react-dom/client";

import { AppProviders } from "@/app/providers/app-providers.tsx";
import App from "@/app/app-main";

import "@/shared/styles/globals.css";

// Function for embedded usage
const renderSwagman = async (
  container: HTMLElement,
  options: { spec?: object; defaultSpec?: string }
) => {
  // If user passes definition or spec, override window.LOCAL_SPEC
  if (options.spec) {
    window.LOCAL_SPEC = options.spec;
    // eslint-disable-next-line no-console
    console.log("📝 window.LOCAL_SPEC updated with provided specification");
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
    LOCAL_SPEC?: object;
  }
}

export { renderSwagman };
