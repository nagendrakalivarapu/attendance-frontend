import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

function AdminDashboard() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    return (
        <div className="admin-layout">

            {/* Sidebar */}
            <aside className="admin-sidebar">

                <div className="sidebar-brand">
                    <div className="brand-icon">
                        SA
                    </div>

                    <div>
                        <h4>Smart Attendance</h4>
                        <small>Admin Panel</small>
                    </div>
                </div>

                <nav className="sidebar-nav">

                    <button
                        className="sidebar-link active"
                        onClick={() => navigate("/admin")}
                    >
                        <span>📊</span>
                        Dashboard
                    </button>

                    <button
                        className="sidebar-link"
                        onClick={() => navigate("/admin/students")}
                    >
                        <span>👨‍🎓</span>
                        Students
                    </button>

                    <button
                        className="sidebar-link"
                        onClick={() => navigate("/admin/teachers")}
                    >
                        <span>👨‍🏫</span>
                        Teachers
                    </button>

                    <button
                        className="sidebar-link"
                        onClick={() => navigate("/admin/courses")}
                    >
                        <span>📚</span>
                        Courses
                    </button>

                    <button
                        className="sidebar-link"
                        onClick={() => navigate("/admin/enrollments")}
                    >
                        <span>📚</span>
                        Enrollments
                    </button>

                    <button className="sidebar-link">
                        <span>📅</span>
                        Attendance
                    </button>

                </nav>

                <div className="sidebar-bottom">

                    <button className="sidebar-link">
                        <span>⚙️</span>
                        Settings
                    </button>

                    <button
                        className="sidebar-link logout-link"
                        onClick={logout}
                    >
                        <span>🚪</span>
                        Logout
                    </button>

                </div>

            </aside>


            {/* Main Content */}
            <main className="admin-main">

                {/* Topbar */}
                <header className="admin-topbar">

                    <div>
                        <h2>Dashboard</h2>
                        <p>Manage your Smart Attendance System</p>
                    </div>

                    <div className="admin-profile">

                        <div className="profile-avatar">
                            {user?.email?.charAt(0).toUpperCase()}
                        </div>

                        <div>
                            <strong>Administrator</strong>
                            <small>{user?.email}</small>
                        </div>

                    </div>

                </header>


                {/* Welcome */}
                <section className="welcome-card">

                    <div>
                        <h3>Welcome back, Admin 👋</h3>

                        <p>
                            Monitor students, teachers, courses and attendance
                            from one place.
                        </p>
                    </div>

                    <div className="welcome-icon">
                        🎓
                    </div>

                </section>


                {/* Statistics */}
                <section className="stats-grid">

                    <div className="stat-card">

                        <div className="stat-icon students-icon">
                            👨‍🎓
                        </div>

                        <div>
                            <span>Total Students</span>
                            <h2>3</h2>
                            <small>Registered students</small>
                        </div>

                    </div>


                    <div className="stat-card">

                        <div className="stat-icon teachers-icon">
                            👨‍🏫
                        </div>

                        <div>
                            <span>Total Teachers</span>
                            <h2>1</h2>
                            <small>Active teachers</small>
                        </div>

                    </div>


                    <div className="stat-card">

                        <div className="stat-icon courses-icon">
                            📚
                        </div>

                        <div>
                            <span>Total Courses</span>
                            <h2>2</h2>
                            <small>Available courses</small>
                        </div>

                    </div>


                    <div className="stat-card">

                        <div className="stat-icon attendance-icon">
                            📊
                        </div>

                        <div>
                            <span>Attendance</span>
                            <h2>--</h2>
                            <small>Overall percentage</small>
                        </div>

                    </div>

                </section>


                {/* Quick Actions */}
                <section className="dashboard-section">

                    <div className="section-header">
                        <div>
                            <h3>Quick Actions</h3>
                            <p>Common administration tasks</p>
                        </div>
                    </div>


                    <div className="quick-actions">

                        <button
                            className="action-card"
                            onClick={() => navigate("/admin/students")}
                        >
                            <div className="action-icon">
                                👨‍🎓
                            </div>

                            <div>
                                <h4>Manage Students</h4>
                                <p>
                                    Add, edit and manage student accounts
                                </p>
                            </div>

                            <span className="action-arrow">
                                →
                            </span>
                        </button>


                        <button className="action-card">

                            <div className="action-icon">
                                👨‍🏫
                            </div>

                            <div>
                                <h4>Manage Teachers</h4>
                                <p>
                                    Manage teacher accounts and assignments
                                </p>
                            </div>

                            <span className="action-arrow">
                                →
                            </span>

                        </button>


                        <button className="action-card">

                            <div className="action-icon">
                                📚
                            </div>

                            <div>
                                <h4>Manage Courses</h4>
                                <p>
                                    Create and assign courses
                                </p>
                            </div>

                            <span className="action-arrow">
                                →
                            </span>

                        </button>


                        <button className="action-card">

                            <div className="action-icon">
                                📊
                            </div>

                            <div>
                                <h4>Attendance Reports</h4>
                                <p>
                                    View attendance records and reports
                                </p>
                            </div>

                            <span className="action-arrow">
                                →
                            </span>

                        </button>

                    </div>

                </section>


                {/* System Status */}
                <section className="dashboard-section">

                    <div className="section-header">
                        <div>
                            <h3>System Status</h3>
                            <p>Current application services</p>
                        </div>
                    </div>

                    <div className="status-grid">

                        <div className="status-card">
                            <div className="status-dot"></div>

                            <div>
                                <strong>Spring Boot API</strong>
                                <small>Backend service</small>
                            </div>

                            <span className="status-online">
                                Online
                            </span>
                        </div>


                        <div className="status-card">
                            <div className="status-dot"></div>

                            <div>
                                <strong>MySQL Database</strong>
                                <small>Database service</small>
                            </div>

                            <span className="status-online">
                                Online
                            </span>
                        </div>


                        <div className="status-card">
                            <div className="status-dot"></div>

                            <div>
                                <strong>Face Recognition API</strong>
                                <small>AI recognition service</small>
                            </div>

                            <span className="status-online">
                                Online
                            </span>
                        </div>

                    </div>

                </section>

            </main>

        </div>
    );
}

export default AdminDashboard;