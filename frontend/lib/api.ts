import axios from "axios";

const API = axios.create({
  baseURL: "https://todo-app-1-uiqk.onrender.com/api",
});
// automatically attach token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// auth
export const register = (data: {
  email: string;
  password: string;
  name: string;
}) => API.post("/auth/register", data);

export const login = (data: { email: string; password: string }) =>
  API.post("/auth/login", data);

// todos
export const getTodos = () => API.get("/todos");
export const createTodo = (title: string) => API.post("/todos", { title });
export const updateTodo = (
  id: string,
  data: { title?: string; completed?: boolean },
) => API.put(`/todos/${id}`, data);
export const deleteTodo = (id: string) => API.delete(`/todos/${id}`);
