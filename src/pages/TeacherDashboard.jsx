import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

function TeacherDashboard() {
    const { user, logout } = useAuth();

    const [courses, setCourses] = useState([]);
    const [courseStudents, setCourseStudents] = useState({});
    const [courseSessions, setCourseSessions] = useState({});

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        loadCourses();
    }, []);

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
        <div className="teacher-dashboard">

            {/* =================================================
                HEADER
            ================================================= */}

            <div className="teacher-header">

                <div>
                    <h1>
                        Teacher Dashboard
                    </h1>

                    <p>
                        Welcome, {user?.email}
                    </p>
                </div>

                <button
                    className="btn btn-danger"
                    onClick={logout}
                >
                    Logout
                </button>

            </div>


            {/* =================================================
                MY COURSES SECTION
            ================================================= */}

            <div className="teacher-section">

                <div className="teacher-section-header">

                    <div>
                        <h2>
                            My Courses
                        </h2>

                        <p>
                            Courses assigned to you
                        </p>
                    </div>

                    <button
                        className="btn btn-outline-primary"
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
                    <div className="teacher-message">
                        Loading your courses...
                    </div>
                )}


                {/* =================================================
                    ERROR
                ================================================= */}

                {!loading && error && (
                    <div className="alert alert-danger">
                        {error}
                    </div>
                )}


                {/* =================================================
                    NO COURSES
                ================================================= */}

                {!loading &&
                    !error &&
                    courses.length === 0 && (

                        <div className="teacher-message">
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

                        <div className="teacher-course-grid">

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
                                        className="teacher-course-card"
                                        key={course.id}
                                    >

                                        {/* =================================================
                                            COURSE HEADER
                                        ================================================= */}

                                        <div className="course-card-top">

                                            <span className="course-code">
                                                {
                                                    course.courseCode
                                                }
                                            </span>

                                            <span className="course-semester">
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

                                        <div className="course-details">

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

                                        <div className="course-students">

                                            <div className="students-header">

                                                <h4>
                                                    Students
                                                </h4>

                                                <span className="student-count">
                                                    {
                                                        students.length
                                                    }
                                                </span>

                                            </div>


                                            {students.length >
                                            0 ? (

                                                <div className="student-list">

                                                    {students.map(
                                                        (
                                                            enrollment
                                                        ) => (

                                                            <div
                                                                className="student-item"
                                                                key={
                                                                    enrollment.id
                                                                }
                                                            >

                                                                <div className="student-info">

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
                                                                    className={`student-status ${
                                                                        enrollment.status?.toLowerCase()
                                                                    }`}
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

                                                <div className="no-course-students">
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

                                            <div className="attendance-session-open">

                                                <div className="attendance-open-header">

                                                    <span className="attendance-live-dot"></span>

                                                    <strong>
                                                        Attendance
                                                        OPEN
                                                    </strong>

                                                </div>


                                                <div className="attendance-started-time">

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
                                                    className="btn btn-danger w-100 mt-3"
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
                                                className="btn btn-primary w-100 mt-3"
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

        </div>
    );
}

export default TeacherDashboard;