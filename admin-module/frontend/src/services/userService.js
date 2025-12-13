import api from "./api";

export const getAllUsers = async (page = 1, limit = 10, search = "") => {
  const response = await api.get("/users", {
    params: { page, limit, search },
  });

  return response.data;
};

export const getUserId = async (id) => {
  const response = await api.get(`/users/${id}`);
  return response.data.data;
};

export const createUser = async (userData) => {
  const response = await api.post("/users", userData);
  return response.data;
};

export const updateUser = async (id, userData) => {
  const response = await api.put(`/users/${id}`, userData);
  return response.data;
};

export const deleteUser = async (id) => {
  const response = await api.delete(`/users/${id}`);
  return response.data;
};

export const getAllRoles = async () => {
  const response = await api.get(`/users/roles`);
  return response.data.data;
};
