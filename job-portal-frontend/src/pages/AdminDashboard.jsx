import { useEffect, useState } from "react";

import { Link } from "react-router-dom";

import toast from "react-hot-toast";

import {
    getAdminDashboard,
    getAdminAnalytics,
    getAllUsers,
    deleteJobAdmin,
    updateJobApprovalAdmin,
    approveInterviewAdmin,
    rejectInterviewAdmin,
} from "../api/adminApi";

import JobStatusBadge from "../components/jobs/JobStatusBadge";
import AdminAnalyticsCharts, {
    AnalyticsSkeleton,
} from "../components/admin/AdminAnalyticsCharts";
import { normalizeJobStatus } from "../utils/jobStatus";

function AdminDashboard() {
    const [dashboardData, setDashboardData] = useState({
        total_users: 0,
        total_jobs: 0,
        pending_jobs: 0,
        approved_jobs: 0,
        rejected_jobs: 0,
        pending_interviews: 0,
        approved_interviews: 0,
        total_recruiters: 0,
        total_candidates: 0,
        total_active_jobs: 0,
        total_applications: 0,
        total_messages: 0,
        latest_users: [],
        latest_jobs: [],
        latest_applications: [],
        latest_messages: [],
        latest_interviews: [],
    });

    const [loading, setLoading] = useState(true);
    const [analyticsLoading, setAnalyticsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");
    const [analyticsError, setAnalyticsError] = useState("");
    const [analyticsData, setAnalyticsData] = useState(null);

    const [deletingJobId, setDeletingJobId] = useState(null);
    const [approvalLoadingId, setApprovalLoadingId] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedJobId, setSelectedJobId] = useState(null);
    const [allUsers, setAllUsers] = useState([]);
    const [activePeoplePanel, setActivePeoplePanel] = useState("candidates");
    const [activeAdminPanel, setActiveAdminPanel] = useState("approvals");

    const fetchAdminData = async () => {
        try {
            setLoading(true);
            setErrorMessage("");

            setAnalyticsLoading(true);
            setAnalyticsError("");

            const [data, usersData] = await Promise.all([
                getAdminDashboard(),
                getAllUsers(),
            ]);

            setDashboardData({
                total_users: data.total_users || 0,
                total_jobs: data.total_jobs || 0,
                pending_jobs: data.pending_jobs || 0,
                approved_jobs: data.approved_jobs || 0,
                rejected_jobs: data.rejected_jobs || 0,
                pending_interviews: data.pending_interviews || 0,
                approved_interviews: data.approved_interviews || 0,
                total_recruiters: data.total_recruiters || 0,
                total_candidates: data.total_candidates || 0,
                total_active_jobs: data.total_active_jobs || 0,
                total_applications: data.total_applications || 0,
                total_messages: data.total_messages || 0,
                latest_users: Array.isArray(data.latest_users)
                    ? data.latest_users
                    : [],
                latest_jobs: Array.isArray(data.latest_jobs)
                    ? data.latest_jobs
                    : [],
                latest_applications: Array.isArray(data.latest_applications)
                    ? data.latest_applications
                    : [],
                latest_messages: Array.isArray(data.latest_messages)
                    ? data.latest_messages
                    : [],
                latest_interviews: Array.isArray(data.latest_interviews)
                    ? data.latest_interviews
                    : [],
            });

            setAllUsers(Array.isArray(usersData) ? usersData : []);

            try {
                const analyticsResponse = await getAdminAnalytics();
                setAnalyticsData(analyticsResponse || null);
            } catch (analyticsRequestError) {
                const analyticsMessage =
                    analyticsRequestError.response?.data?.detail ||
                    "Failed to load analytics charts";

                setAnalyticsError(analyticsMessage);
                toast.error(analyticsMessage);
            }
        } catch (error) {
            console.error(error);

            const message =
                error.response?.data?.detail ||
                "Failed to load admin dashboard data";

            setErrorMessage(message);
            setAnalyticsError(message);
            toast.error(message);
        } finally {
            setLoading(false);
            setAnalyticsLoading(false);
        }
    };

    const handleApproveInterview = async (interviewId) => {
        try {
            await approveInterviewAdmin(interviewId);
            toast.success("Interview approved successfully");
            fetchAdminData();
        } catch (error) {
            toast.error(
                error.response?.data?.detail ||
                "Failed to approve interview"
            );
        }
    };

    const handleRejectInterview = async (interviewId) => {
        const reason = window.prompt("Enter interview rejection reason");

        if (!reason?.trim()) {
            toast.error("Rejection reason is required");
            return;
        }

        try {
            await rejectInterviewAdmin(interviewId, reason.trim());
            toast.success("Interview rejected successfully");
            fetchAdminData();
        } catch (error) {
            toast.error(
                error.response?.data?.detail ||
                "Failed to reject interview"
            );
        }
    };

    useEffect(() => {
        const timerId = window.setTimeout(fetchAdminData, 0);

        return () => window.clearTimeout(timerId);
    }, []);

    const openDeleteModal = (jobId) => {
        setSelectedJobId(jobId);
        setShowDeleteModal(true);
    };

    const closeDeleteModal = () => {
        setSelectedJobId(null);
        setShowDeleteModal(false);
    };

    const handleDeleteJob = async () => {
        if (!selectedJobId) return;

        try {
            setDeletingJobId(selectedJobId);
            setErrorMessage("");

            await deleteJobAdmin(selectedJobId);

            setDashboardData((previousData) => ({
                ...previousData,
                total_jobs:
                    previousData.total_jobs > 0
                        ? previousData.total_jobs - 1
                        : 0,
                latest_jobs: previousData.latest_jobs.filter(
                    (job) => job.id !== selectedJobId
                ),
            }));

            toast.success("Job deleted successfully");
            closeDeleteModal();
        } catch (error) {
            console.error(error);

            const message =
                error.response?.data?.detail ||
                "Failed to delete job";

            setErrorMessage(message);
            toast.error(message);
        } finally {
            setDeletingJobId(null);
        }
    };

    const handleJobApproval = async (jobId, status) => {
        if (status === "rejected") {
            return;
        }

        try {
            setApprovalLoadingId(jobId);
            setErrorMessage("");

            const response = await updateJobApprovalAdmin(jobId, status);
            const updatedJob = response?.job;

            if (!updatedJob?.id) {
                throw new Error("Job approval update failed");
            }

            setDashboardData((previousData) => ({
                ...previousData,
                latest_jobs: previousData.latest_jobs.map((job) =>
                    job.id === updatedJob.id
                        ? updatedJob
                        : job
                ),
            }));

            await fetchAdminData();

            toast.success(response?.message || "Job approval updated");
        } catch (error) {
            console.error(error);

            const message =
                error.response?.data?.detail ||
                error.message ||
                "Failed to update job approval";

            setErrorMessage(message);
            toast.error(message);
        } finally {
            setApprovalLoadingId(null);
        }
    };

    const candidateUsers = allUsers.filter(
        (user) => user.role === "candidate"
    );

    const recruiterUsers = allUsers.filter(
        (user) => ["recruiter", "company"].includes(user.role)
    );

    const visiblePeople = activePeoplePanel === "recruiters"
        ? recruiterUsers
        : activePeoplePanel === "all"
            ? allUsers
            : candidateUsers;

    const visiblePeopleTitle = activePeoplePanel === "recruiters"
        ? "Total Recruiters"
        : activePeoplePanel === "all"
            ? "Total Users"
            : "Total Candidates";

    const visiblePeopleDescription = activePeoplePanel === "recruiters"
        ? "All recruiter and company accounts are shown here."
        : activePeoplePanel === "all"
            ? "Every user account in the portal is shown here."
            : "Every candidate account in the portal is shown here.";

    const mainStats = [
        {
            key: "all",
            label: "Total Users",
            value: dashboardData.total_users,
            icon: "TU",
            helper: "Click to view all users",
            accent: "blue",
        },
        {
            key: "jobs",
            label: "Jobs Pending",
            value: dashboardData.pending_jobs,
            icon: "JP",
            helper: "Pending approval queue",
            accent: "amber",
        },
        {
            key: "interviews",
            label: "Pending Interviews",
            value: dashboardData.pending_interviews,
            icon: "PI",
            helper: "Needs admin decision",
            accent: "violet",
        },
        {
            key: "activeJobs",
            label: "Active Jobs",
            value: dashboardData.total_active_jobs,
            icon: "AJ",
            helper: "Approved public jobs",
            accent: "emerald",
        },
    ];

    const peopleStats = [
        {
            key: "recruiters",
            label: "Recruiters",
            value: dashboardData.total_recruiters,
            icon: "R",
            helper: "Click to view recruiters",
            accent: "indigo",
        },
        {
            key: "candidates",
            label: "Candidates",
            value: dashboardData.total_candidates,
            icon: "C",
            helper: "Click to view all candidates",
            accent: "sky",
        },
        {
            key: "approvedInterviews",
            label: "Approved Interviews",
            value: dashboardData.approved_interviews,
            icon: "AI",
            helper: "Approved interview count",
            accent: "green",
        },
    ];

    const cardColor = {
        blue: "bg-blue-50 text-blue-700 ring-blue-100",
        amber: "bg-amber-50 text-amber-700 ring-amber-100",
        violet: "bg-violet-50 text-violet-700 ring-violet-100",
        emerald: "bg-emerald-50 text-emerald-700 ring-emerald-100",
        indigo: "bg-indigo-50 text-indigo-700 ring-indigo-100",
        sky: "bg-sky-50 text-sky-700 ring-sky-100",
        green: "bg-green-50 text-green-700 ring-green-100",
    };

    const renderStatCard = (stat) => {
        const canSelect = ["all", "recruiters", "candidates"].includes(stat.key);
        const selected = activePeoplePanel === stat.key;

        return (
            <button
                key={stat.key}
                type="button"
                onClick={() => {
                    if (canSelect) {
                        setActivePeoplePanel(stat.key);
                    }
                }}
                disabled={!canSelect}
                className={`group relative overflow-hidden rounded-3xl border bg-white p-6 text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-blue-100 disabled:cursor-default ${
                    selected
                        ? "border-blue-300 shadow-lg shadow-blue-100"
                        : "border-gray-100"
                }`}
            >
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <p className="font-semibold text-gray-500">
                            {stat.label}
                        </p>

                        <h2 className="mt-3 text-4xl font-extrabold text-gray-900">
                            {stat.value}
                        </h2>
                    </div>

                    <span className={`grid h-12 w-12 place-items-center rounded-2xl text-sm font-extrabold ring-1 ${cardColor[stat.accent]}`}>
                        {stat.icon}
                    </span>
                </div>

                <p className={`mt-4 text-sm font-semibold transition ${
                    canSelect
                        ? "text-blue-600 opacity-0 group-hover:translate-x-1 group-hover:opacity-100"
                        : "text-gray-400"
                }`}>
                    {stat.helper}
                </p>

                {selected && (
                    <span className="absolute bottom-0 left-0 h-1 w-full bg-blue-600" />
                )}
            </button>
        );
    };

    const pendingQueueCount = dashboardData.latest_jobs.filter(
        (job) => normalizeJobStatus(job.status) === "pending"
    ).length;

    const adminActionCards = [
        {
            key: "approvals",
            title: "Approval Queue",
            value: pendingQueueCount,
            description: "Review recruiter jobs waiting for approval.",
            icon: "AQ",
            color: "blue",
        },
        {
            key: "messages",
            title: "Contact Messages",
            value: dashboardData.latest_messages.length,
            description: "Read the latest candidate and visitor messages.",
            icon: "CM",
            color: "emerald",
        },
        {
            key: "interviews",
            title: "Interview Requests",
            value: dashboardData.latest_interviews.length,
            description: "Approve shortlisted candidates for interviews.",
            icon: "IR",
            color: "violet",
        },
    ];

    const actionCardColor = {
        blue: "bg-blue-50 text-blue-700 ring-blue-100",
        emerald: "bg-emerald-50 text-emerald-700 ring-emerald-100",
        violet: "bg-violet-50 text-violet-700 ring-violet-100",
    };

    const renderAdminActionCard = (card) => {
        const selected = activeAdminPanel === card.key;

        return (
            <button
                key={card.key}
                type="button"
                onClick={() => setActiveAdminPanel(card.key)}
                className={`group relative overflow-hidden rounded-3xl border bg-white p-6 text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-blue-100 ${
                    selected
                        ? "border-blue-300 shadow-lg shadow-blue-100"
                        : "border-gray-100"
                }`}
            >
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <p className="text-lg font-extrabold text-gray-900">
                            {card.title}
                        </p>

                        <p className="mt-2 text-sm leading-6 text-gray-500">
                            {card.description}
                        </p>
                    </div>

                    <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-sm font-extrabold ring-1 ${actionCardColor[card.color]}`}>
                        {card.icon}
                    </span>
                </div>

                <div className="mt-5 flex items-center justify-between">
                    <span className="text-3xl font-extrabold text-gray-900">
                        {card.value}
                    </span>

                    <span className="text-sm font-bold text-blue-600 opacity-0 transition duration-300 group-hover:translate-x-1 group-hover:opacity-100">
                        Click to view
                    </span>
                </div>

                {selected && (
                    <span className="absolute bottom-0 left-0 h-1 w-full bg-blue-600" />
                )}
            </button>
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="w-14 h-14 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <section className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 px-4 py-8 sm:px-6 sm:py-12">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8 sm:mb-10">
                    <span className="inline-block bg-blue-100 text-blue-700 px-5 py-2 rounded-full text-sm font-bold">
                        Admin Panel
                    </span>

                    <h1 className="mt-5 text-2xl font-extrabold text-gray-900 sm:text-4xl">
                        Admin Dashboard
                    </h1>

                    <p className="mt-3 text-sm text-gray-500 sm:text-lg">
                        Manage users, jobs, applications, approvals, and contact messages from one place.
                    </p>
                </div>

                {errorMessage && (
                    <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-2xl font-semibold">
                        {errorMessage}
                    </div>
                )}

                <div className="grid grid-cols-1 gap-6 mb-6 md:grid-cols-2 xl:grid-cols-4">
                    {mainStats.map(renderStatCard)}
                </div>

                <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-3">
                    {peopleStats.map(renderStatCard)}
                </div>

                <div className="mb-10 overflow-hidden rounded-3xl border border-blue-100 bg-white shadow-sm transition-all duration-300">
                    <div className="flex flex-col gap-4 border-b border-blue-50 bg-blue-50/60 p-5 sm:p-6 md:flex-row md:items-center md:justify-between">
                        <div>
                            <h2 className="text-xl font-extrabold text-gray-900 sm:text-2xl">
                                {visiblePeopleTitle}
                            </h2>

                            <p className="mt-1 text-gray-600">
                                {visiblePeopleDescription}
                            </p>
                        </div>

                        <div className="grid grid-cols-3 rounded-2xl bg-white p-1 shadow-sm sm:flex">
                            {[
                                ["candidates", "Candidates"],
                                ["recruiters", "Recruiters"],
                                ["all", "All Users"],
                            ].map(([key, label]) => (
                                <button
                                    key={key}
                                    type="button"
                                    onClick={() => setActivePeoplePanel(key)}
                                    className={`rounded-xl px-4 py-2 text-sm font-bold transition-all duration-300 ${
                                        activePeoplePanel === key
                                            ? "bg-blue-600 text-white shadow-md"
                                            : "text-gray-600 hover:bg-blue-50 hover:text-blue-700"
                                    }`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid gap-4 p-5 sm:p-6 md:grid-cols-2 xl:grid-cols-3">
                        {visiblePeople.length === 0 ? (
                            <div className="col-span-full rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center">
                                <h3 className="text-xl font-bold text-gray-900">
                                    No records found
                                </h3>

                                <p className="mt-2 text-gray-500">
                                    This section will update as users register.
                                </p>
                            </div>
                        ) : (
                            visiblePeople.map((user) => (
                                <div
                                    key={user.id}
                                    className="group rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:bg-blue-50/40 hover:shadow-lg"
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-blue-600 text-lg font-extrabold text-white transition duration-300 group-hover:scale-105">
                                            {(user.name || user.email || "U").charAt(0).toUpperCase()}
                                        </div>

                                        <div className="min-w-0">
                                            <h3 className="truncate text-lg font-extrabold text-gray-900">
                                                {user.name || "Unnamed User"}
                                            </h3>

                                            <p className="mt-1 truncate text-sm text-gray-500">
                                                {user.email || "No email"}
                                            </p>

                                            <div className="mt-3 flex flex-wrap gap-2">
                                                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold capitalize text-slate-700">
                                                    {user.role || "user"}
                                                </span>

                                                <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold capitalize text-blue-700">
                                                    {user.account_status || "approved"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {analyticsLoading ? (
                    <AnalyticsSkeleton />
                ) : analyticsError ? (
                    <div className="mb-10 rounded-3xl border border-red-100 bg-red-50 p-6 text-red-700">
                        <h2 className="text-xl font-extrabold">
                            Analytics unavailable
                        </h2>
                        <p className="mt-2 text-sm font-semibold">
                            {analyticsError}
                        </p>
                    </div>
                ) : (
                    <AdminAnalyticsCharts analytics={analyticsData} />
                )}

                <div className="mb-6">
                    <div className="mb-5">
                        <span className="inline-flex rounded-full bg-blue-50 px-4 py-2 text-sm font-bold text-blue-700">
                            Admin Workbench
                        </span>

                        <h2 className="mt-4 text-2xl font-extrabold text-gray-900 sm:text-3xl">
                            Review Center
                        </h2>

                        <p className="mt-2 max-w-3xl text-gray-500">
                            Click a card to open the queue you want to manage.
                        </p>
                    </div>

                    <div className="grid gap-6 md:grid-cols-3">
                        {adminActionCards.map(renderAdminActionCard)}
                    </div>
                </div>

                <div className="rounded-3xl border border-gray-100 bg-white shadow-sm overflow-hidden">
                    {activeAdminPanel === "approvals" && (
                        <>
                            <div className="flex flex-col gap-4 border-b border-gray-100 bg-slate-50/70 p-7 md:flex-row md:items-center md:justify-between">
                                <div>
                                    <h2 className="text-2xl font-extrabold text-gray-900">
                                        Job Approval Queue
                                    </h2>

                                    <p className="mt-1 text-gray-500">
                                        Review recruiter jobs before they become visible to candidates.
                                    </p>
                                </div>

                                <Link
                                    to="/admin/job-approvals"
                                    className="w-full rounded-2xl bg-blue-600 px-5 py-3 text-center font-bold text-white transition duration-300 hover:-translate-y-1 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-100 md:w-auto"
                                >
                                    Full Approval Page
                                </Link>
                            </div>

                            <div className="divide-y divide-gray-100">
                                {dashboardData.latest_jobs.length === 0 ? (
                                    <div className="p-10 text-center">
                                        <h3 className="text-xl font-bold text-gray-900">
                                            No jobs found
                                        </h3>
                                        <p className="mt-2 text-gray-500">
                                            New recruiter jobs will appear here for review.
                                        </p>
                                    </div>
                                ) : (
                                    dashboardData.latest_jobs.map((job) => {
                                        const jobStatus = normalizeJobStatus(job.status);
                                        const isApproved = jobStatus === "approved";

                                        return (
                                            <div
                                                key={job.id}
                                                className="group p-6 transition-all duration-300 hover:bg-blue-50/50"
                                            >
                                                <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-center">
                                                    <div className="min-w-0">
                                                        <div className="flex flex-wrap items-center gap-3">
                                                            <h3 className="text-xl font-extrabold text-gray-900">
                                                                {job.title}
                                                            </h3>

                                                            <JobStatusBadge status={job.status} />
                                                        </div>

                                                        <p className="mt-1 text-sm font-semibold text-gray-500">
                                                            {job.company_name} • {job.location}
                                                        </p>

                                                        <p className="mt-3 line-clamp-2 text-sm leading-6 text-gray-600">
                                                            {job.description}
                                                        </p>
                                                    </div>

                                                    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap lg:justify-end">
                                                        {!isApproved && (
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    handleJobApproval(
                                                                        job.id,
                                                                        "approved"
                                                                    )
                                                                }
                                                                disabled={approvalLoadingId === job.id}
                                                                className="rounded-xl bg-green-50 px-4 py-2 font-bold text-green-700 transition-all duration-300 hover:-translate-y-0.5 hover:bg-green-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                                                            >
                                                                {approvalLoadingId === job.id
                                                                    ? "Saving..."
                                                                    : "Approve"}
                                                            </button>
                                                        )}

                                                        <Link
                                                            to="/admin/job-approvals"
                                                            className="rounded-xl bg-amber-50 px-4 py-2 font-bold text-amber-700 transition-all duration-300 hover:-translate-y-0.5 hover:bg-amber-600 hover:text-white"
                                                        >
                                                            Reject
                                                        </Link>

                                                        {isApproved && (
                                                            <Link
                                                                to={`/jobs/${job.id}`}
                                                                className="rounded-xl border border-gray-300 px-4 py-2 font-bold text-gray-700 transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-600 hover:bg-blue-600 hover:text-white"
                                                            >
                                                                View
                                                            </Link>
                                                        )}

                                                        <button
                                                            type="button"
                                                            onClick={() => openDeleteModal(job.id)}
                                                            disabled={deletingJobId === job.id}
                                                            className="rounded-xl bg-red-50 px-4 py-2 font-bold text-red-600 transition-all duration-300 hover:-translate-y-0.5 hover:bg-red-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                                                        >
                                                            {deletingJobId === job.id
                                                                ? "Deleting..."
                                                                : "Delete"}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </>
                    )}

                    {activeAdminPanel === "messages" && (
                        <>
                            <div className="flex flex-col gap-4 border-b border-gray-100 bg-slate-50/70 p-7 md:flex-row md:items-center md:justify-between">
                                <div>
                                    <h2 className="text-2xl font-extrabold text-gray-900">
                                        Contact Messages
                                    </h2>

                                    <p className="mt-1 text-gray-500">
                                        Latest incoming messages from candidates and visitors.
                                    </p>
                                </div>

                                <Link
                                    to="/admin/contact-messages"
                                    className="rounded-2xl bg-blue-600 px-5 py-3 text-center font-bold text-white transition duration-300 hover:-translate-y-1 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-100"
                                >
                                    View All Messages
                                </Link>
                            </div>

                            <div className="grid gap-4 p-6 lg:grid-cols-2">
                                {dashboardData.latest_messages.length === 0 ? (
                                    <div className="col-span-full rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-10 text-center">
                                        <h3 className="text-xl font-bold text-gray-900">
                                            No messages found
                                        </h3>
                                        <p className="mt-2 text-gray-500">
                                            Contact form submissions will appear here.
                                        </p>
                                    </div>
                                ) : (
                                    dashboardData.latest_messages.map((message) => (
                                        <div
                                            key={message.id}
                                            className="group rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:bg-blue-50/40 hover:shadow-lg"
                                        >
                                            <h3 className="text-lg font-extrabold text-gray-900">
                                                {message.subject}
                                            </h3>

                                            <p className="mt-1 text-sm font-semibold text-gray-500">
                                                {message.name} • {message.email}
                                            </p>

                                            <p className="mt-4 line-clamp-3 text-sm leading-6 text-gray-600">
                                                {message.message}
                                            </p>

                                            <p className="mt-4 text-sm font-bold text-blue-600 opacity-0 transition duration-300 group-hover:translate-x-1 group-hover:opacity-100">
                                                Open full inbox
                                            </p>
                                        </div>
                                    ))
                                )}
                            </div>
                        </>
                    )}

                    {activeAdminPanel === "interviews" && (
                        <>
                            <div className="border-b border-gray-100 bg-slate-50/70 p-7">
                                <h2 className="text-2xl font-extrabold text-gray-900">
                                    Interview Approval Requests
                                </h2>
                                <p className="mt-1 text-gray-500">
                                    Approve shortlisted candidates before interviews become visible.
                                </p>
                            </div>

                            <div className="divide-y divide-gray-100">
                                {dashboardData.latest_interviews.length === 0 ? (
                                    <div className="p-10 text-center">
                                        <h3 className="text-xl font-bold text-gray-900">
                                            No interview requests found
                                        </h3>
                                        <p className="mt-2 text-gray-500">
                                            Shortlisted candidates will appear here.
                                        </p>
                                    </div>
                                ) : (
                                    dashboardData.latest_interviews.map((interview) => (
                                        <div
                                            key={interview.id}
                                            className="p-6 transition hover:bg-blue-50/40"
                                        >
                                            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                                                <div>
                                                    <h3 className="text-xl font-extrabold text-gray-900">
                                                        {interview.candidate?.name || "Candidate"}
                                                    </h3>
                                                    <p className="mt-1 text-gray-500">
                                                        {interview.job?.title || "Job"} • {interview.job?.company_name || "Company"}
                                                    </p>
                                                    <span className="mt-3 inline-flex rounded-full bg-yellow-50 px-3 py-1 text-xs font-bold capitalize text-yellow-700">
                                                        {interview.status}
                                                    </span>
                                                </div>

                                                <div className="flex flex-wrap gap-3">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleApproveInterview(interview.id)}
                                                        disabled={interview.status === "approved"}
                                                        className="rounded-xl bg-green-50 px-4 py-2 font-bold text-green-700 transition hover:-translate-y-0.5 hover:bg-green-600 hover:text-white disabled:opacity-60"
                                                    >
                                                        Approve
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRejectInterview(interview.id)}
                                                        disabled={interview.status === "rejected"}
                                                        className="rounded-xl bg-red-50 px-4 py-2 font-bold text-red-600 transition hover:-translate-y-0.5 hover:bg-red-600 hover:text-white disabled:opacity-60"
                                                    >
                                                        Reject
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>

            {showDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
                    <div className="w-full max-w-md rounded-3xl bg-white p-7 shadow-2xl border border-gray-100">
                        <div className="w-14 h-14 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center text-2xl mb-5">
                            🗑️
                        </div>

                        <h2 className="text-2xl font-bold text-gray-900">
                            Delete Job?
                        </h2>

                        <p className="mt-3 text-gray-500 leading-relaxed">
                            This job will be hidden from normal job lists and moved out of the approval queue.
                        </p>

                        <div className="mt-7 flex flex-col sm:flex-row gap-3 sm:justify-end">
                            <button
                                type="button"
                                onClick={closeDeleteModal}
                                disabled={deletingJobId === selectedJobId}
                                className="px-6 py-3 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-100 disabled:opacity-60 transition-all"
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                onClick={handleDeleteJob}
                                disabled={deletingJobId === selectedJobId}
                                className="px-6 py-3 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                            >
                                {deletingJobId === selectedJobId
                                    ? "Deleting..."
                                    : "Yes, Delete"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}

export default AdminDashboard;
