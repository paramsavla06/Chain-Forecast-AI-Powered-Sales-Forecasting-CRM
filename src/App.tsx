import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";

import ForecastPage from "./pages/ForecastPage";
import CRMPage from "./pages/CRMPage";
import OffersPage from "./pages/OffersPage";
import LogsPage from "./pages/LogsPage";
import AdminPage from "./pages/AdminPage";

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/app/forecast" element={<ForecastPage />} />
          <Route path="/app/crm" element={<CRMPage />} />
          <Route path="/app/offers" element={<OffersPage />} />
          <Route path="/app/logs" element={<LogsPage />} />
          <Route path="/app/admin" element={<AdminPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
