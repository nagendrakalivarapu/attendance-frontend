import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function TeacherDashboard() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [courses, setCourses] = useState([]);
    const [attendanceHistory, setAttendanceHistory] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [historyError, setHistoryError] = useState("");
    const [courseStudents, setCourseStudents] = useState({});
    const [courseSessions, setCourseSessions] = useState({});

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        loadCourses();
        loadAttendanceHistory();
    }, []);

    // =========================================================
    // LOAD ATTENDANCE HISTORY
    // =========================================================

    const loadAttendanceHistory = async () => {
        try {
            setHistoryLoading(true);
            setHistoryError("");

            const response = await api.get(
                "/attendance-sessions/my-history"
            );

            setAttendanceHistory(
                Array.isArray(response.data) ? response.data : []
            );
        } catch (err) {
            console.error("Failed to load attendance history:", err);

            setHistoryError(
                err.response?.data?.message ||
                "Unable to load attendance history."
            );
        } finally {
            setHistoryLoading(false);
        }
    };

    // =========================================================
    // LOAD COURSES + STUDENTS + OPEN SESSIONS
    // =========================================================

    const loadCourses = async () => {
        try {
            setLoading(true);
            setError("");

            // Get teacher's courses
            const courseResponse = await api.get(
                "/course/my-courses"
            );

            const teacherCourses = courseResponse.data;

            setCourses(teacherCourses);

            // Load students for all courses
            const studentRequests = teacherCourses.map(
                async (course) => {
                    try {
                        const response = await api.get(
                            `/enrollment/course/${course.id}`
                        );

                        return {
                            courseId: course.id,
                            students: response.data,
                        };
                    } catch (err) {
                        console.error(
                            `Failed to load students for ${course.courseCode}`,
                            err
                        );

                        return {
                            courseId: course.id,
                            students: [],
                        };
                    }
                }
            );

            const studentResults =
                await Promise.all(studentRequests);

            const studentsByCourse = {};

            studentResults.forEach((result) => {
                studentsByCourse[result.courseId] =
                    result.students;
            });

            setCourseStudents(studentsByCourse);

            // Load currently OPEN attendance sessions
            await loadOpenSessions(teacherCourses);

        } catch (err) {
            console.error(err);

            setError(
                err.response?.data?.message ||
                "Failed to load your courses."
            );
        } finally {
            setLoading(false);
        }
    };

    // =========================================================
    // LOAD OPEN ATTENDANCE SESSIONS
    // =========================================================

    const loadOpenSessions = async (teacherCourses) => {
        const activeSessions = {};

        await Promise.all(
            teacherCourses.map(async (course) => {
                try {
                    const response = await api.get(
                        `/attendance-sessions/course/${course.id}/open`
                    );

                    const session = response.data;

                    if (
                        session.status === "OPEN" &&
                        session.courseId === course.id
                    ) {
                        activeSessions[course.id] =
                            session;
                    }

                } catch (err) {
                    // No OPEN session for this course.
                    console.log(
                        `No open attendance session for ${course.courseCode}`
                    );
                }
            })
        );

        setCourseSessions(activeSessions);
    };

    // =========================================================
    // START ATTENDANCE
    // =========================================================

    const startAttendance = async (courseId) => {
        try {
            const response = await api.post(
                "/attendance-sessions",
                {
                    courseId: courseId,
                }
            );

            const session = response.data;

            console.log(
                "Attendance session started:",
                session
            );

            setCourseSessions((previous) => ({
                ...previous,
                [courseId]: session,
            }));

        } catch (err) {
            console.error(err);

            alert(
                err.response?.data?.message ||
                "Failed to start attendance session."
            );
        }
    };

    // =========================================================
    // CLOSE ATTENDANCE
    // =========================================================

    const closeAttendance = async (courseId) => {
        const session = courseSessions[courseId];

        if (!session) {
            return;
        }

        const confirmed = window.confirm(
            "Are you sure you want to close this attendance session?"
        );

        if (!confirmed) {
            return;
        }

        try {
            await api.put(
                `/attendance-sessions/${session.id}/close`
            );

            setCourseSessions((previous) => {
                const updated = {
                    ...previous,
                };

                delete updated[courseId];

                return updated;
            });

            alert(
                "Attendance session closed successfully."
            );

            // Reload course/student/session data
            await loadCourses();

        } catch (err) {
            console.error(err);

            alert(
                err.response?.data?.message ||
                "Failed to close attendance session."
            );
        }
    };

    // =========================================================
    // FORMAT TIME
    // =========================================================

    const formatTime = (dateTime) => {
        if (!dateTime) {
            return "--";
        }

        return new Date(dateTime).toLocaleTimeString(
            [],
            {
                hour: "2-digit",
                minute: "2-digit",
            }
        );
    };

    // =========================================================
    // DASHBOARD
    // =========================================================

    return (
        <div >

            {/* =================================================
                HEADER
            ================================================= */}

            <div >

                <div>
                    <h1>
                        Teacher Dashboard
                    </h1>

                    <p>
                        Welcome, {user?.email}
                    </p>
                </div>

                <div >
                    <button
                        type="button"
                        
                        onClick={() => navigate("/teacher")}
                    >
                        Dashboard
                    </button>

                    <button
                        type="button"
                        
                        onClick={() =>
                            document
                                .getElementById("teacher-attendance-history")
                                ?.scrollIntoView({ behavior: "smooth" })
                        }
                    >
                        Attendance History
                    </button>

                    <button
                        type="button"
                        
                        onClick={loadAttendanceHistory}
                        disabled={historyLoading}
                    >
                        {historyLoading ? "Loading..." : "Refresh History"}
                    </button>

                    <button
                        
                        onClick={logout}
                    >
                        Logout
                    </button>
                </div>

            </div>


            {/* =================================================
                MY COURSES SECTION
            ================================================= */}

            <div >

                <div >

                    <div>
                        <h2>
                            My Courses
                        </h2>

                        <p>
                            Courses assigned to you
                        </p>
                    </div>

                    <button
                        
                        onClick={loadCourses}
                        disabled={loading}
                    >
                        {loading
                            ? "Loading..."
                            : "Refresh"}
                    </button>

                </div>


                {/* =================================================
                    LOADING
                ================================================= */}

                {loading && (
                    <div >
                        Loading your courses...
                    </div>
                )}


                {/* =================================================
                    ERROR
                ================================================= */}

                {!loading && error && (
                    <div >
                        {error}
                    </div>
                )}


                {/* =================================================
                    NO COURSES
                ================================================= */}

                {!loading &&
                    !error &&
                    courses.length === 0 && (

                        <div >
                            No courses have been assigned
                            to you.
                        </div>

                    )}


                {/* =================================================
                    COURSE GRID
                ================================================= */}

                {!loading &&
                    !error &&
                    courses.length > 0 && (

                        <div >

                            {courses.map((course) => {

                                const students =
                                    courseStudents[
                                        course.id
                                        ] || [];

                                const session =
                                    courseSessions[
                                        course.id
                                        ];

                                const isOpen =
                                    session?.status ===
                                    "OPEN";

                                return (

                                    <div
                                        
                                        key={course.id}
                                    >

                                        {/* =================================================
                                            COURSE HEADER
                                        ================================================= */}

                                        <div >

                                            <span >
                                                {
                                                    course.courseCode
                                                }
                                            </span>

                                            <span >
                                                Semester{" "}
                                                {
                                                    course.semester
                                                }
                                            </span>

                                        </div>


                                        {/* =================================================
                                            COURSE NAME
                                        ================================================= */}

                                        <h3>
                                            {
                                                course.courseName
                                            }
                                        </h3>


                                        {/* =================================================
                                            COURSE DETAILS
                                        ================================================= */}

                                        <div >

                                            <div>
                                                <span>
                                                    Department
                                                </span>

                                                <strong>
                                                    {
                                                        course.department
                                                    }
                                                </strong>
                                            </div>

                                            <div>
                                                <span>
                                                    Credits
                                                </span>

                                                <strong>
                                                    {
                                                        course.credits
                                                    }
                                                </strong>
                                            </div>

                                            <div>
                                                <span>
                                                    Total Classes
                                                </span>

                                                <strong>
                                                    {
                                                        course.totalClasses
                                                    }
                                                </strong>
                                            </div>

                                        </div>


                                        {/* =================================================
                                            STUDENTS
                                        ================================================= */}

                                        <div >

                                            <div >

                                                <h4>
                                                    Students
                                                </h4>

                                                <span >
                                                    {
                                                        students.length
                                                    }
                                                </span>

                                            </div>


                                            {students.length >
                                            0 ? (

                                                <div >

                                                    {students.map(
                                                        (
                                                            enrollment
                                                        ) => (

                                                            <div
                                                                
                                                                key={
                                                                    enrollment.id
                                                                }
                                                            >

                                                                <div >

                                                                    <strong>
                                                                        {
                                                                            enrollment.studentName
                                                                        }
                                                                    </strong>

                                                                    <span>
                                                                        {
                                                                            enrollment.registrationNumber
                                                                        }
                                                                    </span>

                                                                </div>

                                                                <span
                                                                    
                                                                >
                                                                    {
                                                                        enrollment.status
                                                                    }
                                                                </span>

                                                            </div>

                                                        )
                                                    )}

                                                </div>

                                            ) : (

                                                <div >
                                                    No students
                                                    enrolled in
                                                    this course.
                                                </div>

                                            )}

                                        </div>


                                        {/* =================================================
                                            ATTENDANCE SESSION
                                        ================================================= */}

                                        {isOpen ? (

                                            <div >

                                                <div >

                                                    <span ></span>

                                                    <strong>
                                                        Attendance
                                                        OPEN
                                                    </strong>

                                                </div>


                                                <div >

                                                    Started at:{" "}

                                                    <strong>
                                                        {
                                                            formatTime(
                                                                session.startedAt
                                                            )
                                                        }
                                                    </strong>

                                                </div>


                                                <button
                                                    
                                                    onClick={() =>
                                                        closeAttendance(
                                                            course.id
                                                        )
                                                    }
                                                >
                                                    Close Attendance
                                                </button>

                                            </div>

                                        ) : (

                                            <button
                                                
                                                onClick={() =>
                                                    startAttendance(
                                                        course.id
                                                    )
                                                }
                                                disabled={
                                                    students.length ===
                                                    0
                                                }
                                            >
                                                Start Attendance
                                            </button>

                                        )}

                                    </div>

                                );

                            })}

                        </div>

                    )}

            </div>

            {/* =========================================================
                ATTENDANCE HISTORY
            ========================================================= */}

            <section
                id="teacher-attendance-history"
                
            >
                <div >
                    <div>
                        <h2>Attendance History</h2>
                        <p>Review your completed and active attendance sessions.</p>
                    </div>

                    <button
                        type="button"
                        
                        onClick={loadAttendanceHistory}
                        disabled={historyLoading}
                    >
                        {historyLoading ? "Loading..." : "Refresh"}
                    </button>
                </div>

                {historyError ? (
                    <div >
                        <strong>Unable to load history</strong>
                        <p>{historyError}</p>
                        <button
                            type="button"
                            onClick={loadAttendanceHistory}
                        >
                            Try Again
                        </button>
                    </div>
                ) : attendanceHistory.length === 0 ? (
                    <div >
                        No attendance sessions have been recorded yet.
                    </div>
                ) : (
                    <div >
                        <table >
                            <thead>
                                <tr>
                                    <th>Session</th>
                                    <th>Course</th>
                                    <th>Date</th>
                                    <th>Students</th>
                                    <th>Present</th>
                                    <th>Absent</th>
                                    <th>Attendance</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {attendanceHistory.slice(0, 20).map((session) => (
                                    <tr key={session.sessionId || session.id}>
                                        <td>#{session.sessionId || session.id}</td>
                                        <td>
                                            <strong>{session.courseCode || "—"}</strong>
                                            <small>{session.courseName || "—"}</small>
                                        </td>
                                        <td>{session.attendanceDate || "—"}</td>
                                        <td>{session.totalStudents ?? 0}</td>
                                        <td >
                                            {session.presentCount ?? 0}
                                        </td>
                                        <td >
                                            {session.absentCount ?? 0}
                                        </td>
                                        <td>
                                            {Number(session.attendancePercentage ?? 0).toFixed(1)}%
                                        </td>
                                        <td>
                                            <span
                                                
                                            >
                                                {session.status || "UNKNOWN"}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>

        </div>
    );
}

export default TeacherDashboard;