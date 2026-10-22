import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

function StudentDashboard() {
    const { logout } = useAuth();

    const [student, setStudent] = useState(null);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                setError("");

                const [studentResponse, coursesResponse] =
                    await Promise.all([
                        api.get("/student/me"),
                        api.get("/enrollment/my-courses"),
                    ]);

                setStudent(studentResponse.data);
                setCourses(coursesResponse.data);

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
                    <div
                        className="spinner-border"
                        role="status"
                    ></div>

                    <p>Loading your dashboard...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="student-dashboard">
                <div className="student-error">

                    <h3>
                        Unable to load dashboard
                    </h3>

                    <p>{error}</p>

                    <button
                        className="btn btn-danger"
                        onClick={logout}
                    >
                        Logout
                    </button>

                </div>
            </div>
        );
    }

    return (
        <div className="student-dashboard">

            {/* Header */}
            <div className="student-dashboard-header">

                <div>
                    <p className="student-dashboard-label">
                        STUDENT DASHBOARD
                    </p>

                    <h1>
                        Welcome, {student.studentName} 👋
                    </h1>

                    <p className="student-dashboard-subtitle">
                        Here's an overview of your academic profile.
                    </p>
                </div>

                <button
                    className="student-logout-btn"
                    onClick={logout}
                >
                    Logout
                </button>

            </div>


            {/* Student Quick Stats */}
            <div className="student-stat-grid">

                <div className="student-stat-card">
                    <span className="student-stat-label">
                        Registration Number
                    </span>

                    <strong>
                        {student.registrationNumber}
                    </strong>
                </div>

                <div className="student-stat-card">
                    <span className="student-stat-label">
                        Department
                    </span>

                    <strong>
                        {student.department}
                    </strong>
                </div>

                <div className="student-stat-card">
                    <span className="student-stat-label">
                        Semester
                    </span>

                    <strong>
                        {student.semester}
                    </strong>
                </div>

                <div className="student-stat-card">
                    <span className="student-stat-label">
                        Enrolled Courses
                    </span>

                    <strong>
                        {courses.length}
                    </strong>
                </div>

            </div>


            {/* Main Content */}
            <div className="student-dashboard-grid">

                {/* Personal Information */}
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

                        <div className="student-profile-icon">
                            {student.studentName
                                ?.charAt(0)
                                .toUpperCase()}
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
                            <span>Section</span>
                            <strong>
                                {student.section}
                            </strong>
                        </div>

                        <div className="student-info-item">
                            <span>Date of Birth</span>
                            <strong>
                                {student.dateOfBirth || "Not provided"}
                            </strong>
                        </div>

                        <div className="student-info-item">
                            <span>Gender</span>
                            <strong>
                                {student.gender || "Not provided"}
                            </strong>
                        </div>

                    </div>

                </div>


                {/* Face Registration */}
                <div className="student-dashboard-card student-face-card">

                    <div className="student-card-header">

                        <div>
                            <p className="student-card-label">
                                SECURITY
                            </p>

                            <h2>
                                Face Registration
                            </h2>
                        </div>

                        <div className="face-icon">
                            {student.faceRegistered ? "✓" : "!"}
                        </div>

                    </div>


                    {student.faceRegistered ? (

                        <div className="face-status success">

                            <div className="face-status-icon">
                                ✓
                            </div>

                            <div>
                                <h3>
                                    Face Registered
                                </h3>

                                <p>
                                    Your face is registered successfully
                                    and ready for attendance.
                                </p>
                            </div>

                        </div>

                    ) : (

                        <div className="face-status pending">

                            <div className="face-status-icon">
                                !
                            </div>

                            <div>
                                <h3>
                                    Face Not Registered
                                </h3>

                                <p>
                                    Your face has not been registered yet.
                                    Please contact your administrator.
                                </p>
                            </div>

                        </div>

                    )}

                </div>

            </div>


            {/* My Courses */}
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

                    <div className="student-no-courses">
                        <div className="no-courses-icon">
                            📚
                        </div>

                        <h3>
                            No courses enrolled
                        </h3>

                        <p>
                            You currently don't have any active course
                            enrollments.
                        </p>
                    </div>

                ) : (

                    <div className="student-course-grid">

                        {courses.map((course) => (

                            <div
                                className="student-course-card"
                                key={course.id}
                            >

                                <div className="student-course-top">

                                    <span className="student-course-code">
                                        {course.courseCode}
                                    </span>

                                    <span
                                        className={`student-course-status ${
                                            course.status?.toLowerCase()
                                        }`}
                                    >
                                        {course.status}
                                    </span>

                                </div>


                                <h3>
                                    {course.courseName}
                                </h3>


                                <div className="student-course-details">

                                    <div>
                                        <span>
                                            Registration Number
                                        </span>

                                        <strong>
                                            {course.registrationNumber}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>
                                            Enrollment Date
                                        </span>

                                        <strong>
                                            {course.enrollmentDate}
                                        </strong>
                                    </div>

                                </div>

                            </div>

                        ))}

                    </div>

                )}

            </div>


            {/* Attendance */}
            <div className="student-coming-soon">

                <h2>
                    Attendance
                </h2>

                <p>
                    Your attendance records and live attendance
                    sessions will appear here.
                </p>

                <span>
                    Coming next 🚀
                </span>

            </div>

        </div>
    );
}

export default StudentDashboard;