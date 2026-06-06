import {
    useEffect,
    useMemo,
    useState,
} from "react";

import { Link } from "react-router-dom";

import {
    getRecruiterDashboard,
    getRecruiterApplicants,
} from "../../api/recruiterApi";

function RecruiterDashboard() {
    const [dashboardData, setDashboardData] = useState(null);
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        fetchRecruiterDashboard();
    }, []);

    const fetchRecruiterDashboard = async () => {
        try {
            setLoading(true);
            setErrorMessage("");

            const [dashboardResponse, applicantsResponse] = await Promise.all([
                getRecruiterDashboard(),
                getRecruiterApplicants(),
            ]);

            setDashboardData(dashboardResponse || null);
            setApplications(Array.isArray(applicantsResponse) ? applicantsResponse : []);
        } catch (error) {
            console.log(error);

            setErrorMessage(
                error.response?.data?.detail ||
                "Failed to load recruiter dashboard"
            );

            setDashboardData(null);
            setApplications([]);
        } finally {
            setLoading(false);
        }
    };

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
        (application) => application.status === "Pending"
    ).length;

    const shortlistedApplications = applications.filter(
        (application) => application.status === "Shortlisted"
    ).length;

    const rejectedApplications = applications.filter(
        (application) => application.status === "Rejected"
    ).length;

    const cards = [
        {
            title: "Company Profile",
            description: "Add or update company details visible to candidates.",
            icon: "🏢",
            bg: "bg-blue-100",
            hoverText: "group-hover:text-blue-600",
            link: "/recruiter/profile",
            count: null,
        },
        {
            title: "Post New Job",
            description: "Create professional job posts and attract candidates.",
            icon: "💼",
            bg: "bg-indigo-100",
            hoverText: "group-hover:text-indigo-600",
            link: "/recruiter/create-job",
            count: null,
        },
        {
            title: "My Jobs",
            description: "View your posted jobs and check applied candidates.",
            icon: "📋",
            bg: "bg-emerald-100",
            hoverText: "group-hover:text-emerald-600",
            link: "/recruiter/my-jobs",
            count: dashboardData?.total_jobs || groupedJobs.length || 0,
        },
        {
            title: "Applied Candidates",
            description: "View all candidates who applied to your jobs.",
            icon: "👥",
            bg: "bg-yellow-100",
            hoverText: "group-hover:text-yellow-600",
            link: "/recruiter/applied-candidates",
            count: totalApplications,
        },
        {
            title: "Resume Review",
            description: "View candidate resumes and mark resume viewed status.",
            icon: "📄",
            bg: "bg-purple-100",
            hoverText: "group-hover:text-purple-600",
            link: "/recruiter/resume-review",
            count: pendingApplications,
        },
        {
            title: "Shortlist / Reject",
            description: "Shortlist candidates or reject applications.",
            icon: "✅",
            bg: "bg-green-100",
            hoverText: "group-hover:text-green-600",
            link: "/recruiter/shortlist-reject",
            count: shortlistedApplications + rejectedApplications,
        },
    ];

    const workflow = [
        {
            step: "1️⃣",
            title: "Open My Jobs",
            description: "Check your posted jobs.",
            link: "/recruiter/my-jobs",
        },
        {
            step: "2️⃣",
            title: "View Candidates",
            description: "See applied candidates.",
            link: "/recruiter/applied-candidates",
        },
        {
            step: "3️⃣",
            title: "View Resume",
            description: "Open candidate resume.",
            link: "/recruiter/resume-review",
        },
        {
            step: "4️⃣",
            title: "Select Status",
            description: "Shortlist ✅ or reject ❌.",
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
        <section className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 px-4 py-12">
            <div className="mx-auto max-w-6xl">

                <div className="mb-10 rounded-3xl bg-white p-8 shadow-xl shadow-blue-100">
                    <span className="inline-flex rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-700">
                        Recruiter Panel
                    </span>

                    <h1 className="mt-4 text-3xl font-bold text-slate-900 md:text-4xl">
                        Recruiter Dashboard
                    </h1>

                    <p className="mt-3 max-w-2xl text-slate-600">
                        Manage your company profile, post jobs, view applied candidates,
                        check resumes, and shortlist or reject candidates.
                    </p>

                    {errorMessage && (
                        <div className="mt-6 rounded-2xl bg-red-50 p-4 text-sm font-semibold text-red-700">
                            {errorMessage}
                        </div>
                    )}

                    <div className="mt-8 grid gap-4 md:grid-cols-4">
                        <div className="rounded-2xl bg-blue-50 p-5">
                            <p className="text-sm font-semibold text-blue-600">
                                Total Jobs
                            </p>
                            <h2 className="mt-2 text-3xl font-bold text-slate-900">
                                {dashboardData?.total_jobs || groupedJobs.length || 0}
                            </h2>
                        </div>

                        <div className="rounded-2xl bg-yellow-50 p-5">
                            <p className="text-sm font-semibold text-yellow-700">
                                Pending Review
                            </p>
                            <h2 className="mt-2 text-3xl font-bold text-slate-900">
                                {pendingApplications}
                            </h2>
                        </div>

                        <div className="rounded-2xl bg-green-50 p-5">
                            <p className="text-sm font-semibold text-green-700">
                                Shortlisted
                            </p>
                            <h2 className="mt-2 text-3xl font-bold text-slate-900">
                                {shortlistedApplications}
                            </h2>
                        </div>

                        <div className="rounded-2xl bg-red-50 p-5">
                            <p className="text-sm font-semibold text-red-700">
                                Rejected
                            </p>
                            <h2 className="mt-2 text-3xl font-bold text-slate-900">
                                {rejectedApplications}
                            </h2>
                        </div>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {cards.map((card) => (
                        <Link
                            key={card.title}
                            to={card.link}
                            className="group relative overflow-hidden rounded-3xl bg-white p-8 shadow-lg shadow-slate-200 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
                        >
                            <div className="absolute right-0 top-0 h-24 w-24 rounded-bl-full bg-slate-50 transition-all duration-300 group-hover:scale-125"></div>

                            {card.count !== null && (
                                <span className="absolute right-5 top-5 rounded-full bg-blue-600 px-3 py-1 text-sm font-bold text-white">
                                    {card.count}
                                </span>
                            )}

                            <div
                                className={`relative mb-5 flex h-14 w-14 items-center justify-center rounded-2xl ${card.bg} text-2xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-6`}
                            >
                                {card.icon}
                            </div>

                            <h2
                                className={`relative text-2xl font-bold text-slate-900 transition-colors duration-300 ${card.hoverText}`}
                            >
                                {card.title}
                            </h2>

                            <p className="relative mt-3 text-slate-600">
                                {card.description}
                            </p>

                            <p className="relative mt-5 text-sm font-semibold text-blue-600 opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100">
                                Click to continue →
                            </p>
                        </Link>
                    ))}
                </div>

                <div className="mt-10 rounded-3xl bg-white p-8 shadow-xl shadow-slate-200">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <h3 className="text-2xl font-bold text-slate-900">
                                Latest Applications
                            </h3>

                            <p className="mt-2 text-slate-600">
                                Candidate applications from your posted jobs.
                            </p>
                        </div>

                        <Link
                            to="/recruiter/applied-candidates"
                            className="rounded-2xl bg-blue-600 px-6 py-3 text-center font-semibold text-white transition hover:bg-blue-700"
                        >
                            View Applied Candidates
                        </Link>
                    </div>

                    <div className="mt-6 space-y-4">
                        {groupedJobs.length > 0 ? (
                            groupedJobs.map((job) => (
                                <div
                                    key={job.id}
                                    className="rounded-2xl border border-slate-100 bg-slate-50 p-5"
                                >
                                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                                        <div>
                                            <h4 className="text-lg font-bold text-slate-900">
                                                {job.title}
                                            </h4>

                                            <p className="text-sm text-slate-500">
                                                {job.company_name} • {job.location}
                                            </p>
                                        </div>

                                        <Link
                                            to={`/recruiter/job-applications/${job.id}`}
                                            className="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
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
                                                    <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-700">
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

                <div className="mt-10 rounded-3xl bg-slate-900 p-8 text-white shadow-xl">
                    <h3 className="text-2xl font-bold">
                        Recruiter Workflow
                    </h3>

                    <div className="mt-6 grid gap-4 md:grid-cols-4">
                        {workflow.map((item) => (
                            <Link
                                key={item.title}
                                to={item.link}
                                className="rounded-2xl bg-white/10 p-5 transition-all duration-300 hover:-translate-y-2 hover:bg-white/20 hover:shadow-lg"
                            >
                                <p className="text-3xl">
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