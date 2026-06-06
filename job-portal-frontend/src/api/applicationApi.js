import axiosInstance from "./axios";

// ================= APPLY JOB =================
export const applyJob = async (jobId) => {
    const response = await axiosInstance.post(
        `/applications/${jobId}`
    );

    return response.data;
};

// ================= MY APPLICATIONS =================
export const getMyApplications = async () => {
    const response = await axiosInstance.get(
        "/applications/my-applications"
    );

    return response.data;
};

// ================= DELETE APPLICATION =================
export const deleteApplication = async (applicationId) => {
    const response = await axiosInstance.delete(
        `/applications/${applicationId}`
    );

    return response.data;
};

// ================= RECRUITER: GET JOB APPLICATIONS =================
export const getJobApplications = async (jobId) => {
    const response = await axiosInstance.get(
        `/applications/job/${jobId}`
    );

    return response.data;
};

// ================= RECRUITER: VIEW RESUME =================
export const viewCandidateResume = async (applicationId) => {
    const response = await axiosInstance.put(
        `/applications/${applicationId}/view-resume`
    );

    return response.data;
};

// ================= RECRUITER: SHORTLIST / REJECT =================
export const updateApplicationStatus = async (
    applicationId,
    status
) => {
    const response = await axiosInstance.put(
        `/applications/${applicationId}/status`,
        null,
        {
            params: {
                status
            }
        }
    );

    return response.data;
};