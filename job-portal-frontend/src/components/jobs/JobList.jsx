import JobCard from "./JobCard";

const jobs = [
    {
        id: 1,
        title: "Frontend Developer",
        company: "Google",
        location: "Bangalore, India",
        type: "Full Time",
    },
    {
        id: 2,
        title: "Backend Developer",
        company: "Microsoft",
        location: "Hyderabad, India",
        type: "Remote",
    },
    {
        id: 3,
        title: "UI/UX Designer",
        company: "Amazon",
        location: "Delhi, India",
        type: "Part Time",
    },
];

function JobList() {
    return (
        <section className="py-20 bg-white">

            {/* Exact same container as Navbar — max-width 1440px, padding scales with screen */}
            <style>{`
                .joblist-container {
                    width: 100%;
                    max-width: 1440px;
                    margin: 0 auto;
                    padding: 0 60px;
                }
                @media (max-width: 767px) {
                    .joblist-container { padding: 0 20px; }
                }
                @media (min-width: 768px) and (max-width: 1023px) {
                    .joblist-container { padding: 0 32px; }
                }
                @media (min-width: 1024px) and (max-width: 1279px) {
                    .joblist-container { padding: 0 40px; }
                }
                @media (min-width: 1280px) {
                    .joblist-container { padding: 0 60px; }
                }
            `}</style>

            <div className="joblist-container">

                {/* Heading */}
                <div className="text-center mb-14">
                    <h2 className="text-6xl font-bold text-gray-900">
                        Featured Jobs
                    </h2>
                    <p className="mt-4 text-gray-500 text-lg">
                        Explore top opportunities from leading companies
                    </p>
                </div>

                {/* Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {jobs.map((job) => (
                        <JobCard key={job.id} job={job} />
                    ))}
                </div>

            </div>

        </section>
    );
}

export default JobList;