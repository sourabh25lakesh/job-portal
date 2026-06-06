import {
    useEffect,
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

function MyApplications() {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");
    const [deletingId, setDeletingId] = useState(null);

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedApplicationId, setSelectedApplicationId] = useState(null);

    // Debug: Log applications state whenever it changes
    useEffect(() => {
        console.log("📊 CANDIDATE: Applications state updated:", applications);
        applications.forEach((app, idx) => {
            console.log(`  [${idx}] ID: ${app.id}, Status: ${app.status}, Job: ${app.job?.title}`);
        });
    }, [applications]);

    const fetchApplications = async (skipLoadingState = false) => {
        try {
            if (!skipLoadingState) {
                setLoading(true);
            }
            setErrorMessage("");

            const data = await getMyApplications();
            console.log("📥 CANDIDATE: Fetched applications from backend:", data);

            setApplications(Array.isArray(data) ? data : []);
            console.log("✅ CANDIDATE: State updated with applications:", Array.isArray(data) ? data : []);
        } catch (error) {
            const message =
                error.response?.data?.detail ||
                error.message ||
                "Failed to load applications";

            setErrorMessage(message);
            toast.error(message);
        } finally {
            if (!skipLoadingState) {
                setLoading(false);
            }
        }
    };

    useEffect(() => {
        fetchApplications();

        // Polling - refresh every 5 seconds (reduced from 2)
        const refreshInterval = setInterval(() => {
            fetchApplications(true); // Skip loading state
        }, 5000);

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

        // Listen for real-time status updates from recruiter - UPDATE ONLY, don't refetch
        const handleApplicationStatusUpdated = (event) => {
            const { applicationId, status } = event.detail;
            
            console.log("✅ CUSTOM EVENT FIRED - Received application status update:", { applicationId, status });
            console.log("🔍 Current applications in state BEFORE update:", applications);
            
            setApplications((prevApplications) => {
                console.log("📝 Callback for setApplications called");
                console.log("🔍 prevApplications:", prevApplications);
                
                const updated = prevApplications.map((app) => {
                    if (app.id === applicationId) {
                        console.log(`✏️ Updating app ${applicationId}: "${app.status}" → "${status}"`);
                        return { ...app, status: status };
                    }
                    return app;
                });
                
                console.log("📊 Updated applications after map:", updated);
                return updated;
            });

            // Force refetch to ensure accuracy from backend
            console.log("⏰ Scheduling refetch in 100ms...");
            setTimeout(() => {
                console.log("🔄 REFETCHING from backend...");
                fetchApplications(true);
            }, 100); // Reduced to 100ms for faster sync
        };

        // Listen for localStorage changes (from other tabs)
        const handleStorageChange = (event) => {
            console.log("🔔 STORAGE EVENT FIRED - Key:", event.key, "New Value:", event.newValue);
            
            // Listen for lastApplicationUpdate key which is set by recruiter
            if (event.key === "lastApplicationUpdate" && event.newValue) {
                try {
                    const data = JSON.parse(event.newValue);
                    console.log("✅ STORAGE EVENT - Received cross-tab application update:", data);
                    console.log("🔍 Current applications in state BEFORE storage update:", applications);
                    
                    setApplications((prevApplications) => {
                        console.log("📝 Callback for setApplications called from storage");
                        console.log("🔍 prevApplications from storage:", prevApplications);
                        
                        const updated = prevApplications.map((app) => {
                            if (app.id === data.applicationId) {
                                console.log(`✏️ STORAGE UPDATE: Updating app ${data.applicationId}: "${app.status}" → "${data.status}"`);
                                return { ...app, status: data.status };
                            }
                            return app;
                        });
                        
                        console.log("📊 Updated applications after storage update:", updated);
                        return updated;
                    });

                    // Force refetch to ensure accuracy from backend
                    console.log("⏰ Scheduling refetch in 100ms after storage event...");
                    setTimeout(() => {
                        console.log("🔄 REFETCHING from backend after storage event...");
                        fetchApplications(true);
                    }, 100);
                } catch (e) {
                    console.error("❌ Error parsing storage update:", e);
                }
            }
        };

        window.addEventListener("focus", handleWindowFocus);
        document.addEventListener("visibilitychange", handleVisibilityChange);
        window.addEventListener("applicationStatusUpdated", handleApplicationStatusUpdated);
        window.addEventListener("storage", handleStorageChange);

        return () => {
            clearInterval(refreshInterval);
            window.removeEventListener("focus", handleWindowFocus);
            document.removeEventListener("visibilitychange", handleVisibilityChange);
            window.removeEventListener("applicationStatusUpdated", handleApplicationStatusUpdated);
            window.removeEventListener("storage", handleStorageChange);
        };
    }, []);

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

    const getStatusLabel = (status) => {
        const cleanStatus = normalizeStatus(status);

        if (cleanStatus === "shortlisted") {
            return "Shortlisted";
        }

        if (cleanStatus === "rejected") {
            return "Rejected";
        }

        return "Pending";
    };

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

    const getStatusStyle = (status) => {
        const cleanStatus = normalizeStatus(status);

        if (cleanStatus === "shortlisted") {
            return "bg-green-100 text-green-700";
        }

        if (cleanStatus === "rejected") {
            return "bg-red-100 text-red-700";
        }

        return "bg-yellow-100 text-yellow-700";
    };

    const getStatusIcon = (status) => {
        const cleanStatus = normalizeStatus(status);

        if (cleanStatus === "shortlisted") return "✅";
        if (cleanStatus === "rejected") return "❌";

        return "⏳";
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="w-14 h-14 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <section className="min-h-screen bg-gray-50 py-12 px-6">
            <div className="max-w-7xl mx-auto">

                <div className="mb-10 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-4xl font-bold text-gray-900">
                                My Applications
                            </h1>
                            <span className="inline-flex items-center gap-2 bg-green-50 border border-green-200 rounded-full px-3 py-1 text-xs font-semibold text-green-700">
                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                Live Updates
                            </span>
                        </div>

                        <p className="mt-3 text-lg text-gray-500">
                            Track job status, recruiter resume views, shortlist and rejection updates.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                        <button
                            onClick={fetchApplications}
                            disabled={loading}
                            className="inline-flex items-center justify-center bg-green-600 hover:bg-green-700 hover:-translate-y-1 text-white px-6 py-3 rounded-2xl font-semibold transition-all duration-300 shadow-sm hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            🔄 {loading ? "Refreshing..." : "Refresh"}
                        </button>

                        <Link
                            to="/jobs"
                            className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 hover:-translate-y-1 text-white px-6 py-3 rounded-2xl font-semibold transition-all duration-300 shadow-sm hover:shadow-lg"
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
                    <div className="bg-white rounded-3xl p-16 text-center border border-gray-100 shadow-sm">
                        <div className="text-7xl">📭</div>

                        <h2 className="mt-6 text-3xl font-bold text-gray-900">
                            No Applications Yet
                        </h2>

                        <p className="mt-4 text-gray-500 text-lg">
                            Start applying for jobs to see them here.
                        </p>

                        <Link
                            to="/jobs"
                            className="inline-block mt-8 bg-blue-600 hover:bg-blue-700 hover:-translate-y-1 text-white px-8 py-4 rounded-2xl font-semibold transition-all duration-300 shadow-lg"
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

                            const cleanStatus = normalizeStatus(application.status);
                            const statusLabel = getStatusLabel(application.status);

                            return (
                                <div
                                    key={application.id}
                                    className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
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

                                            <h2 className="text-2xl font-bold text-gray-900 hover:text-blue-600 transition">
                                                {
                                                    application.job?.title ||
                                                    "Job Title"
                                                }
                                            </h2>

                                            <p className="mt-2 text-lg text-gray-500">
                                                {
                                                    application.job?.company_name ||
                                                    "Company"
                                                }
                                            </p>

                                            <div className="flex flex-wrap gap-3 mt-5">

                                                <span
                                                    className={`
                                                        px-4 py-2 rounded-xl text-sm font-semibold
                                                        ${getStatusStyle(cleanStatus)}
                                                    `}
                                                >
                                                    {getStatusIcon(cleanStatus)} {statusLabel}
                                                </span>

                                                {application.resume_viewed ? (
                                                    <span className="bg-green-100 text-green-700 px-4 py-2 rounded-xl text-sm font-semibold">
                                                        ✅ Resume Viewed by Recruiter
                                                    </span>
                                                ) : (
                                                    <span className="bg-gray-100 text-gray-700 px-4 py-2 rounded-xl text-sm font-semibold">
                                                        ⏳ Resume Not Viewed Yet
                                                    </span>
                                                )}

                                                <span className="bg-gray-100 text-gray-700 px-4 py-2 rounded-xl text-sm">
                                                    📍 {
                                                        application.job?.location ||
                                                        "Location"
                                                    }
                                                </span>

                                                <span className="bg-gray-100 text-gray-700 px-4 py-2 rounded-xl text-sm">
                                                    💰 {
                                                        application.job?.salary ||
                                                        "Not Disclosed"
                                                    }
                                                </span>
                                            </div>

                                            {cleanStatus === "shortlisted" && (
                                                <p className="mt-5 rounded-2xl bg-green-50 px-5 py-4 text-green-700 font-medium">
                                                    🎉 Congratulations! Recruiter shortlisted your application.
                                                </p>
                                            )}

                                            {cleanStatus === "rejected" && (
                                                <p className="mt-5 rounded-2xl bg-red-50 px-5 py-4 text-red-700 font-medium">
                                                    ❌ Your application was rejected for this job.
                                                </p>
                                            )}

                                            {cleanStatus === "pending" && (
                                                <p className="mt-5 rounded-2xl bg-yellow-50 px-5 py-4 text-yellow-700 font-medium">
                                                    ⏳ Your application is pending recruiter review.
                                                </p>
                                            )}
                                        </div>

                                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
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