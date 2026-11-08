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
            <div >
                <div >
                    <div ></div>
                    <p>Loading your attendance history...</p>
                </div>
            </div>
        );
    }

    return (
        <div >
            <div >
                <div>
                    <p >ATTENDANCE</p>
                    <h1>Attendance History</h1>
                    <p>
                        Review your attendance performance across all enrolled courses.
                    </p>
                </div>

                <div >
                    <button
                        type="button"
                        
                        onClick={() => navigate("/student/attendance")}
                    >
                        Mark Attendance
                    </button>
                    <button
                        type="button"
                        
                        onClick={() => navigate("/student")}
                    >
                        ← Dashboard
                    </button>
                </div>
            </div>

            {error && (
                <div >
                    <strong>Unable to load history</strong>
                    <span>{error}</span>
                    <button type="button" onClick={loadHistory}>Retry</button>
                </div>
            )}

            {!error && (
                <>
                    <div >
                        <div >
                            <span>Total Sessions</span>
                            <strong>{totalSessions}</strong>
                        </div>
                        <div >
                            <span>Present</span>
                            <strong>{presentCount}</strong>
                        </div>
                        <div >
                            <span>Absent</span>
                            <strong>{absentCount}</strong>
                        </div>
                        <div >
                            <span>Overall Attendance</span>
                            <strong>{overallPercentage.toFixed(1)}%</strong>
                        </div>
                    </div>

                    <div >
                        <div >
                            <div>
                                <p >COURSE BREAKDOWN</p>
                                <h2>Attendance by Course</h2>
                            </div>
                            <div >
                                {["ALL", "GOOD", "LOW"].map((option) => (
                                    <button
                                        key={option}
                                        type="button"
                                        
                                        onClick={() => setFilter(option)}
                                    >
                                        {option === "ALL" ? "All" : option === "GOOD" ? "75%+" : "Below 75%"}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {filteredCourses.length === 0 ? (
                            <div >
                                <div></div>
                                <h3>No attendance records</h3>
                                <p>
                                    {courses.length === 0
                                        ? "Attendance records will appear here after your courses have conducted classes."
                                        : "No courses match the selected filter."}
                                </p>
                            </div>
                        ) : (
                            <div >
                                {filteredCourses.map((course) => {
                                    const percentage = course.attendancePercentage || 0;
                                    const statusClass = percentageClass(percentage);

                                    return (
                                        <div  key={course.courseId}>
                                            <div >
                                                <div >
                                                    {course.courseCode}
                                                </div>
                                                <div>
                                                    <h3>{course.courseName}</h3>
                                                    <p>
                                                        {course.totalSessions} session{course.totalSessions === 1 ? "" : "s"} conducted
                                                    </p>
                                                </div>
                                            </div>

                                            <div >
                                                <div>
                                                    <span>Present</span>
                                                    <strong>{course.presentCount}</strong>
                                                </div>
                                                <div>
                                                    <span>Absent</span>
                                                    <strong>{course.absentCount}</strong>
                                                </div>
                                                <div >
                                                    <span>Attendance</span>
                                                    <strong>{percentage.toFixed(1)}%</strong>
                                                </div>
                                            </div>

                                            <div >
                                                <div ></div>
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
