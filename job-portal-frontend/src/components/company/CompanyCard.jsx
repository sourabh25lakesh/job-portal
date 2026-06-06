import { Link } from "react-router-dom";

function CompanyCard({ company }) {
    return (
        <div
            className="
                group
                bg-white
                rounded-3xl
                border
                border-gray-100
                p-7
                shadow-sm
                hover:shadow-2xl
                hover:-translate-y-2
                transition-all
                duration-300
            "
        >
            <div className="flex items-center gap-4">
                <div
                    className="
                        w-16
                        h-16
                        rounded-2xl
                        bg-blue-600
                        text-white
                        flex
                        items-center
                        justify-center
                        text-2xl
                        font-bold
                        group-hover:scale-110
                        transition
                        duration-300
                    "
                >
                    {company.logo}
                </div>

                <div>
                    <h2 className="text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition">
                        {company.name}
                    </h2>

                    <p className="text-gray-500 mt-1">
                        {company.industry}
                    </p>
                </div>
            </div>

            <p className="mt-6 text-gray-600 leading-relaxed">
                {company.description}
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
                <span className="bg-gray-100 text-gray-700 px-4 py-2 rounded-xl text-sm">
                    📍 {company.location}
                </span>

                <span className="bg-blue-100 text-blue-700 px-4 py-2 rounded-xl text-sm font-semibold">
                    {company.jobs} Open Jobs
                </span>
            </div>

            <Link
                to={`/jobs?search=${encodeURIComponent(company.name)}`}
                className="
                    mt-7
                    inline-flex
                    items-center
                    justify-center
                    w-full
                    bg-blue-600
                    text-white
                    py-3
                    rounded-2xl
                    font-semibold
                    hover:bg-blue-700
                    transition
                    duration-300
                "
            >
                View Jobs
            </Link>
        </div>
    );
}

export default CompanyCard;