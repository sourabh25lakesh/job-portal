import {
    useEffect,
    useState,
} from "react";

import { Link } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

import { getMyApplications } from "../api/applicationApi";

function Dashboard() {
    const { user } = useAuth();

    const [loading, setLoading] = useState(true);
    const [applications, setApplications] = useState([]);
    const [savedJobsCount, setSavedJobsCount] = useState(0);
    const [appliedJobsCount, setAppliedJobsCount] = useState(0);

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

    const displayName = getValidName();

    useEffect(() => {
        fetchDashboardData();

        // Combined storage change handler
        const handleStorageChange = (event) => {
            // Update local counts for saved/applied jobs
            if (!event.key || event.key.startsWith("saved") || event.key.startsWith("applied")) {
                updateLocalCounts();
            }

            // Listen for lastApplicationUpdate key which is set by recruiter
            if (event.key === "lastApplicationUpdate" && event.newValue) {
                try {
                    const data = JSON.parse(event.newValue);
                    console.log("📲 Dashboard received cross-tab update:", data);
                    
                    setApplications((prevApplications) =>
                        prevApplications.map((app) =>
                            app.id === data.applicationId
                                ? { ...app, status: data.status }
                                : app
                        )
                    );

                    // Force refetch to ensure accuracy from backend
                    setTimeout(() => {
                        fetchDashboardData(true);
                    }, 500);
                } catch (e) {
                    console.error("Error parsing storage update:", e);
                }
            }
        };

        window.addEventListener("storage", handleStorageChange);

        // Polling - refresh every 5 seconds (reduced from 2) to prevent flickering
        const refreshInterval = setInterval(() => {
            fetchDashboardData(true); // Skip loading state
        }, 5000);

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
            const { applicationId, status } = event.detail;
            
            console.log("📲 Dashboard received application status update:", { applicationId, status });
            
            setApplications((prevApplications) =>
                prevApplications.map((app) =>
                    app.id === applicationId
                        ? { ...app, status: status }
                        : app
                )
            );

            // Force refetch to ensure accuracy from backend
            setTimeout(() => {
                fetchDashboardData(true);
            }, 500);
        };

        window.addEventListener("focus", handleWindowFocus);
        document.addEventListener("visibilitychange", handleVisibilityChange);
        window.addEventListener("applicationStatusUpdated", handleApplicationStatusUpdated);

        return () => {
            window.removeEventListener("storage", handleStorageChange);
            clearInterval(refreshInterval);
            window.removeEventListener("focus", handleWindowFocus);
            document.removeEventListener("visibilitychange", handleVisibilityChange);
            window.removeEventListener("applicationStatusUpdated", handleApplicationStatusUpdated);
        };
    }, []);

    const updateLocalCounts = () => {
        const savedJobs = JSON.parse(
            localStorage.getItem("savedJobs") || "[]"
        );

        const appliedJobs = JSON.parse(
            localStorage.getItem("appliedJobs") || "[]"
        );

        setSavedJobsCount(savedJobs.length);
        setAppliedJobsCount(appliedJobs.length);
    };

    const fetchDashboardData = async (skipLoadingState = false) => {
        try {
            if (!skipLoadingState) {
                setLoading(true);
            }
            
            updateLocalCounts();

            const data = await getMyApplications();

            setApplications(Array.isArray(data) ? data : []);

            const backendAppliedCount = Array.isArray(data)
                ? data.length
                : 0;

            const localAppliedJobs = JSON.parse(
                localStorage.getItem("appliedJobs") || "[]"
            );

            setAppliedJobsCount(
                backendAppliedCount > 0
                    ? backendAppliedCount
                    : localAppliedJobs.length
            );
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
        <section className="min-h-screen bg-gray-50 py-10 px-6">
            <div className="max-w-7xl mx-auto">

                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-4xl font-bold text-gray-900">
                                Dashboard
                            </h1>
                            <span className="inline-flex items-center gap-2 bg-green-50 border border-green-200 rounded-full px-3 py-1 text-xs font-semibold text-green-700">
                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                Live Updates
                            </span>
                        </div>

                        <p className="mt-3 text-gray-600 text-lg">
                            Welcome back,
                            <span className="font-semibold text-blue-600 ml-2">
                                {displayName}
                            </span>
                        </p>
                    </div>

                    <Link
                        to="/candidate-profile"
                        className="bg-white border border-gray-100 shadow-sm rounded-3xl px-6 py-4 flex items-center gap-4 hover:shadow-md transition"
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

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mt-10">

                    <div className="bg-white rounded-3xl p-7 border border-gray-100 shadow-sm hover:shadow-lg transition">
                        <p className="text-gray-500 font-medium">
                            Applied Jobs
                        </p>

                        <h2 className="text-5xl font-bold text-blue-600 mt-5">
                            {appliedJobsCount}
                        </h2>
                    </div>

                    <div className="bg-white rounded-3xl p-7 border border-gray-100 shadow-sm hover:shadow-lg transition">
                        <p className="text-gray-500 font-medium">
                            Saved Jobs
                        </p>

                        <h2 className="text-5xl font-bold text-green-600 mt-5">
                            {savedJobsCount}
                        </h2>
                    </div>

                    <div className="bg-white rounded-3xl p-7 border border-gray-100 shadow-sm hover:shadow-lg transition">
                        <p className="text-gray-500 font-medium">
                            Interviews
                        </p>

                        <h2 className="text-5xl font-bold text-orange-500 mt-5">
                            0
                        </h2>
                    </div>

                    <div className="bg-white rounded-3xl p-7 border border-gray-100 shadow-sm hover:shadow-lg transition">
                        <p className="text-gray-500 font-medium">
                            Profile Views
                        </p>

                        <h2 className="text-5xl font-bold text-purple-600 mt-5">
                            0
                        </h2>
                    </div>

                </div>

                <div className="grid lg:grid-cols-3 gap-8 mt-10">

                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">

                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-bold text-gray-900">
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
                                            className="border border-gray-100 rounded-2xl p-5 flex items-center justify-between hover:bg-gray-50 transition"
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
                                                    ${getStatusStyle(application.status)}
                                                `}
                                            >
                                                {getStatusLabel(application.status)}
                                            </span>
                                        </div>
                                    ))
                                )}
                            </div>

                        </div>
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