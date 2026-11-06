import {
    createContext,
    useContext,
    useEffect,
    useState
} from "react";

import api from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {

    const [user, setUser] = useState(() => {

        try {

            const storedUser =
                localStorage.getItem("user");

            return storedUser
                ? JSON.parse(storedUser)
                : null;

        } catch (error) {

            console.error(
                "Failed to restore user session:",
                error
            );

            return null;
        }
    });


    useEffect(() => {

        const token =
            localStorage.getItem("token");

        const storedUser =
            localStorage.getItem("user");

        if (!token || !storedUser) {
            return;
        }

        try {

            setUser(
                JSON.parse(storedUser)
            );

        } catch (error) {

            console.error(
                "Invalid stored user data:",
                error
            );

            localStorage.removeItem("token");
            localStorage.removeItem("user");

            setUser(null);
        }

    }, []);


    // ============================================================
    // LOGIN
    // ============================================================

    const login = async (
        email,
        password
    ) => {

        const response =
            await api.post(
                "/auth/login",
                {
                    email,
                    password
                }
            );

        const data =
            response.data;


        /*
         * ADMIN / TEACHER
         *
         * Backend has authenticated the password,
         * but JWT is not available until OTP
         * verification.
         */
        if (data.requiresOtp) {

            return data;
        }


        /*
         * STUDENT
         *
         * Student receives JWT immediately.
         */
        if (data.token) {

            const loggedInUser = {
                email: data.email,
                role: data.role
            };

            localStorage.setItem(
                "token",
                data.token
            );

            localStorage.setItem(
                "user",
                JSON.stringify(loggedInUser)
            );

            setUser(loggedInUser);
        }

        return data;
    };


    // ============================================================
    // VERIFY OTP
    // ============================================================

    const verifyOtp = async (
        email,
        otp
    ) => {

        const response =
            await api.post(
                "/auth/verify-otp",
                {
                    email,
                    otp
                }
            );

        const data =
            response.data;


        if (!data.token) {

            throw new Error(
                "Authentication token was not returned."
            );
        }


        const loggedInUser = {
            email: data.email,
            role: data.role
        };


        localStorage.setItem(
            "token",
            data.token
        );

        localStorage.setItem(
            "user",
            JSON.stringify(loggedInUser)
        );


        setUser(loggedInUser);


        return data;
    };


    // ============================================================
    // RESEND OTP
    // ============================================================

    const resendOtp = async (
        email
    ) => {

        const response =
            await api.post(
                "/auth/resend-otp",
                {
                    email
                }
            );

        return response.data;
    };


    // ============================================================
    // LOGOUT
    // ============================================================

    const logout = () => {

        localStorage.removeItem(
            "token"
        );

        localStorage.removeItem(
            "user"
        );

        setUser(null);
    };


    return (
        <AuthContext.Provider
            value={{
                user,
                login,
                verifyOtp,
                resendOtp,
                logout
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}


export function useAuth() {

    const context =
        useContext(AuthContext);

    if (!context) {

        throw new Error(
            "useAuth must be used inside AuthProvider"
        );
    }

    return context;
}