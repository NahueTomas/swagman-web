import { Route, Routes } from "react-router-dom";

import SpecificationLayout from "@/layouts/specification-layout";
import IndexPage from "@/pages/index";
import SpecificationPage from "@/pages/specification";
import SpecificationOperationsPage from "@/pages/specification-operations";
import { ErrorBoundary } from "@/shared/components/ui/error-boundary";

function AppMain() {
  return (
    <ErrorBoundary>
      <Routes>
        <Route element={<IndexPage />} path="/" />
        <Route element={<SpecificationLayout />} path="/:url">
          <Route index element={<SpecificationPage />} />
          <Route element={<SpecificationOperationsPage />} path="operations" />
        </Route>
      </Routes>
    </ErrorBoundary>
  );
}

export default AppMain;
