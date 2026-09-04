import { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import "./App.css";

import { ProtectedRoute, GuestRoute } from "./components/guards";
import { MainLayout } from "./components/layout";
import LoginPage from "./pages/login";
import DashboardPage from "./pages/dashboard";
import NotFoundPage from "./pages/not-found";

// Microfrontend remoto federado
const UsersMicrofrontend = lazy(() => import("users/users-app"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutos de stale time
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

function RemoteLoader() {
  return (
    <div className="flex h-64 w-full flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border bg-card/50">
      <Loader2 className="size-8 animate-spin text-primary" />
      <p className="text-sm font-medium text-muted-foreground">
        Cargando microfrontend de usuarios...
      </p>
    </div>
  );
}

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
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
    </QueryClientProvider>
  );
}

export default App;
