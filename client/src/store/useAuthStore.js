import { create } from "zustand";
import axiosInstance from "@/utils/axiosConfig";

export const useAuthStore = create((set) => ({
  user: null,
  loading: true,

  setUser: (user) => set({ user }),

  checkAuth: async () => {
    console.log("🔍 checkAuth called");
    try {
      const res = await axiosInstance.get("/auth/me");
      set({ user: res.data, loading: false });
    } catch {
      set({ user: null, loading: false });
    }
  },

  logout: async () => {
    await axiosInstance.post("/auth/logout");
    set({ user: null });
  },
}));
