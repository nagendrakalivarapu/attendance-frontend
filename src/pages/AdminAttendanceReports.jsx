import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function AdminAttendanceReports() {
    const navigate = useNavigate();

    const [courses, setCourses] = useState([]);
    const [selectedCourseId, setSelectedCourseId] = useState("");
    const [threshold, setThreshold] = useState(75);

    const [analytics, setAnalytics] = useState(null);
    const [studentReports, setStudentReports] = useState([]);

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

            const courseData = response.data || [];

            setCourses(courseData);

            if (courseData.length > 0 && !selectedCourseId) {
                setSelectedCourseId(String(courseData[0].id));
            }
        } catch (error) {
            console.error("Failed to load courses:", error);

            setError(
                error.response?.data?.message ||
                "Failed to load courses."
            );
        } finally {
            setLoadingCourses(false);
        }
    };

    const loadAttendanceReport = async () => {
        if (!selectedCourseId) {
            setAnalytics(null);
            setStudentReports([]);
            return;
        }

        try {
            setLoadingReport(true);
            setError("");

            const [analyticsResponse, reportResponse] =
                await Promise.all([
                    api.get(
                        `/attendance/course/${selectedCourseId}/analytics`,
                        {
                            params: {
                                threshold,
                            },
                        }
                    ),

                    api.get(
                        `/attendance/course/${selectedCourseId}/student-report`,
                        {
                            params: {
                                threshold,
                            },
                        }
                    ),
                ]);

            setAnalytics(analyticsResponse.data);
            setStudentReports(reportResponse.data || []);
        } catch (error) {
            console.error(
                "Failed to load attendance report:",
                error
            );

            setAnalytics(null);
            setStudentReports([]);

            setError(
                error.response?.data?.message ||
                "Failed to load attendance report."
            );
        } finally {
            setLoadingReport(false);
        }
    };

    const handleCourseChange = (event) => {
        setSelectedCourseId(event.target.value);
        setAnalytics(null);
        setStudentReports([]);
        setError("");
    };

    const handleThresholdChange = (event) => {
        setThreshold(Number(event.target.value));
    };

    const selectedCourse = useMemo(() => {
        return courses.find(
            (course) =>
                String(course.id) === String(selectedCourseId)
        );
    }, [courses, selectedCourseId]);

    const lowAttendanceCount = studentReports.filter(
        (student) =>
            student.status === "LOW_ATTENDANCE"
    ).length;

    const goodAttendanceCount = studentReports.filter(
        (student) =>
            student.status === "GOOD"
    ).length;

    const getPercentageClass = (percentage) => {
        const value = Number(percentage || 0);

        if (value >= threshold) {
            return "attendance-report-good";
        }

        if (value >= threshold - 10) {
            return "attendance-report-warning";
        }

        return "attendance-report-low";
    };

    const getInitials = (name) => {
        if (!name) {
            return "?";
        }

        return name
            .split(" ")
            .filter(Boolean)
            .map((part) => part.charAt(0))
            .join("")
            .substring(0, 2)
            .toUpperCase();
    };

    return (
        <div >

            {/* =========================================
                SIDEBAR
            ========================================= */}

            <aside >

                <div >

                    <div >
                        SA
                    </div>

                    <div>
                        <h4>Smart Attendance</h4>
                        <small>Admin Panel</small>
                    </div>

                </div>

                <nav >

                    <button
                        
                        onClick={() =>
                            navigate("/admin")
                        }
                    >
                        <span></span>
                        Dashboard
                    </button>

                    <button
                        
                        onClick={() =>
                            navigate("/admin/students")
                        }
                    >
                        <span></span>
                        Students
                    </button>

                    <button
                        
                        onClick={() =>
                            navigate("/admin/teachers")
                        }
                    >
                        <span></span>
                        Teachers
                    </button>

                    <button
                        
                        onClick={() =>
                            navigate("/admin/courses")
                        }
                    >
                        <span></span>
                        Courses
                    </button>

                    <button
                        
                        onClick={() =>
                            navigate("/admin/enrollments")
                        }
                    >
                        <span></span>
                        Enrollments
                    </button>

                    <button
                        
                        onClick={() =>
                            navigate("/admin/attendance")
                        }
                    >
                        <span></span>
                        Attendance
                    </button>

                </nav>

            </aside>


            {/* =========================================
                MAIN
            ========================================= */}

            <main >

                {/* =========================================
                    TOPBAR
                ========================================= */}

                <header >

                    <div>

                        <h2>
                            Attendance Reports
                        </h2>

                        <p>
                            Analyze course-wise student
                            attendance performance
                        </p>

                    </div>

                    {/* =====================================
                        ATTENDANCE NAVIGATION
                    ===================================== */}

                    <div
                        
                        
                    >

                        <button
                            
                            onClick={() =>
                                navigate(
                                    "/admin/attendance/low"
                                )
                            }
                        >
                             Low Attendance
                        </button>

                        <button
                            
                            onClick={() =>
                                navigate(
                                    "/admin/attendance/history"
                                )
                            }
                        >
                             Attendance History
                        </button>

                        <button
                            
                            onClick={() =>
                                navigate("/admin/attendance/email")
                            }
                        >
                             Send Attendance Report
                        </button>

                        <button
                            
                            onClick={() =>
                                navigate("/admin")
                            }
                        >
                            ← Dashboard
                        </button>

                    </div>

                </header>


                {/* =========================================
                    CONTENT
                ========================================= */}

                <section >


                    {/* =====================================
                        FILTERS
                    ===================================== */}

                    <section >

                        <div >

                            <label>
                                Select Course
                            </label>

                            <select
                                value={selectedCourseId}
                                onChange={handleCourseChange}
                                disabled={loadingCourses}
                            >

                                <option value="">
                                    {loadingCourses
                                        ? "Loading courses..."
                                        : "Select a course"}
                                </option>

                                {courses.map((course) => (

                                    <option
                                        key={course.id}
                                        value={course.id}
                                    >
                                        {course.courseCode} -{" "}
                                        {course.courseName}
                                    </option>

                                ))}

                            </select>

                        </div>


                        <div >

                            <label>
                                Required Attendance
                            </label>

                            <select
                                value={threshold}
                                onChange={handleThresholdChange}
                            >

                                <option value={60}>
                                    60%
                                </option>

                                <option value={65}>
                                    65%
                                </option>

                                <option value={70}>
                                    70%
                                </option>

                                <option value={75}>
                                    75%
                                </option>

                                <option value={80}>
                                    80%
                                </option>

                                <option value={85}>
                                    85%
                                </option>

                                <option value={90}>
                                    90%
                                </option>

                            </select>

                        </div>


                        <button
                            
                            onClick={() =>
                                void loadAttendanceReport()
                            }
                            disabled={
                                !selectedCourseId ||
                                loadingReport
                            }
                        >
                            {loadingReport
                                ? "Loading..."
                                : "Generate Report"}
                        </button>


                        <button
                            
                            onClick={() => {

                                void loadCourses();

                                if (selectedCourseId) {
                                    void loadAttendanceReport();
                                }

                            }}
                            disabled={
                                loadingCourses ||
                                loadingReport
                            }
                        >
                            ↻ Refresh
                        </button>

                    </section>


                    {/* =====================================
                        ERROR
                    ===================================== */}

                    {error && (

                        <div >

                            <span>
                                ️
                            </span>

                            <div>

                                <strong>
                                    Unable to load report
                                </strong>

                                <p>
                                    {error}
                                </p>

                            </div>

                        </div>

                    )}


                    {/* =====================================
                        EMPTY STATE
                    ===================================== */}

                    {!selectedCourseId &&
                        !loadingCourses && (

                            <div >

                                <div >
                                    
                                </div>

                                <h3>
                                    Select a Course
                                </h3>

                                <p>
                                    Choose a course above to view
                                    detailed attendance analytics
                                    and student performance.
                                </p>

                            </div>

                        )}


                    {/* =====================================
                        LOADING
                    ===================================== */}

                    {loadingReport && (

                        <div >

                            <div >
                                ⟳
                            </div>

                            <strong>
                                Generating attendance report...
                            </strong>

                            <p>
                                Calculating student attendance
                                statistics.
                            </p>

                        </div>

                    )}


                    {/* =====================================
                        REPORT
                    ===================================== */}

                    {!loadingReport &&
                        analytics && (

                            <>

                                {/* =================================
                                    COURSE HEADER
                                ================================= */}

                                <section >

                                    <div>

                                        <div >
                                            {analytics.courseCode}
                                        </div>

                                        <h3>
                                            {analytics.courseName}
                                        </h3>

                                        <p>
                                            Required attendance:
                                            {" "}
                                            <strong>
                                                {threshold}%
                                            </strong>
                                        </p>

                                    </div>

                                    <div >

                                        <span>
                                            Overall Attendance
                                        </span>

                                        <strong>
                                            {
                                                analytics.averageAttendancePercentage
                                            }%
                                        </strong>

                                    </div>

                                </section>


                                {/* =================================
                                    STATISTICS
                                ================================= */}

                                <section >

                                    <div >

                                        <div >
                                            
                                        </div>

                                        <div>

                                            <span>
                                                Total Students
                                            </span>

                                            <strong>
                                                {
                                                    analytics.totalStudents
                                                }
                                            </strong>

                                        </div>

                                    </div>


                                    <div >

                                        <div >
                                            
                                        </div>

                                        <div>

                                            <span>
                                                Closed Sessions
                                            </span>

                                            <strong>
                                                {
                                                    analytics.totalSessions
                                                }
                                            </strong>

                                        </div>

                                    </div>


                                    <div >

                                        <div >
                                            
                                        </div>

                                        <div>

                                            <span>
                                                Present
                                            </span>

                                            <strong>
                                                {
                                                    analytics.totalPresent
                                                }
                                            </strong>

                                        </div>

                                    </div>


                                    <div >

                                        <div >
                                            
                                        </div>

                                        <div>

                                            <span>
                                                Absent
                                            </span>

                                            <strong>
                                                {
                                                    analytics.totalAbsent
                                                }
                                            </strong>

                                        </div>

                                    </div>


                                    <div >

                                        <div >
                                            
                                        </div>

                                        <div>

                                            <span>
                                                Low Attendance
                                            </span>

                                            <strong>
                                                {
                                                    analytics.lowAttendanceStudents
                                                }
                                            </strong>

                                        </div>

                                    </div>

                                </section>


                                {/* =================================
                                    SUMMARY
                                ================================= */}

                                <section >

                                    <div >

                                        <div >
                                            
                                        </div>

                                        <div>

                                            <span>
                                                Students Meeting Requirement
                                            </span>

                                            <strong>
                                                {goodAttendanceCount}
                                            </strong>

                                        </div>

                                    </div>


                                    <div >

                                        <div >
                                            
                                        </div>

                                        <div>

                                            <span>
                                                Students Below Requirement
                                            </span>

                                            <strong>
                                                {lowAttendanceCount}
                                            </strong>

                                        </div>

                                    </div>

                                </section>


                                {/* =================================
                                    QUICK ACTIONS
                                ================================= */}

                                <section
                                    
                                    
                                >

                                    <button
                                        
                                        onClick={() =>
                                            navigate(
                                                "/admin/attendance/low"
                                            )
                                        }
                                    >
                                         View Low Attendance
                                    </button>

                                    <button
                                        
                                        onClick={() =>
                                            navigate(
                                                "/admin/attendance/history"
                                            )
                                        }
                                    >
                                         View Attendance History
                                    </button>

                                    <button
                                        
                                        onClick={() =>
                                            navigate(
                                                "/admin/attendance/email"
                                            )
                                        }
                                    >
                                         Send Attendance Report
                                    </button>

                                </section>


                                {/* =================================
                                    STUDENT REPORT
                                ================================= */}

                                <section >

                                    <div >

                                        <div>

                                            <h3>
                                                Student Attendance Report
                                            </h3>

                                            <p>
                                                Individual attendance
                                                performance for{" "}
                                                {selectedCourse?.courseName ||
                                                    analytics.courseName}
                                            </p>

                                        </div>

                                        <span >
                                            {studentReports.length} Students
                                        </span>

                                    </div>


                                    {studentReports.length === 0 ? (

                                        <div >

                                            <div>
                                                
                                            </div>

                                            <h4>
                                                No Student Records
                                            </h4>

                                            <p>
                                                There are no enrolled
                                                students or attendance
                                                records for this course.
                                            </p>

                                        </div>

                                    ) : (

                                        <div >

                                            <table >

                                                <thead>

                                                <tr>

                                                    <th>
                                                        Student
                                                    </th>

                                                    <th>
                                                        Registration No.
                                                    </th>

                                                    <th>
                                                        Sessions
                                                    </th>

                                                    <th>
                                                        Present
                                                    </th>

                                                    <th>
                                                        Absent
                                                    </th>

                                                    <th>
                                                        Attendance
                                                    </th>

                                                    <th>
                                                        Status
                                                    </th>

                                                </tr>

                                                </thead>


                                                <tbody>

                                                {studentReports.map(
                                                    (student) => (

                                                        <tr
                                                            key={
                                                                student.studentId
                                                            }
                                                        >

                                                            <td>

                                                                <div >

                                                                    <div >

                                                                        {
                                                                            getInitials(
                                                                                student.studentName
                                                                            )
                                                                        }

                                                                    </div>

                                                                    <div>

                                                                        <strong>
                                                                            {
                                                                                student.studentName
                                                                            }
                                                                        </strong>

                                                                        <small>
                                                                            Student
                                                                        </small>

                                                                    </div>

                                                                </div>

                                                            </td>


                                                            <td>

                                                                    <span >
                                                                        {
                                                                            student.registrationNumber
                                                                        }
                                                                    </span>

                                                            </td>


                                                            <td>
                                                                {
                                                                    student.totalSessions
                                                                }
                                                            </td>


                                                            <td>

                                                                    <span >
                                                                        {
                                                                            student.presentCount
                                                                        }
                                                                    </span>

                                                            </td>


                                                            <td>

                                                                    <span >
                                                                        {
                                                                            student.absentCount
                                                                        }
                                                                    </span>

                                                            </td>


                                                            <td>

                                                                <div >

                                                                    <strong
                                                                        
                                                                    >
                                                                        {
                                                                            student.attendancePercentage
                                                                        }%
                                                                    </strong>

                                                                    <div >

                                                                        <div
                                                                            
                                                                            
                                                                        />

                                                                    </div>

                                                                </div>

                                                            </td>


                                                            <td>

                                                                {student.status ===
                                                                "LOW_ATTENDANCE" ? (

                                                                    <span >
                                                                             Low Attendance
                                                                        </span>

                                                                ) : (

                                                                    <span >
                                                                             Good
                                                                        </span>

                                                                )}

                                                            </td>

                                                        </tr>

                                                    )
                                                )}

                                                </tbody>

                                            </table>

                                        </div>

                                    )}

                                </section>

                            </>

                        )}

                </section>

            </main>

        </div>
    );
}

export default AdminAttendanceReports;