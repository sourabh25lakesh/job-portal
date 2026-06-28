import { useState, useEffect, useRef } from "react";

import {
    Link,
    useLocation,
    useNavigate,
} from "react-router-dom";

import toast from "react-hot-toast";

import { useAuth } from "../../context/AuthContext";

const NAV_LINKS = [
    { name: "Home", path: "/" },
    { name: "Jobs", path: "/jobs" },
    { name: "Companies", path: "/companies" },
    { name: "About", path: "/about" },
    { name: "Contact", path: "/contact" },
];

function Navbar() {
    const { user, logout } = useAuth();

    const navigate = useNavigate();
    const location = useLocation();
    const navRef = useRef(null);

    const [menuOpen, setMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    const storedUser = JSON.parse(localStorage.getItem("user") || "null");
    const storedRole = localStorage.getItem("role");

    const currentUser = user || storedUser;
    const displayRole = currentUser?.role || storedRole || "candidate";

    const getValidName = () => {
        const possibleName =
            currentUser?.name ||
            currentUser?.full_name ||
            currentUser?.username ||
            currentUser?.email?.split("@")[0] ||
            "User";

        if (
            !possibleName ||
            possibleName === "undefined" ||
            possibleName === "null"
        ) {
            return currentUser?.email?.split("@")[0] || "User";
        }

        return possibleName;
    };

    const displayName = getValidName();

    const isAdmin = displayRole === "admin";
    const isCandidate = displayRole === "candidate";
    const isRecruiter = displayRole === "recruiter" || displayRole === "company";

    const profilePath = isRecruiter
        ? "/recruiter/profile"
        : isAdmin
        ? "/admin/dashboard"
        : "/candidate-profile";

    const dashboardPath = isRecruiter
        ? "/recruiter/dashboard"
        : isAdmin
        ? "/admin/dashboard"
        : "/dashboard";

    useEffect(() => {
        const onScroll = () => {
            setScrolled(window.scrollY > 8);
        };

        window.addEventListener("scroll", onScroll, { passive: true });

        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    useEffect(() => {
        setMenuOpen(false);
    }, [location.pathname]);

    useEffect(() => {
        const handler = (e) => {
            if (
                navRef.current &&
                !navRef.current.contains(e.target)
            ) {
                setMenuOpen(false);
            }
        };

        if (menuOpen) {
            document.addEventListener("mousedown", handler);
        }

        return () => document.removeEventListener("mousedown", handler);
    }, [menuOpen]);

    useEffect(() => {
        document.body.style.overflow = menuOpen ? "hidden" : "";

        return () => {
            document.body.style.overflow = "";
        };
    }, [menuOpen]);

    const isActive = (path) =>
        path === "/"
            ? location.pathname === "/"
            : location.pathname.startsWith(path);

    const openLogoutModal = () => {
        setMenuOpen(false);
        setShowLogoutModal(true);
    };

    const closeLogoutModal = () => {
        setShowLogoutModal(false);
    };

    const handleLogout = () => {
        logout();

        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("role");

        setShowLogoutModal(false);
        toast.success("Logout successful");
        navigate("/login");
    };

    return (
        <>
            <div ref={navRef}>
                <nav
                    className={`
                        sticky top-0 z-50 w-full
                        bg-white/95 backdrop-blur-xl
                        border-b border-gray-100
                        transition-shadow duration-300
                        ${scrolled ? "shadow-lg" : ""}
                    `}
                >
                    <div className="w-full px-4 sm:px-6 lg:px-14 xl:px-20">
                        <div className="flex h-16 items-center justify-between gap-3 md:h-[74px] md:gap-8">
                            <Link
                                to="/"
                                className="
                                    flex-shrink-0
                                    text-2xl sm:text-[1.7rem]
                                    font-extrabold
                                    tracking-tight
                                    text-gray-900
                                    no-underline
                                    hover:opacity-80
                                    transition-opacity
                                "
                            >
                                Job<span className="text-blue-600">Portal</span>
                            </Link>

                            <ul className="
                                hidden md:flex items-center justify-center flex-1
                                gap-3 list-none m-0 p-0
                            ">
                                {NAV_LINKS.map((item) => (
                                    <li key={item.path}>
                                        <Link
                                            to={item.path}
                                            aria-current={isActive(item.path) ? "page" : undefined}
                                            className={`
                                                block px-4 py-2.5 rounded-xl no-underline
                                                text-[0.96rem] font-medium border-b-2
                                                transition-all duration-200
                                                ${
                                                    isActive(item.path)
                                                        ? "text-blue-600 bg-blue-50 font-semibold border-blue-600"
                                                        : "text-gray-600 border-transparent hover:text-blue-600 hover:bg-blue-50 hover:border-blue-600"
                                                }
                                            `}
                                        >
                                            {item.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>

                            <div className="hidden md:flex items-center gap-3 flex-shrink-0">
                                {currentUser || storedRole ? (
                                    <>
                                        <Link
                                            to={profilePath}
                                            className="
                                                flex items-center gap-2 px-3 py-2 rounded-xl
                                                bg-gray-50 border border-gray-100 no-underline
                                                hover:bg-blue-50 hover:border-blue-100 transition
                                            "
                                        >
                                            <div className="
                                                w-9 h-9 rounded-full bg-blue-600 text-white
                                                flex items-center justify-center text-sm font-bold
                                            ">
                                                {displayName.charAt(0).toUpperCase()}
                                            </div>

                                            <div className="leading-tight">
                                                <p className="text-sm font-semibold text-gray-800 m-0">
                                                    {displayName}
                                                </p>

                                                <p className="text-[11px] text-gray-500 capitalize m-0">
                                                    {displayRole}
                                                </p>
                                            </div>
                                        </Link>

                                        <Link
                                            to={dashboardPath}
                                            className="
                                                inline-flex items-center px-4 py-2.5 rounded-xl
                                                bg-gray-50 text-gray-700 text-[0.92rem]
                                                font-semibold no-underline hover:bg-blue-50
                                                hover:text-blue-600 transition-all duration-200
                                            "
                                        >
                                            {isAdmin ? "Admin Panel" : "Dashboard"}
                                        </Link>

                                        {isAdmin && (
                                            <Link
                                                to="/admin/contact-messages"
                                                className="
                                                    inline-flex items-center px-4 py-2.5 rounded-xl
                                                    bg-blue-50 text-blue-600 text-[0.92rem]
                                                    font-semibold no-underline hover:bg-blue-100
                                                    transition-all duration-200
                                                "
                                            >
                                                Messages
                                            </Link>
                                        )}

                                        {isCandidate && (
                                            <Link
                                                to="/my-applications"
                                                className="
                                                    inline-flex items-center px-4 py-2.5 rounded-xl
                                                    bg-blue-50 text-blue-600 text-[0.92rem]
                                                    font-semibold no-underline hover:bg-blue-100
                                                    transition-all duration-200
                                                "
                                            >
                                                My Applications
                                            </Link>
                                        )}

                                        <button
                                            type="button"
                                            onClick={openLogoutModal}
                                            className="
                                                inline-flex items-center px-5 py-2.5 rounded-xl
                                                bg-red-500 text-white text-[0.92rem] font-semibold
                                                border-none cursor-pointer hover:bg-red-600
                                                hover:-translate-y-0.5 hover:shadow-lg
                                                transition-all duration-200
                                            "
                                        >
                                            Logout
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <Link
                                            to="/login"
                                            className="
                                                inline-flex items-center px-5 py-2.5 rounded-xl
                                                border border-blue-600 text-blue-600 text-[0.92rem]
                                                font-semibold no-underline hover:bg-blue-600
                                                hover:text-white hover:-translate-y-0.5
                                                transition-all duration-200
                                            "
                                        >
                                            Login
                                        </Link>

                                        <Link
                                            to="/register"
                                            className="
                                                inline-flex items-center px-5 py-2.5 rounded-xl
                                                bg-blue-600 text-white text-[0.92rem]
                                                font-semibold no-underline hover:bg-blue-700
                                                hover:-translate-y-0.5 transition-all duration-200
                                            "
                                        >
                                            Sign Up
                                        </Link>
                                    </>
                                )}
                            </div>

                            <button
                                type="button"
                                onClick={() => setMenuOpen(!menuOpen)}
                                className="
                                    md:hidden w-11 h-11 rounded-xl border border-gray-200
                                    bg-white text-gray-700 flex items-center justify-center
                                    hover:bg-blue-50 hover:text-blue-600 transition
                                "
                                aria-label="Toggle menu"
                            >
                                {menuOpen ? "✕" : "☰"}
                            </button>
                        </div>
                    </div>

                    {menuOpen && (
                        <div className="
                            md:hidden bg-white border-t border-gray-100
                            px-4 py-4 animate-[fadeIn_0.2s_ease-in-out]
                        ">
                            <div className="flex max-h-[calc(100vh-4rem)] flex-col gap-2 overflow-y-auto pb-2">
                                {NAV_LINKS.map((item) => (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        className={`
                                            px-4 py-3 rounded-xl no-underline
                                            font-semibold transition
                                            ${
                                                isActive(item.path)
                                                    ? "bg-blue-50 text-blue-600"
                                                    : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                                            }
                                        `}
                                    >
                                        {item.name}
                                    </Link>
                                ))}

                                <div className="border-t border-gray-100 my-3"></div>

                                {currentUser || storedRole ? (
                                    <>
                                        <Link
                                            to={profilePath}
                                            className="
                                                px-4 py-3 rounded-xl bg-gray-50
                                                text-gray-800 no-underline font-semibold
                                            "
                                        >
                                            {displayName} · {displayRole}
                                        </Link>

                                        <Link
                                            to={dashboardPath}
                                            className="
                                                px-4 py-3 rounded-xl text-gray-700
                                                hover:bg-blue-50 hover:text-blue-600
                                                no-underline font-semibold transition
                                            "
                                        >
                                            {isAdmin ? "Admin Panel" : "Dashboard"}
                                        </Link>

                                        {isAdmin && (
                                            <Link
                                                to="/admin/contact-messages"
                                                className="
                                                    px-4 py-3 rounded-xl bg-blue-50
                                                    text-blue-600 no-underline font-semibold
                                                "
                                            >
                                                Messages
                                            </Link>
                                        )}

                                        {isCandidate && (
                                            <Link
                                                to="/my-applications"
                                                className="
                                                    px-4 py-3 rounded-xl bg-blue-50
                                                    text-blue-600 no-underline font-semibold
                                                "
                                            >
                                                My Applications
                                            </Link>
                                        )}

                                        <button
                                            type="button"
                                            onClick={openLogoutModal}
                                            className="
                                                mt-2 w-full px-4 py-3 rounded-xl
                                                bg-red-500 text-white font-semibold
                                                border-none cursor-pointer hover:bg-red-600
                                                transition text-left
                                            "
                                        >
                                            Logout
                                        </button>
                                    </>
                                ) : (
                                    <div className="grid grid-cols-2 gap-3">
                                        <Link
                                            to="/login"
                                            className="
                                                text-center px-4 py-3 rounded-xl
                                                border border-blue-600 text-blue-600
                                                no-underline font-semibold hover:bg-blue-600
                                                hover:text-white transition
                                            "
                                        >
                                            Login
                                        </Link>

                                        <Link
                                            to="/register"
                                            className="
                                                text-center px-4 py-3 rounded-xl bg-blue-600
                                                text-white no-underline font-semibold
                                                hover:bg-blue-700 transition
                                            "
                                        >
                                            Sign Up
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </nav>
            </div>

            {showLogoutModal && (
                <div className="
                    fixed inset-0 z-[999] flex items-center justify-center
                    bg-black/50 px-4
                ">
                    <div className="
                        w-full max-w-md rounded-3xl bg-white p-7
                        shadow-2xl border border-gray-100
                    ">
                        <div className="
                            w-14 h-14 rounded-2xl bg-red-100 text-red-600
                            flex items-center justify-center text-xl font-black mb-5
                        ">
                            LO
                        </div>

                        <h2 className="text-2xl font-bold text-gray-900">
                            Logout Account?
                        </h2>

                        <p className="mt-3 text-gray-500 leading-relaxed">
                            Are you sure you want to logout from your account?
                        </p>

                        <div className="mt-7 flex flex-col sm:flex-row gap-3 sm:justify-end">
                            <button
                                type="button"
                                onClick={closeLogoutModal}
                                className="
                                    px-6 py-3 rounded-xl border border-gray-300
                                    text-gray-700 font-semibold hover:bg-gray-100
                                    transition-all
                                "
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                onClick={handleLogout}
                                className="
                                    px-6 py-3 rounded-xl bg-red-600 text-white
                                    font-semibold hover:bg-red-700 transition-all
                                "
                            >
                                Yes, Logout
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default Navbar;
