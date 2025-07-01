import React from "react";
import ReactDOM from "react-dom/client";

import { AppProviders } from "@/app/providers/app-providers.tsx";
import App from "@/app/app-main";

import "@/shared/styles/globals.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AppProviders>
      <App />
    </AppProviders>
  </React.StrictMode>
);
