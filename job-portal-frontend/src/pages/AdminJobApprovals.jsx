import {
    useEffect,
    useMemo,
    useState,
} from "react";

import toast from "react-hot-toast";

import {
    approveJobAdmin,
    getAllJobsAdmin,
    rejectJobAdmin,
} from "../api/adminApi";

import ConfirmModal from "../components/common/ConfirmModal";
import JobStatusBadge from "../components/jobs/JobStatusBadge";
import { normalizeJobStatus } from "../utils/jobStatus";

const formatDate = (value) => {
    if (!value) {
        return "Not available";
    }

    return new Intl.DateTimeFormat("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(new Date(value));
};

function AdminJobApprovals() {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");
    const [selectedJob, setSelectedJob] = useState(null);
    const [action, setAction] = useState("");
    const [rejectionReason, setRejectionReason] = useState("");
    const [saving, setSaving] = useState(false);

    const fetchJobs = async () => {
        try {
            setLoading(true);
            setErrorMessage("");

            const data = await getAllJobsAdmin();

            setJobs(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error(error);

            const message =
                error.response?.data?.detail ||
                "Failed to load jobs for approval";

            setErrorMessage(message);
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timerId = window.setTimeout(fetchJobs, 0);

        return () => window.clearTimeout(timerId);
    }, []);

    const stats = useMemo(() => {
        return jobs.reduce(
            (summary, job) => {
                const status = normalizeJobStatus(job.status);

                summary.total += 1;
                summary[status] += 1;

                return summary;
            },
            {
                total: 0,
                pending: 0,
                approved: 0,
                rejected: 0,
            }
        );
    }, [jobs]);

    const openModal = (job, nextAction) => {
        setSelectedJob(job);
        setAction(nextAction);
        setRejectionReason("");
    };

    const closeModal = () => {
        if (saving) return;

        setSelectedJob(null);
        setAction("");
        setRejectionReason("");
    };

    const handleConfirm = async () => {
        if (!selectedJob || !action) return;

        if (action === "reject" && !rejectionReason.trim()) {
            toast.error("Please add a rejection reason");
            return;
        }

        try {
            setSaving(true);

            const updatedJob =
                action === "approve"
                    ? await approveJobAdmin(selectedJob.id)
                    : await rejectJobAdmin(
                        selectedJob.id,
                        rejectionReason.trim()
                    );

            setJobs((previousJobs) =>
                previousJobs.map((job) =>
                    job.id === selectedJob.id
                        ? {
                            ...job,
                            ...updatedJob,
                        }
                        : job
                )
            );

            toast.success(
                action === "approve"
                    ? "Job approved successfully"
                    : "Job rejected successfully"
            );

            closeModal();
        } catch (error) {
            console.error(error);

            const message =
                error.response?.data?.detail ||
                "Failed to update job status";

            toast.error(message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <section className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 sm:py-10">
            <div className="mx-auto max-w-7xl">
                <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <p className="text-sm font-bold uppercase text-blue-700">
                            Approval Management
                        </p>

                        <h1 className="mt-2 text-2xl font-extrabold text-slate-950 sm:text-3xl md:text-4xl">
                            Job Approval Queue
                        </h1>

                        <p className="mt-3 max-w-2xl text-sm text-slate-600 sm:text-base">
                            Review recruiter job posts before candidates can discover or apply to them.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={fetchJobs}
                        className="w-full rounded-xl border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-700 shadow-sm transition hover:bg-slate-100 lg:w-auto"
                    >
                        Refresh
                    </button>
                </div>

                <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {[
                        ["Total Jobs", stats.total, "bg-white text-slate-900"],
                        ["Pending", stats.pending, "bg-yellow-50 text-yellow-700"],
                        ["Approved", stats.approved, "bg-green-50 text-green-700"],
                        ["Rejected", stats.rejected, "bg-red-50 text-red-700"],
                    ].map(([label, value, className], index) => (
                        <div
                            key={label}
                            className={`rounded-2xl border border-slate-200 p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-md ${className}`}
                        >
                            <p className="text-sm font-bold">
                                {label}
                            </p>

                            <p className="mt-3 text-3xl font-extrabold">
                                {value}
                            </p>
                        </div>
                    ))}
                </div>

                {errorMessage && (
                    <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 font-semibold text-red-700">
                        {errorMessage}
                    </div>
                )}

                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    {loading ? (
                        <div className="space-y-3 p-6">
                            {[1, 2, 3, 4, 5].map((item) => (
                                <div
                                    key={item}
                                    className="h-16 animate-pulse rounded-xl bg-slate-100"
                                ></div>
                            ))}
                        </div>
                    ) : jobs.length === 0 ? (
                        <div className="px-6 py-16 text-center">
                            <h2 className="text-2xl font-bold text-slate-900">
                                No jobs to review
                            </h2>

                            <p className="mt-2 text-slate-500">
                                New recruiter submissions will appear here.
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-200">
                                <thead className="bg-slate-50">
                                    <tr>
                                        {[
                                            "Job Title",
                                            "Company",
                                            "Recruiter",
                                            "Created Date",
                                            "Status",
                                            "Actions",
                                        ].map((heading) => (
                                            <th
                                                key={heading}
                                                scope="col"
                                                className="px-5 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-500"
                                            >
                                                {heading}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-slate-100">
                                    {jobs.map((job) => (
                                        <tr
                                            key={job.id}
                                            className="transition hover:bg-blue-50/40"
                                        >
                                            <td className="max-w-xs px-5 py-4">
                                                <p className="font-bold text-slate-900">
                                                    {job.title}
                                                </p>

                                                <p className="mt-1 line-clamp-2 text-sm text-slate-500">
                                                    {job.description}
                                                </p>
                                            </td>

                                            <td className="px-5 py-4 text-sm text-slate-700">
                                                {job.company_name}
                                            </td>

                                            <td className="px-5 py-4 text-sm text-slate-700">
                                                <p className="font-semibold">
                                                    {job.recruiter?.name || "Recruiter"}
                                                </p>

                                                <p className="text-slate-500">
                                                    {job.recruiter?.email || "No email"}
                                                </p>
                                            </td>

                                            <td className="px-5 py-4 text-sm text-slate-600">
                                                {formatDate(job.created_at)}
                                            </td>

                                            <td className="px-5 py-4">
                                                <div className="space-y-2">
                                                    <JobStatusBadge status={job.status} />

                                                    {normalizeJobStatus(job.status) === "rejected" && job.rejection_reason && (
                                                        <p className="max-w-xs text-xs leading-5 text-red-600">
                                                            {job.rejection_reason}
                                                        </p>
                                                    )}
                                                </div>
                                            </td>

                                            <td className="px-5 py-4">
                                                <div className="flex flex-wrap gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => openModal(job, "approve")}
                                                        disabled={normalizeJobStatus(job.status) === "approved"}
                                                        className="rounded-lg bg-green-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-green-100 disabled:text-green-700"
                                                    >
                                                        Approve
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() => openModal(job, "reject")}
                                                        disabled={normalizeJobStatus(job.status) === "rejected"}
                                                        className="rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-100 disabled:text-red-700"
                                                    >
                                                        Reject
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            <ConfirmModal
                open={Boolean(selectedJob)}
                title={
                    action === "approve"
                        ? "Approve this job?"
                        : "Reject this job?"
                }
                description={
                    selectedJob
                        ? `${selectedJob.title} at ${selectedJob.company_name}`
                        : ""
                }
                confirmLabel={
                    action === "approve"
                        ? "Approve Job"
                        : "Reject Job"
                }
                confirmClassName={
                    action === "approve"
                        ? "bg-green-600 hover:bg-green-700"
                        : "bg-red-600 hover:bg-red-700"
                }
                loading={saving}
                onCancel={closeModal}
                onConfirm={handleConfirm}
            >
                {action === "reject" && (
                    <label className="block">
                        <span className="text-sm font-bold text-slate-700">
                            Rejection reason
                        </span>

                        <textarea
                            value={rejectionReason}
                            onChange={(event) => setRejectionReason(event.target.value)}
                            rows="4"
                            className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
                            placeholder="Explain what the recruiter should fix before resubmitting."
                        ></textarea>
                    </label>
                )}
            </ConfirmModal>
        </section>
    );
}

export default AdminJobApprovals;
