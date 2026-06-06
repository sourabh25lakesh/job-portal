import { Navigate, useLocation } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

function ProtectedRoute({ children, allowedRoles }) {
    const {
        user,
        loading,
    } = useAuth();

    const location = useLocation();

    // ================= LOADING =================
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    // ================= NOT LOGGED IN =================
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    const userRole = user?.role || localStorage.getItem("role") || "candidate";

    // ================= ROLE NOT ALLOWED =================
    if (
        allowedRoles &&
        allowedRoles.length > 0 &&
        !allowedRoles.includes(userRole)
    ) {
        if (userRole === "admin") {
            return <Navigate to="/admin/dashboard" replace />;
        }

        if (userRole === "company" || userRole === "recruiter") {
            return <Navigate to="/recruiter/dashboard" replace />;
        }

        return <Navigate to="/dashboard" replace />;
    }

    // ================= PREVENT WRONG DASHBOARD ACCESS =================
    if (location.pathname === "/dashboard" && userRole === "admin") {
        return <Navigate to="/admin/dashboard" replace />;
    }

    if (
        location.pathname === "/dashboard" &&
        (userRole === "company" || userRole === "recruiter")
    ) {
        return <Navigate to="/recruiter/dashboard" replace />;
    }

    // ================= ALLOWED =================
    return children;
}

export default ProtectedRoute;