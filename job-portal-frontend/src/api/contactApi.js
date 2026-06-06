import axiosInstance from "./axios";

// ================= SEND CONTACT MESSAGE =================
export const sendContactMessage = async (contactData) => {
    try {
        const response = await axiosInstance.post(
            "/contact/",
            contactData
        );

        return response.data;
    } catch (error) {
        console.error("Send contact message error:", error);
        throw error;
    }
};

// ================= GET ALL CONTACT MESSAGES =================
export const getContactMessages = async () => {
    try {
        const response = await axiosInstance.get(
            "/contact/"
        );

        return response.data;
    } catch (error) {
        console.error("Get contact messages error:", error);
        throw error;
    }
};

// ================= GET SINGLE CONTACT MESSAGE =================
export const getContactMessageById = async (messageId) => {
    try {
        const response = await axiosInstance.get(
            `/contact/${messageId}`
        );

        return response.data;
    } catch (error) {
        console.error("Get contact message by ID error:", error);
        throw error;
    }
};