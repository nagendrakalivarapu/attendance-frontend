import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

function TeacherDashboard() {
    const { user, logout } = useAuth();

    const [courses, setCourses] = useState([]);
    const [courseStudents, setCourseStudents] = useState({});
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

            const teacherCourses = response.data;

            setCourses(teacherCourses);

            // Load students for every course
            const studentRequests = teacherCourses.map(async (course) => {
                try {
                    const studentResponse = await api.get(
                        `/enrollment/course/${course.id}`
                    );

                    return {
                        courseId: course.id,
                        students: studentResponse.data,
                    };
                } catch (err) {
                    console.error(
                        `Failed to load students for course ${course.id}`,
                        err
                    );

                    return {
                        courseId: course.id,
                        students: [],
                    };
                }
            });

            const results = await Promise.all(studentRequests);

            const studentsByCourse = {};

            results.forEach((result) => {
                studentsByCourse[result.courseId] = result.students;
            });

            setCourseStudents(studentsByCourse);

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

    const startAttendance = async (courseId) => {
        try {
            const response = await api.post(
                "/attendance-sessions",
                {
                    courseId: courseId,
                }
            );

            console.log(
                "Attendance session started:",
                response.data
            );

            alert("Attendance session started successfully!");

        } catch (err) {
            console.error(err);

            alert(
                err.response?.data?.message ||
                "Failed to start attendance session."
            );
        }
    };

    return (
        <div className="teacher-dashboard">

            {/* Header */}
            <div className="teacher-header">

                <div>
                    <h1>Teacher Dashboard</h1>

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
                {!loading &&
                    !error &&
                    courses.length === 0 && (
                        <div className="teacher-message">
                            No courses have been assigned to you.
                        </div>
                    )}


                {/* Courses */}
                {!loading &&
                    !error &&
                    courses.length > 0 && (

                        <div className="teacher-course-grid">

                            {courses.map((course) => {

                                const students =
                                    courseStudents[course.id] || [];

                                return (

                                    <div
                                        className="teacher-course-card"
                                        key={course.id}
                                    >

                                        {/* Course Header */}
                                        <div className="course-card-top">

                                            <span className="course-code">
                                                {course.courseCode}
                                            </span>

                                            <span className="course-semester">
                                                Semester {course.semester}
                                            </span>

                                        </div>


                                        {/* Course Name */}
                                        <h3>
                                            {course.courseName}
                                        </h3>


                                        {/* Course Details */}
                                        <div className="course-details">

                                            <div>
                                                <span>
                                                    Department
                                                </span>

                                                <strong>
                                                    {course.department}
                                                </strong>
                                            </div>


                                            <div>
                                                <span>
                                                    Credits
                                                </span>

                                                <strong>
                                                    {course.credits}
                                                </strong>
                                            </div>


                                            <div>
                                                <span>
                                                    Total Classes
                                                </span>

                                                <strong>
                                                    {course.totalClasses}
                                                </strong>
                                            </div>

                                        </div>


                                        {/* Students Section */}
                                        <div className="course-students">

                                            <div className="students-header">

                                                <h4>
                                                    Students
                                                </h4>

                                                <span className="student-count">
                                                    {students.length}
                                                </span>

                                            </div>


                                            {/* Students */}
                                            {students.length > 0 ? (

                                                <div className="student-list">

                                                    {students.map(
                                                        (enrollment) => (

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
                                                    No students enrolled
                                                    in this course.
                                                </div>

                                            )}

                                        </div>


                                        {/* Start Attendance */}
                                        <button
                                            className="btn btn-primary w-100 mt-3"
                                            onClick={() =>
                                                startAttendance(
                                                    course.id
                                                )
                                            }
                                            disabled={
                                                students.length === 0
                                            }
                                        >
                                            Start Attendance
                                        </button>

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