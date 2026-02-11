import { Navigate, Outlet } from "react-router-dom";
import { LoaderCircle } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";

export default function PublicRoutes({ children }) {
  const { user, loading } = useAuthStore();

  console.log(`PublicRoute: Checking auth - loading: ${loading}`)
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <LoaderCircle className="size-7 animate-spin" />
      </div>
    );
  }
  console.log(`PublicRoute: Checking auth - user: ${user}`)

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
