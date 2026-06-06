import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

function GoogleSuccess() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    useEffect(() => {
        const token = searchParams.get("token");
        const role = searchParams.get("role") || "candidate";

        if (!token) {
            navigate("/login");
            return;
        }

        localStorage.setItem("token", token);
        localStorage.setItem("role", role);

        setTimeout(() => {
            if (role === "admin") {
                navigate("/admin/dashboard");
            }
            else if (role === "company" || role === "recruiter") {
                navigate("/recruiter/dashboard");
            }
            else {
                navigate("/dashboard");
            }
        }, 500);

    }, [searchParams, navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="bg-white shadow-xl rounded-2xl p-8 text-center">
                <h2 className="text-xl font-bold text-gray-800">
                    Logging you in with Google...
                </h2>

                <p className="text-gray-500 mt-2">
                    Please wait a moment.
                </p>
            </div>
        </div>
    );
}

export default GoogleSuccess;