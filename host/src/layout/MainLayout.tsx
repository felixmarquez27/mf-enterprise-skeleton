import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

export function MainLayout() {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* Sidebar fijo */}
      <Sidebar />

      {/* Área principal */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto bg-muted/20 p-6 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default MainLayout;
