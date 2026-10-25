import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

function TeacherAttendanceHistory() {
    const [sessions, setSessions] = useState([]);
    const [selectedSession, setSelectedSession] = useState(null);
    const [attendance, setAttendance] = useState([]);
    const [loading, setLoading] = useState(true);
    const [detailsLoading, setDetailsLoading] = useState(false);
    const [error, setError] = useState("");
    const [detailsError, setDetailsError] = useState("");

    useEffect(() => {
        const fetchHistory = async () => {
            await loadHistory();
        };

        fetchHistory();
    }, []);

    const loadHistory = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/attendance-sessions/my-history");
            const history = Array.isArray(response.data) ? response.data : [];

            setSessions(history);

            if (history.length > 0) {
                await loadSessionAttendance(history[0]);
            } else {
                setSelectedSession(null);
                setAttendance([]);
            }
        } catch (err) {
            console.error(err);
            setError(
                err.response?.data?.message ||
                "Failed to load attendance history."
            );
        } finally {
            setLoading(false);
        }
    };

    const loadSessionAttendance = async (session) => {
        try {
            setDetailsLoading(true);
            setDetailsError("");
            setSelectedSession(session);

            const response = await api.get(
                `/attendance-sessions/${session.sessionId}/attendance`
            );

            setAttendance(Array.isArray(response.data) ? response.data : []);
        } catch (err) {
            console.error(err);
            setAttendance([]);
            setDetailsError(
                err.response?.data?.message ||
                "Failed to load attendance details."
            );
        } finally {
            setDetailsLoading(false);
        }
    };

    const formatDate = (date) => {
        if (!date) return "--";

        return new Date(`${date}T00:00:00`).toLocaleDateString([], {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    const formatTime = (dateTime) => {
        if (!dateTime) return "--";

        return new Date(dateTime).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const totals = useMemo(() => {
        return sessions.reduce(
            (summary, session) => ({
                sessions: summary.sessions + 1,
                students: summary.students + Number(session.totalStudents || 0),
                present: summary.present + Number(session.presentCount || 0),
                absent: summary.absent + Number(session.absentCount || 0),
            }),
            { sessions: 0, students: 0, present: 0, absent: 0 }
        );
    }, [sessions]);

    return (
        <div className="teacher-history-page">
            <div className="teacher-history-header">
                <div>
                    <Link to="/teacher" className="teacher-history-back-link">
                        ← Back to Dashboard
                    </Link>
                    <h1>Attendance History</h1>
                    <p>Review previous attendance sessions and student-wise attendance.</p>
                </div>

                <button
                    type="button"
                    className="btn btn-outline-primary"
                    onClick={loadHistory}
                    disabled={loading}
                >
                    {loading ? "Refreshing..." : "Refresh"}
                </button>
            </div>

            {loading ? (
                <div className="teacher-history-state">
                    <div className="spinner-border text-primary" role="status" aria-hidden="true" />
                    <span>Loading attendance history...</span>
                </div>
            ) : error ? (
                <div className="alert alert-danger teacher-history-alert">
                    {error}
                </div>
            ) : sessions.length === 0 ? (
                <div className="teacher-history-empty">
                    <div className="teacher-history-empty-icon">✓</div>
                    <h2>No attendance sessions yet</h2>
                    <p>Start an attendance session from your Teacher Dashboard to see it here.</p>
                    <Link to="/teacher" className="btn btn-primary">
                        Go to Dashboard
                    </Link>
                </div>
            ) : (
                <>
                    <div className="teacher-history-summary-grid">
                        <div className="teacher-history-summary-card">
                            <span>Total Sessions</span>
                            <strong>{totals.sessions}</strong>
                        </div>
                        <div className="teacher-history-summary-card">
                            <span>Students Recorded</span>
                            <strong>{totals.students}</strong>
                        </div>
                        <div className="teacher-history-summary-card">
                            <span>Present Records</span>
                            <strong>{totals.present}</strong>
                        </div>
                        <div className="teacher-history-summary-card">
                            <span>Absent Records</span>
                            <strong>{totals.absent}</strong>
                        </div>
                    </div>

                    <div className="teacher-history-layout">
                        <section className="teacher-history-card">
                            <div className="teacher-history-card-header">
                                <div>
                                    <h2>Sessions</h2>
                                    <p>Select a session to view its students.</p>
                                </div>
                            </div>

                            <div className="teacher-session-list">
                                {sessions.map((session) => {
                                    const isSelected =
                                        selectedSession?.sessionId === session.sessionId;

                                    return (
                                        <button
                                            type="button"
                                            className={`teacher-session-item ${
                                                isSelected ? "selected" : ""
                                            }`}
                                            key={session.sessionId}
                                            onClick={() => loadSessionAttendance(session)}
                                        >
                                            <div className="teacher-session-item-main">
                                                <div className="teacher-session-course">
                                                    <strong>{session.courseCode}</strong>
                                                    <span>{session.courseName}</span>
                                                </div>
                                                <span
                                                    className={`teacher-session-status ${
                                                        session.status?.toLowerCase()
                                                    }`}
                                                >
                                                    {session.status}
                                                </span>
                                            </div>

                                            <div className="teacher-session-meta">
                                                <span>{formatDate(session.attendanceDate)}</span>
                                                <span>{session.totalStudents} students</span>
                                            </div>

                                            <div className="teacher-session-counts">
                                                <span className="present-count">
                                                    {session.presentCount} Present
                                                </span>
                                                <span className="absent-count">
                                                    {session.absentCount} Absent
                                                </span>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </section>

                        <section className="teacher-history-card teacher-history-details">
                            {!selectedSession ? (
                                <div className="teacher-history-state compact">
                                    Select a session to view attendance details.
                                </div>
                            ) : (
                                <>
                                    <div className="teacher-history-card-header details-header">
                                        <div>
                                            <div className="teacher-details-title-row">
                                                <h2>{selectedSession.courseCode}</h2>
                                                <span
                                                    className={`teacher-session-status ${selectedSession.status?.toLowerCase()}`}
                                                >
                                                    {selectedSession.status}
                                                </span>
                                            </div>
                                            <p>{selectedSession.courseName}</p>
                                        </div>

                                        <div className="teacher-details-date">
                                            <strong>{formatDate(selectedSession.attendanceDate)}</strong>
                                            <span>
                                                Started {formatTime(selectedSession.startedAt)}
                                            </span>
                                        </div>
                                    </div>

                                    {detailsLoading ? (
                                        <div className="teacher-history-state compact">
                                            <div className="spinner-border spinner-border-sm text-primary" role="status" aria-hidden="true" />
                                            Loading student attendance...
                                        </div>
                                    ) : detailsError ? (
                                        <div className="alert alert-danger teacher-history-alert">
                                            {detailsError}
                                        </div>
                                    ) : attendance.length === 0 ? (
                                        <div className="teacher-history-empty compact">
                                            <h3>No attendance records</h3>
                                            <p>No student attendance records were found for this session.</p>
                                        </div>
                                    ) : (
                                        <div className="teacher-attendance-table-wrap">
                                            <table className="table teacher-attendance-table align-middle mb-0">
                                                <thead>
                                                    <tr>
                                                        <th>Student</th>
                                                        <th>Registration Number</th>
                                                        <th>Status</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {attendance.map((record) => (
                                                        <tr key={record.studentId}>
                                                            <td>
                                                                <strong>{record.studentName}</strong>
                                                            </td>
                                                            <td>{record.registrationNumber}</td>
                                                            <td>
                                                                <span
                                                                    className={`teacher-attendance-status ${record.status?.toLowerCase()}`}
                                                                >
                                                                    {record.status}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </>
                            )}
                        </section>
                    </div>
                </>
            )}
        </div>
    );
}

export default TeacherAttendanceHistory;
