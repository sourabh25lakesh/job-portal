import {
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";

import axiosInstance from "../api/axios";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // ================= NORMALIZE USER =================
    const normalizeUser = (userData) => {
        if (!userData) {
            return null;
        }

        return {
            ...userData,
            role:
                userData.role ||
                localStorage.getItem("role") ||
                "candidate",
        };
    };

    // ================= SAVE USER =================
    const saveUser = (userData) => {
        const finalUser = normalizeUser(userData);

        if (!finalUser) {
            setUser(null);
            return null;
        }

        setUser(finalUser);

        localStorage.setItem("user", JSON.stringify(finalUser));
        localStorage.setItem("role", finalUser.role);

        return finalUser;
    };

    // ================= CLEAR AUTH =================
    const clearAuth = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("role");

        setUser(null);
    };

    // ================= LOAD USER =================
    const loadUser = async () => {
        setLoading(true);

        try {
            const token = localStorage.getItem("token");

            if (!token) {
                clearAuth();
                return;
            }

            const response = await axiosInstance.get("/auth/me");

            saveUser(response.data);
        } catch (error) {
            console.error(
                "Auth load error:",
                error?.response?.data || error.message
            );

            clearAuth();
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUser();
    }, []);

    // ================= LOGIN =================
    const login = async (arg1, arg2 = null) => {
        let token = null;
        let userData = null;

        // Format 1: login(token, userData)
        if (typeof arg1 === "string") {
            token = arg1;
            userData = arg2;
        }

        // Format 2: login(userData, token)
        if (typeof arg1 === "object" && typeof arg2 === "string") {
            userData = arg1;
            token = arg2;
        }

        if (!token) {
            clearAuth();
            setLoading(false);
            return;
        }

        localStorage.setItem("token", token);

        if (userData) {
            saveUser(userData);
            setLoading(false);
            return;
        }

        await loadUser();
    };

    // ================= LOGOUT =================
    const logout = () => {
        clearAuth();
        setLoading(false);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                login,
                logout,
                loadUser,
                isAuthenticated: !!user,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);