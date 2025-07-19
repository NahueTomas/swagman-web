import React from "react";
import ReactDOM from "react-dom/client";

import { AppProviders } from "@/app/providers/app-providers.tsx";
import App from "@/app/app-main";

import "@/shared/styles/globals.css";

ReactDOM.createRoot(document.getElementById("swagman-web")!).render(
  <React.StrictMode>
    <AppProviders>
      <App />
    </AppProviders>
  </React.StrictMode>
);
