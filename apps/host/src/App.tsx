import { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import QueryProvider from "@/providers/query-provider";
import { Toaster, Loader } from "design-system";
import "design-system/styles.css";

import { ProtectedRoute, GuestRoute } from "./features/auth/components";
import { MainLayout } from "./layout";
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
                  <Suspense
                    fallback={
                      <div className="flex h-64 w-full items-center justify-center">
                        <Loader className="size-8 text-primary" />
                      </div>
                    }
                  >
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
