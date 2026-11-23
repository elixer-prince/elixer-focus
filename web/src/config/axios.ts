import axios from "axios";
import toast from "react-hot-toast";

import type { ApiErrorResponse } from "@/types/api";

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_BASE_API_URL + "/api",
});

axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("ACCESS_TOKEN");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosClient.interceptors.response.use(
  (response) => {
    const envelope = response.data;
    if (envelope.success === false) {
      return Promise.reject(new Error(envelope.message));
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("ACCESS_TOKEN");
      toast.error("Session expired. Please log in again.", { duration: 4000 });
    } else if (error.response?.data?.message) {
      const errorData = error.response.data as ApiErrorResponse;
      toast.error(errorData.message, { duration: 4000 });
    } else if (error.response?.status) {
      toast.error(`Server error: ${error.response.status}`, { duration: 4000 });
    } else if (error.message) {
      toast.error(error.message, { duration: 4000 });
    }
    throw error;
  },
);

export default axiosClient;
