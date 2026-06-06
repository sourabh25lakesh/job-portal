import axiosInstance from "./axios";

// ================= GET ADMIN DASHBOARD =================
export const getAdminDashboard = async () => {
    const response = await axiosInstance.get(
        "/admin/dashboard"
    );

    return response.data;
};

// ================= GET ALL USERS =================
export const getAllUsers = async () => {
    const response = await axiosInstance.get(
        "/admin/users"
    );

    return response.data;
};

// ================= GET ALL JOBS =================
export const getAllJobsAdmin = async () => {
    const response = await axiosInstance.get(
        "/admin/jobs"
    );

    return response.data;
};

// ================= GET ALL APPLICATIONS =================
export const getAllApplicationsAdmin = async () => {
    const response = await axiosInstance.get(
        "/admin/applications"
    );

    return response.data;
};

// ================= GET CONTACT MESSAGES =================
export const getContactMessagesAdmin = async () => {
    const response = await axiosInstance.get(
        "/admin/contact-messages"
    );

    return response.data;
};

// ================= DELETE USER =================
export const deleteUserAdmin = async (userId) => {
    const response = await axiosInstance.delete(
        `/admin/users/${userId}`
    );

    return response.data;
};

// ================= DELETE JOB =================
export const deleteJobAdmin = async (jobId) => {
    const response = await axiosInstance.delete(
        `/jobs/${jobId}`
    );

    return response.data;
};