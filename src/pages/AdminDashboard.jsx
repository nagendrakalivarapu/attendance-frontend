import { useAuth } from "../context/AuthContext";

function AdminDashboard() {
    const { user, logout } = useAuth();

    return (
        <div className="container mt-5">
            <h1>Admin Dashboard</h1>

            <p>
                Welcome, <strong>{user.email}</strong>
            </p>

            <p>
                Role: <strong>{user.role}</strong>
            </p>

            <button
                className="btn btn-danger"
                onClick={logout}
            >
                Logout
            </button>
        </div>
    );
}

export default AdminDashboard;