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
        <section className="min-h-screen bg-gray-50 py-12 px-6">
            <div className="max-w-7xl mx-auto">

                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900">
                            Find Your Dream Job 🚀
                        </h1>

                        <p className="mt-3 text-gray-600 text-lg">
                            Explore thousands of opportunities from top companies.
                        </p>
                    </div>

                    <form
                        onSubmit={handleSearch}
                        className="w-full lg:w-[460px] flex gap-3 bg-white p-2 rounded-2xl border border-gray-100 shadow-sm"
                    >
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search title, company, location..."
                            className="
                                flex-1
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
                    <div className="bg-white rounded-3xl p-14 text-center shadow-sm border border-gray-100 mt-10">
                        <h2 className="text-3xl font-bold text-gray-800">
                            No Jobs Found
                        </h2>

                        <p className="text-gray-500 mt-4">
                            Try searching with another keyword.
                        </p>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8 mt-10">
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
                                <div className="p-7">
                                    <div className="
                                        w-16
                                        h-16
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
                                                <h2 className="text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition">
                                                    {job.title}
                                                </h2>

                                                <p className="mt-2 text-gray-500">
                                                    {job.company_name || "Company"}
                                                </p>
                                            </div>

                                            <span className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap">
                                                {job.job_type || "Full Time"}
                                            </span>
                                        </div>

                                        <p className="mt-6 text-gray-600 leading-relaxed line-clamp-3">
                                            {job.description}
                                        </p>

                                        <div className="flex flex-wrap gap-3 mt-6">
                                            <span className="bg-gray-100 px-4 py-2 rounded-xl text-sm text-gray-700">
                                                📍 {job.location || "Remote"}
                                            </span>

                                            <span className="bg-gray-100 px-4 py-2 rounded-xl text-sm text-gray-700">
                                                💰 {job.salary || "Not Disclosed"}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t border-gray-100 p-5 flex items-center justify-between">
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