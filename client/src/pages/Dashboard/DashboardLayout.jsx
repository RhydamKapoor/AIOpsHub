import { Outlet } from "react-router-dom";
export default function DashboardLayout() {
  return (
    <div className="h-full min-h-0 w-full overflow-x-hidden">
      <Outlet />
    </div>
  );
}
