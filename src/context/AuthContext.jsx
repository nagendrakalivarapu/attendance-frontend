import { createContext, useContext, useState } from "react";
import api from "../services/api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        const token = localStorage.getItem("token");
        const email = localStorage.getItem("email");
        const role = localStorage.getItem("role");

        if (token && email && role) {
            return { token, email, role };
        }

        return null;
    });

    const login = async (email, password) => {
        const response = await api.post("/auth/login", {
            email,
            password,
        });

        const data = response.data;

        localStorage.setItem("token", data.token);
        localStorage.setItem("email", data.email);
        localStorage.setItem("role", data.role);

        setUser({
            token: data.token,
            email: data.email,
            role: data.role,
        });

        return data;
    };

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("email");
        localStorage.removeItem("role");

        setUser(null);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                login,
                logout,
                isAuthenticated: !!user,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}