import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import toast from "react-hot-toast";

import {
    registerUser,
    continueWithGoogle,
} from "../api/authApi";

import registerImage from "../assets/images/register.png";

function Register() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirm_password: "",
        role: "candidate",
    });

    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [imageError, setImageError] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage("");

        const name = formData.name.trim();
        const email = formData.email.trim().toLowerCase();
        const password = formData.password.trim();
        const confirmPassword = formData.confirm_password.trim();
        const role = formData.role;

        if (!name) {
            const message = "Full name is required";
            setErrorMessage(message);
            toast.error(message);
            return;
        }

        if (!email) {
            const message = "Email is required";
            setErrorMessage(message);
            toast.error(message);
            return;
        }

        if (password.length < 6) {
            const message = "Password must be at least 6 characters";
            setErrorMessage(message);
            toast.error(message);
            return;
        }

        if (password !== confirmPassword) {
            const message = "Passwords do not match";
            setErrorMessage(message);
            toast.error(message);
            return;
        }

        try {
            setLoading(true);

            await registerUser({
                name,
                full_name: name,
                email,
                password,
                role,
            });

            toast.success("Account created successfully");

            setFormData({
                name: "",
                email: "",
                password: "",
                confirm_password: "",
                role: "candidate",
            });

            setTimeout(() => {
                navigate("/login");
            }, 800);
        } catch (error) {
            console.log(error);

            const detail = error?.response?.data?.detail;

            const message = Array.isArray(detail)
                ? detail.map((err) => err?.msg).join(", ")
                : detail || error?.message || "Registration failed";

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
                        Start Your Career..
                    </h1>

                    <p className="mt-6 text-blue-100 text-lg leading-relaxed">
                        Create your account and explore thousands of
                        opportunities from the world's top companies.
                    </p>

                    <div className="mt-12 flex justify-center">
                        {!imageError ? (
                            <img
                                src={registerImage}
                                alt="Register"
                                onError={() => setImageError(true)}
                                className="w-full max-w-md object-contain"
                            />
                        ) : (
                            <div className="w-full max-w-md h-64 bg-white/15 rounded-3xl flex items-center justify-center text-8xl shadow-inner">
                                🚀
                            </div>
                        )}
                    </div>
                </div>

                <div className="p-6 sm:p-10 lg:p-16">
                    <div className="max-w-md mx-auto">
                        <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
                            Create Account
                        </h2>

                        <p className="mt-3 text-gray-500">
                            Please fill your information
                        </p>

                        {errorMessage && (
                            <div className="mt-6 bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-2xl font-medium shadow-sm">
                                {errorMessage}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="mt-8 space-y-5 sm:mt-10">
                            <div>
                                <label className="block mb-2 text-sm font-semibold text-gray-700">
                                    Full Name
                                </label>

                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Enter your full name"
                                    required
                                    autoComplete="name"
                                    className="w-full px-5 py-4 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition"
                                />
                            </div>

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
                                    placeholder="Create password"
                                    required
                                    autoComplete="new-password"
                                    className="w-full px-5 py-4 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition"
                                />
                            </div>

                            <div>
                                <label className="block mb-2 text-sm font-semibold text-gray-700">
                                    Confirm Password
                                </label>

                                <input
                                    type="password"
                                    name="confirm_password"
                                    value={formData.confirm_password}
                                    onChange={handleChange}
                                    placeholder="Confirm password"
                                    required
                                    autoComplete="new-password"
                                    className="w-full px-5 py-4 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition"
                                />
                            </div>

                            <div>
                                <label className="block mb-2 text-sm font-semibold text-gray-700">
                                    Select Role
                                </label>

                                <select
                                    name="role"
                                    value={formData.role}
                                    onChange={handleChange}
                                    className="w-full px-5 py-4 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition bg-white"
                                >
                                    <option value="candidate">Candidate</option>
                                    <option value="recruiter">Recruiter</option>
                                </select>
                            </div>

                            <label className="flex items-start gap-3 text-sm text-gray-600">
                                <input type="checkbox" className="mt-1" required />
                                I agree to the Terms & Conditions and Privacy Policy
                            </label>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-blue-600 text-white py-4 rounded-xl font-semibold hover:bg-blue-700 hover:scale-[1.01] transition duration-300 shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {loading ? "Creating Account..." : "Create Account"}
                            </button>
                        </form>

                        <div className="my-8 flex items-center">
                            <div className="flex-1 border-t border-gray-200"></div>
                            <span className="px-4 text-sm text-gray-400">OR</span>
                            <div className="flex-1 border-t border-gray-200"></div>
                        </div>

                        <button
                            type="button"
                            onClick={continueWithGoogle}
                            className="w-full flex items-center justify-center gap-3 border border-gray-300 py-4 rounded-xl font-semibold text-gray-800 hover:bg-gray-100 hover:border-gray-400 transition"
                        >
                            <FcGoogle className="text-2xl" />
                            Continue with Google
                        </button>

                        <p className="mt-8 text-center text-gray-600">
                            Already have an account?
                            <Link
                                to="/login"
                                className="ml-2 text-blue-600 font-semibold hover:underline"
                            >
                                Login
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default Register;
