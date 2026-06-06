import { Link } from "react-router-dom";

const companies = [
    {
        id: 1,
        name: "Google",
        industry: "Technology",
        location: "Bangalore, India",
        jobs: 12,
        logo: "G",
        description: "Build products used by billions of people worldwide.",
    },
    {
        id: 2,
        name: "Microsoft",
        industry: "Software",
        location: "Hyderabad, India",
        jobs: 8,
        logo: "M",
        description: "Empowering people and businesses through innovation.",
    },
    {
        id: 3,
        name: "Amazon",
        industry: "E-Commerce",
        location: "Pune, India",
        jobs: 15,
        logo: "A",
        description: "Work on large-scale systems and customer-focused products.",
    },
    {
        id: 4,
        name: "Infosys",
        industry: "IT Services",
        location: "Mysore, India",
        jobs: 10,
        logo: "I",
        description: "Create digital solutions for global businesses.",
    },
    {
        id: 5,
        name: "TCS",
        industry: "Consulting",
        location: "Mumbai, India",
        jobs: 20,
        logo: "T",
        description: "Join one of India’s largest technology service companies.",
    },
    {
        id: 6,
        name: "Wipro",
        industry: "IT Services",
        location: "Bangalore, India",
        jobs: 9,
        logo: "W",
        description: "Build your career with modern technology and innovation.",
    },
];

function Companies() {
    return (
        <section className="min-h-screen bg-gray-50 px-6 py-12">
            <div className="max-w-7xl mx-auto">

                <div className="text-center max-w-3xl mx-auto">
                    <span className="inline-block bg-blue-100 text-blue-700 px-5 py-2 rounded-full text-sm font-semibold">
                        Top Companies
                    </span>

                    <h1 className="mt-5 text-4xl md:text-5xl font-bold text-gray-900">
                        Explore Companies Hiring Now
                    </h1>

                    <p className="mt-5 text-gray-600 text-lg leading-relaxed">
                        Discover trusted companies, explore open roles, and find the right place to grow your career.
                    </p>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
                    {companies.map((company) => (
                        <div
                            key={company.id}
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
                                <div className="
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
                                ">
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
                                to="/jobs"
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
                                "
                            >
                                View Jobs
                            </Link>
                        </div>
                    ))}
                </div>

            </div>
        </section>
    );
}

export default Companies;