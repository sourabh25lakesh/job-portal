import {
    useEffect,
    useRef,
    useState,
} from "react";

import {
    Link,
} from "react-router-dom";

import toast from "react-hot-toast";

import {
    getMyApplications,
    deleteApplication,
} from "../api/applicationApi";

import {
    getApplicationStatusClass,
    getApplicationStatusLabel,
    normalizeApplicationStatus,
} from "../utils/applicationStatus";

function MyApplications() {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");
    const [deletingId, setDeletingId] = useState(null);

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedApplicationId, setSelectedApplicationId] = useState(null);
    const refreshTimeoutRef = useRef(null);

    const normalizeApplications = (data) => {
        return Array.isArray(data)
            ? data.map((application) => ({
                ...application,
                status: normalizeApplicationStatus(application.status),
                resume_viewed: Boolean(application.resume_viewed),
            }))
            : [];
    };

    const getApplicationsSnapshot = (items) => {
        return JSON.stringify(
            items.map((application) => ({
                id: application.id,
                status: normalizeApplicationStatus(application.status),
                resume_viewed: Boolean(application.resume_viewed),
                updated_at: application.updated_at || null,
                job_id: application.job_id || application.job?.id || null,
                title: application.job?.title || "",
                company_name: application.job?.company_name || "",
                location: application.job?.location || "",
                salary: application.job?.salary || "",
                description: application.job?.description || "",
                skills: application.job?.skills || [],
                job_status: application.job?.status || "",
            }))
        );
    };

    const updateApplicationsIfChanged = (nextApplications) => {
        setApplications((previousApplications) =>
            getApplicationsSnapshot(previousApplications) === getApplicationsSnapshot(nextApplications)
                ? previousApplications
                : nextApplications
        );
    };

    const fetchApplications = async (skipLoadingState = false) => {
        try {
            if (!skipLoadingState) {
                setLoading(true);
            }
            setErrorMessage("");

            const data = await getMyApplications();
            const cleanApplications = normalizeApplications(data);

            updateApplicationsIfChanged(cleanApplications);
        } catch (error) {
            const message =
                error.response?.data?.detail ||
                error.message ||
                "Failed to load applications";

            setErrorMessage(message);

            if (!skipLoadingState) {
                toast.error(message);
            }
        } finally {
            if (!skipLoadingState) {
                setLoading(false);
            }
        }
    };

    useEffect(() => {
        fetchApplications();

        // Refresh immediately when window gains focus
        const handleWindowFocus = () => {
            fetchApplications(true);
        };

        // Refresh immediately when tab becomes visible
        const handleVisibilityChange = () => {
            if (!document.hidden) {
                fetchApplications(true);
            }
        };

        const mergeApplicationUpdate = (update) => {
            const applicationId = update?.applicationId ?? update?.application?.id;

            if (!applicationId) {
                return;
            }

            setApplications((prevApplications) => {
                const nextApplications = prevApplications.map((application) => {
                    if (String(application.id) !== String(applicationId)) {
                        return application;
                    }

                    const updatedApplication = update.application || {};

                    return {
                        ...application,
                        ...updatedApplication,
                        status: normalizeApplicationStatus(
                            updatedApplication.status ?? update.status ?? application.status
                        ),
                        resume_viewed: Boolean(
                            updatedApplication.resume_viewed ??
                            update.resume_viewed ??
                            application.resume_viewed
                        ),
                    };
                });

                return getApplicationsSnapshot(prevApplications) === getApplicationsSnapshot(nextApplications)
                    ? prevApplications
                    : nextApplications;
            });
        };

        const refetchSoon = () => {
            if (refreshTimeoutRef.current) {
                clearTimeout(refreshTimeoutRef.current);
            }

            refreshTimeoutRef.current = setTimeout(() => {
                fetchApplications(true);
                refreshTimeoutRef.current = null;
            }, 300);
        };

        // Listen for real-time updates from recruiter tabs.
        const handleApplicationStatusUpdated = (event) => {
            mergeApplicationUpdate(event.detail);
            refetchSoon();
        };

        const handleApplicationResumeViewed = (event) => {
            mergeApplicationUpdate({
                ...event.detail,
                resume_viewed: true,
            });
            refetchSoon();
        };

        // Listen for localStorage changes (from other tabs)
        const handleStorageChange = (event) => {
            if (
                (event.key === "lastApplicationUpdate" ||
                    event.key === "lastApplicationResumeViewed") &&
                event.newValue
            ) {
                try {
                    const data = JSON.parse(event.newValue);
                    mergeApplicationUpdate(data);
                    refetchSoon();
                } catch (e) {
                    console.error("Error parsing application update:", e);
                }
            }
        };

        window.addEventListener("focus", handleWindowFocus);
        document.addEventListener("visibilitychange", handleVisibilityChange);
        window.addEventListener("applicationStatusUpdated", handleApplicationStatusUpdated);
        window.addEventListener("applicationResumeViewed", handleApplicationResumeViewed);
        window.addEventListener("storage", handleStorageChange);

        return () => {
            if (refreshTimeoutRef.current) {
                clearTimeout(refreshTimeoutRef.current);
            }

            window.removeEventListener("focus", handleWindowFocus);
            document.removeEventListener("visibilitychange", handleVisibilityChange);
            window.removeEventListener("applicationStatusUpdated", handleApplicationStatusUpdated);
            window.removeEventListener("applicationResumeViewed", handleApplicationResumeViewed);
            window.removeEventListener("storage", handleStorageChange);
        };
    }, []);

    const openDeleteModal = (applicationId) => {
        setSelectedApplicationId(applicationId);
        setShowDeleteModal(true);
    };

    const closeDeleteModal = () => {
        setSelectedApplicationId(null);
        setShowDeleteModal(false);
    };

    const handleDeleteApplication = async () => {
        if (!selectedApplicationId) return;

        try {
            setDeletingId(selectedApplicationId);
            setErrorMessage("");

            await deleteApplication(selectedApplicationId);

            setApplications((previousApplications) =>
                previousApplications.filter(
                    (application) => application.id !== selectedApplicationId
                )
            );

            toast.success("Application removed successfully");
            closeDeleteModal();
        } catch (error) {
            const message =
                error.response?.data?.detail ||
                error.message ||
                "Failed to remove job from history";

            setErrorMessage(message);
            toast.error(message);
        } finally {
            setDeletingId(null);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="w-14 h-14 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <section className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 sm:py-12">
            <div className="max-w-7xl mx-auto">

                <div className="mb-10 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
                    <div>
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                            <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
                                My Applications
                            </h1>
                            <span className="inline-flex items-center gap-2 bg-green-50 border border-green-200 rounded-full px-3 py-1 text-xs font-semibold text-green-700">
                                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                Live Updates
                            </span>
                        </div>

                        <p className="mt-3 text-base text-gray-500 sm:text-lg">
                            Track job status, recruiter resume views, shortlist and rejection updates.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                        <button
                            onClick={fetchApplications}
                            disabled={loading}
                            className="inline-flex items-center justify-center bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-2xl font-semibold transition-colors duration-300 shadow-sm hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            🔄 {loading ? "Refreshing..." : "Refresh"}
                        </button>

                        <Link
                            to="/jobs"
                            className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-semibold transition-colors duration-300 shadow-sm hover:shadow-lg"
                        >
                            Browse More Jobs
                        </Link>
                    </div>
                </div>

                {errorMessage && (
                    <div className="mb-8 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-red-700 font-medium">
                        {errorMessage}
                    </div>
                )}

                {applications.length === 0 ? (
                    <div className="rounded-3xl border border-gray-100 bg-white p-8 text-center shadow-sm sm:p-16">
                        <div className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-blue-50 text-xl font-black text-blue-700">
                            AP
                        </div>

                        <h2 className="mt-6 text-2xl font-bold text-gray-900 sm:text-3xl">
                            No Applications Yet
                        </h2>

                        <p className="mt-4 text-gray-500 text-lg">
                            Start applying for jobs to see them here.
                        </p>

                        <Link
                            to="/jobs"
                            className="inline-block mt-8 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-semibold transition-colors duration-300 shadow-lg"
                        >
                            Browse Jobs
                        </Link>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {applications.map((application) => {
                            const jobId =
                                application.job_id ||
                                application.job?.id;

                            const cleanStatus = normalizeApplicationStatus(application.status);
                            const statusLabel = getApplicationStatusLabel(application.status);

                            return (
                                <div
                                    key={application.id}
                                className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm transition-shadow duration-300 hover:shadow-xl sm:p-8"
                                >
                                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">

                                        <div>
                                            <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center text-xl font-bold text-blue-600 mb-5">
                                                {
                                                    application.job?.company_name
                                                        ?.charAt(0)
                                                        ?.toUpperCase()
                                                    || "J"
                                                }
                                            </div>

                                            <h2 className="break-words text-xl font-bold text-gray-900 transition hover:text-blue-600 sm:text-2xl">
                                                {
                                                    application.job?.title ||
                                                    "Job Title"
                                                }
                                            </h2>

                                            <p className="mt-2 text-base text-gray-500 sm:text-lg">
                                                {
                                                    application.job?.company_name ||
                                                    "Company"
                                                }
                                            </p>

                                            <div className="flex flex-wrap gap-3 mt-5">

                                                <span
                                                    className={`
                                                        px-4 py-2 rounded-xl text-sm font-semibold
                                                        ${getApplicationStatusClass(cleanStatus)}
                                                    `}
                                                >
                                                    {statusLabel}
                                                </span>

                                                {application.resume_viewed ? (
                                                    <span className="bg-green-100 text-green-700 px-4 py-2 rounded-xl text-sm font-semibold">
                                                        Resume Viewed by Recruiter
                                                    </span>
                                                ) : (
                                                    <span className="bg-gray-100 text-gray-700 px-4 py-2 rounded-xl text-sm font-semibold">
                                                        Resume Not Viewed Yet
                                                    </span>
                                                )}

                                                <span className="bg-gray-100 text-gray-700 px-4 py-2 rounded-xl text-sm">
                                                    Location: {
                                                        application.job?.location ||
                                                        "Location"
                                                    }
                                                </span>

                                                <span className="bg-gray-100 text-gray-700 px-4 py-2 rounded-xl text-sm">
                                                    Salary: {
                                                        application.job?.salary ||
                                                        "Not Disclosed"
                                                    }
                                                </span>
                                            </div>

                                            {Array.isArray(application.job?.skills) && application.job.skills.length > 0 && (
                                                <div className="mt-4 flex flex-wrap gap-2">
                                                    {application.job.skills.map((skill) => (
                                                        <span
                                                            key={skill}
                                                            className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700"
                                                        >
                                                            {skill}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}

                                            {cleanStatus === "shortlisted" && (
                                                <p className="mt-5 rounded-2xl bg-green-50 px-5 py-4 text-green-700 font-medium">
                                                    Congratulations! Recruiter shortlisted your application.
                                                </p>
                                            )}

                                            {cleanStatus === "rejected" && (
                                                <p className="mt-5 rounded-2xl bg-red-50 px-5 py-4 text-red-700 font-medium">
                                                    Your application was rejected for this job.
                                                </p>
                                            )}

                                            {cleanStatus === "pending" && (
                                                <p className="mt-5 rounded-2xl bg-yellow-50 px-5 py-4 text-yellow-700 font-medium">
                                                    Your application is pending recruiter review.
                                                </p>
                                            )}
                                        </div>

                                        <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:gap-4 lg:flex-col xl:flex-row">
                                            {jobId && (
                                                <Link
                                                    to={`/jobs/${jobId}`}
                                                    className="text-center border border-gray-300 hover:border-blue-600 hover:bg-blue-600 hover:text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300"
                                                >
                                                    View Job
                                                </Link>
                                            )}

                                            <span className="text-center bg-blue-50 text-blue-700 px-6 py-3 rounded-xl font-semibold">
                                                Saved in History
                                            </span>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    openDeleteModal(application.id)
                                                }
                                                disabled={deletingId === application.id}
                                                className="text-center bg-red-50 text-red-600 hover:bg-red-600 hover:text-white disabled:opacity-60 disabled:cursor-not-allowed px-6 py-3 rounded-xl font-semibold transition-all duration-300"
                                            >
                                                {
                                                    deletingId === application.id
                                                        ? "Deleting..."
                                                        : "Delete"
                                                }
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {showDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
                    <div className="w-full max-w-md rounded-3xl bg-white p-7 shadow-2xl border border-gray-100">
                        <div className="w-14 h-14 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center text-2xl mb-5">
                            🗑️
                        </div>

                        <h2 className="text-2xl font-bold text-gray-900">
                            Delete Application?
                        </h2>

                        <p className="mt-3 text-gray-500 leading-relaxed">
                            Are you sure you want to remove this job from your application history?
                        </p>

                        <div className="mt-7 flex flex-col sm:flex-row gap-3 sm:justify-end">
                            <button
                                type="button"
                                onClick={closeDeleteModal}
                                disabled={deletingId === selectedApplicationId}
                                className="px-6 py-3 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-100 disabled:opacity-60 transition-all"
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                onClick={handleDeleteApplication}
                                disabled={deletingId === selectedApplicationId}
                                className="px-6 py-3 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                            >
                                {
                                    deletingId === selectedApplicationId
                                        ? "Deleting..."
                                        : "Yes, Delete"
                                }
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}

export default MyApplications;
