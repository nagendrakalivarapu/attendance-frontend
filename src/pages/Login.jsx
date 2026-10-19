import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setLoading(true);

        try {
            const data = await login(email, password);

            if (data.role === "ADMIN") {
                navigate("/admin");
            } else if (data.role === "TEACHER") {
                navigate("/teacher");
            } else if (data.role === "STUDENT") {
                navigate("/student");
            } else {
                setError("Unknown user role.");
            }
        } catch (err) {
            console.error(err);

            if (err.response?.data?.message) {
                setError(err.response.data.message);
            } else {
                setError("Login failed. Check your email and password.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container d-flex justify-content-center align-items-center min-vh-100">
            <div className="card shadow p-4" style={{ width: "400px" }}>
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

                <form onSubmit={handleSubmit}>

                    <div className="mb-3">
                        <label className="form-label">
                            Email
                        </label>

                        <input
                            type="email"
                            className="form-control"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="mb-3">
                        <label className="form-label">
                            Password
                        </label>

                        <input
                            type="password"
                            className="form-control"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary w-100"
                        disabled={loading}
                    >
                        {loading ? "Logging in..." : "Login"}
                    </button>

                </form>
            </div>
        </div>
    );
}

export default Login;