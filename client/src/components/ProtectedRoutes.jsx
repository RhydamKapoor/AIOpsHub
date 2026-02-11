import { Navigate, Outlet } from "react-router-dom";
import { LoaderCircle } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";

export default function ProtectedRoute({children}) {
  const { user, loading } = useAuthStore();
  

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <LoaderCircle className="size-7 animate-spin" />
      </div>
    );
  }


  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
