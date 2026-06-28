import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

import {
    getCandidateProfile,
    updateCandidateProfile,
} from "../api/candidateProfileApi";

import ProfileCard from "../components/profile/ProfileCard";
import ResumeUpload from "../components/profile/ResumeUpload";

const skillOptions = [
    "Python",
    "FastAPI",
    "Django",
    "Flask",
    "JavaScript",
    "React",
    "Node.js",
    "Express.js",
    "HTML",
    "CSS",
    "Tailwind CSS",
    "Bootstrap",
    "SQL",
    "MySQL",
    "PostgreSQL",
    "MongoDB",
    "REST API",
    "Git",
    "GitHub",
    "Docker",
    "AWS",
    "Java",
    "C",
    "C++",
    "NumPy",
    "Pandas",
    "AI",
];

function CandidateProfile() {
    const [profile, setProfile] = useState({
        bio: "",
        skills: "",
        experience: "",
        education: "",
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [skillSearch, setSkillSearch] = useState("");
    const [showEditForm, setShowEditForm] = useState(false);

    useEffect(() => {
        fetchProfile();
    }, []);

    const skillsArray = useMemo(() => {
        return profile.skills
            ? profile.skills
                  .split(",")
                  .map((skill) => skill.trim())
                  .filter(Boolean)
            : [];
    }, [profile.skills]);

    const filteredSkills = skillOptions.filter((skill) => {
        const alreadyAdded = skillsArray.some(
            (item) => item.toLowerCase() === skill.toLowerCase()
        );

        return (
            skill.toLowerCase().includes(skillSearch.toLowerCase()) &&
            !alreadyAdded
        );
    });

    const fetchProfile = async () => {
        try {
            const data = await getCandidateProfile();

            setProfile({
                bio: data?.bio || "",
                skills: data?.skills || "",
                experience: data?.experience || "",
                education: data?.education || "",
            });

        } catch (err) {
            setShowEditForm(true);
            toast.error("Please complete your candidate profile.");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setProfile({
            ...profile,
            [e.target.name]: e.target.value,
        });
    };

    const handleAddSkill = (skill) => {
        if (!skill.trim()) return;

        const exists = skillsArray.some(
            (item) => item.toLowerCase() === skill.toLowerCase()
        );

        if (exists) return;

        setProfile({
            ...profile,
            skills: [...skillsArray, skill.trim()].join(", "),
        });

        setSkillSearch("");
    };

    const handleRemoveSkill = (skillToRemove) => {
        setProfile({
            ...profile,
            skills: skillsArray
                .filter((skill) => skill !== skillToRemove)
                .join(", "),
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setSaving(true);

            await updateCandidateProfile(profile);
            await fetchProfile();

            toast.success("Profile updated successfully.");
            setShowEditForm(false);
        } catch (err) {
            toast.error("Profile update failed.");
        } finally {
            setSaving(false);
        }
    };

    const completedFields = Object.values(profile).filter(
        (value) => value.trim() !== ""
    ).length;

    const completionPercentage = Math.round((completedFields / 4) * 100);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <p className="text-gray-600 text-lg">Loading profile...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 sm:py-10">
            <div className="max-w-6xl mx-auto">
                <div className="mb-6 sm:mb-8">
                    <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                        Candidate Profile
                    </h1>

                    <p className="mt-2 text-sm text-gray-500 sm:text-base">
                        Manage your profile, resume, skills, and job applications.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-5 lg:grid-cols-3 lg:gap-6">
                    <div className="lg:col-span-1 space-y-6">
                        <ProfileCard completionPercentage={completionPercentage} />

                        <ResumeUpload onSuccess={fetchProfile} />

                        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg sm:p-6">
                            <div className="flex items-center justify-between mb-5">
                                <h2 className="text-xl font-bold text-gray-900">
                                    Skills
                                </h2>

                                <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-sm font-bold">
                                    {skillsArray.length}
                                </span>
                            </div>

                            {skillsArray.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {skillsArray.map((skill) => (
                                        <span
                                            key={skill}
                                            className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-2 rounded-full text-sm font-semibold"
                                        >
                                            {skill}

                                            <button
                                                type="button"
                                                onClick={() => handleRemoveSkill(skill)}
                                                className="w-5 h-5 flex items-center justify-center rounded-full bg-red-100 text-red-600 hover:bg-red-600 hover:text-white transition"
                                            >
                                                ×
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 text-sm">
                                    No skills added yet.
                                </p>
                            )}
                        </div>

                        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg sm:p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-5">
                                Quick Actions
                            </h2>

                            <div className="space-y-3">
                                <Link
                                    to="/jobs"
                                    className="block text-center bg-gray-100 py-3 rounded-xl font-semibold hover:bg-gray-200 transition"
                                >
                                    Browse Jobs
                                </Link>

                                <Link
                                    to="/my-applications"
                                    className="block text-center bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition"
                                >
                                    My Applications
                                </Link>

                                <Link
                                    to="/dashboard"
                                    className="block text-center bg-gray-100 py-3 rounded-xl font-semibold hover:bg-gray-200 transition"
                                >
                                    Dashboard
                                </Link>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-2 space-y-6">
                        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg sm:p-6">
                            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">
                                    My Profile
                                </h2>

                                <button
                                    type="button"
                                    onClick={() => setShowEditForm(true)}
                                    className="w-full rounded-2xl bg-blue-600 px-5 py-3 font-bold text-white transition duration-300 hover:-translate-y-1 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-100 sm:w-auto"
                                >
                                    Edit Profile
                                </button>
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5">
                                <div className="bg-gray-50 rounded-xl p-4">
                                    <p className="text-sm text-gray-500 font-semibold mb-1">
                                        Bio / About
                                    </p>

                                    <p className="text-gray-800">
                                        {profile.bio || "No bio added yet"}
                                    </p>
                                </div>

                                <div className="bg-gray-50 rounded-xl p-4">
                                    <p className="text-sm text-gray-500 font-semibold mb-2">
                                        Skills
                                    </p>

                                    {skillsArray.length > 0 ? (
                                        <div className="flex flex-wrap gap-2">
                                            {skillsArray.map((skill) => (
                                                <span
                                                    key={skill}
                                                    className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold"
                                                >
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-gray-800">
                                            No skills added yet
                                        </p>
                                    )}
                                </div>

                                <div className="bg-gray-50 rounded-xl p-4">
                                    <p className="text-sm text-gray-500 font-semibold mb-1">
                                        Experience
                                    </p>

                                    <p className="text-gray-800">
                                        {profile.experience || "No experience added yet"}
                                    </p>
                                </div>

                                <div className="bg-gray-50 rounded-xl p-4">
                                    <p className="text-sm text-gray-500 font-semibold mb-1">
                                        Education
                                    </p>

                                    <p className="text-gray-800">
                                        {profile.education || "No education added yet"}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {showEditForm && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 px-3 py-4 sm:px-4 sm:py-8">
                                <form
                                    onSubmit={handleSubmit}
                                    className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-3xl border border-gray-100 bg-white p-5 shadow-2xl sm:p-6"
                                >
                                    <div className="mb-6 flex items-start justify-between gap-4 border-b border-gray-100 pb-5">
                                        <div>
                                            <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">
                                                Edit Profile
                                            </h2>

                                            <p className="mt-1 text-sm text-gray-500">
                                                Update your profile details shown to recruiters.
                                            </p>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => setShowEditForm(false)}
                                            disabled={saving}
                                            className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-gray-100 font-bold text-gray-600 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-60"
                                            aria-label="Close edit profile modal"
                                        >
                                            X
                                        </button>
                                    </div>

                                    <div className="mb-5">
                                        <label className="mb-2 block font-semibold text-gray-700">
                                            Bio / About
                                        </label>

                                        <textarea
                                            name="bio"
                                            value={profile.bio}
                                            onChange={handleChange}
                                            rows="4"
                                            placeholder="Write something about yourself..."
                                            className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>

                                    <div className="mb-5">
                                        <div className="mb-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                            <label className="block font-semibold text-gray-700">
                                                Skills
                                            </label>

                                            <div className="w-full md:w-80 relative">
                                                <input
                                                    type="text"
                                                    value={skillSearch}
                                                    onChange={(e) =>
                                                        setSkillSearch(e.target.value)
                                                    }
                                                    placeholder="Search language / skill..."
                                                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:ring-2 focus:ring-blue-500"
                                                />

                                                {skillSearch && (
                                                    <div className="absolute z-20 mt-2 w-full bg-white border border-gray-100 rounded-xl shadow-lg max-h-56 overflow-y-auto">
                                                        {filteredSkills.length > 0 ? (
                                                            filteredSkills.map((skill) => (
                                                                <button
                                                                    key={skill}
                                                                    type="button"
                                                                    onClick={() =>
                                                                        handleAddSkill(skill)
                                                                    }
                                                                    className="w-full text-left px-4 py-3 hover:bg-blue-50 transition text-gray-700 font-medium"
                                                                >
                                                                    {skill}
                                                                </button>
                                                            ))
                                                        ) : (
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    handleAddSkill(skillSearch)
                                                                }
                                                                className="w-full text-left px-4 py-3 hover:bg-blue-50 transition text-blue-600 font-semibold"
                                                            >
                                                                Add "{skillSearch}"
                                                            </button>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <select
                                            value=""
                                            onChange={(e) =>
                                                handleAddSkill(e.target.value)
                                            }
                                            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none transition focus:ring-2 focus:ring-blue-500"
                                        >
                                        <option value="">
                                            Select skill from dropdown
                                        </option>

                                        {skillOptions
                                            .filter(
                                                (skill) =>
                                                    !skillsArray.some(
                                                        (item) =>
                                                            item.toLowerCase() ===
                                                            skill.toLowerCase()
                                                    )
                                            )
                                            .map((skill) => (
                                                <option key={skill} value={skill}>
                                                    {skill}
                                                </option>
                                            ))}
                                    </select>

                                    <div className="mt-4 flex flex-wrap gap-2">
                                        {skillsArray.length > 0 ? (
                                            skillsArray.map((skill) => (
                                                <span
                                                    key={skill}
                                                    className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-2 rounded-full text-sm font-semibold border border-blue-100"
                                                >
                                                    {skill}

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleRemoveSkill(skill)
                                                        }
                                                        className="w-5 h-5 flex items-center justify-center rounded-full bg-red-100 text-red-600 hover:bg-red-600 hover:text-white transition"
                                                    >
                                                        ×
                                                    </button>
                                                </span>
                                            ))
                                        ) : (
                                            <p className="text-gray-500 text-sm">
                                                Search or select skills to add.
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="mb-5">
                                    <label className="block font-semibold text-gray-700 mb-2">
                                        Experience
                                    </label>

                                    <textarea
                                        name="experience"
                                        value={profile.experience}
                                        onChange={handleChange}
                                        rows="4"
                                        placeholder="Add your work experience..."
                                        className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div className="mb-6">
                                    <label className="block font-semibold text-gray-700 mb-2">
                                        Education
                                    </label>

                                    <textarea
                                        name="education"
                                        value={profile.education}
                                        onChange={handleChange}
                                        rows="4"
                                        placeholder="Add your education details..."
                                        className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="w-full rounded-xl bg-blue-600 py-3 font-semibold text-white transition duration-300 hover:-translate-y-1 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-100 disabled:bg-blue-400"
                                >
                                    {saving ? "Saving..." : "Save Profile"}
                                </button>
                                </form>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CandidateProfile;
