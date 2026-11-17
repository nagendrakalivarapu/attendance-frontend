import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { api, TOKEN_KEY, USER_KEY } from "./api";
const AuthContext = createContext(null);
export function homeForRole(role) {
    if (role === "ADMIN")
        return "/admin";
    if (role === "TEACHER")
        return "/teacher";
    if (role === "STUDENT")
        return "/student";
    return null;
}
export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [ready, setReady] = useState(false);
    useEffect(() => {
        const token = window.localStorage.getItem(TOKEN_KEY);
        const stored = window.localStorage.getItem(USER_KEY);
        if (token && stored) {
            try {
                setUser(JSON.parse(stored));
            }
            catch {
                window.localStorage.removeItem(TOKEN_KEY);
                window.localStorage.removeItem(USER_KEY);
            }
        }
        setReady(true);
    }, []);
    const storeSession = useCallback((data) => {
        const next = { email: data.email ?? "", role: data.role };
        window.localStorage.setItem(TOKEN_KEY, data.token);
        window.localStorage.setItem(USER_KEY, JSON.stringify(next));
        setUser(next);
    }, []);
    const login = useCallback(async (email, password) => {
        const data = await api.post("/auth/login", { email, password });
        // Admins and teachers must confirm a one-time code before a token is issued.
        if (data?.requiresOtp)
            return data;
        if (data?.token)
            storeSession(data);
        return data ?? {};
    }, [storeSession]);
    const verifyOtp = useCallback(async (email, otp) => {
        const data = await api.post("/auth/verify-otp", { email, otp });
        if (!data?.token)
            throw new Error("Authentication token was not returned.");
        storeSession(data);
        return data;
    }, [storeSession]);
    const resendOtp = useCallback((email) => api.post("/auth/resend-otp", { email }), []);
    const logout = useCallback(() => {
        window.localStorage.removeItem(TOKEN_KEY);
        window.localStorage.removeItem(USER_KEY);
        setUser(null);
    }, []);
    return (<AuthContext.Provider value={{ user, ready, login, verifyOtp, resendOtp, logout }}>
      {children}
    </AuthContext.Provider>);
}
export function useAuth() {
    const context = useContext(AuthContext);
    if (!context)
        throw new Error("useAuth must be used inside AuthProvider");
    return context;
}
