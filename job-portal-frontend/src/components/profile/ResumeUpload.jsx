import { useState } from "react";

import { uploadResume } from "../../api/candidateProfileApi";

function ResumeUpload({ onSuccess }) {
    const [resume, setResume] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];

        setMessage("");
        setError("");

        if (!selectedFile) {
            setResume(null);
            return;
        }

        const allowedExtensions = ["pdf", "doc", "docx"];
        const fileExtension = selectedFile.name
            .split(".")
            .pop()
            .toLowerCase();

        if (!allowedExtensions.includes(fileExtension)) {
            setResume(null);
            setError("Only PDF, DOC, or DOCX files are allowed.");
            return;
        }

        setResume(selectedFile);
    };

    const handleUpload = async () => {
        if (!resume) {
            setError("Please select a resume first.");
            return;
        }

        try {
            setUploading(true);
            setMessage("");
            setError("");

            await uploadResume(resume);

            setMessage("Resume uploaded successfully.");
            setResume(null);

            if (onSuccess) {
                onSuccess();
            }
        } catch (err) {
            setError("Resume upload failed. Please try again.");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-5">
                Upload Resume
            </h2>

            {message && (
                <div className="mb-4 bg-green-100 border border-green-300 text-green-700 px-4 py-3 rounded-xl text-sm font-medium">
                    {message}
                </div>
            )}

            {error && (
                <div className="mb-4 bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-xl text-sm font-medium">
                    {error}
                </div>
            )}

            <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
                className="w-full border rounded-xl px-4 py-3 mb-4 bg-gray-50"
            />

            {resume && (
                <p className="text-sm text-gray-600 mb-4">
                    Selected file:{" "}
                    <span className="font-semibold text-gray-800">
                        {resume.name}
                    </span>
                </p>
            )}

            <button
                type="button"
                onClick={handleUpload}
                disabled={uploading}
                className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition disabled:bg-blue-400"
            >
                {uploading ? "Uploading..." : "Upload Resume"}
            </button>
        </div>
    );
}

export default ResumeUpload;