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
        <div >

            {/* =========================================
                SIDEBAR
            ========================================= */}

            <aside >

                <div >

                    <div >
                        SA
                    </div>

                    <div>
                        <h4>Smart Attendance</h4>
                        <small>Admin Panel</small>
                    </div>

                </div>

                <nav >

                    <button
                        
                        onClick={() =>
                            navigate("/admin")
                        }
                    >
                        <span></span>
                        Dashboard
                    </button>

                    <button
                        
                        onClick={() =>
                            navigate("/admin/students")
                        }
                    >
                        <span></span>
                        Students
                    </button>

                    <button
                        
                        onClick={() =>
                            navigate("/admin/teachers")
                        }
                    >
                        <span></span>
                        Teachers
                    </button>

                    <button
                        
                        onClick={() =>
                            navigate("/admin/courses")
                        }
                    >
                        <span></span>
                        Courses
                    </button>

                    <button
                        
                        onClick={() =>
                            navigate("/admin/enrollments")
                        }
                    >
                        <span></span>
                        Enrollments
                    </button>

                    <button
                        
                        onClick={() =>
                            navigate("/admin/attendance")
                        }
                    >
                        <span></span>
                        Attendance
                    </button>

                </nav>

            </aside>


            {/* =========================================
                MAIN
            ========================================= */}

            <main >

                {/* TOPBAR */}

                <header >

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
                        
                    >

                        <button
                            
                            onClick={() =>
                                navigate(
                                    "/admin/attendance"
                                )
                            }
                        >
                            ← Reports
                        </button>

                        <button
                            
                            onClick={() =>
                                navigate(
                                    "/admin/attendance/low"
                                )
                            }
                        >
                            Low Attendance
                        </button>

                        <button
                            
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

                <section >

                    {/* =====================================
                        STATISTICS
                    ===================================== */}

                    <section >

                        <div >

                            <div >
                                
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


                        <div >

                            <div >
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


                        <div >

                            <div >
                                
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


                        <div >

                            <div >
                                
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


                        <div >

                            <div >
                                
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
                        
                        
                    >

                        <div
                            
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

                        <div >

                            <span>
                                ️
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

                        <div >

                            <div >
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
                            
                            
                        >

                            <div >

                                <div>

                                    <h3>
                                        Attendance Sessions
                                    </h3>

                                    <p>
                                        System-wide attendance
                                        session history.
                                    </p>

                                </div>

                                <span >
                                    {filteredSessions.length} Sessions
                                </span>

                            </div>


                            {filteredSessions.length === 0 ? (

                                <div >

                                    <div>
                                        
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

                                <div >

                                    <table >

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
                                                                
                                                            >

                                                                <div
                                                                    
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
                                                                
                                                            >

                                                                <div
                                                                    
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

                                                                <span >
                                                                    {
                                                                        session.presentCount
                                                                    }
                                                                </span>

                                                        </td>


                                                        {/* ABSENT */}

                                                        <td>

                                                                <span >
                                                                    {
                                                                        session.absentCount
                                                                    }
                                                                </span>

                                                        </td>


                                                        {/* ATTENDANCE */}

                                                        <td>

                                                            <div >

                                                                <strong
                                                                    
                                                                >
                                                                    {
                                                                        percentage
                                                                    }%
                                                                </strong>

                                                                <div >

                                                                    <div
                                                                        
                                                                        
                                                                    />

                                                                </div>

                                                            </div>

                                                        </td>


                                                        {/* STATUS */}

                                                        <td>

                                                            {session.status ===
                                                            "OPEN" ? (

                                                                <span >
                                                                        ● Open
                                                                    </span>

                                                            ) : (

                                                                <span >
                                                                         Closed
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