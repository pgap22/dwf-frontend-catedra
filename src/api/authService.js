import api from "./axiosConfig";

export const login = async (correo, password) => {
  const res = await api.post("/auth/login", { correo, password });
  return res.data;
};

export const register = async (nombre, correo, password) => {
  const res = await api.post("/auth/register", { nombre, correo, password });
  return res.data;
};

export const getCurrentUser = async () => {
  const res = await api.get("/auth/me");
  return res.data;
};
