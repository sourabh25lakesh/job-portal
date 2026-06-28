export const normalizeJobStatus = (status) => {
    const value = String(status || "")
        .trim()
        .toLowerCase();

    if (value === "approved" || value === "approve") {
        return "approved";
    }

    if (value === "rejected" || value === "reject") {
        return "rejected";
    }

    return "pending";
};

export const getJobStatusLabel = (status) => {
    const cleanStatus = normalizeJobStatus(status);

    if (cleanStatus === "approved") {
        return "Approved";
    }

    if (cleanStatus === "rejected") {
        return "Rejected";
    }

    return "Pending";
};

export const getJobStatusClass = (status) => {
    const cleanStatus = normalizeJobStatus(status);

    if (cleanStatus === "approved") {
        return "border-green-200 bg-green-50 text-green-700";
    }

    if (cleanStatus === "rejected") {
        return "border-red-200 bg-red-50 text-red-700";
    }

    return "border-yellow-200 bg-yellow-50 text-yellow-700";
};
