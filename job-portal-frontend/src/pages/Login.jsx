import { useState } from "react";

import { Link, useNavigate } from "react-router-dom";

import { FcGoogle } from "react-icons/fc";

import toast from "react-hot-toast";

import {
    loginUser,
    continueWithGoogle,
} from "../api/authApi";

import { useAuth } from "../context/AuthContext";

import loginImage from "../assets/images/login.png";

function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [imageError, setImageError] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const redirectByRole = (role) => {
        if (role === "admin") {
            navigate("/admin/dashboard", { replace: true });
            return;
        }

        if (role === "company" || role === "recruiter") {
            navigate("/recruiter/dashboard", { replace: true });
            return;
        }

        navigate("/dashboard", { replace: true });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setLoading(true);
            setErrorMessage("");

            const data = await loginUser(formData);

            const token = data?.access_token;
            const userData = data?.user || null;

            if (!token) {
                throw new Error("Token not received from server");
            }

            localStorage.setItem("token", token);

            if (userData) {
                localStorage.setItem("user", JSON.stringify(userData));
                localStorage.setItem(
                    "role",
                    userData.role || "candidate"
                );
            }

            if (login) {
                await login(token, userData);
            }

            toast.success("Login successful");

            redirectByRole(userData?.role || "candidate");
        } catch (error) {
            console.log(error);

            localStorage.removeItem("token");
            localStorage.removeItem("user");
            localStorage.removeItem("role");

            const message =
                error?.response?.data?.detail ||
                error?.message ||
                "Invalid email or password";

            setErrorMessage(message);
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-8 sm:px-6 sm:py-16">
            <div className="grid w-full max-w-6xl overflow-hidden rounded-3xl bg-white shadow-2xl lg:grid-cols-2">

                <div className="hidden lg:flex bg-blue-600 text-white p-14 flex-col justify-center">
                    <h1 className="text-5xl font-bold leading-tight">
                        Welcome Back 👋
                    </h1>

                    <p className="mt-6 text-blue-100 text-lg leading-relaxed">
                        Login to continue your journey and discover thousands of
                        opportunities from top companies.
                    </p>

                    <div className="mt-12 flex justify-center">
                        {!imageError ? (
                            <img
                                src={loginImage}
                                alt="Login"
                                onError={() => setImageError(true)}
                                className="w-full max-w-md object-contain"
                            />
                        ) : (
                            <div className="w-full max-w-md h-64 bg-white/15 rounded-3xl flex items-center justify-center text-8xl shadow-inner">
                                💼
                            </div>
                        )}
                    </div>
                </div>

                <div className="p-6 sm:p-10 lg:p-16">
                    <div className="max-w-md mx-auto">

                        <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
                            Login
                        </h2>

                        <p className="mt-3 text-gray-500">
                            Please enter your details
                        </p>

                        {errorMessage && (
                            <div className="mt-6 bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-2xl font-medium shadow-sm">
                                {errorMessage}
                            </div>
                        )}

                        <form
                            onSubmit={handleSubmit}
                            className="mt-8 space-y-5 sm:mt-10 sm:space-y-6"
                        >
                            <div>
                                <label className="block mb-2 text-sm font-semibold text-gray-700">
                                    Email Address
                                </label>

                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="Enter your email"
                                    required
                                    autoComplete="email"
                                    className="w-full px-5 py-4 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition"
                                />
                            </div>

                            <div>
                                <label className="block mb-2 text-sm font-semibold text-gray-700">
                                    Password
                                </label>

                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Enter your password"
                                    required
                                    autoComplete="current-password"
                                    className="w-full px-5 py-4 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition"
                                />
                            </div>

                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <label className="flex items-center gap-2 text-sm text-gray-600">
                                    <input type="checkbox" />
                                    Remember me
                                </label>

                                <Link
                                    to="/forgot-password"
                                    className="text-sm text-blue-600 hover:underline"
                                >
                                    Forgot Password?
                                </Link>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-blue-600 text-white py-4 rounded-xl font-semibold hover:bg-blue-700 hover:scale-[1.01] transition duration-300 shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {loading ? "Logging in..." : "Login"}
                            </button>
                        </form>

                        <div className="my-8 flex items-center">
                            <div className="flex-1 border-t border-gray-200"></div>

                            <span className="px-4 text-sm text-gray-400">
                                OR
                            </span>

                            <div className="flex-1 border-t border-gray-200"></div>
                        </div>

                        <button
                            type="button"
                            onClick={continueWithGoogle}
                            className="w-full flex items-center justify-center gap-3 border border-gray-300 rounded-xl py-4 font-semibold text-gray-800 hover:bg-gray-100 transition duration-300"
                        >
                            <FcGoogle className="text-2xl" />
                            Continue with Google
                        </button>

                        <p className="mt-8 text-center text-gray-600">
                            Don’t have an account?

                            <Link
                                to="/register"
                                className="ml-2 text-blue-600 font-semibold hover:underline"
                            >
                                Sign Up
                            </Link>
                        </p>

                    </div>
                </div>

            </div>
        </section>
    );
}

export default Login;
