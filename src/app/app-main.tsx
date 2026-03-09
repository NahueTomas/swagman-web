import { Navigate, Route, Routes } from "react-router-dom";

import SpecificationLayout from "@/layouts/specification-layout";
import SpecificationOperationsPage from "@/pages/specification-operations";
import { ErrorBoundary } from "@/shared/components/error-boundary";
import { ROUTES } from "@/shared/constants/constants";

function AppMain() {
  return (
    <ErrorBoundary>
      <Routes>
        <Route element={<SpecificationLayout />} path={ROUTES.APP}>
          <Route index element={<SpecificationOperationsPage />} />
          <Route element={<SpecificationOperationsPage />} path=":url" />
        </Route>
        <Route element={<Navigate replace to={ROUTES.APP} />} path="*" />
      </Routes>
    </ErrorBoundary>
  );
}

export default AppMain;
