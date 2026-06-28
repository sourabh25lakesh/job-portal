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
    deleteJob,
    updateJob,
} from "../../api/jobApi";

import {
    viewCandidateResume,
    updateApplicationStatus,
} from "../../api/applicationApi";

import {
    getApplicationStatusClass,
    getApplicationStatusLabel,
    normalizeApplicationStatus,
} from "../../utils/applicationStatus";

import JobStatusBadge from "../../components/jobs/JobStatusBadge";
import {
    getJobStatusLabel,
    normalizeJobStatus,
} from "../../utils/jobStatus";

function MyJobs() {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [updatingId, setUpdatingId] = useState(null);
    const [editingJob, setEditingJob] = useState(null);
    const [editSkillInput, setEditSkillInput] = useState("");
    const [savingJob, setSavingJob] = useState(false);
    const [deleteCandidate, setDeleteCandidate] = useState(null);
    const [deletingJobId, setDeletingJobId] = useState(null);

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

    useEffect(() => {
        const timerId = window.setTimeout(fetchMyJobs, 0);

        return () => window.clearTimeout(timerId);
    }, []);

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

    const mergeApplicationIntoJobs = (updatedApplication) => {
        if (!updatedApplication?.id) {
            return;
        }

        setJobs((previousJobs) =>
            previousJobs.map((job) => ({
                ...job,
                applications: Array.isArray(job.applications)
                    ? job.applications.map((application) =>
                        String(application.id) === String(updatedApplication.id)
                            ? {
                                ...application,
                                ...updatedApplication,
                            }
                            : application
                    )
                    : job.applications,
            }))
        );
    };

    const handleViewResume = async (application) => {
        try {
            setUpdatingId(application.id);

            const data = await viewCandidateResume(application.id);
            mergeApplicationIntoJobs(data?.application);

            broadcastApplicationUpdate("applicationResumeViewed", {
                applicationId: application.id,
                application: data?.application,
                resume_viewed: true,
            });

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
                normalizeApplicationStatus(status)
            );
            const updatedApplication = data?.application;
            const normalizedStatus = normalizeApplicationStatus(status);

            if (normalizeApplicationStatus(updatedApplication?.status) !== normalizedStatus) {
                throw new Error("Status was not saved by the backend");
            }

            mergeApplicationIntoJobs(updatedApplication);

            broadcastApplicationUpdate("applicationStatusUpdated", {
                applicationId,
                application: updatedApplication,
                status: normalizedStatus,
            });

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

    const openEditJob = (job) => {
        setEditingJob({
            id: job.id,
            title: job.title || "",
            company_name: job.company_name || "",
            location: job.location || "",
            salary: job.salary || "",
            description: job.description || "",
            skills: Array.isArray(job.skills) ? job.skills : [],
        });
        setEditSkillInput("");
    };

    const closeEditJob = () => {
        if (savingJob) return;
        setEditingJob(null);
        setEditSkillInput("");
    };

    const handleEditChange = (event) => {
        setEditingJob({
            ...editingJob,
            [event.target.name]: event.target.value,
        });
    };

    const addEditSkill = () => {
        const skill = editSkillInput.trim();

        if (!skill || !editingJob) return;

        const exists = editingJob.skills.some(
            (item) => item.toLowerCase() === skill.toLowerCase()
        );

        if (!exists) {
            setEditingJob({
                ...editingJob,
                skills: [...editingJob.skills, skill],
            });
        }

        setEditSkillInput("");
    };

    const removeEditSkill = (skill) => {
        setEditingJob({
            ...editingJob,
            skills: editingJob.skills.filter((item) => item !== skill),
        });
    };

    const handleEditSkillKeyDown = (event) => {
        if (event.key === "Enter" || event.key === ",") {
            event.preventDefault();
            addEditSkill();
        }
    };

    const handleSaveJob = async () => {
        if (!editingJob) return;

        try {
            setSavingJob(true);

            await updateJob(editingJob.id, {
                title: editingJob.title,
                company_name: editingJob.company_name,
                location: editingJob.location,
                salary: editingJob.salary,
                description: editingJob.description,
                skills: editingJob.skills,
            });

            toast.success("Job updated successfully");
            closeEditJob();
            fetchMyJobs();
        } catch (error) {
            toast.error(
                error.response?.data?.detail ||
                "Failed to update job"
            );
        } finally {
            setSavingJob(false);
        }
    };

    const openDeleteJob = (job) => {
        setDeleteCandidate(job);
    };

    const closeDeleteJob = () => {
        if (deletingJobId) return;
        setDeleteCandidate(null);
    };

    const handleDeleteJob = async () => {
        if (!deleteCandidate?.id) return;

        try {
            setDeletingJobId(deleteCandidate.id);

            const response = await deleteJob(deleteCandidate.id);

            setJobs((previousJobs) =>
                previousJobs.filter((job) => job.id !== deleteCandidate.id)
            );

            toast.success(
                response?.message || "Job moved to deleted jobs"
            );
            setDeleteCandidate(null);
        } catch (error) {
            toast.error(
                error.response?.data?.detail ||
                "Failed to delete job"
            );
        } finally {
            setDeletingJobId(null);
        }
    };

    return (
        <section className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 px-4 py-8 sm:px-6 sm:py-10">
            <div className="mx-auto max-w-6xl">
                <div className="mb-8 rounded-3xl bg-white p-5 shadow-xl shadow-blue-100 sm:p-8">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
                                My Posted Jobs
                            </h1>

                            <p className="mt-3 text-sm text-slate-600 sm:text-base">
                                View your posted jobs, applied candidates, resume review,
                                shortlist and rejection updates.
                            </p>
                        </div>

                        <Link
                            to="/recruiter/deleted-jobs"
                            className="w-full rounded-2xl border border-red-100 bg-red-50 px-5 py-3 text-center font-bold text-red-700 transition duration-300 hover:-translate-y-1 hover:bg-red-600 hover:text-white hover:shadow-lg hover:shadow-red-100 md:w-auto"
                        >
                            Deleted Jobs
                        </Link>
                    </div>
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
                        <div className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-blue-50 text-xl font-black text-blue-700">
                            JB
                        </div>

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
                                className="rounded-3xl bg-white p-5 shadow-lg shadow-slate-200 transition duration-300 hover:-translate-y-1 hover:shadow-xl sm:p-6"
                            >
                                {(() => {
                                    const jobStatus = normalizeJobStatus(job.status);
                                    const statusDescription =
                                        jobStatus === "approved"
                                            ? "Visible to candidates"
                                            : jobStatus === "rejected"
                                                ? "Not visible to candidates"
                                                : "Waiting for admin approval";

                                    return (
                                <div className="flex flex-col gap-4 border-b border-slate-100 pb-5 md:flex-row md:items-start md:justify-between">
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

                                        <p className="mt-1 text-sm font-medium text-slate-500">
                                            {statusDescription}
                                        </p>

                                        {jobStatus === "rejected" && job.rejection_reason && (
                                            <div className="mt-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                                                <span className="font-bold">
                                                    Rejection reason:
                                                </span>{" "}
                                                {job.rejection_reason}
                                            </div>
                                        )}

                                        <div className="mt-3 flex flex-wrap gap-3 text-sm">
                                            <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">
                                                Location: {job.location || "Remote"}
                                            </span>

                                            <span className="rounded-full bg-green-100 px-3 py-1 font-semibold text-green-700">
                                                Salary: {job.salary || "Not Disclosed"}
                                            </span>

                                            <span className="rounded-full bg-blue-100 px-3 py-1 font-semibold text-blue-700">
                                                {job.applications_count || 0} Applications
                                            </span>
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
                                    </div>

                                    <div className="flex w-full flex-col gap-3 sm:flex-row sm:flex-wrap md:w-auto md:justify-end">
                                        <button
                                            type="button"
                                            onClick={() => openEditJob(job)}
                                            className="rounded-xl bg-blue-600 px-4 py-2 text-center font-semibold text-white transition hover:bg-blue-700"
                                        >
                                            Edit Job
                                        </button>

                                        {jobStatus === "approved" ? (
                                            <Link
                                                to={`/jobs/${job.id}`}
                                                className="rounded-xl border border-slate-300 px-4 py-2 text-center font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-slate-900"
                                            >
                                                View Public Job
                                            </Link>
                                        ) : (
                                            <span className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-center font-semibold text-slate-500">
                                                {getJobStatusLabel(job.status)}
                                            </span>
                                        )}

                                        <button
                                            type="button"
                                            onClick={() => openDeleteJob(job)}
                                            className="rounded-xl bg-red-50 px-4 py-2 text-center font-semibold text-red-600 transition hover:bg-red-600 hover:text-white"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                                    );
                                })()}

                                <p className="mt-5 line-clamp-3 text-slate-600">
                                    {job.description}
                                </p>

                                <div className="mt-6">
                                    <h3 className="text-lg font-bold text-slate-900 sm:text-xl">
                                        Applied Candidates
                                    </h3>

                                    {job.applications && job.applications.length > 0 ? (
                                        <div className="mt-4 space-y-4">
                                            {job.applications.map((application) => (
                                                <div
                                                    key={application.id}
                                                    className="rounded-2xl border border-slate-100 bg-slate-50 p-4 sm:p-5"
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
                                                                    className={`rounded-full px-3 py-1 text-xs font-semibold ${getApplicationStatusClass(application.status)}`}
                                                                >
                                                                    {getApplicationStatusLabel(application.status)}
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

                                                        <div className="flex w-full flex-col gap-3 sm:flex-row sm:flex-wrap md:w-auto md:justify-end">
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
                                                                        "shortlisted"
                                                                    )
                                                                }
                                                                disabled={updatingId === application.id}
                                                                className="rounded-xl bg-green-600 px-4 py-2 font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
                                                            >
                                                                Shortlist
                                                            </button>

                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    handleUpdateStatus(
                                                                        application.id,
                                                                        "rejected"
                                                                    )
                                                                }
                                                                disabled={updatingId === application.id}
                                                                className="rounded-xl bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                                                            >
                                                                Reject
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

            {editingJob && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4 py-8">
                    <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-5 shadow-2xl sm:p-6">
                        <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">
                            Edit Job
                        </h2>
                        <p className="mt-2 text-sm text-slate-500">
                            Update your job details directly. Current approval status stays unchanged.
                        </p>

                        <div className="mt-6 space-y-4">
                            {[
                                ["title", "Job Title"],
                                ["company_name", "Company Name"],
                                ["location", "Location"],
                                ["salary", "Salary"],
                            ].map(([name, label]) => (
                                <label key={name} className="block">
                                    <span className="text-sm font-bold text-slate-700">
                                        {label}
                                    </span>
                                    <input
                                        name={name}
                                        value={editingJob[name]}
                                        onChange={handleEditChange}
                                        className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                                    />
                                </label>
                            ))}

                            <label className="block">
                                <span className="text-sm font-bold text-slate-700">
                                    Description
                                </span>
                                <textarea
                                    name="description"
                                    value={editingJob.description}
                                    onChange={handleEditChange}
                                    rows="5"
                                    className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                                ></textarea>
                            </label>

                            <div className="rounded-2xl border border-slate-200 p-4">
                                <span className="text-sm font-bold text-slate-700">
                                    Skills
                                </span>
                                <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                                    <input
                                        value={editSkillInput}
                                        onChange={(event) => setEditSkillInput(event.target.value)}
                                        onKeyDown={handleEditSkillKeyDown}
                                        placeholder="Add skill"
                                        className="w-full flex-1 rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                                    />
                                    <button
                                        type="button"
                                        onClick={addEditSkill}
                                        className="w-full rounded-xl bg-slate-900 px-5 py-3 font-bold text-white hover:bg-slate-700 sm:w-auto"
                                    >
                                        Add
                                    </button>
                                </div>

                                <div className="mt-4 flex flex-wrap gap-2">
                                    {editingJob.skills.length > 0 ? (
                                        editingJob.skills.map((skill) => (
                                            <button
                                                key={skill}
                                                type="button"
                                                onClick={() => removeEditSkill(skill)}
                                                className="rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-red-50 hover:text-red-700"
                                            >
                                                {skill} ×
                                            </button>
                                        ))
                                    ) : (
                                        <p className="text-sm text-slate-500">
                                            No skills added yet.
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                            <button
                                type="button"
                                onClick={closeEditJob}
                                disabled={savingJob}
                                className="w-full rounded-xl border border-slate-300 px-5 py-3 font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-60 sm:w-auto"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleSaveJob}
                                disabled={savingJob}
                                className="w-full rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-60 sm:w-auto"
                            >
                                {savingJob ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {deleteCandidate && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4">
                    <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
                        <div className="grid h-14 w-14 place-items-center rounded-2xl bg-red-50 text-xl font-black text-red-600">
                            !
                        </div>

                        <h2 className="mt-5 text-2xl font-bold text-slate-900">
                            Delete this job?
                        </h2>

                        <p className="mt-3 text-slate-600">
                            This job will be hidden from candidates and moved to Deleted Jobs. You can restore it later.
                        </p>

                        <div className="mt-6 rounded-2xl bg-slate-50 p-4">
                            <p className="font-bold text-slate-900">
                                {deleteCandidate.title}
                            </p>
                            <p className="mt-1 text-sm text-slate-500">
                                {deleteCandidate.company_name} • {deleteCandidate.location}
                            </p>
                        </div>

                        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                            <button
                                type="button"
                                onClick={closeDeleteJob}
                                disabled={deletingJobId === deleteCandidate.id}
                                className="w-full rounded-xl border border-slate-300 px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-60 sm:w-auto"
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                onClick={handleDeleteJob}
                                disabled={deletingJobId === deleteCandidate.id}
                                className="w-full rounded-xl bg-red-600 px-5 py-3 font-semibold text-white transition hover:bg-red-700 disabled:opacity-60 sm:w-auto"
                            >
                                {deletingJobId === deleteCandidate.id
                                    ? "Deleting..."
                                    : "Move to Deleted Jobs"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}

export default MyJobs;
