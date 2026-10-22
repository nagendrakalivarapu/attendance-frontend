import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

const PROFILE_IMAGE_BASE_URL =
    "http://localhost:8080/uploads/profile-pictures/";

function StudentDashboard() {
    const { logout } = useAuth();

    const [student, setStudent] = useState(null);
    const [courses, setCourses] = useState([]);
    const [attendanceSummary, setAttendanceSummary] = useState(null);
    const [courseAttendance, setCourseAttendance] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                setError("");

                const [
                    studentResponse,
                    coursesResponse,
                    attendanceSummaryResponse,
                    courseAttendanceResponse,
                ] = await Promise.all([
                    api.get("/student/me"),
                    api.get("/enrollment/my-courses"),
                    api.get("/attendance/me/summary"),
                    api.get("/attendance/me/courses"),
                ]);

                setStudent(studentResponse.data);
                setCourses(coursesResponse.data);
                setAttendanceSummary(attendanceSummaryResponse.data);
                setCourseAttendance(courseAttendanceResponse.data);

            } catch (err) {
                console.error("Failed to load dashboard:", err);

                setError(
                    err.response?.data?.message ||
                    "Unable to load dashboard."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) {
        return (
            <div className="student-dashboard">
                <div className="student-loading">
                    <div className="student-loading-spinner"></div>
                    <p>Loading your dashboard...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="student-dashboard">
                <div className="student-error">
                    <h3>Unable to load dashboard</h3>
                    <p>{error}</p>

                    <button
                        className="student-retry-btn"
                        onClick={() => window.location.reload()}
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    if (!student) {
        return (
            <div className="student-dashboard">
                <div className="student-error">
                    <h3>Student information not found</h3>
                    <p>Please contact the administrator.</p>
                </div>
            </div>
        );
    }

    const attendancePercentage =
        attendanceSummary?.attendancePercentage ?? 0;

    const totalSessions =
        attendanceSummary?.totalSessions ?? 0;

    const presentCount =
        attendanceSummary?.presentCount ?? 0;

    const absentCount =
        attendanceSummary?.absentCount ?? 0;

    return (
        <div className="student-dashboard">

            {/* ================= HEADER ================= */}

            <div className="student-dashboard-header">

                <div className="student-welcome">

                    <p className="student-dashboard-label">
                        STUDENT DASHBOARD
                    </p>

                    <h1>
                        Welcome, {student.studentName} 👋
                    </h1>

                    <p className="student-dashboard-subtitle">
                        Here's an overview of your academic information
                        and attendance.
                    </p>

                </div>

                <button
                    className="student-logout-btn"
                    onClick={logout}
                >
                    Logout
                </button>

            </div>


            {/* ================= PROFILE / QUICK INFO ================= */}

            <div className="student-dashboard-card student-profile-card">

                <div className="student-profile-header">

                    <div className="student-profile-left">

                        {student.profilePicture ? (
                            <img
                                src={`${PROFILE_IMAGE_BASE_URL}${student.profilePicture}`}
                                alt={student.studentName}
                                className="student-profile-image"
                            />
                        ) : (
                            <div className="student-profile-icon">
                                {student.studentName
                                    ?.charAt(0)
                                    ?.toUpperCase()}
                            </div>
                        )}

                        <div>
                            <p className="student-card-label">
                                STUDENT
                            </p>

                            <h2>
                                {student.studentName}
                            </h2>

                            <p className="student-profile-email">
                                {student.email}
                            </p>
                        </div>

                    </div>

                    <div
                        className={
                            student.faceRegistered
                                ? "student-face-status registered"
                                : "student-face-status pending"
                        }
                    >
                        <span className="student-status-dot"></span>

                        {student.faceRegistered
                            ? "Face Recognition Registered"
                            : "Face Recognition Pending"}
                    </div>

                </div>

            </div>


            {/* ================= QUICK STATS ================= */}

            <div className="student-stat-grid">

                <div className="student-stat-card">

                    <span className="student-stat-label">
                        REGISTRATION NUMBER
                    </span>

                    <strong>
                        {student.registrationNumber}
                    </strong>

                </div>


                <div className="student-stat-card">

                    <span className="student-stat-label">
                        DEPARTMENT
                    </span>

                    <strong>
                        {student.department}
                    </strong>

                </div>


                <div className="student-stat-card">

                    <span className="student-stat-label">
                        SEMESTER
                    </span>

                    <strong>
                        {student.semester}
                    </strong>

                </div>


                <div className="student-stat-card">

                    <span className="student-stat-label">
                        ENROLLED COURSES
                    </span>

                    <strong>
                        {courses.length}
                    </strong>

                </div>

            </div>


            {/* ================= ATTENDANCE OVERVIEW ================= */}

            <div className="student-dashboard-card">

                <div className="student-card-header">

                    <div>
                        <p className="student-card-label">
                            ATTENDANCE
                        </p>

                        <h2>
                            Attendance Overview
                        </h2>
                    </div>

                    <div className="student-attendance-percentage">
                        {attendancePercentage.toFixed(0)}%
                    </div>

                </div>


                <div className="student-attendance-progress">

                    <div className="student-progress-track">

                        <div
                            className="student-progress-fill"
                            style={{
                                width: `${Math.min(
                                    Math.max(attendancePercentage, 0),
                                    100
                                )}%`,
                            }}
                        ></div>

                    </div>

                </div>


                <div className="student-attendance-stats">

                    <div className="student-attendance-stat">

                        <span>Total Sessions</span>

                        <strong>
                            {totalSessions}
                        </strong>

                    </div>


                    <div className="student-attendance-stat">

                        <span>Present</span>

                        <strong>
                            {presentCount}
                        </strong>

                    </div>


                    <div className="student-attendance-stat">

                        <span>Absent</span>

                        <strong>
                            {absentCount}
                        </strong>

                    </div>


                    <div className="student-attendance-stat">

                        <span>Attendance</span>

                        <strong>
                            {attendancePercentage.toFixed(1)}%
                        </strong>

                    </div>

                </div>

            </div>


            {/* ================= MAIN GRID ================= */}

            <div className="student-dashboard-grid">


                {/* ================= PERSONAL INFORMATION ================= */}

                <div className="student-dashboard-card">

                    <div className="student-card-header">

                        <div>
                            <p className="student-card-label">
                                PROFILE
                            </p>

                            <h2>
                                Personal Information
                            </h2>
                        </div>

                    </div>


                    <div className="student-info-grid">

                        <div className="student-info-item">

                            <span>Full Name</span>

                            <strong>
                                {student.studentName}
                            </strong>

                        </div>


                        <div className="student-info-item">

                            <span>Email</span>

                            <strong>
                                {student.email}
                            </strong>

                        </div>


                        <div className="student-info-item">

                            <span>Phone</span>

                            <strong>
                                {student.phone || "Not provided"}
                            </strong>

                        </div>


                        <div className="student-info-item">

                            <span>Gender</span>

                            <strong>
                                {student.gender || "Not provided"}
                            </strong>

                        </div>


                        <div className="student-info-item">

                            <span>Date of Birth</span>

                            <strong>
                                {student.dateOfBirth || "Not provided"}
                            </strong>

                        </div>


                        <div className="student-info-item">

                            <span>Section</span>

                            <strong>
                                {student.section}
                            </strong>

                        </div>


                        <div className="student-info-item">

                            <span>Department</span>

                            <strong>
                                {student.department}
                            </strong>

                        </div>


                        <div className="student-info-item">

                            <span>Semester</span>

                            <strong>
                                {student.semester}
                            </strong>

                        </div>


                        <div className="student-info-item student-info-full">

                            <span>Address</span>

                            <strong>
                                {student.address || "Not provided"}
                            </strong>

                        </div>

                    </div>

                </div>


                {/* ================= FACE RECOGNITION ================= */}

                <div className="student-dashboard-card student-face-card">

                    <div className="student-card-header">

                        <div>
                            <p className="student-card-label">
                                SECURITY
                            </p>

                            <h2>
                                Face Recognition
                            </h2>
                        </div>

                    </div>


                    <div
                        className={
                            student.faceRegistered
                                ? "student-face-status-box registered"
                                : "student-face-status-box pending"
                        }
                    >

                        <div className="student-face-icon">
                            {student.faceRegistered ? "✓" : "!"}
                        </div>

                        <div>

                            <strong>
                                {student.faceRegistered
                                    ? "Face Registered"
                                    : "Registration Pending"}
                            </strong>

                            <p>
                                {student.faceRegistered
                                    ? "Your face is registered and can be used for attendance."
                                    : "Please contact the administrator to register your face."}
                            </p>

                        </div>

                    </div>

                </div>

            </div>


            {/* ================= COURSE ATTENDANCE ================= */}

            <div className="student-dashboard-card">

                <div className="student-card-header">

                    <div>
                        <p className="student-card-label">
                            ATTENDANCE
                        </p>

                        <h2>
                            Course Attendance
                        </h2>
                    </div>

                </div>


                {courseAttendance.length === 0 ? (

                    <div className="student-empty-state">

                        <p>
                            No attendance records available yet.
                        </p>

                    </div>

                ) : (

                    <div className="student-course-attendance-list">

                        {courseAttendance.map((course) => (

                            <div
                                className="student-course-attendance"
                                key={course.courseId}
                            >

                                <div className="student-course-attendance-info">

                                    <div>

                                        <h3>
                                            {course.courseCode}
                                        </h3>

                                        <p>
                                            {course.courseName}
                                        </p>

                                    </div>

                                    <strong>
                                        {course.attendancePercentage.toFixed(1)}%
                                    </strong>

                                </div>


                                <div className="student-progress-track">

                                    <div
                                        className="student-progress-fill"
                                        style={{
                                            width: `${Math.min(
                                                Math.max(
                                                    course.attendancePercentage,
                                                    0
                                                ),
                                                100
                                            )}%`,
                                        }}
                                    ></div>

                                </div>


                                <div className="student-course-attendance-stats">

                                    <span>
                                        Sessions:{" "}
                                        <strong>
                                            {course.totalSessions}
                                        </strong>
                                    </span>

                                    <span>
                                        Present:{" "}
                                        <strong>
                                            {course.presentCount}
                                        </strong>
                                    </span>

                                    <span>
                                        Absent:{" "}
                                        <strong>
                                            {course.absentCount}
                                        </strong>
                                    </span>

                                </div>

                            </div>

                        ))}

                    </div>

                )}

            </div>


            {/* ================= MY COURSES ================= */}

            <div className="student-courses-section">

                <div className="student-section-header">

                    <div>
                        <p className="student-card-label">
                            ACADEMICS
                        </p>

                        <h2>
                            My Courses
                        </h2>
                    </div>

                    <span className="student-course-count">
                        {courses.length}{" "}
                        {courses.length === 1 ? "Course" : "Courses"}
                    </span>

                </div>


                {courses.length === 0 ? (

                    <div className="student-dashboard-card student-empty-state">

                        <p>
                            You are not enrolled in any courses yet.
                        </p>

                    </div>

                ) : (

                    <div className="student-course-grid">

                        {courses.map((course) => {

                            const attendance = courseAttendance.find(
                                (item) =>
                                    item.courseId === course.courseId
                            );

                            return (

                                <div
                                    className="student-course-card"
                                    key={course.id}
                                >

                                    <div className="student-course-card-top">

                                        <span className="student-course-code">
                                            {course.courseCode}
                                        </span>

                                        <span className="student-course-status">
                                            {course.status}
                                        </span>

                                    </div>


                                    <h3>
                                        {course.courseName}
                                    </h3>


                                    <div className="student-course-details">

                                        <div>
                                            <span>Department</span>
                                            <strong>
                                                {course.department || student.department}
                                            </strong>
                                        </div>

                                        <div>
                                            <span>Semester</span>
                                            <strong>
                                                {course.semester || student.semester}
                                            </strong>
                                        </div>

                                    </div>


                                    {attendance && (

                                        <div className="student-course-card-attendance">

                                            <div>

                                                <span>
                                                    Attendance
                                                </span>

                                                <strong>
                                                    {attendance.attendancePercentage.toFixed(1)}%
                                                </strong>

                                            </div>


                                            <div className="student-progress-track">

                                                <div
                                                    className="student-progress-fill"
                                                    style={{
                                                        width: `${Math.min(
                                                            Math.max(
                                                                attendance.attendancePercentage,
                                                                0
                                                            ),
                                                            100
                                                        )}%`,
                                                    }}
                                                ></div>

                                            </div>

                                        </div>

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

export default StudentDashboard;