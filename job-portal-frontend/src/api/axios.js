import axios from "axios";

// ================= AXIOS INSTANCE =================
const axiosInstance = axios.create({
    baseURL: "http://127.0.0.1:8000",
});

// ================= REQUEST INTERCEPTOR =================
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");

        if (token) {
            config.headers = config.headers || {};
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

// ================= RESPONSE INTERCEPTOR =================
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status;

        if (status === 401) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            localStorage.removeItem("role");

            if (window.location.pathname !== "/login") {
                window.dispatchEvent(new Event("auth:logout"));
            }
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;