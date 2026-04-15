import { Outlet, Navigate, useLocation } from "react-router";
import Sidebar from "../Component/Sidebar";
import Header from "../Component/header";

export default function DashboardLayout() {
  const location = useLocation();

  if (location.pathname === "/dashboard") {
    return <Navigate to="/dashboard/overview" replace />;
  }

  return (
    <main className="flex h-dvh bg-black">
      <aside className="w-56 shrink-0 border-r border-white/5">
        <Sidebar />
      </aside>

      <section className="flex flex-col flex-1 h-full w-full overflow-hidden">
        <Header />
        <div className="flex-1 overflow-y-auto w-full">
          <Outlet />
        </div>
      </section>
    </main>
  );
}
