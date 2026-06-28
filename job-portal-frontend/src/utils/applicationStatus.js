export const normalizeApplicationStatus = (status) => {
    const value = String(status || "")
        .trim()
        .toLowerCase();

    if (value === "shortlist" || value === "shortlisted") {
        return "shortlisted";
    }

    if (value === "reject" || value === "rejected") {
        return "rejected";
    }

    return "pending";
};

export const getApplicationStatusLabel = (status) => {
    const cleanStatus = normalizeApplicationStatus(status);

    if (cleanStatus === "shortlisted") {
        return "Shortlisted";
    }

    if (cleanStatus === "rejected") {
        return "Rejected";
    }

    return "Pending";
};

export const getApplicationStatusClass = (status) => {
    const cleanStatus = normalizeApplicationStatus(status);

    if (cleanStatus === "shortlisted") {
        return "bg-green-100 text-green-700";
    }

    if (cleanStatus === "rejected") {
        return "bg-red-100 text-red-700";
    }

    return "bg-yellow-100 text-yellow-700";
};

export const getApplicationStatusIcon = (status) => {
    const cleanStatus = normalizeApplicationStatus(status);

    if (cleanStatus === "shortlisted") return "✅";
    if (cleanStatus === "rejected") return "❌";

    return "⏳";
};
