import {
    useEffect,
    useState,
} from "react";

import {
    Link,
    useParams,
} from "react-router-dom";

import toast from "react-hot-toast";

import {
    getRecruiterJobApplications,
    viewRecruiterCandidateResume,
    updateRecruiterApplicationStatus,
} from "../../api/recruiterApi";

const API_BASE_URL = "http://127.0.0.1:8000";

function JobApplications() {
    const { jobId } = useParams();

    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoadingId, setActionLoadingId] = useState(null);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        loadApplications();
    }, [jobId]);

    const getSafeErrorMessage = (error, fallbackMessage) => {
        const detail = error?.response?.data?.detail;

        if (Array.isArray(detail)) {
            return detail
                .map((item) => item?.msg || "Validation error")
                .join(", ");
        }

        if (typeof detail === "string") {
            return detail;
        }

        if (typeof error?.message === "string") {
            return error.message;
        }

        return fallbackMessage;
    };

    const broadcastApplicationUpdate = (eventName, payload) => {
        const application = payload?.application || null;
        const applicationId = application?.id ?? payload?.applicationId;

        if (!applicationId) {
            return;
        }

        const update = {
            applicationId,
            application,
            status: application?.status ?? payload?.status,
            resume_viewed: application?.resume_viewed ?? payload?.resume_viewed,
            timestamp: new Date().toISOString(),
        };

        window.dispatchEvent(new CustomEvent(eventName, {
            detail: update,
        }));

        localStorage.setItem(
            eventName === "applicationResumeViewed"
                ? "lastApplicationResumeViewed"
                : "lastApplicationUpdate",
            JSON.stringify(update)
        );
    };

    const mergeApplicationIntoState = (updatedApplication) => {
        if (!updatedApplication?.id) {
            return;
        }

        setApplications((previousApplications) =>
            previousApplications.map((application) =>
                String(application.id) === String(updatedApplication.id)
                    ? {
                        ...application,
                        ...updatedApplication,
                    }
                    : application
            )
        );
    };

    const loadApplications = async () => {
        try {
            setLoading(true);
            setErrorMessage("");

            const data = await getRecruiterJobApplications(jobId);

            setApplications(Array.isArray(data) ? data : []);
        } catch (error) {
            const message = getSafeErrorMessage(
                error,
                "Failed to load applications"
            );

            setErrorMessage(message);
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    const getResumeUrl = (resumePath) => {
        if (!resumePath || typeof resumePath !== "string") {
            return null;
        }

        if (resumePath.startsWith("http")) {
            return resumePath;
        }

        const cleanPath = resumePath.startsWith("/")
            ? resumePath
            : `/${resumePath}`;

        return `${API_BASE_URL}${cleanPath}`;
    };

    const handleViewResume = async (applicationId) => {
        try {
            setActionLoadingId(applicationId);
            setErrorMessage("");

            const response = await viewRecruiterCandidateResume(applicationId);

            const resumePath =
                response?.resume_path ||
                response?.resume ||
                response?.profile?.resume_path;

            const resumeUrl = getResumeUrl(resumePath);

            if (!resumeUrl) {
                toast.error("Candidate resume not uploaded");
                return;
            }

            window.open(resumeUrl, "_blank", "noopener,noreferrer");

            mergeApplicationIntoState(response?.application);

            broadcastApplicationUpdate("applicationResumeViewed", {
                applicationId,
                application: response?.application,
                resume_viewed: true,
            });

            toast.success("Resume opened successfully");

            await loadApplications();
        } catch (error) {
            const message = getSafeErrorMessage(
                error,
                "Candidate resume not uploaded"
            );

            setErrorMessage(message);
            toast.error(message);
        } finally {
            setActionLoadingId(null);
        }
    };

    const handleStatusChange = async (applicationId, status) => {
        try {
            setActionLoadingId(applicationId);
            setErrorMessage("");

            const normalizedStatus = normalizeStatus(status);
            const response = await updateRecruiterApplicationStatus(applicationId, normalizedStatus);
            const updatedApplication = response?.application;

            if (normalizeStatus(updatedApplication?.status) !== normalizedStatus) {
                throw new Error("Status was not saved by the backend");
            }

            mergeApplicationIntoState(updatedApplication);

            broadcastApplicationUpdate("applicationStatusUpdated", {
                applicationId,
                application: updatedApplication,
                status: normalizedStatus,
            });

            toast.success(
                normalizedStatus === "shortlisted"
                    ? "Candidate shortlisted successfully"
                    : "Candidate rejected successfully"
            );

            loadApplications();
        } catch (error) {
            const message = getSafeErrorMessage(
                error,
                "Failed to update application status"
            );

            setErrorMessage(message);
            toast.error(message);
        } finally {
            setActionLoadingId(null);
        }
    };
    const normalizeStatus = (status) => {
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
    const getStatusBadge = (status) => {
        const normalizedStatus = normalizeStatus(status);
        
        if (normalizedStatus === "shortlisted") {
            return "bg-green-100 text-green-700";
        }

        if (normalizedStatus === "rejected") {
            return "bg-red-100 text-red-700";
        }

        return "bg-yellow-100 text-yellow-700";
    };

    const getStatusDisplayText = (status) => {
        const normalizedStatus = normalizeStatus(status);
        
        if (normalizedStatus === "shortlisted") {
            return "Shortlisted";
        }

        if (normalizedStatus === "rejected") {
            return "Rejected";
        }

        return "Pending";
    };

    return (
        <section className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 px-4 py-8 sm:px-6 sm:py-10">
            <div className="mx-auto max-w-7xl">
                <div className="mb-8 rounded-3xl bg-white p-5 shadow-xl shadow-blue-100 sm:p-8">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <span className="inline-flex rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-700">
                                Recruiter Applications
                            </span>

                            <h1 className="mt-4 text-2xl font-bold text-slate-900 sm:text-3xl">
                                Applied Candidates
                            </h1>

                            <p className="mt-2 text-sm text-slate-600 sm:text-base">
                                Review candidate profiles, view resumes, shortlist or reject applications.
                            </p>
                        </div>

                        <Link
                            to="/recruiter/my-jobs"
                            className="w-full rounded-xl border border-slate-300 px-5 py-3 text-center font-semibold text-slate-700 hover:bg-slate-100 md:w-auto"
                        >
                            Back to My Jobs
                        </Link>
                    </div>
                </div>

                {errorMessage && (
                    <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 font-medium text-red-700">
                        {String(errorMessage)}
                    </div>
                )}

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
                    </div>
                ) : applications.length === 0 ? (
                    <div className="rounded-3xl bg-white p-6 text-center shadow-lg sm:p-12">
                        <div className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-blue-50 text-xl font-black text-blue-700">
                            AP
                        </div>

                        <h2 className="mt-4 text-xl font-bold text-slate-900 sm:text-2xl">
                            No Applications Yet
                        </h2>

                        <p className="mt-2 text-slate-600">
                            Candidates have not applied to this job yet.
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-4 sm:gap-6">
                        {applications.map((application) => {
                            const rawStatus = application?.status || "pending";
                            const status = normalizeStatus(rawStatus);
                            const isLoading = actionLoadingId === application?.id;

                            const resumeUrl = getResumeUrl(
                                application?.profile?.resume_path
                            );

                            return (
                                <div
                                    key={application.id}
                                    className="rounded-3xl bg-white p-5 shadow-lg shadow-slate-200 transition hover:-translate-y-1 hover:shadow-2xl sm:p-6"
                                >
                                    <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-start gap-3 sm:items-center sm:gap-4">
                                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-lg font-bold text-blue-700 sm:h-14 sm:w-14 sm:text-xl">
                                                    {application?.candidate?.name
                                                        ?.charAt(0)
                                                        ?.toUpperCase() || "C"}
                                                </div>

                                                <div className="min-w-0">
                                                    <h2 className="break-words text-xl font-bold text-slate-900 sm:text-2xl">
                                                        {application?.candidate?.name || "Candidate Name"}
                                                    </h2>

                                                    <p className="break-words text-sm text-slate-600 sm:text-base">
                                                        {application?.candidate?.email || "Candidate Email"}
                                                    </p>

                                                    <p className="mt-1 text-sm text-slate-500">
                                                        Applied Job ID: {application?.job_id}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="mt-5 grid gap-4 md:grid-cols-3">
                                                <div className="rounded-2xl bg-slate-50 p-4">
                                                    <p className="text-sm font-semibold text-slate-500">
                                                        Skills
                                                    </p>

                                                    <p className="mt-1 font-medium text-slate-800">
                                                        {application?.profile?.skills || "N/A"}
                                                    </p>
                                                </div>

                                                <div className="rounded-2xl bg-slate-50 p-4">
                                                    <p className="text-sm font-semibold text-slate-500">
                                                        Experience
                                                    </p>

                                                    <p className="mt-1 font-medium text-slate-800">
                                                        {application?.profile?.experience || "N/A"}
                                                    </p>
                                                </div>

                                                <div className="rounded-2xl bg-slate-50 p-4">
                                                    <p className="text-sm font-semibold text-slate-500">
                                                        Education
                                                    </p>

                                                    <p className="mt-1 font-medium text-slate-800">
                                                        {application?.profile?.education || "N/A"}
                                                    </p>
                                                </div>
                                            </div>

                                            {application?.profile?.bio && (
                                                <div className="mt-4 rounded-2xl bg-slate-50 p-4">
                                                    <p className="text-sm font-semibold text-slate-500">
                                                        Bio
                                                    </p>

                                                    <p className="mt-1 text-slate-700">
                                                        {application.profile.bio}
                                                    </p>
                                                </div>
                                            )}

                                            <div className="mt-5 flex flex-wrap gap-3">
                                                <span
                                                    className={`rounded-full px-4 py-2 text-sm font-semibold ${getStatusBadge(status)}`}
                                                >
                                                    {getStatusDisplayText(status)}
                                                </span>

                                                {application?.resume_viewed ? (
                                                    <span className="rounded-full bg-green-100 px-4 py-2 text-sm font-semibold text-green-700">
                                                        Resume Viewed
                                                    </span>
                                                ) : (
                                                    <span className="rounded-full bg-yellow-100 px-4 py-2 text-sm font-semibold text-yellow-700">
                                                        Resume Not Viewed
                                                    </span>
                                                )}

                                                {resumeUrl ? (
                                                    <span className="rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-700">
                                                        Resume Available
                                                    </span>
                                                ) : (
                                                    <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-600">
                                                        No Resume
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex w-full flex-col gap-3 lg:w-56">
                                            <button
                                                type="button"
                                                onClick={() => handleViewResume(application.id)}
                                                disabled={isLoading || !resumeUrl}
                                                className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                                            >
                                                {isLoading ? "Please wait..." : "View Resume"}
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleStatusChange(
                                                        application.id,
                                                        "shortlisted"
                                                    )
                                                }
                                                disabled={isLoading || status === "shortlisted"}
                                                className="rounded-xl bg-green-600 px-5 py-3 font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
                                            >
                                                {status === "shortlisted" ? "Shortlisted" : "Shortlist"}
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleStatusChange(
                                                        application.id,
                                                        "rejected"
                                                    )
                                                }
                                                disabled={isLoading || status === "rejected"}
                                                className="rounded-xl bg-red-600 px-5 py-3 font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                                            >
                                                {status === "rejected" ? "Rejected" : "Reject"}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </section>
    );
}

export default JobApplications;
