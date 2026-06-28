import { useEffect, useState } from "react";

import { Link } from "react-router-dom";

import toast from "react-hot-toast";

import {
    getMyDeletedRecruiterJobs,
    restoreJob,
} from "../../api/jobApi";

import JobStatusBadge from "../../components/jobs/JobStatusBadge";

function DeletedJobs() {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");
    const [restoreCandidate, setRestoreCandidate] = useState(null);
    const [restoringJobId, setRestoringJobId] = useState(null);

    const fetchDeletedJobs = async () => {
        try {
            setLoading(true);
            setErrorMessage("");

            const data = await getMyDeletedRecruiterJobs();
            setJobs(Array.isArray(data) ? data : []);
        } catch (error) {
            const message =
                error.response?.data?.detail ||
                "Failed to load deleted jobs";

            setErrorMessage(message);
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timerId = window.setTimeout(fetchDeletedJobs, 0);

        return () => window.clearTimeout(timerId);
    }, []);

    const closeRestoreModal = () => {
        if (restoringJobId) return;
        setRestoreCandidate(null);
    };

    const handleRestoreJob = async () => {
        if (!restoreCandidate?.id) return;

        try {
            setRestoringJobId(restoreCandidate.id);

            const restoredJob = await restoreJob(restoreCandidate.id);

            setJobs((previousJobs) =>
                previousJobs.filter((job) => job.id !== restoreCandidate.id)
            );
            setRestoreCandidate(null);

            toast.success(
                restoredJob?.title
                    ? `${restoredJob.title} restored successfully`
                    : "Job restored successfully"
            );
        } catch (error) {
            toast.error(
                error.response?.data?.detail ||
                "Failed to restore job"
            );
        } finally {
            setRestoringJobId(null);
        }
    };

    return (
        <section className="min-h-screen bg-gradient-to-br from-red-50 via-white to-blue-50 px-4 py-8 sm:px-6 sm:py-10">
            <div className="mx-auto max-w-6xl">
                <div className="mb-8 rounded-3xl bg-white p-5 shadow-xl shadow-red-100 sm:p-8">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <span className="inline-flex rounded-full bg-red-50 px-4 py-2 text-sm font-bold text-red-700">
                                Recovery Center
                            </span>

                            <h1 className="mt-4 text-2xl font-bold text-slate-900 sm:text-3xl">
                                Deleted Jobs
                            </h1>

                            <p className="mt-3 max-w-2xl text-sm text-slate-600 sm:text-base">
                                Restore accidentally deleted jobs. Restored jobs return to your My Jobs list with the same approval status.
                            </p>
                        </div>

                        <Link
                            to="/recruiter/my-jobs"
                            className="w-full rounded-2xl bg-blue-600 px-5 py-3 text-center font-bold text-white transition duration-300 hover:-translate-y-1 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-100 md:w-auto"
                        >
                            Back to My Jobs
                        </Link>
                    </div>
                </div>

                {loading && (
                    <div className="grid gap-5 md:grid-cols-2">
                        {[1, 2, 3, 4].map((item) => (
                            <div
                                key={item}
                                className="h-52 animate-pulse rounded-3xl bg-white shadow-sm"
                            />
                        ))}
                    </div>
                )}

                {!loading && errorMessage && (
                    <div className="rounded-2xl border border-red-100 bg-red-50 p-5 font-semibold text-red-700">
                        {errorMessage}
                    </div>
                )}

                {!loading && !errorMessage && jobs.length === 0 && (
                    <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-6 text-center shadow-sm sm:p-10">
                        <div className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-green-50 text-2xl font-black text-green-700">
                            OK
                        </div>

                        <h2 className="mt-5 text-2xl font-bold text-slate-900">
                            No deleted jobs
                        </h2>

                        <p className="mt-2 text-slate-500">
                            Deleted jobs will appear here for recovery.
                        </p>
                    </div>
                )}

                {!loading && !errorMessage && jobs.length > 0 && (
                    <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
                        {jobs.map((job) => (
                            <div
                                key={job.id}
                                className="group rounded-3xl bg-white p-5 shadow-lg shadow-slate-200 transition duration-300 hover:-translate-y-1 hover:shadow-xl sm:p-6"
                            >
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                    <div>
                                        <div className="flex flex-wrap items-center gap-3">
                                            <h2 className="break-words text-xl font-bold text-slate-900 sm:text-2xl">
                                                {job.title}
                                            </h2>

                                            <JobStatusBadge status={job.status} />
                                        </div>

                                        <p className="mt-2 text-slate-600">
                                            {job.company_name}
                                        </p>

                                        <div className="mt-4 flex flex-wrap gap-2 text-sm">
                                            <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">
                                                {job.location || "Remote"}
                                            </span>

                                            <span className="rounded-full bg-green-100 px-3 py-1 font-semibold text-green-700">
                                                {job.salary || "Not Disclosed"}
                                            </span>
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => setRestoreCandidate(job)}
                                        className="w-full rounded-2xl bg-green-50 px-5 py-3 font-bold text-green-700 transition duration-300 hover:-translate-y-1 hover:bg-green-600 hover:text-white hover:shadow-lg hover:shadow-green-100 sm:w-auto"
                                    >
                                        Restore Job
                                    </button>
                                </div>

                                {Array.isArray(job.skills) && job.skills.length > 0 && (
                                    <div className="mt-4 flex flex-wrap gap-2">
                                        {job.skills.map((skill) => (
                                            <span
                                                key={skill}
                                                className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700"
                                            >
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                <p className="mt-5 line-clamp-3 text-slate-600">
                                    {job.description}
                                </p>

                                <p className="mt-5 text-sm font-semibold text-red-600 opacity-0 transition duration-300 group-hover:translate-x-1 group-hover:opacity-100">
                                    Restore to show this job again in My Jobs.
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {restoreCandidate && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4">
                    <div className="w-full max-w-md rounded-3xl bg-white p-5 shadow-2xl sm:p-6">
                        <div className="grid h-14 w-14 place-items-center rounded-2xl bg-green-50 text-xl font-black text-green-700">
                            R
                        </div>

                        <h2 className="mt-5 text-2xl font-bold text-slate-900">
                            Restore this job?
                        </h2>

                        <p className="mt-3 text-slate-600">
                            The job will move back to My Jobs and keep its current approval status.
                        </p>

                        <div className="mt-6 rounded-2xl bg-slate-50 p-4">
                            <p className="font-bold text-slate-900">
                                {restoreCandidate.title}
                            </p>
                            <p className="mt-1 text-sm text-slate-500">
                                {restoreCandidate.company_name} • {restoreCandidate.location}
                            </p>
                        </div>

                        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                            <button
                                type="button"
                                onClick={closeRestoreModal}
                                disabled={restoringJobId === restoreCandidate.id}
                            className="w-full rounded-xl border border-slate-300 px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-60 sm:w-auto"
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                onClick={handleRestoreJob}
                                disabled={restoringJobId === restoreCandidate.id}
                                className="w-full rounded-xl bg-green-600 px-5 py-3 font-semibold text-white transition hover:bg-green-700 disabled:opacity-60 sm:w-auto"
                            >
                                {restoringJobId === restoreCandidate.id
                                    ? "Restoring..."
                                    : "Restore Job"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}

export default DeletedJobs;
