import React from "react";
import { HashRouter } from "react-router-dom";

export const AppProviders = React.memo(
  ({ children }: { children: React.ReactNode }) => {
    return <HashRouter>{children}</HashRouter>;
  }
);

AppProviders.displayName = "AppProviders";
