import axiosInstance from "./axios";

// ================= FORGOT PASSWORD =================
export const forgotPassword = async (email) => {
    const response = await axiosInstance.post(
        "/password/forgot",
        {
            email: email,
        }
    );

    return response.data;
};

// ================= RESET PASSWORD =================
export const resetPassword = async (token, newPassword) => {
    const response = await axiosInstance.post(
        "/password/reset",
        {
            token: token,
            new_password: newPassword,
        }
    );

    return response.data;
};