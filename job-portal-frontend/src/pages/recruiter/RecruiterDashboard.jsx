import {
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";

import { Link } from "react-router-dom";

import {
    getRecruiterDashboard,
    getRecruiterApplicants,
} from "../../api/recruiterApi";

import {
    getApplicationStatusClass,
    getApplicationStatusLabel,
    normalizeApplicationStatus,
} from "../../utils/applicationStatus";

function RecruiterDashboard() {
    const [dashboardData, setDashboardData] = useState(null);
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");
    const refreshIntervalRef = useRef(null);

    const getApplicationsSnapshot = (items) => {
        return JSON.stringify(
            items.map((application) => ({
                id: application.id,
                job_id: application.job_id,
                status: normalizeApplicationStatus(application.status),
                resume_viewed: Boolean(application.resume_viewed),
                updated_at: application.updated_at || null,
                candidate_id: application.candidate?.id || application.user_id || null,
                candidate_name: application.candidate?.name || "",
                resume_path: application.profile?.resume_path || "",
            }))
        );
    };

    const fetchRecruiterDashboard = async (skipLoadingState = false) => {
        try {
            if (!skipLoadingState) {
                setLoading(true);
            }

            setErrorMessage("");

            const [dashboardResponse, applicantsResponse] = await Promise.all([
                getRecruiterDashboard(),
                getRecruiterApplicants(),
            ]);

            setDashboardData(dashboardResponse || null);

            const nextApplications = Array.isArray(applicantsResponse)
                ? applicantsResponse
                : [];

            setApplications((previousApplications) =>
                getApplicationsSnapshot(previousApplications) === getApplicationsSnapshot(nextApplications)
                    ? previousApplications
                    : nextApplications
            );
        } catch (error) {
            console.log(error);

            if (!skipLoadingState) {
                setErrorMessage(
                    error.response?.data?.detail ||
                    "Failed to load recruiter dashboard"
                );

                setDashboardData(null);
                setApplications([]);
            }
        } finally {
            if (!skipLoadingState) {
                setLoading(false);
            }
        }
    };

    useEffect(() => {
        const initialLoadTimer = window.setTimeout(() => {
            fetchRecruiterDashboard();
        }, 0);

        refreshIntervalRef.current = setInterval(() => {
            fetchRecruiterDashboard(true);
        }, 10000);

        const handleWindowFocus = () => {
            fetchRecruiterDashboard(true);
        };

        const handleVisibilityChange = () => {
            if (!document.hidden) {
                fetchRecruiterDashboard(true);
            }
        };

        window.addEventListener("focus", handleWindowFocus);
        document.addEventListener("visibilitychange", handleVisibilityChange);

        return () => {
            window.clearTimeout(initialLoadTimer);

            if (refreshIntervalRef.current) {
                clearInterval(refreshIntervalRef.current);
            }

            window.removeEventListener("focus", handleWindowFocus);
            document.removeEventListener("visibilitychange", handleVisibilityChange);
        };
    }, []);

    const groupedJobs = useMemo(() => {
        const map = new Map();

        applications.forEach((application) => {
            if (!application.job) return;

            const jobId = application.job.id;

            if (!map.has(jobId)) {
                map.set(jobId, {
                    ...application.job,
                    applications: [],
                    applications_count: 0,
                });
            }

            const job = map.get(jobId);

            job.applications.push(application);
            job.applications_count = job.applications.length;
        });

        return Array.from(map.values());
    }, [applications]);

    const totalApplications = applications.length;

    const pendingApplications = applications.filter(
        (application) => normalizeApplicationStatus(application.status) === "pending"
    ).length;

    const shortlistedApplications = applications.filter(
        (application) => normalizeApplicationStatus(application.status) === "shortlisted"
    ).length;

    const rejectedApplications = applications.filter(
        (application) => normalizeApplicationStatus(application.status) === "rejected"
    ).length;

    const totalJobs = dashboardData?.total_jobs || groupedJobs.length || 0;
    const pendingJobs = dashboardData?.pending_jobs || 0;
    const approvedJobs = dashboardData?.approved_jobs || 0;
    const approvedInterviews = dashboardData?.approved_interviews || 0;
    const shortlistedCandidates =
        dashboardData?.shortlisted_candidates || shortlistedApplications;

    const cards = [
        {
            title: "Company Profile",
            description: "Add or update company details visible to candidates.",
            icon: "CP",
            bg: "bg-blue-100",
            hoverText: "group-hover:text-blue-600",
            link: "/recruiter/profile",
            count: null,
        },
        {
            title: "Post New Job",
            description: "Create professional job posts and attract candidates.",
            icon: "NJ",
            bg: "bg-indigo-100",
            hoverText: "group-hover:text-indigo-600",
            link: "/recruiter/create-job",
            count: null,
        },
        {
            title: "My Jobs",
            description: "View your posted jobs and check applied candidates.",
            icon: "MJ",
            bg: "bg-emerald-100",
            hoverText: "group-hover:text-emerald-600",
            link: "/recruiter/my-jobs",
            count: totalJobs,
        },
        {
            title: "Deleted Jobs",
            description: "Recover jobs that were accidentally deleted.",
            icon: "DJ",
            bg: "bg-red-100",
            hoverText: "group-hover:text-red-600",
            link: "/recruiter/deleted-jobs",
            count: null,
        },
        {
            title: "Applied Candidates",
            description: "View all candidates who applied to your jobs.",
            icon: "AC",
            bg: "bg-yellow-100",
            hoverText: "group-hover:text-yellow-600",
            link: "/recruiter/applied-candidates",
            count: totalApplications,
        },
        {
            title: "Resume Review",
            description: "View candidate resumes and mark resume viewed status.",
            icon: "RR",
            bg: "bg-purple-100",
            hoverText: "group-hover:text-purple-600",
            link: "/recruiter/resume-review",
            count: pendingApplications,
        },
        {
            title: "Shortlist / Reject",
            description: "Shortlist candidates or reject applications.",
            icon: "SR",
            bg: "bg-green-100",
            hoverText: "group-hover:text-green-600",
            link: "/recruiter/shortlist-reject",
            count: shortlistedApplications + rejectedApplications,
        },
    ];

    const workflow = [
        {
            step: "01",
            title: "Open My Jobs",
            description: "Check your posted jobs.",
            link: "/recruiter/my-jobs",
        },
        {
            step: "02",
            title: "View Candidates",
            description: "See applied candidates.",
            link: "/recruiter/applied-candidates",
        },
        {
            step: "03",
            title: "View Resume",
            description: "Open candidate resume.",
            link: "/recruiter/resume-review",
        },
        {
            step: "04",
            title: "Select Status",
            description: "Shortlist or reject candidates.",
            link: "/recruiter/shortlist-reject",
        },
    ];

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

                <div className="mb-8 rounded-3xl bg-white p-5 shadow-xl shadow-blue-100 sm:mb-10 sm:p-8">
                    <span className="inline-flex rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-700">
                        Recruiter Panel
                    </span>

                    <h1 className="mt-4 text-2xl font-bold text-slate-900 sm:text-3xl md:text-4xl">
                        Recruiter Dashboard
                    </h1>

                    <p className="mt-3 max-w-2xl text-sm text-slate-600 sm:text-base">
                        Manage your company profile, post jobs, view applied candidates,
                        check resumes, and shortlist or reject candidates.
                    </p>

                    {errorMessage && (
                        <div className="mt-6 rounded-2xl bg-red-50 p-4 text-sm font-semibold text-red-700">
                            {errorMessage}
                        </div>
                    )}

                    <div className="mt-6 grid grid-cols-2 gap-3 sm:mt-8 sm:gap-4 md:grid-cols-3 lg:grid-cols-6">
                        <div className="rounded-2xl bg-blue-50 p-4 transition duration-300 hover:-translate-y-1 hover:shadow-md sm:p-5">
                            <p className="text-sm font-semibold text-blue-600">
                                Total Jobs
                            </p>
                            <h2 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
                                {totalJobs}
                            </h2>
                        </div>

                        <div className="rounded-2xl bg-yellow-50 p-4 transition duration-300 hover:-translate-y-1 hover:shadow-md sm:p-5">
                            <p className="text-sm font-semibold text-yellow-700">
                                Pending Jobs
                            </p>
                            <h2 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
                                {pendingJobs}
                            </h2>
                        </div>

                        <div className="rounded-2xl bg-green-50 p-4 transition duration-300 hover:-translate-y-1 hover:shadow-md sm:p-5">
                            <p className="text-sm font-semibold text-green-700">
                                Approved Jobs
                            </p>
                            <h2 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
                                {approvedJobs}
                            </h2>
                        </div>

                        <div className="rounded-2xl bg-red-50 p-4 transition duration-300 hover:-translate-y-1 hover:shadow-md sm:p-5">
                            <p className="text-sm font-semibold text-red-700">
                                Applications
                            </p>
                            <h2 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
                                {totalApplications}
                            </h2>
                        </div>

                        <div className="rounded-2xl bg-purple-50 p-4 transition duration-300 hover:-translate-y-1 hover:shadow-md sm:p-5">
                            <p className="text-sm font-semibold text-purple-700">
                                Shortlisted
                            </p>
                            <h2 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
                                {shortlistedCandidates}
                            </h2>
                        </div>

                        <div className="rounded-2xl bg-emerald-50 p-4 transition duration-300 hover:-translate-y-1 hover:shadow-md sm:p-5">
                            <p className="text-sm font-semibold text-emerald-700">
                                Interviews
                            </p>
                            <h2 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
                                {approvedInterviews}
                            </h2>
                        </div>
                    </div>
                </div>

                <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {cards.map((card) => (
                        <Link
                            key={card.title}
                            to={card.link}
                            className="group relative overflow-hidden rounded-3xl bg-white p-5 shadow-lg shadow-slate-200 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl sm:p-8"
                        >
                            <div className="absolute right-0 top-0 h-24 w-24 rounded-bl-full bg-slate-50 transition-all duration-300 group-hover:scale-125"></div>

                            {card.count !== null && (
                                <span className="absolute right-5 top-5 rounded-full bg-blue-600 px-3 py-1 text-sm font-bold text-white">
                                    {card.count}
                                </span>
                            )}

                            <div
                                className={`relative mb-5 flex h-12 w-12 items-center justify-center rounded-2xl ${card.bg} text-sm font-black transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 sm:h-14 sm:w-14`}
                            >
                                {card.icon}
                            </div>

                            <h2
                                className={`relative text-xl font-bold text-slate-900 transition-colors duration-300 sm:text-2xl ${card.hoverText}`}
                            >
                                {card.title}
                            </h2>

                            <p className="relative mt-3 text-sm text-slate-600 sm:text-base">
                                {card.description}
                            </p>

                            <p className="relative mt-5 text-sm font-semibold text-blue-600 opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100">
                                Click to continue
                            </p>
                        </Link>
                    ))}
                </div>

                <div className="mt-8 rounded-3xl bg-white p-5 shadow-xl shadow-slate-200 sm:mt-10 sm:p-8">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <h3 className="text-xl font-bold text-slate-900 sm:text-2xl">
                                Latest Applications
                            </h3>

                            <p className="mt-2 text-sm text-slate-600 sm:text-base">
                                Candidate applications from your posted jobs.
                            </p>
                        </div>

                        <Link
                            to="/recruiter/applied-candidates"
                            className="w-full rounded-2xl bg-blue-600 px-6 py-3 text-center font-semibold text-white transition hover:bg-blue-700 md:w-auto"
                        >
                            View Applied Candidates
                        </Link>
                    </div>

                    <div className="mt-6 space-y-4">
                        {groupedJobs.length > 0 ? (
                            groupedJobs.map((job) => (
                                <div
                                    key={job.id}
                                    className="rounded-2xl border border-slate-100 bg-slate-50 p-4 sm:p-5"
                                >
                                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                                        <div>
                                            <h4 className="text-lg font-bold text-slate-900">
                                                {job.title}
                                            </h4>

                                            <p className="text-sm text-slate-500">
                                                {job.company_name} • {job.location}
                                            </p>

                                            {Array.isArray(job.skills) && job.skills.length > 0 && (
                                                <div className="mt-3 flex flex-wrap gap-2">
                                                    {job.skills.slice(0, 5).map((skill) => (
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

                                        <Link
                                            to={`/recruiter/job-applications/${job.id}`}
                                            className="w-full rounded-full bg-blue-600 px-4 py-2 text-center text-sm font-semibold text-white transition hover:bg-blue-700 md:w-auto"
                                        >
                                            View {job.applications_count} Applications
                                        </Link>
                                    </div>

                                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                                        {job.applications.slice(0, 4).map((application) => (
                                            <div
                                                key={application.id}
                                                className="rounded-xl bg-white p-4 shadow-sm"
                                            >
                                                <p className="font-bold text-slate-900">
                                                    {application.candidate?.name || "Candidate"}
                                                </p>

                                                <p className="text-sm text-slate-500">
                                                    {application.candidate?.email || "No email"}
                                                </p>

                                                <p className="mt-2 text-sm text-slate-600">
                                                    Skills: {application.profile?.skills || "Not added"}
                                                </p>

                                                <div className="mt-3 flex flex-wrap gap-2">
                                                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getApplicationStatusClass(application.status)}`}>
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
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                                <h4 className="text-xl font-bold text-slate-900">
                                    No applications yet
                                </h4>

                                <p className="mt-2 text-slate-500">
                                    When candidates apply, they will show here.
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-8 rounded-3xl bg-slate-900 p-5 text-white shadow-xl sm:mt-10 sm:p-8">
                    <h3 className="text-xl font-bold sm:text-2xl">
                        Recruiter Workflow
                    </h3>

                    <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {workflow.map((item) => (
                            <Link
                                key={item.title}
                                to={item.link}
                                className="rounded-2xl bg-white/10 p-5 transition-all duration-300 hover:-translate-y-2 hover:bg-white/20 hover:shadow-lg"
                            >
                                <p className="text-sm font-black text-blue-200">
                                    {item.step}
                                </p>

                                <h4 className="mt-3 font-semibold">
                                    {item.title}
                                </h4>

                                <p className="mt-2 text-sm text-slate-300">
                                    {item.description}
                                </p>
                            </Link>
                        ))}
                    </div>
                </div>

            </div>
        </section>
    );
}

export default RecruiterDashboard;
