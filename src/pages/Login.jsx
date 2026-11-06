import {
    useEffect,
    useState
} from "react";

import {
    useNavigate
} from "react-router-dom";

import {
    useAuth
} from "../context/AuthContext";


function Login() {

    const navigate =
        useNavigate();

    const {
        login,
        verifyOtp,
        resendOtp
    } = useAuth();


    // ============================================================
    // LOGIN STATE
    // ============================================================

    const [email, setEmail] =
        useState("");

    const [password, setPassword] =
        useState("");

    const [otp, setOtp] =
        useState("");

    const [step, setStep] =
        useState("login");

    const [role, setRole] =
        useState("");


    // ============================================================
    // UI STATE
    // ============================================================

    const [error, setError] =
        useState("");

    const [success, setSuccess] =
        useState("");

    const [loading, setLoading] =
        useState(false);

    const [resending, setResending] =
        useState(false);

    const [showPassword, setShowPassword] =
        useState(false);

    const [resendCountdown, setResendCountdown] =
        useState(0);


    // ============================================================
    // RESEND COUNTDOWN
    // ============================================================

    useEffect(() => {

        if (resendCountdown <= 0) {
            return;
        }

        const timer =
            setInterval(() => {

                setResendCountdown(
                    previous =>
                        Math.max(
                            previous - 1,
                            0
                        )
                );

            }, 1000);


        return () => {
            clearInterval(timer);
        };

    }, [resendCountdown]);


    // ============================================================
    // LOGIN
    // ============================================================

    const handleLogin = async (event) => {

        event.preventDefault();

        setError("");
        setSuccess("");
        setLoading(true);


        try {

            const data =
                await login(
                    email.trim(),
                    password
                );


            /*
             * ADMIN / TEACHER
             *
             * Backend requires OTP.
             */
            if (data.requiresOtp) {

                setRole(
                    data.role
                );

                setStep("otp");

                setOtp("");

                setResendCountdown(60);

                setSuccess(
                    data.message ||
                    "A verification code has been sent to your email."
                );

                return;
            }


            /*
             * STUDENT
             *
             * Direct login.
             */
            navigateByRole(
                data.role
            );

        } catch (error) {

            console.error(
                "Login error:",
                error
            );

            setError(
                error.response?.data?.message ||
                error.message ||
                "Login failed. Check your email and password."
            );

        } finally {

            setLoading(false);
        }
    };


    // ============================================================
    // VERIFY OTP
    // ============================================================

    const handleVerifyOtp = async (event) => {

        event.preventDefault();

        setError("");
        setSuccess("");


        if (!/^\d{6}$/.test(otp)) {

            setError(
                "Please enter the 6-digit verification code."
            );

            return;
        }


        setLoading(true);


        try {

            const data =
                await verifyOtp(
                    email.trim(),
                    otp
                );


            setSuccess(
                data.message ||
                "Verification successful."
            );


            navigateByRole(
                data.role
            );

        } catch (error) {

            console.error(
                "OTP verification error:",
                error
            );

            setError(
                error.response?.data?.message ||
                error.message ||
                "Invalid or expired OTP."
            );

        } finally {

            setLoading(false);
        }
    };


    // ============================================================
    // RESEND OTP
    // ============================================================

    const handleResendOtp = async () => {

        if (resendCountdown > 0) {
            return;
        }


        setError("");
        setSuccess("");
        setResending(true);


        try {

            const data =
                await resendOtp(
                    email.trim()
                );


            setOtp("");

            setResendCountdown(60);

            setSuccess(
                data.message ||
                "A new verification code has been sent."
            );

        } catch (error) {

            console.error(
                "Resend OTP error:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Unable to resend OTP."
            );

        } finally {

            setResending(false);
        }
    };


    // ============================================================
    // ROLE NAVIGATION
    // ============================================================

    const navigateByRole = (
        userRole
    ) => {

        if (userRole === "ADMIN") {

            navigate("/admin");

        } else if (userRole === "TEACHER") {

            navigate("/teacher");

        } else if (userRole === "STUDENT") {

            navigate("/student");

        } else {

            setError(
                "Unknown user role."
            );
        }
    };


    // ============================================================
    // BACK TO LOGIN
    // ============================================================

    const handleBackToLogin = () => {

        setStep("login");

        setOtp("");

        setError("");

        setSuccess("");

        setResendCountdown(0);
    };


    // ============================================================
    // LOGIN SCREEN
    // ============================================================

    if (step === "login") {

        return (
            <div className="container d-flex justify-content-center align-items-center min-vh-100">

                <div
                    className="card shadow p-4"
                    style={{
                        width: "400px"
                    }}
                >

                    <h2 className="text-center mb-4">
                        Smart Attendance
                    </h2>


                    <h5 className="text-center mb-4">
                        Login
                    </h5>


                    {error && (
                        <div className="alert alert-danger">
                            {error}
                        </div>
                    )}


                    {success && (
                        <div className="alert alert-success">
                            {success}
                        </div>
                    )}


                    <form
                        onSubmit={handleLogin}
                    >

                        {/* EMAIL */}

                        <div className="mb-3">

                            <label className="form-label">
                                Email
                            </label>

                            <input
                                type="email"
                                className="form-control"
                                value={email}
                                onChange={(event) =>
                                    setEmail(
                                        event.target.value
                                    )
                                }
                                placeholder="Enter your email"
                                autoComplete="email"
                                required
                            />

                        </div>


                        {/* PASSWORD */}

                        <div className="mb-3">

                            <label className="form-label">
                                Password
                            </label>


                            <div className="login-password-field">

                                <input
                                    type={
                                        showPassword
                                            ? "text"
                                            : "password"
                                    }
                                    className="form-control"
                                    value={password}
                                    onChange={(event) =>
                                        setPassword(
                                            event.target.value
                                        )
                                    }
                                    placeholder="Enter your password"
                                    autoComplete="current-password"
                                    required
                                />


                                <button
                                    type="button"
                                    className="login-password-toggle"
                                    onClick={() =>
                                        setShowPassword(
                                            previous =>
                                                !previous
                                        )
                                    }
                                >
                                    {showPassword
                                        ? "Hide"
                                        : "Show"}
                                </button>

                            </div>

                        </div>


                        {/* LOGIN BUTTON */}

                        <button
                            type="submit"
                            className="btn btn-primary w-100"
                            disabled={loading}
                        >

                            {loading
                                ? "Signing in..."
                                : "Login"}

                        </button>

                    </form>

                </div>

            </div>
        );
    }


    // ============================================================
    // OTP SCREEN
    // ============================================================

    return (
        <div className="container d-flex justify-content-center align-items-center min-vh-100">

            <div
                className="card shadow p-4"
                style={{
                    width: "400px"
                }}
            >

                <div className="text-center mb-4">

                    <h2>
                        Verify Your Identity
                    </h2>

                    <p className="text-muted mb-1">
                        {role === "ADMIN"
                            ? "Administrator verification"
                            : "Teacher verification"}
                    </p>

                    <small className="text-muted">
                        Enter the 6-digit code sent to
                    </small>

                    <div className="fw-semibold mt-1">
                        {email}
                    </div>

                </div>


                {error && (
                    <div className="alert alert-danger">
                        {error}
                    </div>
                )}


                {success && (
                    <div className="alert alert-success">
                        {success}
                    </div>
                )}


                <form
                    onSubmit={handleVerifyOtp}
                >

                    <div className="mb-4">

                        <label className="form-label">
                            Verification Code
                        </label>

                        <input
                            type="text"
                            className="form-control text-center"
                            value={otp}
                            onChange={(event) => {

                                const value =
                                    event.target.value
                                        .replace(/\D/g, "")
                                        .slice(0, 6);

                                setOtp(value);
                            }}
                            placeholder="000000"
                            inputMode="numeric"
                            autoComplete="one-time-code"
                            maxLength={6}
                            required
                            style={{
                                fontSize: "24px",
                                letterSpacing: "8px",
                                fontWeight: "600"
                            }}
                        />

                    </div>


                    <button
                        type="submit"
                        className="btn btn-primary w-100"
                        disabled={
                            loading ||
                            otp.length !== 6
                        }
                    >

                        {loading
                            ? "Verifying..."
                            : "Verify OTP"}

                    </button>

                </form>


                {/* RESEND */}

                <div className="text-center mt-4">

                    {resendCountdown > 0 ? (

                        <p className="text-muted mb-0">

                            Resend available in{" "}

                            <strong>
                                {resendCountdown}s
                            </strong>

                        </p>

                    ) : (

                        <button
                            type="button"
                            className="btn btn-link"
                            onClick={handleResendOtp}
                            disabled={resending}
                        >

                            {resending
                                ? "Sending..."
                                : "Resend OTP"}

                        </button>
                    )}

                </div>


                {/* BACK */}

                <div className="text-center mt-2">

                    <button
                        type="button"
                        className="btn btn-link text-secondary"
                        onClick={handleBackToLogin}
                    >
                        Back to Login
                    </button>

                </div>

            </div>

        </div>
    );
}


export default Login;