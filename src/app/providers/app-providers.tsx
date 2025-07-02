import { HashRouter, type NavigateOptions } from "react-router-dom";
import { HeroUIProvider } from "@heroui/system";
import { useHref, useNavigate } from "react-router-dom";
import { ToastProvider } from "@heroui/toast";

declare module "@react-types/shared" {
  interface RouterConfig {
    routerOptions: NavigateOptions;
  }
}

function HeroUIProviderWithRouter({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();

  return (
    <HeroUIProvider navigate={navigate} useHref={useHref}>
      <ToastProvider />
      {children}
    </HeroUIProvider>
  );
}

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <HashRouter>
      <HeroUIProviderWithRouter>{children}</HeroUIProviderWithRouter>
    </HashRouter>
  );
}
