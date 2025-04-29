import { Outlet } from "react-router-dom";
export default function DashboardLayout() {
  return (
    <div className="h-full w-full overflow-x-hidden">
      <Outlet />
    </div>
  );
}
