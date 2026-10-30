import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function AdminAttendanceHistory() {
    const navigate = useNavigate();

    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");

    const loadHistory = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get(
                "/attendance-sessions/admin/history"
            );

            setSessions(response.data || []);
        } catch (error) {
            console.error(
                "Failed to load attendance history:",
                error
            );

            setError(
                error.response?.data?.message ||
                "Failed to load attendance history."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void loadHistory();
    }, []);

    const filteredSessions = useMemo(() => {
        const query = search.trim().toLowerCase();

        return sessions.filter((session) => {
            const matchesSearch =
                !query ||
                session.courseCode
                    ?.toLowerCase()
                    .includes(query) ||
                session.courseName
                    ?.toLowerCase()
                    .includes(query) ||
                session.teacherName
                    ?.toLowerCase()
                    .includes(query);

            const matchesStatus =
                statusFilter === "ALL" ||
                session.status === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [sessions, search, statusFilter]);

    const totalSessions = sessions.length;

    const openSessions = sessions.filter(
        (session) => session.status === "OPEN"
    ).length;

    const closedSessions = sessions.filter(
        (session) => session.status === "CLOSED"
    ).length;

    const totalPresent = sessions.reduce(
        (sum, session) =>
            sum + Number(session.presentCount || 0),
        0
    );

    const totalAbsent = sessions.reduce(
        (sum, session) =>
            sum + Number(session.absentCount || 0),
        0
    );

    const totalMarked = totalPresent + totalAbsent;

    const overallAttendance =
        totalMarked > 0
            ? ((totalPresent / totalMarked) * 100).toFixed(2)
            : "0.00";

    const formatDate = (value) => {
        if (!value) {
            return "-";
        }

        return new Date(`${value}T00:00:00`).toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
            }
        );
    };

    const formatDateTime = (value) => {
        if (!value) {
            return "-";
        }

        return new Date(value).toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const getAttendanceClass = (percentage) => {
        const value = Number(percentage || 0);

        if (value >= 75) {
            return "attendance-report-good";
        }

        if (value >= 60) {
            return "attendance-report-warning";
        }

        return "attendance-report-low";
    };

    const getInitials = (name) => {
        if (!name) {
            return "?";
        }

        return name
            .split(" ")
            .filter(Boolean)
            .map((part) => part.charAt(0))
            .join("")
            .substring(0, 2)
            .toUpperCase();
    };

    return (
        <div className="admin-layout">

            {/* =========================================
                SIDEBAR
            ========================================= */}

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
                        className="sidebar-link"
                        onClick={() =>
                            navigate("/admin")
                        }
                    >
                        <span>📊</span>
                        Dashboard
                    </button>

                    <button
                        className="sidebar-link"
                        onClick={() =>
                            navigate("/admin/students")
                        }
                    >
                        <span>👨‍🎓</span>
                        Students
                    </button>

                    <button
                        className="sidebar-link"
                        onClick={() =>
                            navigate("/admin/teachers")
                        }
                    >
                        <span>👨‍🏫</span>
                        Teachers
                    </button>

                    <button
                        className="sidebar-link"
                        onClick={() =>
                            navigate("/admin/courses")
                        }
                    >
                        <span>📚</span>
                        Courses
                    </button>

                    <button
                        className="sidebar-link"
                        onClick={() =>
                            navigate("/admin/enrollments")
                        }
                    >
                        <span>📝</span>
                        Enrollments
                    </button>

                    <button
                        className="sidebar-link active"
                        onClick={() =>
                            navigate("/admin/attendance")
                        }
                    >
                        <span>📅</span>
                        Attendance
                    </button>

                </nav>

            </aside>


            {/* =========================================
                MAIN
            ========================================= */}

            <main className="admin-main">

                {/* TOPBAR */}

                <header className="admin-topbar">

                    <div>
                        <h2>
                            Attendance History
                        </h2>

                        <p>
                            View all attendance sessions
                            across the system.
                        </p>
                    </div>

                    <div
                        style={{
                            display: "flex",
                            gap: "10px",
                            flexWrap: "wrap",
                        }}
                    >

                        <button
                            className="attendance-report-back-button"
                            onClick={() =>
                                navigate(
                                    "/admin/attendance"
                                )
                            }
                        >
                            ← Reports
                        </button>

                        <button
                            className="attendance-report-refresh-button"
                            onClick={() =>
                                void loadHistory()
                            }
                            disabled={loading}
                        >
                            ↻ Refresh
                        </button>

                    </div>

                </header>


                {/* CONTENT */}

                <section className="admin-content">

                    {/* =====================================
                        STATISTICS
                    ===================================== */}

                    <section className="attendance-report-stat-grid">

                        <div className="attendance-report-stat-card">

                            <div className="report-stat-icon blue">
                                📅
                            </div>

                            <div>
                                <span>
                                    Total Sessions
                                </span>

                                <strong>
                                    {totalSessions}
                                </strong>
                            </div>

                        </div>


                        <div className="attendance-report-stat-card">

                            <div className="report-stat-icon green">
                                ●
                            </div>

                            <div>
                                <span>
                                    Open Sessions
                                </span>

                                <strong>
                                    {openSessions}
                                </strong>
                            </div>

                        </div>


                        <div className="attendance-report-stat-card">

                            <div className="report-stat-icon purple">
                                ✓
                            </div>

                            <div>
                                <span>
                                    Closed Sessions
                                </span>

                                <strong>
                                    {closedSessions}
                                </strong>
                            </div>

                        </div>


                        <div className="attendance-report-stat-card present">

                            <div className="report-stat-icon green">
                                👤
                            </div>

                            <div>
                                <span>
                                    Total Present
                                </span>

                                <strong>
                                    {totalPresent}
                                </strong>
                            </div>

                        </div>


                        <div className="attendance-report-stat-card warning">

                            <div className="report-stat-icon orange">
                                📊
                            </div>

                            <div>
                                <span>
                                    Overall Attendance
                                </span>

                                <strong>
                                    {overallAttendance}%
                                </strong>
                            </div>

                        </div>

                    </section>


                    {/* =====================================
                        FILTERS
                    ===================================== */}

                    <section
                        className="attendance-report-filter-card"
                        style={{ marginTop: "20px" }}
                    >

                        <div
                            className="attendance-report-filter"
                        >

                            <label>
                                Search
                            </label>

                            <input
                                type="text"
                                placeholder="Course, teacher..."
                                value={search}
                                onChange={(event) =>
                                    setSearch(
                                        event.target.value
                                    )
                                }
                            />

                        </div>


                        <div
                            className="attendance-report-filter"
                        >

                            <label>
                                Session Status
                            </label>

                            <select
                                value={statusFilter}
                                onChange={(event) =>
                                    setStatusFilter(
                                        event.target.value
                                    )
                                }
                            >

                                <option value="ALL">
                                    All Sessions
                                </option>

                                <option value="OPEN">
                                    Open
                                </option>

                                <option value="CLOSED">
                                    Closed
                                </option>

                            </select>

                        </div>


                        <button
                            className="attendance-report-refresh-button"
                            onClick={() => {
                                setSearch("");
                                setStatusFilter("ALL");
                            }}
                        >
                            Clear Filters
                        </button>

                    </section>


                    {/* =====================================
                        ERROR
                    ===================================== */}

                    {error && (

                        <div className="attendance-report-error">

                            <span>
                                ⚠️
                            </span>

                            <div>

                                <strong>
                                    Unable to load history
                                </strong>

                                <p>
                                    {error}
                                </p>

                            </div>

                        </div>

                    )}


                    {/* =====================================
                        LOADING
                    ===================================== */}

                    {loading && (

                        <div className="attendance-report-loading">

                            <div className="attendance-loading-spinner">
                                ⟳
                            </div>

                            <strong>
                                Loading attendance history...
                            </strong>

                            <p>
                                Fetching attendance sessions.
                            </p>

                        </div>

                    )}


                    {/* =====================================
                        TABLE
                    ===================================== */}

                    {!loading && !error && (

                        <section
                            className="attendance-report-table-card"
                            style={{ marginTop: "20px" }}
                        >

                            <div className="attendance-report-table-header">

                                <div>

                                    <h3>
                                        Attendance Sessions
                                    </h3>

                                    <p>
                                        System-wide attendance
                                        session history.
                                    </p>

                                </div>

                                <span className="attendance-report-count">
                                    {filteredSessions.length} Sessions
                                </span>

                            </div>


                            {filteredSessions.length === 0 ? (

                                <div className="attendance-report-no-data">

                                    <div>
                                        📭
                                    </div>

                                    <h4>
                                        No Sessions Found
                                    </h4>

                                    <p>
                                        No attendance sessions
                                        match the selected
                                        filters.
                                    </p>

                                </div>

                            ) : (

                                <div className="attendance-report-table-wrapper">

                                    <table className="attendance-report-table">

                                        <thead>

                                        <tr>

                                            <th>
                                                Session
                                            </th>

                                            <th>
                                                Course
                                            </th>

                                            <th>
                                                Teacher
                                            </th>

                                            <th>
                                                Date
                                            </th>

                                            <th>
                                                Started
                                            </th>

                                            <th>
                                                Closed
                                            </th>

                                            <th>
                                                Students
                                            </th>

                                            <th>
                                                Present
                                            </th>

                                            <th>
                                                Absent
                                            </th>

                                            <th>
                                                Attendance
                                            </th>

                                            <th>
                                                Status
                                            </th>

                                        </tr>

                                        </thead>


                                        <tbody>

                                        {filteredSessions.map(
                                            (session) => {

                                                const percentage =
                                                    Number(
                                                        session.attendancePercentage ||
                                                        0
                                                    );

                                                return (

                                                    <tr
                                                        key={
                                                            session.sessionId
                                                        }
                                                    >

                                                        {/* SESSION */}

                                                        <td>

                                                            <strong>
                                                                #
                                                                {
                                                                    session.sessionId
                                                                }
                                                            </strong>

                                                        </td>


                                                        {/* COURSE */}

                                                        <td>

                                                            <div
                                                                className="attendance-student-cell"
                                                            >

                                                                <div
                                                                    className="attendance-student-avatar"
                                                                >
                                                                    {session.courseCode
                                                                            ?.charAt(
                                                                                0
                                                                            )
                                                                            ?.toUpperCase() ||
                                                                        "C"}
                                                                </div>

                                                                <div>

                                                                    <strong>
                                                                        {
                                                                            session.courseCode
                                                                        }
                                                                    </strong>

                                                                    <small>
                                                                        {
                                                                            session.courseName
                                                                        }
                                                                    </small>

                                                                </div>

                                                            </div>

                                                        </td>


                                                        {/* TEACHER */}

                                                        <td>

                                                            <div
                                                                className="attendance-student-cell"
                                                            >

                                                                <div
                                                                    className="attendance-student-avatar"
                                                                >
                                                                    {getInitials(
                                                                        session.teacherName
                                                                    )}
                                                                </div>

                                                                <div>

                                                                    <strong>
                                                                        {
                                                                            session.teacherName ||
                                                                            "Unknown"
                                                                        }
                                                                    </strong>

                                                                    <small>
                                                                        Teacher
                                                                    </small>

                                                                </div>

                                                            </div>

                                                        </td>


                                                        {/* DATE */}

                                                        <td>
                                                            {
                                                                formatDate(
                                                                    session.attendanceDate
                                                                )
                                                            }
                                                        </td>


                                                        {/* START */}

                                                        <td>
                                                            {
                                                                formatDateTime(
                                                                    session.startedAt
                                                                )
                                                            }
                                                        </td>


                                                        {/* CLOSED */}

                                                        <td>
                                                            {
                                                                formatDateTime(
                                                                    session.closedAt
                                                                )
                                                            }
                                                        </td>


                                                        {/* STUDENTS */}

                                                        <td>
                                                            {
                                                                session.totalStudents
                                                            }
                                                        </td>


                                                        {/* PRESENT */}

                                                        <td>

                                                                <span className="present-number">
                                                                    {
                                                                        session.presentCount
                                                                    }
                                                                </span>

                                                        </td>


                                                        {/* ABSENT */}

                                                        <td>

                                                                <span className="absent-number">
                                                                    {
                                                                        session.absentCount
                                                                    }
                                                                </span>

                                                        </td>


                                                        {/* ATTENDANCE */}

                                                        <td>

                                                            <div className="attendance-percentage-cell">

                                                                <strong
                                                                    className={getAttendanceClass(
                                                                        percentage
                                                                    )}
                                                                >
                                                                    {
                                                                        percentage
                                                                    }%
                                                                </strong>

                                                                <div className="mini-progress">

                                                                    <div
                                                                        className={getAttendanceClass(
                                                                            percentage
                                                                        )}
                                                                        style={{
                                                                            width: `${Math.min(
                                                                                Math.max(
                                                                                    percentage,
                                                                                    0
                                                                                ),
                                                                                100
                                                                            )}%`,
                                                                        }}
                                                                    />

                                                                </div>

                                                            </div>

                                                        </td>


                                                        {/* STATUS */}

                                                        <td>

                                                            {session.status ===
                                                            "OPEN" ? (

                                                                <span className="attendance-status-badge good">
                                                                        ● Open
                                                                    </span>

                                                            ) : (

                                                                <span className="attendance-status-badge">
                                                                        ✓ Closed
                                                                    </span>

                                                            )}

                                                        </td>

                                                    </tr>

                                                );
                                            }
                                        )}

                                        </tbody>

                                    </table>

                                </div>

                            )}

                        </section>

                    )}

                </section>

            </main>

        </div>
    );
}

export default AdminAttendanceHistory;