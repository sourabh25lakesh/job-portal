import { useEffect, useState } from "react";

import { Link } from "react-router-dom";

import toast from "react-hot-toast";

import {
    getAdminDashboard,
    deleteJobAdmin,
} from "../api/adminApi";

function AdminDashboard() {
    const [dashboardData, setDashboardData] = useState({
        total_users: 0,
        total_jobs: 0,
        total_applications: 0,
        total_messages: 0,
        latest_users: [],
        latest_jobs: [],
        latest_applications: [],
        latest_messages: [],
    });

    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");

    const [deletingJobId, setDeletingJobId] = useState(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedJobId, setSelectedJobId] = useState(null);

    useEffect(() => {
        fetchAdminData();
    }, []);

    const fetchAdminData = async () => {
        try {
            setLoading(true);
            setErrorMessage("");

            const data = await getAdminDashboard();

            setDashboardData({
                total_users: data.total_users || 0,
                total_jobs: data.total_jobs || 0,
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
            });
        } catch (error) {
            console.error(error);

            const message =
                error.response?.data?.detail ||
                "Failed to load admin dashboard data";

            setErrorMessage(message);
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

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

    const handleApproveCandidate = (userName) => {
        toast.success(`${userName || "Candidate"} approved successfully`);
    };

    const handleRejectCandidate = (userName) => {
        toast.error(`${userName || "Candidate"} rejected`);
    };

    const candidateUsers = dashboardData.latest_users.filter(
        (user) => user.role === "candidate"
    );

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="w-14 h-14 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <section className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 px-6 py-12">
            <div className="max-w-7xl mx-auto">
                <div className="mb-10">
                    <span className="inline-block bg-blue-100 text-blue-700 px-5 py-2 rounded-full text-sm font-bold">
                        Admin Panel
                    </span>

                    <h1 className="mt-5 text-4xl font-extrabold text-gray-900">
                        Admin Dashboard
                    </h1>

                    <p className="mt-3 text-gray-500 text-lg">
                        Manage users, jobs, applications, approvals, and contact messages from one place.
                    </p>
                </div>

                {errorMessage && (
                    <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-2xl font-semibold">
                        {errorMessage}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                    <div className="bg-white rounded-3xl p-7 border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                        <p className="text-gray-500 font-semibold">
                            Total Users
                        </p>

                        <h2 className="mt-3 text-4xl font-extrabold text-gray-900">
                            {dashboardData.total_users}
                        </h2>
                    </div>

                    <div className="bg-white rounded-3xl p-7 border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                        <p className="text-gray-500 font-semibold">
                            Total Jobs
                        </p>

                        <h2 className="mt-3 text-4xl font-extrabold text-gray-900">
                            {dashboardData.total_jobs}
                        </h2>
                    </div>

                    <div className="bg-white rounded-3xl p-7 border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                        <p className="text-gray-500 font-semibold">
                            Applications
                        </p>

                        <h2 className="mt-3 text-4xl font-extrabold text-gray-900">
                            {dashboardData.total_applications}
                        </h2>
                    </div>

                    <div className="bg-white rounded-3xl p-7 border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                        <p className="text-gray-500 font-semibold">
                            Messages
                        </p>

                        <h2 className="mt-3 text-4xl font-extrabold text-gray-900">
                            {dashboardData.total_messages}
                        </h2>
                    </div>
                </div>

                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden mb-10">
                    <div className="p-7 border-b border-gray-100 flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-extrabold text-gray-900">
                                Candidate Approval
                            </h2>

                            <p className="text-gray-500 mt-1">
                                Review candidate accounts from admin panel only.
                            </p>
                        </div>

                        <span className="bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-bold">
                            {candidateUsers.length} Candidates
                        </span>
                    </div>

                    <div className="divide-y divide-gray-100">
                        {candidateUsers.length === 0 ? (
                            <p className="p-7 text-gray-500">
                                No candidate approvals found.
                            </p>
                        ) : (
                            candidateUsers.map((candidate) => (
                                <div
                                    key={candidate.id}
                                    className="p-7 hover:bg-blue-50/50 transition-all duration-300"
                                >
                                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center text-xl font-bold">
                                                {(candidate.name || candidate.full_name || candidate.email || "C")
                                                    .charAt(0)
                                                    .toUpperCase()}
                                            </div>

                                            <div>
                                                <h3 className="text-xl font-bold text-gray-900">
                                                    {candidate.name ||
                                                        candidate.full_name ||
                                                        "Candidate"}
                                                </h3>

                                                <p className="text-gray-500 mt-1">
                                                    {candidate.email || "No email"} • Candidate
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap gap-3">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleApproveCandidate(
                                                        candidate.name ||
                                                            candidate.full_name
                                                    )
                                                }
                                                className="px-5 py-3 rounded-xl bg-green-50 text-green-700 font-bold hover:bg-green-600 hover:text-white transition-all duration-300"
                                            >
                                                Approve
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleRejectCandidate(
                                                        candidate.name ||
                                                            candidate.full_name
                                                    )
                                                }
                                                className="px-5 py-3 rounded-xl bg-red-50 text-red-600 font-bold hover:bg-red-600 hover:text-white transition-all duration-300"
                                            >
                                                Reject
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="p-7 border-b border-gray-100">
                            <h2 className="text-2xl font-extrabold text-gray-900">
                                Latest Jobs
                            </h2>
                        </div>

                        <div className="divide-y divide-gray-100">
                            {dashboardData.latest_jobs.length === 0 ? (
                                <p className="p-7 text-gray-500">
                                    No jobs found.
                                </p>
                            ) : (
                                dashboardData.latest_jobs.map((job) => (
                                    <div
                                        key={job.id}
                                        className="p-7 hover:bg-blue-50/50 transition-all duration-300"
                                    >
                                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                            <div>
                                                <h3 className="text-xl font-bold text-gray-900">
                                                    {job.title}
                                                </h3>

                                                <p className="mt-1 text-gray-500">
                                                    {job.company_name} • {job.location}
                                                </p>
                                            </div>

                                            <div className="flex gap-3">
                                                <Link
                                                    to={`/jobs/${job.id}`}
                                                    className="px-5 py-3 rounded-xl border border-gray-300 font-bold hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all duration-300"
                                                >
                                                    View
                                                </Link>

                                                <button
                                                    type="button"
                                                    onClick={() => openDeleteModal(job.id)}
                                                    disabled={deletingJobId === job.id}
                                                    className="px-5 py-3 rounded-xl bg-red-50 text-red-600 font-bold hover:bg-red-600 hover:text-white disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-300"
                                                >
                                                    {deletingJobId === job.id
                                                        ? "Deleting..."
                                                        : "Delete"}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="p-7 border-b border-gray-100">
                            <h2 className="text-2xl font-extrabold text-gray-900">
                                Contact Messages
                            </h2>
                        </div>

                        <div className="divide-y divide-gray-100">
                            {dashboardData.latest_messages.length === 0 ? (
                                <p className="p-7 text-gray-500">
                                    No messages found.
                                </p>
                            ) : (
                                dashboardData.latest_messages.map((message) => (
                                    <div
                                        key={message.id}
                                        className="p-7 hover:bg-blue-50/50 transition-all duration-300"
                                    >
                                        <h3 className="text-lg font-bold text-gray-900">
                                            {message.subject}
                                        </h3>

                                        <p className="mt-1 text-gray-500">
                                            {message.name} • {message.email}
                                        </p>

                                        <p className="mt-3 text-gray-600 line-clamp-2">
                                            {message.message}
                                        </p>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="p-7 border-t border-gray-100">
                            <Link
                                to="/admin/contact-messages"
                                className="inline-block bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 hover:-translate-y-1 transition-all duration-300"
                            >
                                View All Messages
                            </Link>
                        </div>
                    </div>
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
                            Are you sure you want to delete this job permanently?
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