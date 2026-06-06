import axiosInstance from "./axios";


// ================= ERROR HANDLER =================
const handleApiError = (error) => {
    const detail = error?.response?.data?.detail;

    if (Array.isArray(detail)) {
        throw new Error(
            detail
                .map((err) => err?.msg || "Validation error")
                .join(", ")
        );
    }

    if (typeof detail === "string") {
        throw new Error(detail);
    }

    throw new Error(
        error?.response?.data?.message ||
        error?.message ||
        "Something went wrong"
    );
};


// ================= NORMALIZE STATUS =================
const normalizeStatus = (status) => {
    const value = String(status || "")
        .trim()
        .toLowerCase();

    if (value === "shortlist") {
        return "shortlisted";
    }

    if (value === "reject") {
        return "rejected";
    }

    if (["pending", "shortlisted", "rejected"].includes(value)) {
        return value;
    }

    return "pending";
};


// ================= CREATE RECRUITER PROFILE =================
export const createRecruiterProfile = async (data) => {
    try {
        const response = await axiosInstance.post(
            "/recruiters/profile",
            data
        );

        return response.data;
    } catch (error) {
        handleApiError(error);
    }
};


// ================= GET RECRUITER PROFILE =================
export const getRecruiterProfile = async () => {
    try {
        const response = await axiosInstance.get(
            "/recruiters/profile"
        );

        return response.data;
    } catch (error) {
        handleApiError(error);
    }
};


// ================= UPDATE RECRUITER PROFILE =================
export const updateRecruiterProfile = async (data) => {
    try {
        const response = await axiosInstance.put(
            "/recruiters/profile",
            data
        );

        return response.data;
    } catch (error) {
        handleApiError(error);
    }
};


// ================= GET RECRUITER DASHBOARD =================
export const getRecruiterDashboard = async () => {
    try {
        const response = await axiosInstance.get(
            "/recruiters/dashboard"
        );

        return response.data;
    } catch (error) {
        handleApiError(error);
    }
};


// ================= CREATE RECRUITER JOB =================
export const createRecruiterJob = async (data) => {
    try {
        const response = await axiosInstance.post(
            "/jobs/",
            data
        );

        return response.data;
    } catch (error) {
        handleApiError(error);
    }
};


// ================= GET ALL RECRUITER APPLICANTS =================
export const getRecruiterApplicants = async () => {
    try {
        const response = await axiosInstance.get(
            "/applications/recruiter/applicants"
        );

        return response.data;
    } catch (error) {
        handleApiError(error);
    }
};


// ================= GET APPLICATIONS FOR ONE JOB =================
export const getRecruiterJobApplications = async (jobId) => {
    try {
        const response = await axiosInstance.get(
            `/applications/job/${jobId}`
        );

        return response.data;
    } catch (error) {
        handleApiError(error);
    }
};


// ================= VIEW CANDIDATE RESUME =================
export const viewRecruiterCandidateResume = async (applicationId) => {
    try {
        const response = await axiosInstance.put(
            `/applications/${applicationId}/view-resume`
        );

        return response.data;
    } catch (error) {
        handleApiError(error);
    }
};


// ================= GET CANDIDATE RESUME =================
export const getRecruiterCandidateResume = async (applicationId) => {
    try {
        const response = await axiosInstance.get(
            `/applications/${applicationId}/resume`
        );

        return response.data;
    } catch (error) {
        handleApiError(error);
    }
};


// ================= UPDATE APPLICATION STATUS =================
export const updateRecruiterApplicationStatus = async (
    applicationId,
    status
) => {
    try {
        const cleanStatus = normalizeStatus(status);

        const response = await axiosInstance.patch(
            `/applications/${applicationId}/status`,
            {
                status: cleanStatus,
            }
        );

        return response.data;
    } catch (error) {
        handleApiError(error);
    }
};