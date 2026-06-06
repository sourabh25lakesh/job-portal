import { useState } from "react";
import { Link } from "react-router-dom";
import { forgotPassword } from "../api/passwordResetApi";

function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email.trim()) {
            setErrorMessage("Please enter your email address.");
            return;
        }

        try {
            setLoading(true);
            setSuccessMessage("");
            setErrorMessage("");

            const data = await forgotPassword(email.trim());

            setSuccessMessage(
                data.message ||
                "Password reset link sent successfully. Please check your email."
            );

            setEmail("");
        } catch (error) {
            setErrorMessage(
                error.response?.data?.detail ||
                "Failed to send reset link. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-100 flex items-center justify-center px-6 py-12">
            <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-gray-100 p-8 hover:shadow-2xl transition-all duration-300">
                <div className="text-center mb-8">
                    <div className="mx-auto w-16 h-16 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center text-3xl font-bold mb-5">
                        🔐
                    </div>

                    <h1 className="text-3xl font-extrabold text-gray-900">
                        Forgot Password?
                    </h1>

                    <p className="mt-3 text-gray-500">
                        Enter your email and we’ll send you a reset link.
                    </p>
                </div>

                {successMessage && (
                    <div className="mb-5 rounded-2xl bg-green-50 border border-green-200 text-green-700 px-5 py-4 font-medium">
                        {successMessage}
                    </div>
                )}

                {errorMessage && (
                    <div className="mb-5 rounded-2xl bg-red-50 border border-red-200 text-red-700 px-5 py-4 font-medium">
                        {errorMessage}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block mb-2 text-sm font-bold text-gray-700">
                            Email Address
                        </label>

                        <input
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full px-5 py-4 rounded-2xl border border-gray-300 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100 transition-all"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white py-4 rounded-2xl font-bold hover:-translate-y-1 hover:shadow-xl transition-all duration-300"
                    >
                        {loading ? "Sending..." : "Send Reset Link"}
                    </button>
                </form>

                <div className="mt-7 text-center">
                    <Link
                        to="/login"
                        className="text-blue-600 font-bold hover:text-blue-700 transition"
                    >
                        Back to Login
                    </Link>
                </div>
            </div>
        </section>
    );
}

export default ForgotPassword;