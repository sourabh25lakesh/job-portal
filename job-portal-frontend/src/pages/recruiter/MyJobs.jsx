import {
    useEffect,
    useState,
} from "react";

import { Link } from "react-router-dom";

import toast from "react-hot-toast";

import {
    getRecruiterDashboard,
} from "../../api/recruiterApi";

import {
    viewCandidateResume,
    updateApplicationStatus,
} from "../../api/applicationApi";

function MyJobs() {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [updatingId, setUpdatingId] = useState(null);

    useEffect(() => {
        fetchMyJobs();
    }, []);

    const fetchMyJobs = async () => {
        try {
            setLoading(true);
            setError("");

            const data = await getRecruiterDashboard();

            setJobs(Array.isArray(data?.jobs) ? data.jobs : []);
        } catch (err) {
            console.log(err);

            setError(
                err?.response?.data?.detail ||
                "Failed to load your jobs"
            );
        } finally {
            setLoading(false);
        }
    };

    const handleViewResume = async (application) => {
        try {
            setUpdatingId(application.id);

            const data = await viewCandidateResume(application.id);

            toast.success(
                data?.message || "Resume opened successfully"
            );

            if (data?.resume_path) {
                const resumeUrl = data.resume_path.startsWith("http")
                    ? data.resume_path
                    : `http://127.0.0.1:8000/${data.resume_path}`;

                window.open(resumeUrl, "_blank");
            }

            fetchMyJobs();
        } catch (err) {
            console.log(err);

            toast.error(
                err?.response?.data?.detail ||
                "Candidate resume not uploaded"
            );
        } finally {
            setUpdatingId(null);
        }
    };

    const handleUpdateStatus = async (
        applicationId,
        status
    ) => {
        try {
            setUpdatingId(applicationId);

            const data = await updateApplicationStatus(
                applicationId,
                status
            );

            toast.success(
                data?.message || `Application marked as ${status}`
            );

            fetchMyJobs();
        } catch (err) {
            console.log(err);

            toast.error(
                err?.response?.data?.detail ||
                "Failed to update application status"
            );
        } finally {
            setUpdatingId(null);
        }
    };

    const getStatusClass = (status) => {
        if (status === "Shortlisted") {
            return "bg-green-100 text-green-700";
        }

        if (status === "Rejected") {
            return "bg-red-100 text-red-700";
        }

        return "bg-yellow-100 text-yellow-700";
    };

    return (
        <section className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 px-4 py-10">
            <div className="mx-auto max-w-6xl">
                <div className="mb-8 rounded-3xl bg-white p-8 shadow-xl shadow-blue-100">
                    <h1 className="text-3xl font-bold text-slate-900">
                        My Posted Jobs
                    </h1>

                    <p className="mt-3 text-slate-600">
                        View your posted jobs, applied candidates, resume review,
                        shortlist and rejection updates.
                    </p>
                </div>

                {loading && (
                    <div className="flex justify-center py-20">
                        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
                    </div>
                )}

                {error && (
                    <div className="rounded-2xl bg-red-50 p-4 text-red-700">
                        {error}
                    </div>
                )}

                {!loading && !error && jobs.length === 0 && (
                    <div className="rounded-3xl bg-white p-10 text-center shadow-lg">
                        <p className="text-5xl">💼</p>

                        <h2 className="mt-4 text-2xl font-bold text-slate-900">
                            No jobs posted yet
                        </h2>

                        <p className="mt-2 text-slate-600">
                            Create your first job post to receive applications.
                        </p>

                        <Link
                            to="/recruiter/create-job"
                            className="mt-6 inline-block rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
                        >
                            Post New Job
                        </Link>
                    </div>
                )}

                {!loading && !error && jobs.length > 0 && (
                    <div className="space-y-8">
                        {jobs.map((job) => (
                            <div
                                key={job.id}
                                className="rounded-3xl bg-white p-6 shadow-lg shadow-slate-200"
                            >
                                <div className="flex flex-col gap-4 border-b border-slate-100 pb-5 md:flex-row md:items-start md:justify-between">
                                    <div>
                                        <h2 className="text-2xl font-bold text-slate-900">
                                            {job.title}
                                        </h2>

                                        <p className="mt-2 text-slate-600">
                                            {job.company_name}
                                        </p>

                                        <div className="mt-3 flex flex-wrap gap-3 text-sm">
                                            <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">
                                                📍 {job.location || "Remote"}
                                            </span>

                                            <span className="rounded-full bg-green-100 px-3 py-1 font-semibold text-green-700">
                                                💰 {job.salary || "Not Disclosed"}
                                            </span>

                                            <span className="rounded-full bg-blue-100 px-3 py-1 font-semibold text-blue-700">
                                                👥 {job.applications_count || 0} Applications
                                            </span>
                                        </div>
                                    </div>

                                    <Link
                                        to={`/jobs/${job.id}`}
                                        className="rounded-xl border border-slate-300 px-4 py-2 text-center font-semibold text-slate-700 hover:bg-slate-100"
                                    >
                                        View Job
                                    </Link>
                                </div>

                                <p className="mt-5 line-clamp-3 text-slate-600">
                                    {job.description}
                                </p>

                                <div className="mt-6">
                                    <h3 className="text-xl font-bold text-slate-900">
                                        Applied Candidates
                                    </h3>

                                    {job.applications && job.applications.length > 0 ? (
                                        <div className="mt-4 space-y-4">
                                            {job.applications.map((application) => (
                                                <div
                                                    key={application.id}
                                                    className="rounded-2xl border border-slate-100 bg-slate-50 p-5"
                                                >
                                                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                                                        <div>
                                                            <h4 className="text-lg font-bold text-slate-900">
                                                                {application.candidate?.name || "Candidate"}
                                                            </h4>

                                                            <p className="mt-1 text-sm text-slate-500">
                                                                {application.candidate?.email || "No email"}
                                                            </p>

                                                            <div className="mt-3 flex flex-wrap gap-2">
                                                                <span
                                                                    className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(application.status)}`}
                                                                >
                                                                    {application.status || "Pending"}
                                                                </span>

                                                                <span
                                                                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                                                        application.resume_viewed
                                                                            ? "bg-green-100 text-green-700"
                                                                            : "bg-slate-100 text-slate-600"
                                                                    }`}
                                                                >
                                                                    {application.resume_viewed
                                                                        ? "Resume Viewed"
                                                                        : "Resume Not Viewed"}
                                                                </span>
                                                            </div>

                                                            <div className="mt-4 rounded-xl bg-white p-4 text-sm text-slate-600">
                                                                <p>
                                                                    <span className="font-semibold text-slate-800">
                                                                        Skills:
                                                                    </span>{" "}
                                                                    {application.profile?.skills || "Not added"}
                                                                </p>

                                                                <p className="mt-1">
                                                                    <span className="font-semibold text-slate-800">
                                                                        Experience:
                                                                    </span>{" "}
                                                                    {application.profile?.experience || "Not added"}
                                                                </p>

                                                                <p className="mt-1">
                                                                    <span className="font-semibold text-slate-800">
                                                                        Education:
                                                                    </span>{" "}
                                                                    {application.profile?.education || "Not added"}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        <div className="flex flex-wrap gap-3 md:justify-end">
                                                            <button
                                                                type="button"
                                                                onClick={() => handleViewResume(application)}
                                                                disabled={updatingId === application.id}
                                                                className="rounded-xl bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                                                            >
                                                                {updatingId === application.id
                                                                    ? "Please wait..."
                                                                    : "View Resume"}
                                                            </button>

                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    handleUpdateStatus(
                                                                        application.id,
                                                                        "Shortlisted"
                                                                    )
                                                                }
                                                                disabled={updatingId === application.id}
                                                                className="rounded-xl bg-green-600 px-4 py-2 font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
                                                            >
                                                                Shortlist ✅
                                                            </button>

                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    handleUpdateStatus(
                                                                        application.id,
                                                                        "Rejected"
                                                                    )
                                                                }
                                                                disabled={updatingId === application.id}
                                                                className="rounded-xl bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                                                            >
                                                                Reject ❌
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
                                            <p className="font-semibold text-slate-700">
                                                No candidates applied yet.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}

export default MyJobs;