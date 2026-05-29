import { useAuthStore } from "@/store/useAuthStore";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LoaderCircle } from "lucide-react";

export default function AuthSuccess() {
  const navigate = useNavigate();
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    let cancelled = false;

    const finish = async () => {
      await checkAuth();
      if (cancelled) return;

      const user = useAuthStore.getState().user;
      setStatus(user ? "ok" : "failed");
      navigate(user ? "/" : "/login", { replace: true });
    };

    finish();
    return () => {
      cancelled = true;
    };
  }, [checkAuth, navigate]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 px-4">
      <LoaderCircle className="h-9 w-9 animate-spin text-primary" />
      <div className="text-center">
        <h2 className="text-xl font-bold sm:text-2xl">
          {status === "failed" ? "Sign-in incomplete" : "Authentication successful"}
        </h2>
        <p className="mt-1 text-sm text-base-content/60">
          {status === "failed"
            ? "Redirecting to login…"
            : "Redirecting to your workspace…"}
        </p>
      </div>
    </div>
  );
}
