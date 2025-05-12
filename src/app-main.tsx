import { Route, Routes } from "react-router-dom";

import SpecificationLayout from "./layouts/specification-layout";

import IndexPage from "@/pages/index";
import SpecificationPage from "@/pages/specification";
import SpecificationOperationsPage from "@/pages/specification-operations";

function App() {
  return (
    <Routes>
      <Route element={<IndexPage />} path="/" />
      <Route element={<SpecificationLayout />} path="/specification/:url">
        <Route index element={<SpecificationPage />} />
        <Route
          element={<SpecificationOperationsPage />}
          path="/specification/:url/operations"
        />
      </Route>
    </Routes>
  );
}

export default App;
