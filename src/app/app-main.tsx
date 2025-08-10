import { Route, Routes } from "react-router-dom";

import SpecificationLayout from "@/layouts/specification-layout";
import SpecificationSelectorPage from "@/pages/specification-selector";
import SpecificationOperationsPage from "@/pages/specification-operations";
import { ErrorBoundary } from "@/shared/components/ui/error-boundary";
import { ROUTES } from "@/shared/constants/constants";

function AppMain() {
  return (
    <ErrorBoundary>
      <Routes>
        <Route
          element={<SpecificationSelectorPage />}
          path={ROUTES.SPECIFICATION_SELECTOR}
        />
        <Route element={<SpecificationLayout />} path={ROUTES.APP}>
          <Route index element={<SpecificationOperationsPage />} path=":url" />
        </Route>
      </Routes>
    </ErrorBoundary>
  );
}

export default AppMain;
