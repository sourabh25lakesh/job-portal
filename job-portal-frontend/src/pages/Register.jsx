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
        full_name: "",
        email: "",
        password: "",
        confirm_password: "",
        role: "candidate",
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

    const handleSubmit = async (e) => {
        e.preventDefault();

        setErrorMessage("");

        if (formData.password !== formData.confirm_password) {
            const message = "Passwords do not match";
            setErrorMessage(message);
            toast.error(message);
            return;
        }

        try {
            setLoading(true);

            await registerUser({
                full_name: formData.full_name,
                email: formData.email,
                password: formData.password,
                role: formData.role,
            });

            toast.success("Account created successfully");

            setTimeout(() => {
                navigate("/login");
            }, 800);
        } catch (error) {
            console.log(error);

            const message =
                error.response?.data?.detail ||
                "Registration failed";

            setErrorMessage(message);
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="min-h-screen bg-gray-50 flex items-center justify-center px-6 py-16">
            <div className="w-full max-w-6xl grid lg:grid-cols-2 bg-white rounded-3xl overflow-hidden shadow-2xl">
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

                <div className="p-8 sm:p-12 lg:p-16">
                    <div className="max-w-md mx-auto">
                        <h2 className="text-4xl font-bold text-gray-900">
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

                        <form
                            onSubmit={handleSubmit}
                            className="mt-10 space-y-5"
                        >
                            <div>
                                <label className="block mb-2 text-sm font-semibold text-gray-700">
                                    Full Name
                                </label>

                                <input
                                    type="text"
                                    name="full_name"
                                    value={formData.full_name}
                                    onChange={handleChange}
                                    placeholder="Enter your full name"
                                    required
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
                                    <option value="candidate">
                                        Candidate
                                    </option>

                                    <option value="recruiter">
                                        Recruiter
                                    </option>
                                </select>
                            </div>

                            <label className="flex items-start gap-3 text-sm text-gray-600">
                                <input
                                    type="checkbox"
                                    className="mt-1"
                                    required
                                />

                                I agree to the Terms & Conditions and Privacy
                                Policy
                            </label>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-blue-600 text-white py-4 rounded-xl font-semibold hover:bg-blue-700 hover:scale-[1.01] transition duration-300 shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {loading
                                    ? "Creating Account..."
                                    : "Create Account"}
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
                            className="
                                w-full
                                flex
                                items-center
                                justify-center
                                gap-3
                                border
                                border-gray-300
                                py-4
                                rounded-xl
                                font-semibold
                                text-gray-800
                                hover:bg-gray-100
                                hover:border-gray-400
                                transition
                            "
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