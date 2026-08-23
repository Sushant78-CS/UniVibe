import { Outlet } from "react-router";

function AppLayout() {
  return (
    <div className="min-h-screen">
      <Outlet />
    </div>
  );
}

export default AppLayout;
