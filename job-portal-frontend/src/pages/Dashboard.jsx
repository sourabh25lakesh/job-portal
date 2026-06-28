import {
    useEffect,
    useRef,
    useState,
} from "react";

import { Link } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

import {
    getMyApplications,
    getMyInterviews,
} from "../api/applicationApi";

import {
    getApplicationStatusClass,
    getApplicationStatusLabel,
    normalizeApplicationStatus,
} from "../utils/applicationStatus";

function Dashboard() {
    const { user } = useAuth();

    const [loading, setLoading] = useState(true);
    const [applications, setApplications] = useState([]);
    const [interviews, setInterviews] = useState([]);
    const [savedJobsCount, setSavedJobsCount] = useState(0);
    const [appliedJobsCount, setAppliedJobsCount] = useState(0);
    const refreshTimeoutRef = useRef(null);

    const getValidName = () => {
        const possibleName =
            user?.name ||
            user?.full_name ||
            user?.username ||
            user?.email?.split("@")[0] ||
            "User";

        if (
            !possibleName ||
            possibleName === "undefined" ||
            possibleName === "null"
        ) {
            return user?.email?.split("@")[0] || "User";
        }

        return possibleName;
    };

    const displayName = getValidName();

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

    useEffect(() => {
        fetchDashboardData();

        // Combined storage change handler
        const handleStorageChange = (event) => {
            // Update local counts for saved/applied jobs
            if (!event.key || event.key.startsWith("saved") || event.key.startsWith("applied")) {
                updateLocalCounts();
            }

            if (
                (event.key === "lastApplicationUpdate" ||
                    event.key === "lastApplicationResumeViewed") &&
                event.newValue
            ) {
                try {
                    const data = JSON.parse(event.newValue);
                    const applicationId = data.applicationId ?? data.application?.id;
                    
                    setApplications((prevApplications) => {
                        const nextApplications = prevApplications.map((application) => {
                            if (String(application.id) !== String(applicationId)) {
                                return application;
                            }

                            const updatedApplication = data.application || {};

                            return {
                                ...application,
                                ...updatedApplication,
                                status: normalizeApplicationStatus(
                                    updatedApplication.status ?? data.status ?? application.status
                                ),
                                resume_viewed: Boolean(
                                    updatedApplication.resume_viewed ??
                                    data.resume_viewed ??
                                    application.resume_viewed
                                ),
                            };
                        });

                        return getApplicationsSnapshot(prevApplications) === getApplicationsSnapshot(nextApplications)
                            ? prevApplications
                            : nextApplications;
                    });

                    if (refreshTimeoutRef.current) {
                        clearTimeout(refreshTimeoutRef.current);
                    }

                    refreshTimeoutRef.current = setTimeout(() => {
                        fetchDashboardData(true);
                        refreshTimeoutRef.current = null;
                    }, 500);
                } catch (e) {
                    console.error("Error parsing storage update:", e);
                }
            }
        };

        window.addEventListener("storage", handleStorageChange);

        // Refresh immediately when window gains focus
        const handleWindowFocus = () => {
            fetchDashboardData(true);
        };

        // Refresh immediately when tab becomes visible
        const handleVisibilityChange = () => {
            if (!document.hidden) {
                fetchDashboardData(true);
            }
        };

        // Listen for real-time status updates from recruiter - UPDATE ONLY, don't refetch
        const handleApplicationStatusUpdated = (event) => {
            const update = event.detail || {};
            const applicationId = update.applicationId ?? update.application?.id;
            
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

            if (refreshTimeoutRef.current) {
                clearTimeout(refreshTimeoutRef.current);
            }

            refreshTimeoutRef.current = setTimeout(() => {
                fetchDashboardData(true);
                refreshTimeoutRef.current = null;
            }, 500);
        };

        window.addEventListener("focus", handleWindowFocus);
        document.addEventListener("visibilitychange", handleVisibilityChange);
        window.addEventListener("applicationStatusUpdated", handleApplicationStatusUpdated);
        window.addEventListener("applicationResumeViewed", handleApplicationStatusUpdated);

        return () => {
            window.removeEventListener("storage", handleStorageChange);
            if (refreshTimeoutRef.current) {
                clearTimeout(refreshTimeoutRef.current);
            }

            window.removeEventListener("focus", handleWindowFocus);
            document.removeEventListener("visibilitychange", handleVisibilityChange);
            window.removeEventListener("applicationStatusUpdated", handleApplicationStatusUpdated);
            window.removeEventListener("applicationResumeViewed", handleApplicationStatusUpdated);
        };
    }, []);

    const updateLocalCounts = () => {
        const userStorageKey = user?.id || user?.email || "guest";
        const savedJobs = JSON.parse(
            localStorage.getItem(`savedJobs:${userStorageKey}`) || "[]"
        );

        setSavedJobsCount(savedJobs.length);
    };

    const fetchDashboardData = async (skipLoadingState = false) => {
        try {
            if (!skipLoadingState) {
                setLoading(true);
            }
            
            updateLocalCounts();

            const data = await getMyApplications();
            const interviewData = await getMyInterviews();
            const cleanApplications = normalizeApplications(data);

            updateApplicationsIfChanged(cleanApplications);
            setInterviews(Array.isArray(interviewData) ? interviewData : []);

            const backendAppliedCount = Array.isArray(data)
                ? data.length
                : 0;

            setAppliedJobsCount(backendAppliedCount);
        } catch (error) {
            console.log(error);
            updateLocalCounts();
        } finally {
            if (!skipLoadingState) {
                setLoading(false);
            }
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
        <section className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 sm:py-10">
            <div className="max-w-7xl mx-auto">

                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                    <div>
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                            <h1 className="text-2xl font-bold text-gray-900 sm:text-4xl">
                                Dashboard
                            </h1>
                            <span className="inline-flex items-center gap-2 bg-green-50 border border-green-200 rounded-full px-3 py-1 text-xs font-semibold text-green-700">
                                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                Live Updates
                            </span>
                        </div>

                        <p className="mt-3 text-sm text-gray-600 sm:text-lg">
                            Welcome back,
                            <span className="font-semibold text-blue-600 ml-2">
                                {displayName}
                            </span>
                        </p>
                    </div>

                    <Link
                        to="/candidate-profile"
                        className="flex items-center gap-4 rounded-3xl border border-gray-100 bg-white px-5 py-4 shadow-sm transition hover:-translate-y-1 hover:shadow-md sm:px-6"
                    >
                        <div className="w-14 h-14 rounded-full bg-blue-600 text-white flex items-center justify-center text-xl font-bold">
                            {displayName.charAt(0).toUpperCase()}
                        </div>

                        <div>
                            <h3 className="font-bold text-lg text-gray-800">
                                {displayName}
                            </h3>

                            <p className="text-sm text-gray-400">
                                {user?.email || "No email"}
                            </p>

                            <p className="text-sm text-blue-600 font-semibold mt-1">
                                View Profile
                            </p>
                        </div>
                    </Link>
                </div>

                <div className="mt-8 grid grid-cols-2 gap-4 sm:mt-10 xl:grid-cols-4 xl:gap-6">

                    <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg sm:p-7">
                        <p className="text-sm font-medium text-gray-500 sm:text-base">
                            Applied Jobs
                        </p>

                        <h2 className="mt-4 text-3xl font-bold text-blue-600 sm:mt-5 sm:text-5xl">
                            {appliedJobsCount}
                        </h2>
                    </div>

                    <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg sm:p-7">
                        <p className="text-sm font-medium text-gray-500 sm:text-base">
                            Saved Jobs
                        </p>

                        <h2 className="mt-4 text-3xl font-bold text-green-600 sm:mt-5 sm:text-5xl">
                            {savedJobsCount}
                        </h2>
                    </div>

                    <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg sm:p-7">
                        <p className="text-sm font-medium text-gray-500 sm:text-base">
                            Interviews
                        </p>

                        <h2 className="mt-4 text-3xl font-bold text-orange-500 sm:mt-5 sm:text-5xl">
                            {interviews.length}
                        </h2>
                    </div>

                    <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg sm:p-7">
                        <p className="text-sm font-medium text-gray-500 sm:text-base">
                            Profile Views
                        </p>

                        <h2 className="mt-4 text-3xl font-bold text-purple-600 sm:mt-5 sm:text-5xl">
                            0
                        </h2>
                    </div>

                </div>

                <div className="mt-8 grid gap-6 lg:mt-10 lg:grid-cols-3 lg:gap-8">

                    <div className="lg:col-span-2">
                        <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-sm sm:p-8">

                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">
                                    Recent Applications
                                </h2>

                                <Link
                                    to="/my-applications"
                                    className="text-blue-600 font-semibold hover:underline"
                                >
                                    View All
                                </Link>
                            </div>

                            <div className="mt-8 space-y-5">
                                {applications.length === 0 ? (
                                    <div className="text-center py-12">
                                        <h3 className="text-xl font-bold text-gray-800">
                                            No applications yet
                                        </h3>

                                        <p className="text-gray-500 mt-2">
                                            Apply for jobs and your history will show here.
                                        </p>

                                        <Link
                                            to="/jobs"
                                            className="inline-block mt-6 bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition"
                                        >
                                            Browse Jobs
                                        </Link>
                                    </div>
                                ) : (
                                    applications.slice(0, 3).map((application) => (
                                        <div
                                            key={application.id}
                                            className="flex flex-col gap-3 rounded-2xl border border-gray-100 p-4 transition hover:bg-gray-50 sm:flex-row sm:items-center sm:justify-between sm:p-5"
                                        >
                                            <div>
                                                <h3 className="font-semibold text-lg text-gray-800">
                                                    {application.job?.title || "Job Title"}
                                                </h3>

                                                <p className="text-gray-500 mt-1">
                                                    {application.job?.company_name || "Company"} • {application.job?.location || "Location"}
                                                </p>
                                            </div>

                                            <span
                                                className={`
                                                    px-4 py-2 rounded-full text-sm font-medium
                                                    ${getApplicationStatusClass(application.status)}
                                                `}
                                            >
                                                {getApplicationStatusLabel(application.status)}
                                            </span>
                                        </div>
                                    ))
                                )}
                            </div>

                        </div>

                        {interviews.length > 0 && (
                            <div className="mt-8 bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
                                <h2 className="text-2xl font-bold text-gray-900">
                                    Approved Interviews
                                </h2>

                                <div className="mt-6 space-y-4">
                                    {interviews.slice(0, 3).map((interview) => (
                                        <div
                                            key={interview.id}
                                            className="rounded-2xl border border-green-100 bg-green-50 p-5"
                                        >
                                            <h3 className="font-bold text-green-900">
                                                {interview.job?.title || "Interview"}
                                            </h3>
                                            <p className="mt-1 text-sm text-green-700">
                                                {interview.job?.company_name || "Company"} • Approved by admin
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="space-y-8">

                        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
                            <h2 className="text-2xl font-bold text-gray-900">
                                Profile Completion
                            </h2>

                            <div className="mt-6">
                                <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
                                    <div className="h-4 w-[75%] bg-blue-600 rounded-full"></div>
                                </div>

                                <p className="mt-3 text-gray-600">
                                    Your profile is
                                    <span className="font-semibold text-blue-600">
                                        {" "}75% complete
                                    </span>
                                </p>
                            </div>

                            <Link
                                to="/candidate-profile"
                                className="block text-center mt-6 w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition"
                            >
                                Complete Profile
                            </Link>
                        </div>

                        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
                            <h2 className="text-2xl font-bold text-gray-900">
                                Quick Actions
                            </h2>

                            <div className="mt-6 flex flex-col gap-4">

                                <Link
                                    to="/candidate-profile"
                                    className="text-center bg-gray-100 hover:bg-gray-200 transition py-3 rounded-xl font-medium"
                                >
                                    Upload Resume
                                </Link>

                                <Link
                                    to="/candidate-profile"
                                    className="text-center bg-gray-100 hover:bg-gray-200 transition py-3 rounded-xl font-medium"
                                >
                                    Edit Profile
                                </Link>

                                <Link
                                    to="/jobs"
                                    className="text-center bg-gray-100 hover:bg-gray-200 transition py-3 rounded-xl font-medium"
                                >
                                    Browse Jobs
                                </Link>

                                <Link
                                    to="/my-applications"
                                    className="text-center bg-blue-600 hover:bg-blue-700 text-white transition py-3 rounded-xl font-medium"
                                >
                                    My Applications
                                </Link>

                            </div>
                        </div>

                    </div>

                </div>

            </div>
        </section>
    );
}

export default Dashboard;
