import axiosInstance from "./axios";

const BACKEND_URL = "http://127.0.0.1:8000";

// ================= LOGIN =================
export const loginUser = async (userData) => {
    const formData = new FormData();

    formData.append("username", userData.email);
    formData.append("password", userData.password);

    const response = await axiosInstance.post(
        "/auth/login",
        formData,
        {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        }
    );

    return response.data;
};

// ================= REGISTER =================
export const registerUser = async (userData) => {
    const formData = new FormData();

    formData.append("name", userData.name);
    formData.append("email", userData.email);
    formData.append("password", userData.password);
    formData.append("role", userData.role);

    const response = await axiosInstance.post(
        "/auth/register",
        formData,
        {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        }
    );

    return response.data;
};

// ================= GET CURRENT USER =================
export const getCurrentUser = async () => {
    const response = await axiosInstance.get("/auth/me");

    return response.data;
};

// ================= CONTINUE WITH GOOGLE =================
export const continueWithGoogle = () => {
    window.location.href = `${BACKEND_URL}/auth/google/login`;
};

// ================= LOGOUT =================
export const logoutUser = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");

    window.location.href = "/login";
};