import { Link } from "react-router-dom";

function Footer() {

    return (

        <footer className="bg-gray-950 text-gray-300">

            <div className="max-w-7xl mx-auto px-4 py-10 sm:px-6 sm:py-14 lg:py-16">

                {/* Top Section */}
                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-12">

                    {/* Logo & Description */}
                    <div>

                        <h2 className="text-2xl font-bold text-white sm:text-3xl">
                            Job<span className="text-blue-500">Portal</span>
                        </h2>

                        <p className="mt-4 text-sm leading-7 text-gray-400 sm:text-base">
                            Discover thousands of job opportunities from top
                            companies and build your future career with confidence.
                        </p>

                    </div>

                    {/* Quick Links */}
                    <div>

                        <h3 className="mb-4 text-lg font-semibold text-white sm:text-xl">
                            Quick Links
                        </h3>

                        <ul className="space-y-3">

                            <li>
                                <Link
                                    to="/"
                                    className="hover:text-blue-500 transition duration-300"
                                >
                                    Home
                                </Link>
                            </li>

                            <li>
                                <Link
                                    to="/jobs"
                                    className="hover:text-blue-500 transition duration-300"
                                >
                                    Jobs
                                </Link>
                            </li>

                            <li>
                                <Link
                                    to="/companies"
                                    className="hover:text-blue-500 transition duration-300"
                                >
                                    Companies
                                </Link>
                            </li>

                            <li>
                                <Link
                                    to="/dashboard"
                                    className="hover:text-blue-500 transition duration-300"
                                >
                                    Dashboard
                                </Link>
                            </li>

                        </ul>

                    </div>

                    {/* Resources */}
                    <div>

                        <h3 className="mb-4 text-lg font-semibold text-white sm:text-xl">
                            Resources
                        </h3>

                        <ul className="space-y-3">

                            <li>
                                <a
                                    href="#"
                                    className="hover:text-blue-500 transition duration-300"
                                >
                                    Help Center
                                </a>
                            </li>

                            <li>
                                <a
                                    href="#"
                                    className="hover:text-blue-500 transition duration-300"
                                >
                                    Privacy Policy
                                </a>
                            </li>

                            <li>
                                <a
                                    href="#"
                                    className="hover:text-blue-500 transition duration-300"
                                >
                                    Terms & Conditions
                                </a>
                            </li>

                            <li>
                                <a
                                    href="#"
                                    className="hover:text-blue-500 transition duration-300"
                                >
                                    Career Advice
                                </a>
                            </li>

                        </ul>

                    </div>

                    {/* Contact */}
                    <div>

                        <h3 className="mb-4 text-lg font-semibold text-white sm:text-xl">
                            Contact Us
                        </h3>

                        <div className="space-y-3 text-sm text-gray-400 sm:text-base">

                            <p>
                                📧 support@jobportal.com
                            </p>

                            <p>
                                📞 +91 7082225625
                            </p>

                            <p>
                                📍 Mohali, India
                            </p>

                        </div>

                    </div>

                </div>

                {/* Bottom Section */}
                <div className="border-t border-gray-800 mt-10 pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">

                    <p className="text-gray-500 text-sm">
                        © 2026 JobPortal. All rights reserved.
                    </p>

                    {/* Social Icons */}
                    <div className="flex items-center gap-5 text-xl">

                        <a
                            href="#"
                            className="hover:text-blue-500 transition duration-300"
                        >
                            🌐
                        </a>

                        <a
                            href="#"
                            className="hover:text-blue-500 transition duration-300"
                        >
                            💼
                        </a>

                        <a
                            href="#"
                            className="hover:text-blue-500 transition duration-300"
                        >
                            📘
                        </a>

                        <a
                            href="#"
                            className="hover:text-blue-500 transition duration-300"
                        >
                            📸
                        </a>

                    </div>

                </div>

            </div>

        </footer>
    );
}

export default Footer;
