import axiosInstance from "./axios";

// ================= GET ADMIN DASHBOARD =================
export const getAdminDashboard = async () => {
    const response = await axiosInstance.get(
        "/admin/dashboard"
    );

    return response.data;
};

// ================= GET ADMIN ANALYTICS =================
export const getAdminAnalytics = async () => {
    const response = await axiosInstance.get(
        "/admin/analytics"
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

// ================= GET PENDING JOBS =================
export const getPendingJobsAdmin = async () => {
    const response = await axiosInstance.get(
        "/admin/jobs/pending"
    );

    return response.data;
};

// ================= APPROVE JOB =================
export const approveJobAdmin = async (jobId) => {
    const response = await axiosInstance.patch(
        `/admin/jobs/${jobId}/approve`
    );

    return response.data;
};

// ================= REJECT JOB =================
export const rejectJobAdmin = async (
    jobId,
    rejectionReason
) => {
    const response = await axiosInstance.patch(
        `/admin/jobs/${jobId}/reject`,
        {
            rejection_reason: rejectionReason,
        }
    );

    return response.data;
};

// ================= GET INTERVIEW REQUESTS =================
export const getInterviewRequestsAdmin = async () => {
    const response = await axiosInstance.get(
        "/admin/interviews"
    );

    return response.data;
};

// ================= APPROVE INTERVIEW =================
export const approveInterviewAdmin = async (interviewId) => {
    const response = await axiosInstance.patch(
        `/admin/interviews/${interviewId}/approve`
    );

    return response.data;
};

// ================= REJECT INTERVIEW =================
export const rejectInterviewAdmin = async (
    interviewId,
    rejectionReason
) => {
    const response = await axiosInstance.patch(
        `/admin/interviews/${interviewId}/reject`,
        {
            rejection_reason: rejectionReason,
        }
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

// ================= UPDATE JOB APPROVAL =================
export const updateJobApprovalAdmin = async (
    jobId,
    status
) => {
    const response = await axiosInstance.patch(
        `/admin/jobs/${jobId}/approval`,
        {
            status,
        }
    );

    return response.data;
};
