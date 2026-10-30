import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function AdminDashboard() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [dashboardStats, setDashboardStats] = useState({
        students: 0,
        teachers: 0,
        courses: 0,
    });

    const [statsLoading, setStatsLoading] = useState(true);
    const [statsError, setStatsError] = useState("");

    const [attendanceDashboard, setAttendanceDashboard] = useState(null);
    const [attendanceLoading, setAttendanceLoading] = useState(true);
    const [attendanceError, setAttendanceError] = useState("");

    const [systemStatus, setSystemStatus] = useState({
        backend: "checking",
        database: "checking",
        faceApi: "checking",
    });

    const [statusLoading, setStatusLoading] = useState(true);

    const [recentSessions, setRecentSessions] = useState([]);
    const [recentSessionsLoading, setRecentSessionsLoading] = useState(true);
    const [recentSessionsError, setRecentSessionsError] = useState("");

    useEffect(() => {
        void loadDashboardStats();
        void loadAttendanceDashboard();
        void checkSystemStatus();
        void loadRecentSessions();
    }, []);

    const loadDashboardStats = async () => {
        try {
            setStatsLoading(true);
            setStatsError("");

            const [studentsResponse, teachersResponse, coursesResponse] =
                await Promise.all([
                    api.get("/student"),
                    api.get("/teacher"),
                    api.get("/course"),
                ]);

            setDashboardStats({
                students: Array.isArray(studentsResponse.data)
                    ? studentsResponse.data.length
                    : 0,
                teachers: Array.isArray(teachersResponse.data)
                    ? teachersResponse.data.length
                    : 0,
                courses: Array.isArray(coursesResponse.data)
                    ? coursesResponse.data.length
                    : 0,
            });
        } catch (error) {
            console.error("Failed to load dashboard statistics:", error);

            setStatsError(
                error.response?.data?.message ||
                "Failed to load dashboard statistics."
            );
        } finally {
            setStatsLoading(false);
        }
    };

    const loadAttendanceDashboard = async () => {
        try {
            setAttendanceLoading(true);
            setAttendanceError("");

            const response = await api.get(
                "/attendance/admin/dashboard"
            );

            setAttendanceDashboard(response.data);
        } catch (error) {
            console.error(
                "Failed to load attendance dashboard:",
                error
            );

            setAttendanceError(
                error.response?.data?.message ||
                "Failed to load attendance statistics."
            );
        } finally {
            setAttendanceLoading(false);
        }
    };

    const loadRecentSessions = async () => {
        try {
            setRecentSessionsLoading(true);
            setRecentSessionsError("");

            const response = await api.get("/attendance-sessions/admin/history");
            const sessions = Array.isArray(response.data) ? response.data : [];

            setRecentSessions(sessions.slice(0, 6));
        } catch (error) {
            console.error("Failed to load recent attendance sessions:", error);
            setRecentSessionsError(
                error.response?.data?.message ||
                "Failed to load recent attendance sessions."
            );
        } finally {
            setRecentSessionsLoading(false);
        }
    };

    const formatDate = (value) => {
        if (!value) return "—";
        return new Date(`${value}T00:00:00`).toLocaleDateString();
    };

    const formatDateTime = (value) => {
        if (!value) return "—";
        return new Date(value).toLocaleString();
    };

    const getSessionPercentage = (session) => {
        const value = Number(session?.attendancePercentage);
        if (Number.isFinite(value)) return value;

        const present = Number(session?.presentCount || 0);
        const absent = Number(session?.absentCount || 0);
        const total = present + absent;
        return total > 0 ? (present / total) * 100 : 0;
    };

    const getTrendHeight = (session) => {
        return `${Math.min(Math.max(getSessionPercentage(session), 0), 100)}%`;
    };

    const checkSystemStatus = async () => {
        setStatusLoading(true);

        let backendStatus = "offline";
        let databaseStatus = "offline";
        let faceApiStatus = "offline";

        try {
            // A successful authenticated backend request confirms
            // that Spring Boot is reachable.
            const response = await api.get("/student");
            backendStatus = response.status >= 200 && response.status < 300
                ? "online"
                : "offline";

            // The student/course data requests above are served through
            // Spring Boot and require database access, so a successful
            // response also indicates that the database is reachable
            // through the backend.
            databaseStatus = "online";
        } catch (error) {
            console.error("Backend status check failed:", error);

            // If the backend is unavailable, database status cannot be
            // independently verified from the browser.
            backendStatus = "offline";
            databaseStatus = "unknown";
        }

        try {
            // FastAPI health endpoint.
            const response = await fetch("http://127.0.0.1:8000/face/health", {
                method: "GET",
            });

            faceApiStatus = response.ok ? "online" : "offline";
        } catch (error) {
            console.error("Face Recognition API status check failed:", error);
            faceApiStatus = "offline";
        }

        setSystemStatus({
            backend: backendStatus,
            database: databaseStatus,
            faceApi: faceApiStatus,
        });

        setStatusLoading(false);
    };

    const refreshDashboard = async () => {
        await Promise.all([
            loadDashboardStats(),
            loadAttendanceDashboard(),
            checkSystemStatus(),
            loadRecentSessions(),
        ]);
    };

    const getStatusLabel = (status) => {
        if (status === "checking") {
            return "Checking...";
        }

        if (status === "online") {
            return "Online";
        }

        if (status === "unknown") {
            return "Unknown";
        }

        return "Offline";
    };

    const getStatusClass = (status) => {
        if (status === "online") {
            return "status-online";
        }

        if (status === "checking") {
            return "status-checking";
        }

        if (status === "unknown") {
            return "status-unknown";
        }

        return "status-offline";
    };

    return (
        <div className="admin-layout">

            {/* ================================
                SIDEBAR
            ================================= */}

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
                        <span>📝</span>
                        Enrollments
                    </button>

                    <button
                        className="sidebar-link"
                        onClick={() => navigate("/admin/attendance")}
                    >
                        <span>📅</span>
                        Attendance
                    </button>

                </nav>

                <div className="sidebar-bottom">

                    <button
                        className="sidebar-link"
                        onClick={() => refreshDashboard()}
                    >
                        <span>🔄</span>
                        Refresh Dashboard
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

            {/* ================================
                MAIN CONTENT
            ================================= */}

            <main className="admin-main">

                {/* ================================
                    TOPBAR
                ================================= */}

                <header className="admin-topbar">

                    <div>
                        <h2>Dashboard</h2>

                        <p>
                            Manage your Smart Attendance System
                        </p>
                    </div>

                    <div className="admin-profile">

                        <div className="profile-avatar">
                            {user?.email
                                ?.charAt(0)
                                .toUpperCase()}
                        </div>

                        <div>
                            <strong>
                                Administrator
                            </strong>

                            <small>
                                {user?.email}
                            </small>
                        </div>

                    </div>

                </header>

                {/* ================================
                    WELCOME CARD
                ================================= */}

                <section className="welcome-card">

                    <div>

                        <h3>
                            Welcome back, Admin 👋
                        </h3>

                        <p>
                            Monitor students, teachers,
                            courses and attendance from
                            one place.
                        </p>

                    </div>

                    <div className="welcome-icon">
                        🎓
                    </div>

                </section>

                {/* ================================
                    STATISTICS
                ================================= */}

                <section className="stats-grid">

                    {/* Students */}

                    <div className="stat-card">

                        <div className="stat-icon students-icon">
                            👨‍🎓
                        </div>

                        <div>

                            <span>
                                Total Students
                            </span>

                            <h2>
                                {statsLoading
                                    ? "..."
                                    : statsError
                                        ? "--"
                                        : dashboardStats.students}
                            </h2>

                            <small>
                                {statsError
                                    ? "Unable to load"
                                    : "Registered students"}
                            </small>

                        </div>

                    </div>

                    {/* Teachers */}

                    <div className="stat-card">

                        <div className="stat-icon teachers-icon">
                            👨‍🏫
                        </div>

                        <div>

                            <span>
                                Total Teachers
                            </span>

                            <h2>
                                {statsLoading
                                    ? "..."
                                    : statsError
                                        ? "--"
                                        : dashboardStats.teachers}
                            </h2>

                            <small>
                                {statsError
                                    ? "Unable to load"
                                    : "Active teachers"}
                            </small>

                        </div>

                    </div>

                    {/* Courses */}

                    <div className="stat-card">

                        <div className="stat-icon courses-icon">
                            📚
                        </div>

                        <div>

                            <span>
                                Total Courses
                            </span>

                            <h2>
                                {statsLoading
                                    ? "..."
                                    : statsError
                                        ? "--"
                                        : dashboardStats.courses}
                            </h2>

                            <small>
                                {statsError
                                    ? "Unable to load"
                                    : "Available courses"}
                            </small>

                        </div>

                    </div>

                    {/* Attendance */}

                    <div className="stat-card">

                        <div className="stat-icon attendance-icon">
                            📊
                        </div>

                        <div>

                            <span>
                                Attendance
                            </span>

                            <h2>
                                {attendanceLoading
                                    ? "..."
                                    : attendanceError
                                        ? "--"
                                        : `${attendanceDashboard?.attendancePercentage ?? 0}%`
                                }
                            </h2>

                            <small>
                                {attendanceError
                                    ? "Unable to load"
                                    : "Overall percentage"
                                }
                            </small>

                        </div>

                    </div>

                </section>

                {statsError && (
                    <div className="attendance-dashboard-error">
                        <strong>
                            Unable to load dashboard counts
                        </strong>

                        <p>
                            {statsError}
                        </p>

                        <button
                            className="attendance-retry-button"
                            onClick={() => void loadDashboardStats()}
                        >
                            Try Again
                        </button>
                    </div>
                )}

                {/* ================================
                    ATTENDANCE OVERVIEW
                ================================= */}

                <section className="dashboard-section">

                    <div className="section-header">

                        <div>

                            <h3>
                                Attendance Overview
                            </h3>

                            <p>
                                System-wide attendance
                                session and record statistics
                            </p>

                        </div>

                        {!attendanceLoading &&
                            !attendanceError && (

                                <button
                                    className="attendance-refresh-button"
                                    onClick={() =>
                                        void loadAttendanceDashboard()
                                    }
                                >
                                    ↻ Refresh
                                </button>

                            )}

                    </div>

                    {/* Loading */}

                    {attendanceLoading && (

                        <div className="attendance-dashboard-message">

                            <div className="attendance-loading-spinner">
                                ⟳
                            </div>

                            <strong>
                                Loading attendance statistics...
                            </strong>

                            <small>
                                Fetching the latest attendance data
                            </small>

                        </div>

                    )}

                    {/* Error */}

                    {!attendanceLoading &&
                        attendanceError && (

                            <div className="attendance-dashboard-error">

                                <div className="attendance-state-icon">
                                    ⚠️
                                </div>

                                <strong>
                                    Unable to load attendance statistics
                                </strong>

                                <p>
                                    {attendanceError}
                                </p>

                                <button
                                    className="attendance-retry-button"
                                    onClick={() =>
                                        void loadAttendanceDashboard()
                                    }
                                >
                                    Try Again
                                </button>

                            </div>

                        )}

                    {/* Attendance Data */}

                    {!attendanceLoading &&
                        !attendanceError &&
                        attendanceDashboard && (

                            <div className="attendance-overview-grid">

                                {/* Total Sessions */}

                                <div className="attendance-overview-card">

                                    <div className="attendance-overview-icon">
                                        📅
                                    </div>

                                    <div>

                                        <span>
                                            Total Sessions
                                        </span>

                                        <strong>
                                            {
                                                attendanceDashboard.totalSessions
                                            }
                                        </strong>

                                        <small>
                                            All attendance sessions
                                        </small>

                                    </div>

                                </div>

                                {/* Open Sessions */}

                                <div className="attendance-overview-card open">

                                    <div className="attendance-overview-icon">
                                        🟢
                                    </div>

                                    <div>

                                        <span>
                                            Open Sessions
                                        </span>

                                        <strong>
                                            {
                                                attendanceDashboard.openSessions
                                            }
                                        </strong>

                                        <small>
                                            Currently active
                                        </small>

                                    </div>

                                </div>

                                {/* Closed Sessions */}

                                <div className="attendance-overview-card closed">

                                    <div className="attendance-overview-icon">
                                        🔒
                                    </div>

                                    <div>

                                        <span>
                                            Closed Sessions
                                        </span>

                                        <strong>
                                            {
                                                attendanceDashboard.closedSessions
                                            }
                                        </strong>

                                        <small>
                                            Completed sessions
                                        </small>

                                    </div>

                                </div>

                                {/* Attendance Records */}

                                <div className="attendance-overview-card">

                                    <div className="attendance-overview-icon">
                                        📝
                                    </div>

                                    <div>

                                        <span>
                                            Attendance Records
                                        </span>

                                        <strong>
                                            {
                                                attendanceDashboard.totalAttendanceRecords
                                            }
                                        </strong>

                                        <small>
                                            Recorded entries
                                        </small>

                                    </div>

                                </div>

                                {/* Present */}

                                <div className="attendance-overview-card present">

                                    <div className="attendance-overview-icon">
                                        ✓
                                    </div>

                                    <div>

                                        <span>
                                            Present
                                        </span>

                                        <strong>
                                            {
                                                attendanceDashboard.presentCount
                                            }
                                        </strong>

                                        <small>
                                            Present records
                                        </small>

                                    </div>

                                </div>

                                {/* Absent */}

                                <div className="attendance-overview-card absent">

                                    <div className="attendance-overview-icon">
                                        ✕
                                    </div>

                                    <div>

                                        <span>
                                            Absent
                                        </span>

                                        <strong>
                                            {
                                                attendanceDashboard.absentCount
                                            }
                                        </strong>

                                        <small>
                                            Absent records
                                        </small>

                                    </div>

                                </div>

                                {/* Overall Percentage */}

                                <div className="attendance-percentage-card">

                                    <div className="attendance-percentage-content">

                                        <div>

                                            <span>
                                                Overall Attendance
                                            </span>

                                            <strong>
                                                {
                                                    attendanceDashboard.attendancePercentage
                                                }%
                                            </strong>

                                            <small>
                                                Based on present and absent
                                                attendance records
                                            </small>

                                        </div>

                                        <div className="attendance-percentage-icon">
                                            📊
                                        </div>

                                    </div>

                                    {/* Progress Bar */}

                                    <div className="attendance-progress-track">

                                        <div
                                            className="attendance-progress-fill"
                                            style={{
                                                width: `${Math.min(
                                                    Math.max(
                                                        attendanceDashboard.attendancePercentage || 0,
                                                        0
                                                    ),
                                                    100
                                                )}%`
                                            }}
                                        />

                                    </div>

                                </div>

                            </div>

                        )}

                </section>

                {/* ================================
                    RECENT ATTENDANCE SESSIONS
                ================================= */}

                <section className="dashboard-section admin-recent-attendance-section">

                    <div className="section-header">
                        <div>
                            <h3>Recent Attendance Sessions</h3>
                            <p>Latest attendance activity across the system</p>
                        </div>

                        <button
                            className="attendance-refresh-button"
                            onClick={() => void loadRecentSessions()}
                            disabled={recentSessionsLoading}
                        >
                            {recentSessionsLoading ? "Loading..." : "↻ Refresh"}
                        </button>
                    </div>

                    {recentSessionsError && (
                        <div className="attendance-dashboard-error">
                            <strong>Unable to load recent sessions</strong>
                            <p>{recentSessionsError}</p>
                            <button
                                className="attendance-retry-button"
                                onClick={() => void loadRecentSessions()}
                            >
                                Try Again
                            </button>
                        </div>
                    )}

                    {!recentSessionsLoading && !recentSessionsError && recentSessions.length === 0 && (
                        <div className="attendance-dashboard-message">
                            <strong>No attendance sessions found</strong>
                            <small>Recent sessions will appear here when attendance is started.</small>
                        </div>
                    )}

                    {!recentSessionsLoading && !recentSessionsError && recentSessions.length > 0 && (
                        <>
                            <div className="admin-attendance-trend">
                                <div className="admin-attendance-trend-header">
                                    <div>
                                        <strong>Recent Attendance Trend</strong>
                                        <small>Attendance percentage for the latest sessions</small>
                                    </div>
                                    <span>100%</span>
                                </div>

                                <div className="admin-attendance-trend-chart">
                                    {recentSessions.map((session) => {
                                        const percentage = getSessionPercentage(session);
                                        return (
                                            <button
                                                key={session.sessionId}
                                                type="button"
                                                className="admin-attendance-trend-bar"
                                                title={`${session.courseCode || "Course"}: ${percentage.toFixed(2)}%`}
                                                onClick={() => navigate("/admin/attendance/history")}
                                            >
                                                <span
                                                    className="admin-attendance-trend-fill"
                                                    style={{ height: getTrendHeight(session) }}
                                                />
                                                <small>{Math.round(percentage)}%</small>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="admin-recent-sessions-table-wrap">
                                <table className="admin-recent-sessions-table">
                                    <thead>
                                    <tr>
                                        <th>Session</th>
                                        <th>Course</th>
                                        <th>Teacher</th>
                                        <th>Date</th>
                                        <th>Present</th>
                                        <th>Absent</th>
                                        <th>Attendance</th>
                                        <th>Status</th>
                                        <th>Action</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {recentSessions.map((session) => {
                                        const percentage = getSessionPercentage(session);
                                        const status = session.status || "UNKNOWN";

                                        return (
                                            <tr key={session.sessionId}>
                                                <td>#{session.sessionId}</td>
                                                <td>
                                                    <strong>{session.courseCode || "—"}</strong>
                                                    <small>{session.courseName || ""}</small>
                                                </td>
                                                <td>{session.teacherName || "—"}</td>
                                                <td>
                                                    <strong>{formatDate(session.attendanceDate)}</strong>
                                                    <small>{formatDateTime(session.startedAt)}</small>
                                                </td>
                                                <td>{session.presentCount ?? 0}</td>
                                                <td>{session.absentCount ?? 0}</td>
                                                <td>
                                                    <strong>{percentage.toFixed(2)}%</strong>
                                                </td>
                                                <td>
                                                        <span className={`admin-session-status ${status.toLowerCase()}`}>
                                                            {status}
                                                        </span>
                                                </td>
                                                <td>
                                                    <button
                                                        type="button"
                                                        className="admin-session-view-button"
                                                        onClick={() => navigate("/admin/attendance/history")}
                                                    >
                                                        View History
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}

                </section>

                {/* ================================
                    QUICK ACTIONS
                ================================= */}

                <section className="dashboard-section">

                    <div className="section-header">

                        <div>

                            <h3>
                                Quick Actions
                            </h3>

                            <p>
                                Common administration tasks
                            </p>

                        </div>

                    </div>

                    <div className="quick-actions">

                        {/* Students */}

                        <button
                            className="action-card"
                            onClick={() =>
                                navigate("/admin/students")
                            }
                        >

                            <div className="action-icon">
                                👨‍🎓
                            </div>

                            <div>

                                <h4>
                                    Manage Students
                                </h4>

                                <p>
                                    Add, edit and manage
                                    student accounts
                                </p>

                            </div>

                            <span className="action-arrow">
                                →
                            </span>

                        </button>

                        {/* Teachers */}

                        <button
                            className="action-card"
                            onClick={() =>
                                navigate("/admin/teachers")
                            }
                        >

                            <div className="action-icon">
                                👨‍🏫
                            </div>

                            <div>

                                <h4>
                                    Manage Teachers
                                </h4>

                                <p>
                                    Manage teacher accounts
                                    and assignments
                                </p>

                            </div>

                            <span className="action-arrow">
                                →
                            </span>

                        </button>

                        {/* Courses */}

                        <button
                            className="action-card"
                            onClick={() =>
                                navigate("/admin/courses")
                            }
                        >

                            <div className="action-icon">
                                📚
                            </div>

                            <div>

                                <h4>
                                    Manage Courses
                                </h4>

                                <p>
                                    Create and assign courses
                                </p>

                            </div>

                            <span className="action-arrow">
                                →
                            </span>

                        </button>

                        {/* Attendance */}

                        <button
                            className="action-card"
                            onClick={() =>
                                navigate("/admin/attendance")
                            }
                        >

                            <div className="action-icon">
                                📊
                            </div>

                            <div>

                                <h4>
                                    Attendance Reports
                                </h4>

                                <p>
                                    View attendance records
                                    and reports
                                </p>

                            </div>

                            <span className="action-arrow">
                                →
                            </span>

                        </button>

                    </div>

                </section>

                {/* ================================
                    SYSTEM STATUS
                ================================= */}

                <section className="dashboard-section">

                    <div className="section-header">

                        <div>

                            <h3>
                                System Status
                            </h3>

                            <p>
                                Current application services
                            </p>

                        </div>

                        <button
                            className="attendance-refresh-button"
                            onClick={() => void checkSystemStatus()}
                            disabled={statusLoading}
                        >
                            {statusLoading ? "Checking..." : "↻ Check Status"}
                        </button>

                    </div>

                    <div className="status-grid">

                        {/* Spring Boot */}

                        <div className="status-card">

                            <div
                                className={`status-dot ${systemStatus.backend}`}
                            ></div>

                            <div>

                                <strong>
                                    Spring Boot API
                                </strong>

                                <small>
                                    Backend service
                                </small>

                            </div>

                            <span
                                className={getStatusClass(systemStatus.backend)}
                            >
                                {getStatusLabel(systemStatus.backend)}
                            </span>

                        </div>

                        {/* MySQL */}

                        <div className="status-card">

                            <div
                                className={`status-dot ${systemStatus.database}`}
                            ></div>

                            <div>

                                <strong>
                                    MySQL Database
                                </strong>

                                <small>
                                    Database service
                                </small>

                            </div>

                            <span
                                className={getStatusClass(systemStatus.database)}
                            >
                                {getStatusLabel(systemStatus.database)}
                            </span>

                        </div>

                        {/* Face Recognition */}

                        <div className="status-card">

                            <div
                                className={`status-dot ${systemStatus.faceApi}`}
                            ></div>

                            <div>

                                <strong>
                                    Face Recognition API
                                </strong>

                                <small>
                                    AI recognition service
                                </small>

                            </div>

                            <span
                                className={getStatusClass(systemStatus.faceApi)}
                            >
                                {getStatusLabel(systemStatus.faceApi)}
                            </span>

                        </div>

                    </div>

                </section>

            </main>

        </div>
    );
}

export default AdminDashboard;
