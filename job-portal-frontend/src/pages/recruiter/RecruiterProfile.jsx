import { useEffect, useState } from "react";

import toast from "react-hot-toast";

import {
    createRecruiterProfile,
    getRecruiterProfile,
} from "../../api/recruiterApi";

function RecruiterProfile() {
    const [formData, setFormData] = useState({
        company_name: "",
        company_website: "",
        company_location: "",
        company_description: "",
    });

    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(true);

    useEffect(() => {
        fetchRecruiterProfile();
    }, []);

    const fetchRecruiterProfile = async () => {
        try {
            setPageLoading(true);
            setMessage("");

            const data = await getRecruiterProfile();

            setFormData({
                company_name: data.company_name || "",
                company_website: data.company_website || "",
                company_location: data.company_location || "",
                company_description: data.company_description || "",
            });
        } catch (error) {
            if (error.response?.status !== 404) {
                const errorText =
                    error.response?.data?.detail ||
                    "Failed to load recruiter profile";

                setMessage(errorText);
                toast.error(errorText);
            }
        } finally {
            setPageLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setLoading(true);
            setMessage("");

            await createRecruiterProfile(formData);

            const successText = "Recruiter profile saved successfully";

            setMessage(successText);
            toast.success(successText);
        } catch (error) {
            const errorText =
                error.response?.data?.detail ||
                "Something went wrong";

            setMessage(errorText);
            toast.error(errorText);
        } finally {
            setLoading(false);
        }
    };

    if (pageLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="w-14 h-14 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <section className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 px-4 py-12">
            <div className="mx-auto max-w-3xl">
                <div className="rounded-3xl bg-white p-6 shadow-xl shadow-blue-100 md:p-10">
                    <div className="mb-8">
                        <span className="inline-block rounded-full bg-blue-100 px-4 py-2 text-sm font-bold text-blue-700">
                            Recruiter Profile
                        </span>

                        <h1 className="mt-5 text-3xl font-bold text-slate-900">
                            Create Recruiter Profile
                        </h1>

                        <p className="mt-2 text-slate-600">
                            Add your company details before posting jobs.
                        </p>
                    </div>

                    {message && (
                        <div className="mb-6 rounded-2xl bg-blue-50 px-4 py-3 font-medium text-blue-700">
                            {message}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <input
                            type="text"
                            name="company_name"
                            placeholder="Company Name"
                            value={formData.company_name}
                            onChange={handleChange}
                            required
                            className="w-full rounded-2xl border border-slate-200 px-4 py-4 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                        />

                        <input
                            type="text"
                            name="company_website"
                            placeholder="Company Website"
                            value={formData.company_website}
                            onChange={handleChange}
                            className="w-full rounded-2xl border border-slate-200 px-4 py-4 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                        />

                        <input
                            type="text"
                            name="company_location"
                            placeholder="Company Location"
                            value={formData.company_location}
                            onChange={handleChange}
                            className="w-full rounded-2xl border border-slate-200 px-4 py-4 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                        />

                        <textarea
                            name="company_description"
                            placeholder="Company Description"
                            value={formData.company_description}
                            onChange={handleChange}
                            rows="5"
                            className="w-full resize-none rounded-2xl border border-slate-200 px-4 py-4 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                        />

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 font-bold text-white transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-200 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {loading ? "Saving..." : "Save Profile"}
                        </button>
                    </form>
                </div>
            </div>
        </section>
    );
}

export default RecruiterProfile;