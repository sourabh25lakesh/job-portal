import axiosInstance from "./axios";

// ================= GET ALL JOBS =================
export const getJobs = async (search = "") => {
    try {
        const response = await axiosInstance.get(
            "/jobs/",
            {
                params: search
                    ? {
                        search: search.trim(),
                    }
                    : {},
            }
        );

        return response.data;
    } catch (error) {
        console.error("Get Jobs Error:", error);
        throw error;
    }
};

// ================= GET MY RECRUITER JOBS =================
export const getMyRecruiterJobs = async () => {
    try {
        const response = await axiosInstance.get(
            "/jobs/my-jobs"
        );

        return response.data;
    } catch (error) {
        console.error("Get Recruiter Jobs Error:", error);
        throw error;
    }
};

// ================= GET MY DELETED RECRUITER JOBS =================
export const getMyDeletedRecruiterJobs = async () => {
    try {
        const response = await axiosInstance.get(
            "/jobs/my-jobs/deleted"
        );

        return response.data;
    } catch (error) {
        console.error("Get Deleted Recruiter Jobs Error:", error);
        throw error;
    }
};

// ================= GET SINGLE JOB =================
export const getJobById = async (id) => {
    try {
        const response = await axiosInstance.get(
            `/jobs/${id}`
        );

        return response.data;
    } catch (error) {
        console.error("Get Job Error:", error);
        throw error;
    }
};

// ================= CREATE JOB =================
export const createJob = async (jobData) => {
    try {
        const response = await axiosInstance.post(
            "/jobs/",
            jobData
        );

        return response.data;
    } catch (error) {
        console.error("Create Job Error:", error);
        throw error;
    }
};

// ================= UPDATE JOB =================
export const updateJob = async (
    jobId,
    jobData
) => {
    try {
        const response = await axiosInstance.put(
            `/jobs/${jobId}`,
            jobData
        );

        return response.data;
    } catch (error) {
        console.error("Update Job Error:", error);
        throw error;
    }
};

// ================= RESTORE JOB =================
export const restoreJob = async (jobId) => {
    try {
        const response = await axiosInstance.patch(
            `/jobs/${jobId}/restore`
        );

        return response.data;
    } catch (error) {
        console.error("Restore Job Error:", error);
        throw error;
    }
};

// ================= DELETE JOB =================
export const deleteJob = async (jobId) => {
    try {
        const response = await axiosInstance.delete(
            `/jobs/${jobId}`
        );

        return response.data;
    } catch (error) {
        console.error("Delete Job Error:", error);
        throw error;
    }
};
