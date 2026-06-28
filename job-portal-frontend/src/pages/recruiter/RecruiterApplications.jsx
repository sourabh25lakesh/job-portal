import {
    useEffect,
    useMemo,
    useState,
} from "react";

import { Link, useLocation } from "react-router-dom";

import { getRecruiterApplicants } from "../../api/recruiterApi";

import {
    getApplicationStatusClass,
    getApplicationStatusLabel,
} from "../../utils/applicationStatus";

function RecruiterApplications() {
    const location = useLocation();

    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);

    const pageType = useMemo(() => {
        if (location.pathname.includes("resume-review")) {
            return "resume";
        }

        if (location.pathname.includes("shortlist-reject")) {
            return "status";
        }

        return "applied";
    }, [location.pathname]);

    const pageInfo = {
        applied: {
            title: "Applied Candidates",
            description: "View all candidates who applied to your posted jobs.",
        },
        resume: {
            title: "Resume Review",
            description: "Open candidate resumes and check review status.",
        },
        status: {
            title: "Shortlist / Reject",
            description: "Shortlist or reject candidate applications.",
        },
    };

    const fetchApplications = async (quiet = false) => {
        try {
            if (!quiet) {
                setLoading(true);
            }

            const data = await getRecruiterApplicants();
            const nextApplications = Array.isArray(data) ? data : [];

            setApplications((previousApplications) => {
                if (
                    JSON.stringify(previousApplications) ===
                    JSON.stringify(nextApplications)
                ) {
                    return previousApplications;
                }

                return nextApplications;
            });
        } catch (error) {
            console.log(error);
            setApplications([]);
        } finally {
            if (!quiet) {
                setLoading(false);
            }
        }
    };

    useEffect(() => {
        fetchApplications();

        const refreshQuietly = () => fetchApplications(true);

        const handleVisibilityChange = () => {
            if (!document.hidden) {
                refreshQuietly();
            }
        };

        window.addEventListener("focus", refreshQuietly);
        document.addEventListener("visibilitychange", handleVisibilityChange);

        const refreshInterval = window.setInterval(refreshQuietly, 10000);

        return () => {
            window.removeEventListener("focus", refreshQuietly);
            document.removeEventListener("visibilitychange", handleVisibilityChange);
            window.clearInterval(refreshInterval);
        };
    }, []);

    const jobsWithApplications = useMemo(() => {
        const groupedJobs = new Map();

        applications.forEach((application) => {
            const job = application?.job;

            if (!job?.id) {
                return;
            }

            if (!groupedJobs.has(job.id)) {
                groupedJobs.set(job.id, {
                    ...job,
                    applications: [],
                    applications_count: 0,
                });
            }

            const groupedJob = groupedJobs.get(job.id);

            groupedJob.applications.push(application);
            groupedJob.applications_count = groupedJob.applications.length;
        });

        return Array.from(groupedJobs.values());
    }, [applications]);

    const getResumeUrl = (resumePath) => {
        if (!resumePath || typeof resumePath !== "string") {
            return null;
        }

        if (resumePath.startsWith("http")) {
            return resumePath;
        }

        const cleanPath = resumePath.startsWith("/")
            ? resumePath
            : `/${resumePath}`;

        return `http://127.0.0.1:8000${cleanPath}`;
    };

    if (loading) {
        return (
            <section className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50">
                <div className="h-14 w-14 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
            </section>
        );
    }

    return (
        <section className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 px-4 py-8 sm:px-6 sm:py-12">
            <div className="mx-auto max-w-6xl">

                <div className="mb-8 rounded-3xl bg-white p-5 shadow-xl shadow-blue-100 sm:p-8">
                    <Link
                        to="/recruiter/dashboard"
                        className="text-sm font-semibold text-blue-600 hover:text-blue-700"
                    >
                        Back to Dashboard
                    </Link>

                    <h1 className="mt-4 text-2xl font-bold text-slate-900 sm:text-3xl md:text-4xl">
                        {pageInfo[pageType].title}
                    </h1>

                    <p className="mt-3 text-sm text-slate-600 sm:text-base">
                        {pageInfo[pageType].description}
                    </p>
                </div>

                {jobsWithApplications.length === 0 ? (
                    <div className="rounded-3xl bg-white p-6 text-center shadow-xl shadow-slate-200 sm:p-12">
                        <div className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-blue-50 text-xl font-black text-blue-700">
                            AC
                        </div>

                        <h2 className="mt-4 text-xl font-bold text-slate-900 sm:text-2xl">
                            No applied candidates yet
                        </h2>

                        <p className="mt-2 text-slate-500">
                            When candidates apply to your jobs, they will show here.
                        </p>

                        <Link
                            to="/recruiter/my-jobs"
                            className="mt-6 inline-flex w-full justify-center rounded-2xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700 sm:w-auto"
                        >
                            Open My Jobs
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {jobsWithApplications.map((job) => (
                            <div
                                key={job.id}
                            className="rounded-3xl bg-white p-5 shadow-xl shadow-slate-200 sm:p-6"
                            >
                                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                    <div>
                                        <h2 className="break-words text-xl font-bold text-slate-900 sm:text-2xl">
                                            {job.title}
                                        </h2>

                                        <p className="mt-1 text-slate-500">
                                            {job.company_name} • {job.location}
                                        </p>
                                    </div>

                                    <Link
                                        to={`/recruiter/job-applications/${job.id}`}
                                        className="w-full rounded-2xl bg-blue-600 px-5 py-3 text-center font-semibold text-white transition hover:bg-blue-700 md:w-auto"
                                    >
                                        Manage Applications
                                    </Link>
                                </div>

                                <div className="mt-6 grid gap-4 md:grid-cols-2">
                                    {job.applications?.map((application) => {
                                        const resumeUrl = getResumeUrl(
                                            application?.profile?.resume_path
                                        );

                                        return (
                                            <div
                                                key={application.id}
                                                className="rounded-2xl border border-slate-100 bg-slate-50 p-4 sm:p-5"
                                            >
                                                <h3 className="text-lg font-bold text-slate-900">
                                                    {application.candidate?.name || "Candidate"}
                                                </h3>

                                                <p className="mt-1 text-sm text-slate-500">
                                                    {application.candidate?.email || "No email"}
                                                </p>

                                                <div className="mt-4 flex flex-wrap gap-2">
                                                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getApplicationStatusClass(application.status)}`}>
                                                        {getApplicationStatusLabel(application.status)}
                                                    </span>

                                                    <span
                                                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                                            application.resume_viewed
                                                                ? "bg-green-100 text-green-700"
                                                                : "bg-slate-200 text-slate-700"
                                                        }`}
                                                    >
                                                        {application.resume_viewed
                                                            ? "Resume Viewed"
                                                            : "Resume Not Viewed"}
                                                    </span>
                                                </div>

                                                <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                                                    <Link
                                                        to={`/recruiter/job-applications/${job.id}`}
                                                        className="rounded-xl bg-blue-600 px-4 py-2 text-center text-sm font-semibold text-white transition hover:bg-blue-700"
                                                    >
                                                        View Details
                                                    </Link>

                                                    {resumeUrl && (
                                                        <a
                                                            href={resumeUrl}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="rounded-xl bg-slate-900 px-4 py-2 text-center text-sm font-semibold text-white transition hover:bg-slate-800"
                                                        >
                                                            Open Resume
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

            </div>
        </section>
    );
}

export default RecruiterApplications;
