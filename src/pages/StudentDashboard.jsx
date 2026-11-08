import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

const PROFILE_IMAGE_BASE_URL =
    "http://localhost:8080/uploads/profile-pictures/";

function StudentDashboard() {
    const { logout } = useAuth();
    const navigate = useNavigate();

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
            <div >
                <div >
                    <div ></div>
                    <p>Loading your dashboard...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div >
                <div >
                    <h3>Unable to load dashboard</h3>
                    <p>{error}</p>

                    <button
                        
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
            <div >
                <div >
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
        <div >

            {/* ================= HEADER ================= */}

            <div >

                <div >

                    <p >
                        STUDENT DASHBOARD
                    </p>

                    <h1>
                        Welcome, {student.studentName} 
                    </h1>

                    <p >
                        Here's an overview of your academic information
                        and attendance.
                    </p>

                </div>

                <div >
                    <button
                        
                        onClick={() => navigate("/student/attendance")}
                    >
                        Mark Attendance
                    </button>
                    <button
                        
                        onClick={() => navigate("/student/attendance-history")}
                    >
                        Attendance History
                    </button>
                    <button
                        
                        onClick={logout}
                    >
                        Logout
                    </button>
                </div>

            </div>


            {/* ================= PROFILE / QUICK INFO ================= */}

            <div >

                <div >

                    <div >

                        {student.profilePicture ? (
                            <img
                                src={`${PROFILE_IMAGE_BASE_URL}${student.profilePicture}`}
                                alt={student.studentName}
                                
                            />
                        ) : (
                            <div >
                                {student.studentName
                                    ?.charAt(0)
                                    ?.toUpperCase()}
                            </div>
                        )}

                        <div>
                            <p >
                                STUDENT
                            </p>

                            <h2>
                                {student.studentName}
                            </h2>

                            <p >
                                {student.email}
                            </p>
                        </div>

                    </div>

                    <div
                        
                    >
                        <span ></span>

                        {student.faceRegistered
                            ? "Face Recognition Registered"
                            : "Face Recognition Pending"}
                    </div>

                </div>

            </div>


            {/* ================= QUICK STATS ================= */}

            <div >

                <div >

                    <span >
                        REGISTRATION NUMBER
                    </span>

                    <strong>
                        {student.registrationNumber}
                    </strong>

                </div>


                <div >

                    <span >
                        DEPARTMENT
                    </span>

                    <strong>
                        {student.department}
                    </strong>

                </div>


                <div >

                    <span >
                        SEMESTER
                    </span>

                    <strong>
                        {student.semester}
                    </strong>

                </div>


                <div >

                    <span >
                        ENROLLED COURSES
                    </span>

                    <strong>
                        {courses.length}
                    </strong>

                </div>

            </div>


            {/* ================= ATTENDANCE OVERVIEW ================= */}

            <div >

                <div >

                    <div>
                        <p >
                            ATTENDANCE
                        </p>

                        <h2>
                            Attendance Overview
                        </h2>
                    </div>

                    <div >
                        {attendancePercentage.toFixed(0)}%
                    </div>

                </div>


                <div >

                    <div >

                        <div
                            
                            
                        ></div>

                    </div>

                </div>


                <div >

                    <div >

                        <span>Total Sessions</span>

                        <strong>
                            {totalSessions}
                        </strong>

                    </div>


                    <div >

                        <span>Present</span>

                        <strong>
                            {presentCount}
                        </strong>

                    </div>


                    <div >

                        <span>Absent</span>

                        <strong>
                            {absentCount}
                        </strong>

                    </div>


                    <div >

                        <span>Attendance</span>

                        <strong>
                            {attendancePercentage.toFixed(1)}%
                        </strong>

                    </div>

                </div>

            </div>


            {/* ================= MAIN GRID ================= */}

            <div >


                {/* ================= PERSONAL INFORMATION ================= */}

                <div >

                    <div >

                        <div>
                            <p >
                                PROFILE
                            </p>

                            <h2>
                                Personal Information
                            </h2>
                        </div>

                    </div>


                    <div >

                        <div >

                            <span>Full Name</span>

                            <strong>
                                {student.studentName}
                            </strong>

                        </div>


                        <div >

                            <span>Email</span>

                            <strong>
                                {student.email}
                            </strong>

                        </div>


                        <div >

                            <span>Phone</span>

                            <strong>
                                {student.phone || "Not provided"}
                            </strong>

                        </div>


                        <div >

                            <span>Gender</span>

                            <strong>
                                {student.gender || "Not provided"}
                            </strong>

                        </div>


                        <div >

                            <span>Date of Birth</span>

                            <strong>
                                {student.dateOfBirth || "Not provided"}
                            </strong>

                        </div>


                        <div >

                            <span>Section</span>

                            <strong>
                                {student.section}
                            </strong>

                        </div>


                        <div >

                            <span>Department</span>

                            <strong>
                                {student.department}
                            </strong>

                        </div>


                        <div >

                            <span>Semester</span>

                            <strong>
                                {student.semester}
                            </strong>

                        </div>


                        <div >

                            <span>Address</span>

                            <strong>
                                {student.address || "Not provided"}
                            </strong>

                        </div>

                    </div>

                </div>


                {/* ================= FACE RECOGNITION ================= */}

                <div >

                    <div >

                        <div>
                            <p >
                                SECURITY
                            </p>

                            <h2>
                                Face Recognition
                            </h2>
                        </div>

                    </div>


                    <div
                        
                    >

                        <div >
                            {student.faceRegistered ? "" : "!"}
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

            <div >

                <div >

                    <div>
                        <p >
                            ATTENDANCE
                        </p>

                        <h2>
                            Course Attendance
                        </h2>
                    </div>

                </div>


                {courseAttendance.length === 0 ? (

                    <div >

                        <p>
                            No attendance records available yet.
                        </p>

                    </div>

                ) : (

                    <div >

                        {courseAttendance.map((course) => (

                            <div
                                
                                key={course.courseId}
                            >

                                <div >

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


                                <div >

                                    <div
                                        
                                        
                                    ></div>

                                </div>


                                <div >

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

            <div >

                <div >

                    <div>
                        <p >
                            ACADEMICS
                        </p>

                        <h2>
                            My Courses
                        </h2>
                    </div>

                    <span >
                        {courses.length}{" "}
                        {courses.length === 1 ? "Course" : "Courses"}
                    </span>

                </div>


                {courses.length === 0 ? (

                    <div >

                        <p>
                            You are not enrolled in any courses yet.
                        </p>

                    </div>

                ) : (

                    <div >

                        {courses.map((course) => {

                            const attendance = courseAttendance.find(
                                (item) =>
                                    item.courseId === course.courseId
                            );

                            return (

                                <div
                                    
                                    key={course.id}
                                >

                                    <div >

                                        <span >
                                            {course.courseCode}
                                        </span>

                                        <span >
                                            {course.status}
                                        </span>

                                    </div>


                                    <h3>
                                        {course.courseName}
                                    </h3>


                                    <div >

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

                                        <div >

                                            <div>

                                                <span>
                                                    Attendance
                                                </span>

                                                <strong>
                                                    {attendance.attendancePercentage.toFixed(1)}%
                                                </strong>

                                            </div>


                                            <div >

                                                <div
                                                    
                                                    
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