import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

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
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
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

            setError("");
        } catch (err) {
            setError("Please complete your candidate profile.");
            setShowEditForm(true);
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
            setMessage("");
            setError("");

            await updateCandidateProfile(profile);
            await fetchProfile();

            setMessage("Profile updated successfully.");
            setShowEditForm(false);
        } catch (err) {
            setError("Profile update failed.");
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
        <div className="min-h-screen bg-gray-50 px-4 py-8">
            <div className="max-w-6xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">
                        Candidate Profile
                    </h1>

                    <p className="text-gray-500 mt-2">
                        Manage your profile, resume, skills, and job applications.
                    </p>
                </div>

                {message && (
                    <div className="mb-5 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl">
                        {message}
                    </div>
                )}

                {error && (
                    <div className="mb-5 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-1 space-y-6">
                        <ProfileCard completionPercentage={completionPercentage} />

                        <ResumeUpload onSuccess={fetchProfile} />

                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
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

                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
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
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-gray-900">
                                    My Profile
                                </h2>

                                <button
                                    type="button"
                                    onClick={() => setShowEditForm(!showEditForm)}
                                    className={`px-4 py-2 rounded-xl font-semibold transition ${
                                        showEditForm
                                            ? "bg-red-50 text-red-600 hover:bg-red-100"
                                            : "bg-blue-600 text-white hover:bg-blue-700"
                                    }`}
                                >
                                    {showEditForm ? "✕ Close Edit" : "✏️ Edit Profile"}
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
                            <form
                                onSubmit={handleSubmit}
                                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
                            >
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                                    Edit Profile
                                </h2>

                                <div className="mb-5">
                                    <label className="block font-semibold text-gray-700 mb-2">
                                        Bio / About
                                    </label>

                                    <textarea
                                        name="bio"
                                        value={profile.bio}
                                        onChange={handleChange}
                                        rows="4"
                                        placeholder="Write something about yourself..."
                                        className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div className="mb-5">
                                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-3">
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
                                                className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
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
                                        className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 bg-white"
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
                                        className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
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
                                        className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition disabled:bg-blue-400"
                                >
                                    {saving ? "Saving..." : "Save Profile"}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CandidateProfile;