import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Hero() {

    const [search, setSearch] = useState("");

    const navigate = useNavigate();

    // ================= SEARCH HANDLER =================
    const handleSearch = () => {

        const keyword = search.trim();

        if (keyword) {

            navigate(`/jobs?search=${encodeURIComponent(keyword)}`);

        } else {

            navigate("/jobs");
        }
    };

    // ================= ENTER KEY SEARCH =================
    const handleKeyDown = (e) => {

        if (e.key === "Enter") {

            handleSearch();
        }
    };

    return (

        <section className="bg-gray-50 min-h-[90vh] flex items-center">

            <div className="max-w-7xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-12 items-center">

                {/* ================= LEFT CONTENT ================= */}
                <div>

                    <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight">

                        Find Your
                        <span className="text-blue-600"> Dream Job </span>
                        Today

                    </h1>

                    <p className="mt-6 text-lg text-gray-600 leading-relaxed max-w-xl">

                        Discover thousands of job opportunities with all the
                        information you need. Its your future. Come find it.

                    </p>

                    {/* ================= SEARCH BOX ================= */}
                    <div className="mt-8 flex flex-col sm:flex-row gap-4">

                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Search jobs, company, location..."
                            className="
                                flex-1
                                px-5
                                py-4
                                rounded-2xl
                                border
                                border-gray-300
                                outline-none
                                focus:ring-2
                                focus:ring-blue-500
                                bg-white
                                shadow-sm
                                text-gray-700
                            "
                        />

                        <button
                            onClick={handleSearch}
                            className="
                                bg-blue-600
                                text-white
                                px-8
                                py-4
                                rounded-2xl
                                hover:bg-blue-700
                                transition
                                duration-300
                                font-semibold
                                shadow-md
                            "
                        >
                            Search
                        </button>

                    </div>

                    {/* ================= BUTTONS ================= */}
                    <div className="mt-8 flex flex-wrap gap-4">

                        <button
                            onClick={() => navigate("/jobs")}
                            className="
                                bg-blue-600
                                text-white
                                px-8
                                py-4
                                rounded-2xl
                                hover:bg-blue-700
                                transition
                                duration-300
                                font-semibold
                                shadow-md
                            "
                        >
                            Get Started
                        </button>

                        <button
                            onClick={() => navigate("/about")}
                            className="
                                border
                                border-blue-600
                                text-blue-600
                                px-8
                                py-4
                                rounded-2xl
                                hover:bg-blue-600
                                hover:text-white
                                transition
                                duration-300
                                font-semibold
                            "
                        >
                            Learn More
                        </button>

                    </div>

                </div>

                {/* ================= RIGHT IMAGE ================= */}
                <div className="flex justify-center">

                    <img
                        src="https://illustrations.popsy.co/gray/work-from-home.svg"
                        alt="Hero"
                        className="w-full max-w-lg drop-shadow-lg"
                    />

                </div>

            </div>

        </section>
    );
}

export default Hero;