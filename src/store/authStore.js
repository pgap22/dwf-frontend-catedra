import { create } from "zustand";
import { getCurrentUser } from "../api/authService";

export const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem("token") || null,
  setUser: (user) => set({ user }),
  setToken: (token) => {
    localStorage.setItem("token", token);
    set({ token });
  },
  logout: () => {
    localStorage.removeItem("token");
    set({ token: null, user: null });
  },
  fetchUser: async () => {
    try {
      const user = await getCurrentUser();
      set({ user });
    } catch {
      set({ user: null });
    }
  },
}));
