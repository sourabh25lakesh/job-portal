import {
    useEffect,
    useState,
} from "react";

import {
    Link,
    useParams,
} from "react-router-dom";

import toast from "react-hot-toast";

import { getJobById } from "../api/jobApi";

import {
    applyJob,
    getMyApplications,
} from "../api/applicationApi";

function JobDetails() {
    const { id } = useParams();

    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [applying, setApplying] = useState(false);
    const [applied, setApplied] = useState(false);
    const [saved, setSaved] = useState(false);
    const [showAppliedCard, setShowAppliedCard] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const getUserStorageKey = () => {
        const storedUser = JSON.parse(localStorage.getItem("user") || "null");

        return storedUser?.id || storedUser?.email || "guest";
    };

    const getSavedJobsKey = () => `savedJobs:${getUserStorageKey()}`;
    const getAppliedJobsKey = () => `appliedJobs:${getUserStorageKey()}`;
    const getCurrentJobId = () => String(job?.id || id);

    useEffect(() => {
        fetchJob();
        checkSavedJob();
        checkAppliedJob();
    }, [id]);

    const fetchJob = async () => {
        try {
            setLoading(true);
            setJob(null);

            const data = await getJobById(id);
            setJob(data);
        } catch (error) {
            console.log(error);
            setJob(null);
            toast.error("Job not found");
        } finally {
            setLoading(false);
        }
    };

    const checkSavedJob = () => {
        const savedJobs = JSON.parse(
            localStorage.getItem(getSavedJobsKey()) || "[]"
        );

        const isSaved = savedJobs.some(
            (jobId) => String(jobId) === getCurrentJobId()
        );

        setSaved(isSaved);
    };

    const removeAppliedJobFromLocalStorage = () => {
        const appliedJobs = JSON.parse(
            localStorage.getItem(getAppliedJobsKey()) || "[]"
        );

        const updatedAppliedJobs = appliedJobs.filter(
            (jobId) => String(jobId) !== getCurrentJobId()
        );

        localStorage.setItem(
            getAppliedJobsKey(),
            JSON.stringify(updatedAppliedJobs)
        );
    };

    const checkAppliedJob = async () => {
        try {
            setApplied(false);
            setShowAppliedCard(false);

            const applications = await getMyApplications();

            const applicationList = Array.isArray(applications)
                ? applications
                : applications?.applications || [];

            const isApplied = applicationList.some((application) => {
                const applicationJobId =
                    application.job_id ||
                    application.job?.id ||
                    application.job?.job_id;

                return String(applicationJobId) === getCurrentJobId();
            });

            if (isApplied) {
                setApplied(true);
                setShowAppliedCard(true);
                saveAppliedJobToLocalStorage();
            } else {
                setApplied(false);
                setShowAppliedCard(false);
                removeAppliedJobFromLocalStorage();
            }
        } catch (error) {
            console.log(error);

            const appliedJobs = JSON.parse(
                localStorage.getItem(getAppliedJobsKey()) || "[]"
            );

            const hasToken = Boolean(localStorage.getItem("token"));
            const isApplied = hasToken && appliedJobs.some(
                (jobId) => String(jobId) === getCurrentJobId()
            );

            setApplied(isApplied);
            setShowAppliedCard(isApplied);
        }
    };

    const saveAppliedJobToLocalStorage = () => {
        const appliedJobs = JSON.parse(
            localStorage.getItem(getAppliedJobsKey()) || "[]"
        );

        const alreadyApplied = appliedJobs.some(
            (jobId) => String(jobId) === getCurrentJobId()
        );

        if (!alreadyApplied) {
            appliedJobs.push(getCurrentJobId());

            localStorage.setItem(
                getAppliedJobsKey(),
                JSON.stringify(appliedJobs)
            );
        }
    };

    const handleApply = async () => {
        if (applied) {
            toast.success("Application already submitted");
            return;
        }

        try {
            setApplying(true);
            setErrorMessage("");

            const jobIdToApply = job?.id;

            if (!jobIdToApply) {
                throw new Error("Unable to identify this job. Please refresh and try again.");
            }

            const data = await applyJob(jobIdToApply);

            const message =
                data.message || `Applied to ${job.title} successfully`;

            setApplied(true);
            setShowAppliedCard(true);
            saveAppliedJobToLocalStorage();

            toast.success(message);
        } catch (error) {
            console.log(error);

            const message =
                error.response?.data?.detail ||
                error.message ||
                "Failed to apply job";

            if (
                message.toLowerCase().includes("already") ||
                message.toLowerCase().includes("duplicate")
            ) {
                setApplied(true);
                setShowAppliedCard(true);
                saveAppliedJobToLocalStorage();

                toast.error("You already applied for this job");
            } else {
                setErrorMessage(message);
                toast.error(message);
            }
        } finally {
            setApplying(false);
        }
    };

    const handleSaveJob = () => {
        if (!job) return;

        const savedJobs = JSON.parse(
            localStorage.getItem(getSavedJobsKey()) || "[]"
        );

        const isAlreadySaved = savedJobs.some(
            (jobId) => String(jobId) === getCurrentJobId()
        );

        if (isAlreadySaved) {
            const updatedJobs = savedJobs.filter(
                (jobId) => String(jobId) !== getCurrentJobId()
            );

            localStorage.setItem(
                getSavedJobsKey(),
                JSON.stringify(updatedJobs)
            );

            setSaved(false);
            toast.success("Job removed from saved jobs");
        } else {
            savedJobs.push(getCurrentJobId());

            localStorage.setItem(
                getSavedJobsKey(),
                JSON.stringify(savedJobs)
            );

            setSaved(true);
            toast.success("Job saved successfully");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="w-14 h-14 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!job) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100 text-center">
                    <h1 className="text-3xl font-bold text-gray-800">
                        Job Not Found
                    </h1>
                </div>
            </div>
        );
    }

    return (
        <section className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 sm:py-12">
            <div className="max-w-7xl mx-auto">
                <div className="grid gap-6 lg:grid-cols-3 lg:gap-8">
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="p-6 sm:p-10">
                                <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-blue-100 text-2xl font-bold text-blue-600 sm:h-20 sm:w-20 sm:text-3xl">
                                    {job.company_name
                                        ?.charAt(0)
                                        ?.toUpperCase() || "C"}
                                </div>

                                <div className="mt-8">
                                    <h1 className="break-words text-3xl font-bold text-gray-900 sm:text-4xl">
                                        {job.title}
                                    </h1>

                                    <p className="mt-3 text-lg text-gray-500 sm:text-xl">
                                        {job.company_name || "Company"}
                                    </p>

                                    <div className="flex flex-wrap gap-3 mt-6">
                                        <span className="bg-blue-100 text-blue-700 px-4 py-2 rounded-xl text-sm font-semibold">
                                            {job.job_type || "Full Time"}
                                        </span>

                                        <span className="bg-gray-100 text-gray-700 px-4 py-2 rounded-xl text-sm">
                                            Location: {job.location || "Remote"}
                                        </span>

                                        <span className="bg-gray-100 text-gray-700 px-4 py-2 rounded-xl text-sm">
                                            Salary: {job.salary || "Not Disclosed"}
                                        </span>
                                    </div>

                                    {Array.isArray(job.skills) && job.skills.length > 0 && (
                                        <div className="mt-6 flex flex-wrap gap-2">
                                            {job.skills.map((skill) => (
                                                <span
                                                    key={skill}
                                                    className="rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700"
                                                >
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="border-t border-gray-100"></div>

                            <div className="space-y-8 p-6 sm:space-y-10 sm:p-10">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">
                                        Job Description
                                    </h2>

                                    <p className="mt-5 text-base leading-relaxed text-gray-600 sm:text-lg">
                                        {job.description}
                                    </p>
                                </div>

                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">
                                        Requirements
                                    </h2>

                                    <ul className="mt-5 space-y-4 text-gray-600">
                                        <li>• Strong communication skills</li>
                                        <li>• Team collaboration experience</li>
                                        <li>• Problem solving mindset</li>
                                        <li>• Passion for technology</li>
                                    </ul>
                                </div>

                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">
                                        Benefits
                                    </h2>

                                    <ul className="mt-5 space-y-4 text-gray-600">
                                        <li>• Flexible working hours</li>
                                        <li>• Health insurance</li>
                                        <li>• Remote work support</li>
                                        <li>• Learning opportunities</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm lg:sticky lg:top-28 lg:p-8">
                            <h2 className="text-2xl font-bold text-gray-900">
                                Apply for this job
                            </h2>

                            <p className="mt-4 text-gray-500 leading-relaxed">
                                Submit your application now and start your journey with top companies.
                            </p>

                            {showAppliedCard && (
                                <div className="mt-6 rounded-2xl border border-blue-200 bg-blue-50 px-5 py-4">
                                    <h3 className="font-bold text-blue-700">
                                        ✓ Application Submitted
                                    </h3>

                                    <p className="text-sm text-blue-600 mt-1">
                                        You have already applied for this position.
                                    </p>

                                    <Link
                                        to="/my-applications"
                                        className="block text-center mt-4 bg-green-600 hover:bg-green-700 text-white py-3 rounded-2xl font-semibold transition"
                                    >
                                        View My Applications
                                    </Link>
                                </div>
                            )}

                            {errorMessage && !applied && (
                                <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-red-700 font-medium">
                                    {errorMessage}
                                </div>
                            )}

                            <button
                                onClick={handleApply}
                                disabled={applying || applied}
                                className={`w-full mt-8 py-4 rounded-2xl font-semibold transition shadow-lg ${
                                    applied
                                        ? "bg-green-100 text-green-700 cursor-not-allowed border border-green-200"
                                        : "bg-blue-600 hover:bg-blue-700 text-white hover:shadow-xl hover:scale-[1.01]"
                                }`}
                            >
                                {applying
                                    ? "Applying..."
                                    : applied
                                        ? "✓ Applied"
                                        : "Apply Now"}
                            </button>

                            <button
                                type="button"
                                onClick={handleSaveJob}
                                className={`w-full mt-4 border py-4 rounded-2xl font-semibold transition ${
                                    saved
                                        ? "border-yellow-400 bg-yellow-50 text-yellow-700 hover:bg-yellow-100"
                                        : "border-gray-300 hover:bg-gray-100"
                                }`}
                            >
                                {saved ? "Saved Job" : "Save Job"}
                            </button>

                            <div className="mt-8 space-y-4 border-t border-gray-100 pt-8">
                                <div className="flex items-center justify-between gap-4">
                                    <span className="text-gray-500">Experience</span>
                                    <span className="font-semibold">2+ Years</span>
                                </div>

                                <div className="flex items-center justify-between gap-4">
                                    <span className="text-gray-500">Job Type</span>
                                    <span className="font-semibold">
                                        {job.job_type || "Full Time"}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between gap-4">
                                    <span className="text-gray-500">Location</span>
                                    <span className="font-semibold">
                                        {job.location || "Remote"}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default JobDetails;
