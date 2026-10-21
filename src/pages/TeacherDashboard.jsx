import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

function TeacherDashboard() {
    const { user, logout } = useAuth();

    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        loadCourses();
    }, []);

    const loadCourses = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/course/my-courses");

            setCourses(response.data);
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

    return (
        <div className="teacher-dashboard">

            {/* Header */}
            <div className="teacher-header">
                <div>
                    <h1>Teacher Dashboard</h1>
                    <p>Welcome, {user?.email}</p>
                </div>

                <button
                    className="btn btn-danger"
                    onClick={logout}
                >
                    Logout
                </button>
            </div>

            {/* My Courses */}
            <div className="teacher-section">

                <div className="teacher-section-header">
                    <div>
                        <h2>My Courses</h2>
                        <p>
                            Courses assigned to you
                        </p>
                    </div>

                    <button
                        className="btn btn-outline-primary"
                        onClick={loadCourses}
                    >
                        Refresh
                    </button>
                </div>

                {/* Loading */}
                {loading && (
                    <div className="teacher-message">
                        Loading your courses...
                    </div>
                )}

                {/* Error */}
                {!loading && error && (
                    <div className="alert alert-danger">
                        {error}
                    </div>
                )}

                {/* No courses */}
                {!loading && !error && courses.length === 0 && (
                    <div className="teacher-message">
                        No courses have been assigned to you.
                    </div>
                )}

                {/* Courses */}
                {!loading && !error && courses.length > 0 && (
                    <div className="teacher-course-grid">

                        {courses.map((course) => (
                            <div
                                className="teacher-course-card"
                                key={course.id}
                            >

                                <div className="course-card-top">
                                    <span className="course-code">
                                        {course.courseCode}
                                    </span>

                                    <span className="course-semester">
                                        Semester {course.semester}
                                    </span>
                                </div>

                                <h3>
                                    {course.courseName}
                                </h3>

                                <div className="course-details">

                                    <div>
                                        <span>Department</span>
                                        <strong>
                                            {course.department}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>Credits</span>
                                        <strong>
                                            {course.credits}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>Total Classes</span>
                                        <strong>
                                            {course.totalClasses}
                                        </strong>
                                    </div>

                                </div>

                                <button
                                    className="btn btn-primary w-100 mt-3"
                                    disabled
                                >
                                    Start Attendance
                                </button>

                            </div>
                        ))}

                    </div>
                )}

            </div>
        </div>
    );
}

export default TeacherDashboard;