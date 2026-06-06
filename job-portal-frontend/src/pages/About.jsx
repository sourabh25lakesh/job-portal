import { Link } from "react-router-dom";

const stats = [
    { number: "10K+", label: "Active Jobs" },
    { number: "5K+", label: "Companies" },
    { number: "25K+", label: "Candidates" },
    { number: "98%", label: "Success Rate" },
];

const features = [
    {
        title: "Smart Job Search",
        description: "Search jobs by title, company, location, and skills with a smooth experience.",
        icon: "🔍",
    },
    {
        title: "Easy Apply",
        description: "Apply for jobs quickly and track applications from your dashboard.",
        icon: "🚀",
    },
    {
        title: "Recruiter Tools",
        description: "Recruiters can post jobs, manage profiles, and find better candidates.",
        icon: "💼",
    },
];

const testimonials = [
    {
        name: "Vishnu Ramesh",
        role: "Frontend Developer",
        text: "JobPortal helped me find relevant jobs quickly. The interface is clean and easy to use.",
        avatar: "V",
    },
    {
        name: "Priya Sharma",
        role: "HR Recruiter",
        text: "Posting jobs and managing candidates feels simple, fast, and professional.",
        avatar: "P",
    },
    {
        name: "Rahul Mehta",
        role: "Backend Developer",
        text: "The application process is smooth. I could apply and track everything easily.",
        avatar: "R",
    },
    {
        name: "Aman Verma",
        role: "Full Stack Developer",
        text: "A clean platform for searching jobs and managing applications professionally.",
        avatar: "A",
    },
    {
        name: "Sneha Kapoor",
        role: "Talent Manager",
        text: "The recruiter flow is simple and saves a lot of time while hiring candidates.",
        avatar: "S",
    },
];

function About() {
    const marqueeItems = [...testimonials, ...testimonials];

    return (
        <section className="min-h-screen bg-gray-50 px-6 py-16 overflow-hidden">
            <div className="max-w-7xl mx-auto">

                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    <div className="animate-fadeInUp">
                        <span className="inline-block bg-blue-100 text-blue-700 px-5 py-2 rounded-full text-sm font-semibold">
                            About JobPortal
                        </span>

                        <h1 className="mt-6 text-4xl md:text-6xl font-extrabold text-gray-900 leading-tight">
                            Connecting Talent With{" "}
                            <span className="text-blue-600">
                                Great Opportunities
                            </span>
                        </h1>

                        <p className="mt-6 text-lg text-gray-600 leading-relaxed">
                            JobPortal helps candidates discover better jobs and helps recruiters find the right talent with a clean, fast, and professional hiring experience.
                        </p>

                        <div className="mt-8 flex flex-wrap gap-4">
                            <Link
                                to="/jobs"
                                className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-semibold hover:bg-blue-700 hover:-translate-y-1 hover:shadow-xl transition-all duration-300"
                            >
                                Explore Jobs
                            </Link>

                            <Link
                                to="/companies"
                                className="border border-blue-600 text-blue-600 px-8 py-4 rounded-2xl font-semibold hover:bg-blue-600 hover:text-white hover:-translate-y-1 transition-all duration-300"
                            >
                                View Companies
                            </Link>
                        </div>
                    </div>

                    <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 animate-float">
                        <img
                            src="https://illustrations.popsy.co/gray/remote-work.svg"
                            alt="About JobPortal"
                            className="w-full max-w-md mx-auto"
                        />
                    </div>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
                    {stats.map((item) => (
                        <div
                            key={item.label}
                            className="bg-white rounded-3xl p-7 text-center border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300"
                        >
                            <h2 className="text-4xl font-extrabold text-blue-600">
                                {item.number}
                            </h2>

                            <p className="mt-2 text-gray-600 font-medium">
                                {item.label}
                            </p>
                        </div>
                    ))}
                </div>

                <div className="mt-20 text-center">
                    <h2 className="text-4xl font-bold text-gray-900">
                        Why Choose Us?
                    </h2>

                    <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
                        Built with modern UI, smooth user experience, and practical hiring features.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8 mt-12">
                    {features.map((feature) => (
                        <div
                            key={feature.title}
                            className="group bg-white rounded-3xl p-8 border border-gray-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300"
                        >
                            <div className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center text-3xl group-hover:scale-110 transition duration-300">
                                {feature.icon}
                            </div>

                            <h3 className="mt-6 text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition">
                                {feature.title}
                            </h3>

                            <p className="mt-4 text-gray-600 leading-relaxed">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>

                {/* TESTIMONIALS MARQUEE */}
                <div className="mt-24">
                    <div className="text-center">
                        <span className="inline-block bg-blue-100 text-blue-700 px-5 py-2 rounded-full text-sm font-semibold">
                            Testimonials
                        </span>

                        <h2 className="mt-5 text-4xl md:text-5xl font-bold text-gray-900">
                            What Users Say
                        </h2>

                        <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
                            Real feedback from candidates and recruiters using JobPortal.
                        </p>
                    </div>

                    <div className="relative mt-12 overflow-hidden">
                        <div className="pointer-events-none absolute left-0 top-0 h-full w-24 bg-gradient-to-r from-gray-50 to-transparent z-10"></div>
                        <div className="pointer-events-none absolute right-0 top-0 h-full w-24 bg-gradient-to-l from-gray-50 to-transparent z-10"></div>

                        <div className="testimonial-marquee flex gap-8 w-max">
                            {marqueeItems.map((item, index) => (
                                <div
                                    key={`${item.name}-${index}`}
                                    className="group w-[330px] md:w-[390px] bg-white rounded-3xl p-8 border border-gray-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-full bg-blue-600 text-white flex items-center justify-center text-xl font-bold group-hover:scale-110 transition duration-300">
                                            {item.avatar}
                                        </div>

                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition">
                                                {item.name}
                                            </h3>

                                            <p className="text-sm text-gray-500">
                                                {item.role}
                                            </p>
                                        </div>
                                    </div>

                                    <p className="mt-6 text-gray-600 leading-relaxed">
                                        “{item.text}”
                                    </p>

                                    <div className="mt-5 text-yellow-400 text-lg tracking-wide">
                                        ★★★★★
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

            </div>

            <style>{`
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(24px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @keyframes float {
                    0%, 100% {
                        transform: translateY(0);
                    }
                    50% {
                        transform: translateY(-12px);
                    }
                }

                @keyframes testimonialMarquee {
                    from {
                        transform: translateX(0);
                    }
                    to {
                        transform: translateX(-50%);
                    }
                }

                .animate-fadeInUp {
                    animation: fadeInUp 0.8s ease forwards;
                }

                .animate-float {
                    animation: float 4s ease-in-out infinite;
                }

                .testimonial-marquee {
                    animation: testimonialMarquee 28s linear infinite;
                }

                .testimonial-marquee:hover {
                    animation-play-state: paused;
                }
            `}</style>
        </section>
    );
}

export default About;