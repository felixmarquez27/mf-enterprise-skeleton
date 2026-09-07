import { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import QueryProvider from "@/providers/query-provider";
import { Toaster } from "design-system";
import "./App.css";

import { ProtectedRoute, GuestRoute } from "./components/guards";
import { MainLayout } from "./components/layout";
import { RemoteLoader } from "./components/common";
import LoginPage from "./pages/login";
import DashboardPage from "./pages/dashboard";
import NotFoundPage from "./pages/not-found";

// Microfrontend remoto federado
const UsersMicrofrontend = lazy(() => import("users/users-app"));

export function App() {
  return (
    <QueryProvider>
      <BrowserRouter>
        <Routes>
          {/* Zona de invitados (Pública / Sin Sesión) */}
          <Route element={<GuestRoute />}>
            <Route path="/login" element={<LoginPage />} />
          </Route>

          {/* Zona protegida dentro del Shell administrativo */}
          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              <Route path="/" element={<DashboardPage />} />
              <Route
                path="/users/*"
                element={
                  <Suspense fallback={<RemoteLoader />}>
                    <UsersMicrofrontend />
                  </Suspense>
                }
              />
            </Route>
          </Route>

          {/* Manejo de 404 */}
          <Route path="/404" element={<NotFoundPage />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" richColors />
    </QueryProvider>
  );
}

export default App;
