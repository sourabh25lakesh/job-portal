import axiosInstance from "./axios";

// ================= GET CANDIDATE PROFILE =================
export const getCandidateProfile = async () => {
    const response = await axiosInstance.get(
        "/candidate-profile/me"
    );

    return response.data;
};

// ================= CREATE / UPDATE CANDIDATE PROFILE =================
// Backend route: PUT /candidate-profile/me
export const updateCandidateProfile = async (profileData) => {
    const response = await axiosInstance.put(
        "/candidate-profile/me",
        profileData
    );

    return response.data;
};

// ================= UPLOAD RESUME =================
// Backend route: POST /resume/upload
export const uploadResume = async (file) => {
    const formData = new FormData();

    formData.append("resume", file);

    const response = await axiosInstance.post(
        "/resume/upload",
        formData
    );

    return response.data;
};