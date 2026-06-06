import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { createJob } from "../api/jobApi";

function CreateJob() {

    const navigate = useNavigate();

    // ================= STATES =================

    const [formData, setFormData] = useState({

        title: "",
        company_name: "",
        location: "",
        salary: "",
        description: "",

    });

    const [loading, setLoading] = useState(false);

    // ================= HANDLE CHANGE =================

    const handleChange = (e) => {

        setFormData({

            ...formData,

            [e.target.name]: e.target.value,

        });
    };

    // ================= HANDLE SUBMIT =================

    const handleSubmit = async (e) => {

        e.preventDefault();

        try {

            setLoading(true);

            await createJob(formData);

            alert("Job Created Successfully");

            navigate("/jobs");

        } catch (error) {

            console.log(error);

            alert("Failed to create job");

        } finally {

            setLoading(false);
        }
    };

    return (

        <section className="min-h-screen bg-gray-50 py-14 px-6">

            <div className="max-w-4xl mx-auto">

                <div className="
                    bg-white
                    rounded-3xl
                    shadow-xl
                    border
                    border-gray-100
                    p-8
                    md:p-12
                ">

                    {/* HEADER */}

                    <div className="mb-10">

                        <h1 className="
                            text-4xl
                            font-bold
                            text-gray-900
                        ">

                            Create New Job

                        </h1>

                        <p className="
                            mt-3
                            text-lg
                            text-gray-500
                        ">

                            Post a new opportunity for candidates.

                        </p>

                    </div>

                    {/* FORM */}

                    <form
                        onSubmit={handleSubmit}
                        className="space-y-6"
                    >

                        {/* TITLE */}

                        <div>

                            <label className="
                                block
                                mb-2
                                text-sm
                                font-semibold
                                text-gray-700
                            ">

                                Job Title

                            </label>

                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                required
                                placeholder="Frontend Developer"
                                className="
                                    w-full
                                    px-5
                                    py-4
                                    border
                                    border-gray-300
                                    rounded-xl
                                    outline-none
                                    focus:ring-2
                                    focus:ring-blue-500
                                "
                            />

                        </div>

                        {/* COMPANY */}

                        <div>

                            <label className="
                                block
                                mb-2
                                text-sm
                                font-semibold
                                text-gray-700
                            ">

                                Company Name

                            </label>

                            <input
                                type="text"
                                name="company_name"
                                value={formData.company_name}
                                onChange={handleChange}
                                required
                                placeholder="Google"
                                className="
                                    w-full
                                    px-5
                                    py-4
                                    border
                                    border-gray-300
                                    rounded-xl
                                    outline-none
                                    focus:ring-2
                                    focus:ring-blue-500
                                "
                            />

                        </div>

                        {/* LOCATION */}

                        <div>

                            <label className="
                                block
                                mb-2
                                text-sm
                                font-semibold
                                text-gray-700
                            ">

                                Location

                            </label>

                            <input
                                type="text"
                                name="location"
                                value={formData.location}
                                onChange={handleChange}
                                required
                                placeholder="Bangalore, India"
                                className="
                                    w-full
                                    px-5
                                    py-4
                                    border
                                    border-gray-300
                                    rounded-xl
                                    outline-none
                                    focus:ring-2
                                    focus:ring-blue-500
                                "
                            />

                        </div>

                        {/* SALARY */}

                        <div>

                            <label className="
                                block
                                mb-2
                                text-sm
                                font-semibold
                                text-gray-700
                            ">

                                Salary

                            </label>

                            <input
                                type="text"
                                name="salary"
                                value={formData.salary}
                                onChange={handleChange}
                                required
                                placeholder="10 LPA"
                                className="
                                    w-full
                                    px-5
                                    py-4
                                    border
                                    border-gray-300
                                    rounded-xl
                                    outline-none
                                    focus:ring-2
                                    focus:ring-blue-500
                                "
                            />

                        </div>

                        {/* DESCRIPTION */}

                        <div>

                            <label className="
                                block
                                mb-2
                                text-sm
                                font-semibold
                                text-gray-700
                            ">

                                Job Description

                            </label>

                            <textarea
                                rows="6"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                required
                                placeholder="Write job details..."
                                className="
                                    w-full
                                    px-5
                                    py-4
                                    border
                                    border-gray-300
                                    rounded-xl
                                    outline-none
                                    focus:ring-2
                                    focus:ring-blue-500
                                    resize-none
                                "
                            ></textarea>

                        </div>

                        {/* BUTTON */}

                        <button
                            type="submit"
                            disabled={loading}
                            className="
                                w-full
                                bg-blue-600
                                hover:bg-blue-700
                                text-white
                                py-4
                                rounded-xl
                                font-semibold
                                transition
                                shadow-lg
                                disabled:opacity-70
                            "
                        >

                            {
                                loading
                                    ? "Creating Job..."
                                    : "Create Job"
                            }

                        </button>

                    </form>

                </div>

            </div>

        </section>
    );
}

export default CreateJob;