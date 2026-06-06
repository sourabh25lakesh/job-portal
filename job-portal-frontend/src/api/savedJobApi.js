import axiosInstance from "./axios";

// ================= SAVE JOB =================
export const saveJob = async (jobId) => {
    const response = await axiosInstance.post(
        `/saved-jobs/${jobId}`
    );

    return response.data;
};

// ================= GET SAVED JOBS =================
export const getSavedJobs = async () => {
    const response = await axiosInstance.get(
        "/saved-jobs/"
    );

    return response.data;
};

// ================= REMOVE SAVED JOB =================
export const removeSavedJob = async (jobId) => {
    const response = await axiosInstance.delete(
        `/saved-jobs/${jobId}`
    );

    return response.data;
};