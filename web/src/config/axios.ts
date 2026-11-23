import axios from "axios";
import toast from "react-hot-toast";

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
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("ACCESS_TOKEN");
      toast.error("Session expired. Please log in again.", { duration: 4000 });
    } else if (error.response?.data?.message) {
      toast.error(error.response.data.message, { duration: 4000 });
    } else if (error.response?.status) {
      toast.error(`Server error: ${error.response.status}`, { duration: 4000 });
    } else if (error.message) {
      toast.error(error.message, { duration: 4000 });
    }
    throw error;
  },
);

export default axiosClient;
