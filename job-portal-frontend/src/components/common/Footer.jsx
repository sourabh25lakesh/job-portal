import { Link } from "react-router-dom";

function Footer() {

    return (

        <footer className="bg-gray-950 text-gray-300">

            <div className="max-w-7xl mx-auto px-6 py-16">

                {/* Top Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">

                    {/* Logo & Description */}
                    <div>

                        <h2 className="text-3xl font-bold text-white">
                            Job<span className="text-blue-500">Portal</span>
                        </h2>

                        <p className="mt-5 text-gray-400 leading-relaxed">
                            Discover thousands of job opportunities from top
                            companies and build your future career with confidence.
                        </p>

                    </div>

                    {/* Quick Links */}
                    <div>

                        <h3 className="text-xl font-semibold text-white mb-6">
                            Quick Links
                        </h3>

                        <ul className="space-y-4">

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

                        <h3 className="text-xl font-semibold text-white mb-6">
                            Resources
                        </h3>

                        <ul className="space-y-4">

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

                        <h3 className="text-xl font-semibold text-white mb-6">
                            Contact Us
                        </h3>

                        <div className="space-y-4 text-gray-400">

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
                <div className="border-t border-gray-800 mt-14 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">

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