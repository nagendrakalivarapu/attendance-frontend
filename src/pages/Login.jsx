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
            <div >

                <div
                    
                    
                >

                    <h2 >
                        Smart Attendance
                    </h2>


                    <h5 >
                        Login
                    </h5>


                    {error && (
                        <div >
                            {error}
                        </div>
                    )}


                    {success && (
                        <div >
                            {success}
                        </div>
                    )}


                    <form
                        onSubmit={handleLogin}
                    >

                        {/* EMAIL */}

                        <div >

                            <label >
                                Email
                            </label>

                            <input
                                type="email"
                                
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

                        <div >

                            <label >
                                Password
                            </label>


                            <div >

                                <input
                                    type={
                                        showPassword
                                            ? "text"
                                            : "password"
                                    }
                                    
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
        <div >

            <div
                
                
            >

                <div >

                    <h2>
                        Verify Your Identity
                    </h2>

                    <p >
                        {role === "ADMIN"
                            ? "Administrator verification"
                            : "Teacher verification"}
                    </p>

                    <small >
                        Enter the 6-digit code sent to
                    </small>

                    <div >
                        {email}
                    </div>

                </div>


                {error && (
                    <div >
                        {error}
                    </div>
                )}


                {success && (
                    <div >
                        {success}
                    </div>
                )}


                <form
                    onSubmit={handleVerifyOtp}
                >

                    <div >

                        <label >
                            Verification Code
                        </label>

                        <input
                            type="text"
                            
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
                            
                        />

                    </div>


                    <button
                        type="submit"
                        
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

                <div >

                    {resendCountdown > 0 ? (

                        <p >

                            Resend available in{" "}

                            <strong>
                                {resendCountdown}s
                            </strong>

                        </p>

                    ) : (

                        <button
                            type="button"
                            
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

                <div >

                    <button
                        type="button"
                        
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