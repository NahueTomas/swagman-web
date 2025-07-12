import React from "react";
import { HashRouter, type NavigateOptions } from "react-router-dom";
import { HeroUIProvider } from "@heroui/system";
import { useHref, useNavigate } from "react-router-dom";
import { ToastProvider } from "@heroui/toast";

declare module "@react-types/shared" {
  interface RouterConfig {
    routerOptions: NavigateOptions;
  }
}

const HeroUIProviderWithRouter = React.memo(
  ({ children }: { children: React.ReactNode }) => {
    const navigate = useNavigate();

    return (
      <HeroUIProvider
        disableRipple={false}
        navigate={navigate}
        useHref={useHref}
      >
        <ToastProvider />
        {children}
      </HeroUIProvider>
    );
  }
);

HeroUIProviderWithRouter.displayName = "HeroUIProviderWithRouter";

export const AppProviders = React.memo(
  ({ children }: { children: React.ReactNode }) => {
    return (
      <HashRouter>
        <HeroUIProviderWithRouter>{children}</HeroUIProviderWithRouter>
      </HashRouter>
    );
  }
);

AppProviders.displayName = "AppProviders";
