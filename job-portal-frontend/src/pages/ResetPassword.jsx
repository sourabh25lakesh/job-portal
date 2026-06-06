import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { resetPassword } from "../api/passwordResetApi";

function ResetPassword() {
    const [searchParams] = useSearchParams();

    const token = searchParams.get("token");

    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!token) {
            setErrorMessage("Invalid or missing reset token.");
            return;
        }

        if (newPassword !== confirmPassword) {
            setErrorMessage("Passwords do not match.");
            return;
        }

        try {
            setLoading(true);
            setSuccessMessage("");
            setErrorMessage("");

            const data = await resetPassword(token, newPassword);

            setSuccessMessage(
                data.message || "Password reset successfully. You can login now."
            );

            setNewPassword("");
            setConfirmPassword("");
        } catch (error) {
            setErrorMessage(
                error.response?.data?.detail ||
                "Failed to reset password. Please try again."
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
                        🔑
                    </div>

                    <h1 className="text-3xl font-extrabold text-gray-900">
                        Reset Password
                    </h1>

                    <p className="mt-3 text-gray-500">
                        Create a new password for your account.
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
                            New Password
                        </label>

                        <input
                            type="password"
                            placeholder="Enter new password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                            minLength={6}
                            className="w-full px-5 py-4 rounded-2xl border border-gray-300 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100 transition-all"
                        />
                    </div>

                    <div>
                        <label className="block mb-2 text-sm font-bold text-gray-700">
                            Confirm Password
                        </label>

                        <input
                            type="password"
                            placeholder="Confirm new password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            minLength={6}
                            className="w-full px-5 py-4 rounded-2xl border border-gray-300 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100 transition-all"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white py-4 rounded-2xl font-bold hover:-translate-y-1 hover:shadow-xl transition-all duration-300"
                    >
                        {loading ? "Resetting..." : "Reset Password"}
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

export default ResetPassword;