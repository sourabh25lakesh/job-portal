import {
    useEffect,
    useState,
} from "react";

import {
    Link,
    useLocation,
    useNavigate,
} from "react-router-dom";

import { getJobs } from "../api/jobApi";

function Jobs() {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    const location = useLocation();
    const navigate = useNavigate();

    const queryParams = new URLSearchParams(location.search);
    const searchKeyword = queryParams.get("search") || "";

    useEffect(() => {
        setSearch(searchKeyword);
        fetchJobs(searchKeyword);
    }, [searchKeyword]);

    const fetchJobs = async (keyword = "") => {
        try {
            setLoading(true);

            const data = await getJobs(keyword);

            setJobs(data);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();

        const keyword = search.trim();

        if (keyword) {
            navigate(`/jobs?search=${encodeURIComponent(keyword)}`);
        } else {
            navigate("/jobs");
        }
    };

    return (
        <section className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 sm:py-12">
            <div className="max-w-7xl mx-auto">

                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
                            Find Your Dream Job
                        </h1>

                        <p className="mt-3 text-base text-gray-600 sm:text-lg">
                            Explore thousands of opportunities from top companies.
                        </p>
                    </div>

                    <form
                        onSubmit={handleSearch}
                        className="flex w-full flex-col gap-2 rounded-2xl border border-gray-100 bg-white p-2 shadow-sm sm:flex-row lg:w-[460px]"
                    >
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search title, company, location..."
                            className="
                                min-w-0 flex-1
                                px-4
                                py-3
                                rounded-xl
                                outline-none
                                bg-transparent
                                text-gray-700
                            "
                        />

                        <button
                            type="submit"
                            className="
                                bg-blue-600
                                hover:bg-blue-700
                                text-white
                                px-6
                                py-3
                                rounded-xl
                                font-semibold
                                transition
                            "
                        >
                            Search
                        </button>
                    </form>
                </div>

                {loading ? (
                    <div className="min-h-[400px] flex items-center justify-center">
                        <div className="w-14 h-14 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : jobs.length === 0 ? (
                    <div className="mt-10 rounded-3xl border border-gray-100 bg-white p-8 text-center shadow-sm sm:p-14">
                        <h2 className="text-2xl font-bold text-gray-800 sm:text-3xl">
                            No Jobs Found
                        </h2>

                        <p className="text-gray-500 mt-4">
                            Try searching with another keyword.
                        </p>
                    </div>
                ) : (
                    <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3 xl:gap-8">
                        {jobs.map((job) => (
                            <Link
                                key={job.id}
                                to={`/jobs/${job.id}`}
                                className="
                                    group
                                    bg-white
                                    rounded-3xl
                                    border
                                    border-gray-100
                                    shadow-sm
                                    hover:shadow-2xl
                                    hover:-translate-y-2
                                    transition-all
                                    duration-300
                                    overflow-hidden
                                    block
                                "
                            >
                                <div className="p-5 sm:p-7">
                                    <div className="
                                        w-14
                                        h-14
                                        sm:w-16
                                        sm:h-16
                                        rounded-2xl
                                        bg-blue-100
                                        flex
                                        items-center
                                        justify-center
                                        text-2xl
                                        font-bold
                                        text-blue-600
                                    ">
                                        {
                                            job.company_name
                                                ?.charAt(0)
                                                ?.toUpperCase()
                                            || "C"
                                        }
                                    </div>

                                    <div className="mt-6">
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <h2 className="text-xl font-bold text-gray-900 transition group-hover:text-blue-600 sm:text-2xl">
                                                    {job.title}
                                                </h2>

                                                <p className="mt-2 text-gray-500">
                                                    {job.company_name || "Company"}
                                                </p>
                                            </div>

                                            <span className="rounded-full bg-blue-100 px-3 py-1.5 text-xs font-semibold text-blue-700 sm:px-4 sm:py-2 sm:text-sm">
                                                {job.job_type || "Full Time"}
                                            </span>
                                        </div>

                                        <p className="mt-6 text-gray-600 leading-relaxed line-clamp-3">
                                            {job.description}
                                        </p>

                                        {Array.isArray(job.skills) && job.skills.length > 0 && (
                                            <div className="mt-5 flex flex-wrap gap-2">
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

                                        <div className="flex flex-wrap gap-3 mt-6">
                                            <span className="bg-gray-100 px-4 py-2 rounded-xl text-sm text-gray-700">
                                                Location: {job.location || "Remote"}
                                            </span>

                                            <span className="bg-gray-100 px-4 py-2 rounded-xl text-sm text-gray-700">
                                                Salary: {job.salary || "Not Disclosed"}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-3 border-t border-gray-100 p-5 sm:flex-row sm:items-center sm:justify-between">
                                    <p className="text-sm text-gray-500">
                                        Posted Recently
                                    </p>

                                    <div className="bg-blue-600 group-hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold transition">
                                        View Details
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}

export default Jobs;
