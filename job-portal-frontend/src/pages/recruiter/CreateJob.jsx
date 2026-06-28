import { useState } from "react";
import { createRecruiterJob } from "../../api/recruiterApi";

function CreateJob() {
  const [formData, setFormData] = useState({
    title: "",
    company_name: "",
    location: "",
    salary: "",
    description: "",
    skills: [],
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [skillInput, setSkillInput] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const addSkill = () => {
    const skill = skillInput.trim();

    if (!skill) return;

    const exists = formData.skills.some(
      (item) => item.toLowerCase() === skill.toLowerCase()
    );

    if (!exists) {
      setFormData({
        ...formData,
        skills: [...formData.skills, skill],
      });
    }

    setSkillInput("");
  };

  const removeSkill = (skill) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter((item) => item !== skill),
    });
  };

  const handleSkillKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addSkill();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await createRecruiterJob(formData);

      setMessage(
        response?.status === "approved"
          ? "Job posted successfully."
          : "Job submitted for admin approval. It will appear on the Jobs page after approval."
      );

      setFormData({
        title: "",
        company_name: "",
        location: "",
        salary: "",
        description: "",
        skills: [],
      });
      setSkillInput("");
    } catch (error) {
      setMessage(error.response?.data?.detail || "Job post failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 px-4 py-8 sm:px-6 sm:py-12">
      <div className="mx-auto max-w-3xl">
        <div className="rounded-3xl bg-white p-5 shadow-xl shadow-indigo-100 sm:p-6 md:p-10">
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
              Post New Job
            </h1>
            <p className="mt-2 text-sm text-slate-600 sm:text-base">
              Create a professional job post. New recruiter jobs are reviewed by admin before they go public.
            </p>
          </div>

          {message && (
            <div className="mb-6 rounded-2xl bg-indigo-50 px-4 py-3 font-medium text-indigo-700">
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            <input
              type="text"
              name="title"
              placeholder="Job Title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 sm:py-4"
            />

            <input
              type="text"
              name="company_name"
              placeholder="Company Name"
              value={formData.company_name}
              onChange={handleChange}
              required
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 sm:py-4"
            />

            <input
              type="text"
              name="location"
              placeholder="Location"
              value={formData.location}
              onChange={handleChange}
              required
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 sm:py-4"
            />

            <input
              type="text"
              name="salary"
              placeholder="Salary"
              value={formData.salary}
              onChange={handleChange}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 sm:py-4"
            />

            <textarea
              name="description"
              placeholder="Job Description"
              value={formData.description}
              onChange={handleChange}
              rows="6"
              required
              className="w-full resize-none rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 sm:py-4"
            />

            <div className="rounded-2xl border border-slate-200 p-4">
              <label className="text-sm font-bold text-slate-700">
                Required Skills
              </label>

              <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={handleSkillKeyDown}
                  placeholder="Type a skill and press Enter"
                  className="w-full flex-1 rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
                />

                <button
                  type="button"
                  onClick={addSkill}
                  className="w-full rounded-xl bg-slate-900 px-5 py-3 font-bold text-white transition hover:bg-slate-700 sm:w-auto"
                >
                  Add
                </button>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {formData.skills.length > 0 ? (
                  formData.skills.map((skill) => (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className="rounded-full bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700 transition hover:bg-red-50 hover:text-red-700"
                    >
                      {skill} ×
                    </button>
                  ))
                ) : (
                  <p className="text-sm text-slate-500">
                    Add skills like Python, MySQL, React, FastAPI.
                  </p>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 px-6 py-3 font-bold text-white transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-200 disabled:cursor-not-allowed disabled:opacity-60 sm:py-4"
            >
              {loading ? "Submitting..." : "Submit for Approval"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

export default CreateJob;
