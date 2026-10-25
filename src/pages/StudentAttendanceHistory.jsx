import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function StudentAttendanceHistory() {
    const navigate = useNavigate();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [filter, setFilter] = useState("ALL");

    const loadHistory = async () => {
        try {
            setLoading(true);
            setError("");
            const response = await api.get("/attendance/me/courses");
            setCourses(Array.isArray(response.data) ? response.data : []);
        } catch (err) {
            console.error("Failed to load attendance history:", err);
            setError(
                err.response?.data?.message ||
                "Unable to load your attendance history."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadHistory();
    }, []);

    const filteredCourses = useMemo(() => {
        if (filter === "ALL") return courses;
        return courses.filter((course) => {
            if (filter === "GOOD") return course.attendancePercentage >= 75;
            return course.attendancePercentage < 75;
        });
    }, [courses, filter]);

    const totalSessions = courses.reduce((sum, item) => sum + (item.totalSessions || 0), 0);
    const presentCount = courses.reduce((sum, item) => sum + (item.presentCount || 0), 0);
    const absentCount = courses.reduce((sum, item) => sum + (item.absentCount || 0), 0);
    const overallPercentage = totalSessions > 0
        ? (presentCount / totalSessions) * 100
        : 0;

    const percentageClass = (percentage) => {
        if (percentage >= 75) return "good";
        if (percentage >= 60) return "warning";
        return "danger";
    };

    if (loading) {
        return (
            <div className="student-history-page">
                <div className="student-history-loading">
                    <div className="student-loading-spinner"></div>
                    <p>Loading your attendance history...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="student-history-page">
            <div className="student-history-header">
                <div>
                    <p className="student-dashboard-label">ATTENDANCE</p>
                    <h1>Attendance History</h1>
                    <p>
                        Review your attendance performance across all enrolled courses.
                    </p>
                </div>

                <button
                    type="button"
                    className="student-history-back-btn"
                    onClick={() => navigate("/student")}
                >
                    ← Dashboard
                </button>
            </div>

            {error && (
                <div className="student-history-alert">
                    <strong>Unable to load history</strong>
                    <span>{error}</span>
                    <button type="button" onClick={loadHistory}>Retry</button>
                </div>
            )}

            {!error && (
                <>
                    <div className="student-history-summary-grid">
                        <div className="student-history-summary-card">
                            <span>Total Sessions</span>
                            <strong>{totalSessions}</strong>
                        </div>
                        <div className="student-history-summary-card">
                            <span>Present</span>
                            <strong>{presentCount}</strong>
                        </div>
                        <div className="student-history-summary-card">
                            <span>Absent</span>
                            <strong>{absentCount}</strong>
                        </div>
                        <div className="student-history-summary-card highlight">
                            <span>Overall Attendance</span>
                            <strong>{overallPercentage.toFixed(1)}%</strong>
                        </div>
                    </div>

                    <div className="student-history-card">
                        <div className="student-history-card-header">
                            <div>
                                <p className="student-card-label">COURSE BREAKDOWN</p>
                                <h2>Attendance by Course</h2>
                            </div>
                            <div className="student-history-filters">
                                {["ALL", "GOOD", "LOW"].map((option) => (
                                    <button
                                        key={option}
                                        type="button"
                                        className={filter === option ? "active" : ""}
                                        onClick={() => setFilter(option)}
                                    >
                                        {option === "ALL" ? "All" : option === "GOOD" ? "75%+" : "Below 75%"}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {filteredCourses.length === 0 ? (
                            <div className="student-history-empty">
                                <div>📋</div>
                                <h3>No attendance records</h3>
                                <p>
                                    {courses.length === 0
                                        ? "Attendance records will appear here after your courses have conducted classes."
                                        : "No courses match the selected filter."}
                                </p>
                            </div>
                        ) : (
                            <div className="student-history-list">
                                {filteredCourses.map((course) => {
                                    const percentage = course.attendancePercentage || 0;
                                    const statusClass = percentageClass(percentage);

                                    return (
                                        <div className="student-history-course" key={course.courseId}>
                                            <div className="student-history-course-main">
                                                <div className="student-history-course-code">
                                                    {course.courseCode}
                                                </div>
                                                <div>
                                                    <h3>{course.courseName}</h3>
                                                    <p>
                                                        {course.totalSessions} session{course.totalSessions === 1 ? "" : "s"} conducted
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="student-history-course-stats">
                                                <div>
                                                    <span>Present</span>
                                                    <strong>{course.presentCount}</strong>
                                                </div>
                                                <div>
                                                    <span>Absent</span>
                                                    <strong>{course.absentCount}</strong>
                                                </div>
                                                <div className={`student-history-percentage ${statusClass}`}>
                                                    <span>Attendance</span>
                                                    <strong>{percentage.toFixed(1)}%</strong>
                                                </div>
                                            </div>

                                            <div className="student-history-progress">
                                                <div style={{ width: `${Math.min(Math.max(percentage, 0), 100)}%` }}></div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}

export default StudentAttendanceHistory;
