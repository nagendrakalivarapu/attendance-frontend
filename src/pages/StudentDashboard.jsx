import { useAuth } from "../context/AuthContext";

function StudentDashboard() {
    const { user, logout } = useAuth();

    return (
        <div className="container mt-5">
            <h1>Student Dashboard</h1>

            <p>Welcome, {user.email}</p>

            <button
                className="btn btn-danger"
                onClick={logout}
            >
                Logout
            </button>
        </div>
    );
}

export default StudentDashboard;