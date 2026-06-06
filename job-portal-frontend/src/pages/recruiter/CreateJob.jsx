import { useState } from "react";
import { createRecruiterJob } from "../../api/recruiterApi";

function CreateJob() {
  const [formData, setFormData] = useState({
    title: "",
    company_name: "",
    location: "",
    salary: "",
    description: "",
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      await createRecruiterJob(formData);

      setMessage("Job posted successfully.");

      setFormData({
        title: "",
        company_name: "",
        location: "",
        salary: "",
        description: "",
      });
    } catch (error) {
      setMessage(error.response?.data?.detail || "Job post failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 px-4 py-12">
      <div className="mx-auto max-w-3xl">
        <div className="rounded-3xl bg-white p-6 shadow-xl shadow-indigo-100 md:p-10">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900">
              Post New Job
            </h1>
            <p className="mt-2 text-slate-600">
              Create a clean and professional job post for candidates.
            </p>
          </div>

          {message && (
            <div className="mb-6 rounded-2xl bg-indigo-50 px-4 py-3 font-medium text-indigo-700">
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <input
              type="text"
              name="title"
              placeholder="Job Title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full rounded-2xl border border-slate-200 px-4 py-4 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
            />

            <input
              type="text"
              name="company_name"
              placeholder="Company Name"
              value={formData.company_name}
              onChange={handleChange}
              required
              className="w-full rounded-2xl border border-slate-200 px-4 py-4 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
            />

            <input
              type="text"
              name="location"
              placeholder="Location"
              value={formData.location}
              onChange={handleChange}
              required
              className="w-full rounded-2xl border border-slate-200 px-4 py-4 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
            />

            <input
              type="text"
              name="salary"
              placeholder="Salary"
              value={formData.salary}
              onChange={handleChange}
              className="w-full rounded-2xl border border-slate-200 px-4 py-4 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
            />

            <textarea
              name="description"
              placeholder="Job Description"
              value={formData.description}
              onChange={handleChange}
              rows="6"
              required
              className="w-full resize-none rounded-2xl border border-slate-200 px-4 py-4 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 px-6 py-4 font-bold text-white transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Posting..." : "Post Job"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

export default CreateJob;