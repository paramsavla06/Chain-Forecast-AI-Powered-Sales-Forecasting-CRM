import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";

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
          <Route path="/" element={<Navigate to="/forecast" replace />} />
          <Route path="/forecast" element={<ForecastPage />} />
          <Route path="/crm" element={<CRMPage />} />
          <Route path="/offers" element={<OffersPage />} />
          <Route path="/logs" element={<LogsPage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
