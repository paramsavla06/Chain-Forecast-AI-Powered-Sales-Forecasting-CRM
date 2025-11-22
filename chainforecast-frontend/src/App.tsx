import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";

import Layout from "./components/Layout";
import ForecastPage from "./pages/ForecastPage";
import CRMPage from "./pages/CRMPage";
import OffersPage from "./pages/OffersPage";
import LogsPage from "./pages/LogsPage";
import AdminPage from "./pages/AdminPage";
import ForecastGraphPage from "./pages/ForecastGraphPage";

import React from "react";
import {
  SignedIn,
  SignedOut,
  RedirectToSignIn,
  SignIn,
  SignUp,
} from "@clerk/clerk-react";

// Protects routes so only signed-in users can view them
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SignedIn>{children}</SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          {/* redirect root to /forecast */}
          <Route path="/" element={<Navigate to="/forecast" replace />} />

          {/* auth pages (public) */}
          <Route
            path="/sign-in"
            element={
              <div className="auth-page">
                <SignIn routing="path" path="/sign-in" />
              </div>
            }
          />
          <Route
            path="/sign-up"
            element={
              <div className="auth-page">
                <SignUp routing="path" path="/sign-up" />
              </div>
            }
          />

          {/* forecast main card */}
          <Route
            path="/forecast"
            element={
              <ProtectedRoute>
                <ForecastPage />
              </ProtectedRoute>
            }
          />

          {/* NEW: full-screen graph page */}
          <Route
            path="/forecast/graph"
            element={
              <ProtectedRoute>
                <ForecastGraphPage />
              </ProtectedRoute>
            }
          />

          {/* other pages */}
          <Route
            path="/crm"
            element={
              <ProtectedRoute>
                <CRMPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/offers"
            element={
              <ProtectedRoute>
                <OffersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/logs"
            element={
              <ProtectedRoute>
                <LogsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
