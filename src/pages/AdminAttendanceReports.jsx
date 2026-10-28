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

            setCourses(response.data || []);
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
                                threshold
                            }
                        }
                    ),

                    api.get(
                        `/attendance/course/${selectedCourseId}/student-report`,
                        {
                            params: {
                                threshold
                            }
                        }
                    )
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
        if (percentage >= threshold) {
            return "attendance-report-good";
        }

        if (percentage >= threshold - 10) {
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
            .map((part) => part.charAt(0))
            .join("")
            .substring(0, 2)
            .toUpperCase();
    };

    return (
        <div className="admin-layout">

            {/* =========================================
                SIDEBAR
            ========================================= */}

            <aside className="admin-sidebar">

                <div className="sidebar-brand">

                    <div className="brand-icon">
                        SA
                    </div>

                    <div>
                        <h4>Smart Attendance</h4>
                        <small>Admin Panel</small>
                    </div>

                </div>


                <nav className="sidebar-nav">

                    <button
                        className="sidebar-link"
                        onClick={() => navigate("/admin")}
                    >
                        <span>📊</span>
                        Dashboard
                    </button>


                    <button
                        className="sidebar-link"
                        onClick={() =>
                            navigate("/admin/students")
                        }
                    >
                        <span>👨‍🎓</span>
                        Students
                    </button>


                    <button
                        className="sidebar-link"
                        onClick={() =>
                            navigate("/admin/teachers")
                        }
                    >
                        <span>👨‍🏫</span>
                        Teachers
                    </button>


                    <button
                        className="sidebar-link"
                        onClick={() =>
                            navigate("/admin/courses")
                        }
                    >
                        <span>📚</span>
                        Courses
                    </button>


                    <button
                        className="sidebar-link"
                        onClick={() =>
                            navigate("/admin/enrollments")
                        }
                    >
                        <span>📝</span>
                        Enrollments
                    </button>


                    <button
                        className="sidebar-link active"
                        onClick={() =>
                            navigate("/admin/attendance")
                        }
                    >
                        <span>📅</span>
                        Attendance
                    </button>

                </nav>

            </aside>


            {/* =========================================
                MAIN
            ========================================= */}

            <main className="admin-main">

                {/* =========================================
                    TOPBAR
                ========================================= */}

                <header className="admin-topbar">

                    <div>

                        <h2>
                            Attendance Reports
                        </h2>

                        <p>
                            Analyze course-wise student
                            attendance performance
                        </p>

                    </div>

                    <button
                        className="attendance-report-back-button"
                        onClick={() =>
                            navigate("/admin")
                        }
                    >
                        ← Dashboard
                    </button>

                </header>


                {/* =========================================
                    FILTERS
                ========================================= */}

                <section className="attendance-report-filter-card">

                    <div className="attendance-report-filter">

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


                    <div className="attendance-report-filter">

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
                        className="attendance-report-generate-button"
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
                        className="attendance-report-refresh-button"
                        onClick={() => {
                            void loadCourses();

                            if (selectedCourseId) {
                                void loadAttendanceReport();
                            }
                        }}
                    >
                        ↻ Refresh
                    </button>

                </section>


                {/* =========================================
                    ERROR
                ========================================= */}

                {error && (

                    <div className="attendance-report-error">

                        <span>
                            ⚠️
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


                {/* =========================================
                    EMPTY STATE
                ========================================= */}

                {!selectedCourseId &&
                    !loadingCourses && (

                        <div className="attendance-report-empty">

                            <div className="attendance-report-empty-icon">
                                📊
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


                {/* =========================================
                    LOADING
                ========================================= */}

                {loadingReport && (

                    <div className="attendance-report-loading">

                        <div className="attendance-loading-spinner">
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


                {/* =========================================
                    REPORT
                ========================================= */}

                {!loadingReport &&
                    analytics && (

                        <>

                            {/* Course Header */}

                            <section className="attendance-report-course-header">

                                <div>

                                    <div className="attendance-report-course-code">
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

                                <div className="attendance-report-overall">

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


                            {/* Statistics */}

                            <section className="attendance-report-stat-grid">

                                <div className="attendance-report-stat-card">

                                    <div className="report-stat-icon blue">
                                        👨‍🎓
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


                                <div className="attendance-report-stat-card">

                                    <div className="report-stat-icon purple">
                                        📅
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


                                <div className="attendance-report-stat-card present">

                                    <div className="report-stat-icon green">
                                        ✓
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


                                <div className="attendance-report-stat-card absent">

                                    <div className="report-stat-icon red">
                                        ✕
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


                                <div className="attendance-report-stat-card warning">

                                    <div className="report-stat-icon orange">
                                        ⚠
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


                            {/* Summary */}

                            <section className="attendance-report-summary-grid">

                                <div className="attendance-summary-good">

                                    <div className="summary-icon">
                                        ✓
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


                                <div className="attendance-summary-low">

                                    <div className="summary-icon">
                                        ⚠
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


                            {/* Student Report */}

                            <section className="attendance-report-table-card">

                                <div className="attendance-report-table-header">

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

                                    <span className="attendance-report-count">
                                        {studentReports.length} Students
                                    </span>

                                </div>


                                {studentReports.length === 0 ? (

                                    <div className="attendance-report-no-data">

                                        <div>
                                            📭
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

                                    <div className="attendance-report-table-wrapper">

                                        <table className="attendance-report-table">

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

                                                            <div className="attendance-student-cell">

                                                                <div className="attendance-student-avatar">
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

                                                                <span className="attendance-registration">
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

                                                                <span className="present-number">
                                                                    {
                                                                        student.presentCount
                                                                    }
                                                                </span>

                                                        </td>


                                                        <td>

                                                                <span className="absent-number">
                                                                    {
                                                                        student.absentCount
                                                                    }
                                                                </span>

                                                        </td>


                                                        <td>

                                                            <div className="attendance-percentage-cell">

                                                                <strong
                                                                    className={
                                                                        getPercentageClass(
                                                                            student.attendancePercentage
                                                                        )
                                                                    }
                                                                >
                                                                    {
                                                                        student.attendancePercentage
                                                                    }%
                                                                </strong>

                                                                <div className="mini-progress">

                                                                    <div
                                                                        className={
                                                                            getPercentageClass(
                                                                                student.attendancePercentage
                                                                            )
                                                                        }
                                                                        style={{
                                                                            width: `${Math.min(
                                                                                Math.max(
                                                                                    student.attendancePercentage || 0,
                                                                                    0
                                                                                ),
                                                                                100
                                                                            )}%`
                                                                        }}
                                                                    />

                                                                </div>

                                                            </div>

                                                        </td>


                                                        <td>

                                                            {student.status ===
                                                            "LOW_ATTENDANCE" ? (

                                                                <span className="attendance-status-badge low">
                                                                        ⚠ Low Attendance
                                                                    </span>

                                                            ) : (

                                                                <span className="attendance-status-badge good">
                                                                        ✓ Good
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

            </main>

        </div>
    );
}

export default AdminAttendanceReports;