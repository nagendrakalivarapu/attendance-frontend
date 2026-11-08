import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

function AdminLowAttendance() {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState("");
    const [threshold, setThreshold] = useState(75);

    const [students, setStudents] = useState([]);
    const [loadingCourses, setLoadingCourses] = useState(true);
    const [loadingReport, setLoadingReport] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        loadCourses();
    }, []);

    const loadCourses = async () => {
        try {
            setLoadingCourses(true);
            setError("");

            const response = await api.get("/course");
            setCourses(response.data || []);

            if (response.data?.length > 0) {
                setSelectedCourse(response.data[0].id);
            }
        } catch (err) {
            console.error(err);
            setError("Failed to load courses.");
        } finally {
            setLoadingCourses(false);
        }
    };

    const loadLowAttendance = async () => {
        if (!selectedCourse) {
            setError("Please select a course.");
            return;
        }

        try {
            setLoadingReport(true);
            setError("");

            const response = await api.get(
                `/attendance/course/${selectedCourse}/low-attendance`,
                {
                    params: {
                        threshold,
                    },
                }
            );

            setStudents(response.data || []);
        } catch (err) {
            console.error(err);
            setError("Failed to load low attendance report.");
            setStudents([]);
        } finally {
            setLoadingReport(false);
        }
    };

    useEffect(() => {
        if (selectedCourse) {
            loadLowAttendance();
        }
    }, [selectedCourse]);

    const selectedCourseData = courses.find(
        (course) => Number(course.id) === Number(selectedCourse)
    );

    const totalLowAttendance = students.length;

    const averageAttendance =
        students.length > 0
            ? students.reduce(
            (sum, student) => sum + Number(student.attendancePercentage || 0),
            0
        ) / students.length
            : 0;

    const getAttendanceClass = (percentage) => {
        if (percentage < 50) return "attendance-critical";
        if (percentage < 60) return "attendance-warning";
        return "attendance-low";
    };

    return (
        <div >
            {/* Sidebar */}
            <aside >
                <div >
                    <div >SA</div>
                    <div>
                        <h2>Smart Attendance</h2>
                        <span>Admin Panel</span>
                    </div>
                </div>

                <nav >
                    <button
                        
                        onClick={() => navigate("/admin")}
                    >
                        <span></span>
                        Dashboard
                    </button>

                    <button
                        
                        onClick={() => navigate("/admin/students")}
                    >
                        <span></span>
                        Students
                    </button>

                    <button
                        
                        onClick={() => navigate("/admin/teachers")}
                    >
                        <span></span>
                        Teachers
                    </button>

                    <button
                        
                        onClick={() => navigate("/admin/courses")}
                    >
                        <span></span>
                        Courses
                    </button>

                    <button
                        
                        onClick={() => navigate("/admin/enrollments")}
                    >
                        <span></span>
                        Enrollments
                    </button>

                    <button
                        
                        onClick={() => navigate("/admin/attendance")}
                    >
                        <span></span>
                        Attendance
                    </button>

                    <button
                        
                        onClick={() => navigate("/admin/attendance")}
                    >
                        <span></span>
                        Attendance Reports
                    </button>

                    <button
                        
                        onClick={() => navigate("/admin/attendance/history")}
                    >
                        <span></span>
                        Attendance History
                    </button>
                </nav>

                <div >
                    <button
                        
                        onClick={() => navigate("/login")}
                    >
                        <span></span>
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main */}
            <main >
                <header >
                    <div>
                        <h1>Low Attendance Report</h1>
                        <p>Identify students below the required attendance threshold.</p>
                    </div>

                    <div >
                        <button
                            
                            onClick={() => navigate("/admin/attendance")}
                        >
                            Reports
                        </button>
                        <button
                            
                            onClick={() => navigate("/admin/attendance/history")}
                        >
                            History
                        </button>
                        <div >
                            <div >
                                {user?.email?.charAt(0)?.toUpperCase() || "A"}
                            </div>

                            <div>
                                <strong>Administrator</strong>
                                <span>{user?.email}</span>
                            </div>
                        </div>
                    </div>
                </header>

                <section >
                    {/* Filters */}
                    <div >
                        <div >
                            <div >
                                <label>Course</label>

                                <select
                                    value={selectedCourse}
                                    onChange={(e) => setSelectedCourse(e.target.value)}
                                    disabled={loadingCourses}
                                >
                                    {loadingCourses ? (
                                        <option>Loading courses...</option>
                                    ) : (
                                        courses.map((course) => (
                                            <option key={course.id} value={course.id}>
                                                {course.courseCode} - {course.courseName}
                                            </option>
                                        ))
                                    )}
                                </select>
                            </div>

                            <div >
                                <label>Attendance Threshold</label>

                                <select
                                    value={threshold}
                                    onChange={(e) => setThreshold(Number(e.target.value))}
                                >
                                    <option value={50}>Below 50%</option>
                                    <option value={60}>Below 60%</option>
                                    <option value={65}>Below 65%</option>
                                    <option value={70}>Below 70%</option>
                                    <option value={75}>Below 75%</option>
                                    <option value={80}>Below 80%</option>
                                    <option value={85}>Below 85%</option>
                                    <option value={90}>Below 90%</option>
                                </select>
                            </div>

                            <button
                                
                                onClick={loadLowAttendance}
                                disabled={loadingReport || !selectedCourse}
                            >
                                {loadingReport ? "Loading..." : "Generate Report"}
                            </button>

                            <button
                                
                                onClick={loadCourses}
                                disabled={loadingCourses}
                            >
                                ↻ Refresh
                            </button>
                        </div>
                    </div>

                    {error && (
                        <div >
                            {error}
                        </div>
                    )}

                    {/* Course Header */}
                    {selectedCourseData && (
                        <div >
                            <div>
                <span >
                  {selectedCourseData.courseCode}
                </span>

                                <h2>{selectedCourseData.courseName}</h2>

                                <p>
                                    {selectedCourseData.department} · Semester{" "}
                                    {selectedCourseData.semester}
                                </p>
                            </div>

                            <div >
                                <span>Required Attendance</span>
                                <strong>{threshold}%</strong>
                            </div>
                        </div>
                    )}

                    {/* Statistics */}
                    <div >
                        <div >
                            <div >️</div>

                            <div>
                                <span>Low Attendance Students</span>
                                <strong>{totalLowAttendance}</strong>
                            </div>
                        </div>

                        <div >
                            <div ></div>

                            <div>
                                <span>Average of Flagged Students</span>
                                <strong>{averageAttendance.toFixed(2)}%</strong>
                            </div>
                        </div>

                        <div >
                            <div ></div>

                            <div>
                                <span>Attendance Threshold</span>
                                <strong>{threshold}%</strong>
                            </div>
                        </div>
                    </div>

                    {/* Table */}
                    <div >
                        <div >
                            <div>
                                <h2>Students Requiring Attention</h2>
                                <p>
                                    Students whose attendance is below {threshold}%.
                                </p>
                            </div>

                            <span >
                {students.length} student{students.length !== 1 ? "s" : ""}
              </span>
                        </div>

                        {loadingReport ? (
                            <div >
                                Loading low attendance report...
                            </div>
                        ) : students.length === 0 ? (
                            <div >
                                <div ></div>
                                <h3>No Low Attendance Students</h3>
                                <p>
                                    All students in this course are meeting the selected
                                    attendance threshold.
                                </p>
                            </div>
                        ) : (
                            <div >
                                <table >
                                    <thead>
                                    <tr>
                                        <th>Student</th>
                                        <th>Registration No.</th>
                                        <th>Total Sessions</th>
                                        <th>Present</th>
                                        <th>Absent</th>
                                        <th>Attendance</th>
                                        <th>Status</th>
                                    </tr>
                                    </thead>

                                    <tbody>
                                    {students.map((student) => {
                                        const percentage = Number(
                                            student.attendancePercentage || 0
                                        );

                                        return (
                                            <tr key={student.studentId}>
                                                <td>
                                                    <div >
                                                        <div >
                                                            {student.studentName
                                                                ?.charAt(0)
                                                                ?.toUpperCase() || "S"}
                                                        </div>

                                                        <strong>{student.studentName}</strong>
                                                    </div>
                                                </td>

                                                <td>{student.registrationNumber}</td>

                                                <td>{student.totalSessions}</td>

                                                <td >
                                                    {student.presentCount}
                                                </td>

                                                <td >
                                                    {student.absentCount}
                                                </td>

                                                <td>
                            <span
                                
                            >
                              {percentage.toFixed(2)}%
                            </span>
                                                </td>

                                                <td>
                            <span >
                              LOW ATTENDANCE
                            </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </section>
            </main>
        </div>
    );
}

export default AdminLowAttendance;