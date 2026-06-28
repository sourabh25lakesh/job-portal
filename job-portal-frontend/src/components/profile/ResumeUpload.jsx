import { useRef, useState } from "react";
import toast from "react-hot-toast";

import { uploadResume } from "../../api/candidateProfileApi";

function ResumeUpload({ onSuccess }) {
    const [resume, setResume] = useState(null);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];

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
            toast.error("Only PDF, DOC, or DOCX files are allowed.");
            return;
        }

        setResume(selectedFile);
        toast.success("Resume selected.");
    };

    const handleUpload = async () => {
        if (!resume) {
            toast.error("Please select a resume first.");
            return;
        }

        try {
            setUploading(true);

            await uploadResume(resume);

            toast.success("Resume uploaded successfully.");
            setResume(null);

            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }

            if (onSuccess) {
                onSuccess();
            }
        } catch (err) {
            toast.error("Resume upload failed. Please try again.");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
            <div className="mb-5">
                <h2 className="text-xl font-bold text-gray-900">
                    Resume
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                    Upload PDF, DOC, or DOCX resume files.
                </p>
            </div>

            <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
                className="hidden"
            />

            <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="group w-full rounded-2xl border border-dashed border-blue-200 bg-blue-50/70 p-5 text-left transition duration-300 hover:border-blue-400 hover:bg-blue-50"
            >
                <div className="flex items-center gap-4">
                    <div className="grid h-12 w-12 place-items-center rounded-2xl bg-blue-600 text-sm font-black text-white transition duration-300 group-hover:scale-105">
                        CV
                    </div>

                    <div className="min-w-0">
                        <p className="font-bold text-gray-900">
                            {resume ? resume.name : "Choose resume file"}
                        </p>

                        <p className="mt-1 truncate text-sm text-gray-500">
                            {resume
                                ? `${Math.ceil(resume.size / 1024)} KB selected`
                                : "Click to browse from your computer"}
                        </p>
                    </div>
                </div>
            </button>

            <button
                type="button"
                onClick={handleUpload}
                disabled={uploading}
                className="mt-4 w-full rounded-2xl bg-blue-600 py-3 font-bold text-white transition duration-300 hover:-translate-y-1 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
                {uploading ? "Uploading..." : "Upload Resume"}
            </button>
        </div>
    );
}

export default ResumeUpload;
