import { Link } from "react-router-dom";

function CompanyProfile({ company }) {
    return (
        <div
            className="
                bg-white
                rounded-3xl
                border
                border-gray-100
                shadow-sm
                p-8
            "
        >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div className="flex items-center gap-5">
                    <div
                        className="
                            w-20
                            h-20
                            rounded-3xl
                            bg-blue-600
                            text-white
                            flex
                            items-center
                            justify-center
                            text-3xl
                            font-bold
                        "
                    >
                        {company.logo}
                    </div>

                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            {company.name}
                        </h1>

                        <p className="text-gray-500 mt-2">
                            {company.industry}
                        </p>
                    </div>
                </div>

                <Link
                    to={`/jobs?search=${encodeURIComponent(company.name)}`}
                    className="
                        bg-blue-600
                        text-white
                        px-7
                        py-3
                        rounded-2xl
                        font-semibold
                        hover:bg-blue-700
                        transition
                        text-center
                    "
                >
                    View Open Jobs
                </Link>
            </div>

            <div className="grid md:grid-cols-3 gap-5 mt-8">
                <div className="bg-gray-50 rounded-2xl p-5">
                    <p className="text-sm text-gray-500">Location</p>
                    <h3 className="font-semibold text-gray-900 mt-1">
                        {company.location}
                    </h3>
                </div>

                <div className="bg-gray-50 rounded-2xl p-5">
                    <p className="text-sm text-gray-500">Open Jobs</p>
                    <h3 className="font-semibold text-gray-900 mt-1">
                        {company.jobs}
                    </h3>
                </div>

                <div className="bg-gray-50 rounded-2xl p-5">
                    <p className="text-sm text-gray-500">Industry</p>
                    <h3 className="font-semibold text-gray-900 mt-1">
                        {company.industry}
                    </h3>
                </div>
            </div>

            <div className="mt-8">
                <h2 className="text-2xl font-bold text-gray-900">
                    About Company
                </h2>

                <p className="mt-4 text-gray-600 leading-relaxed">
                    {company.description}
                </p>
            </div>
        </div>
    );
}

export default CompanyProfile;