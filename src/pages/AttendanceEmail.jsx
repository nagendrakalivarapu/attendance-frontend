import { useEffect, useMemo, useState } from "react";
import api from "../services/api";

const AttendanceEmail = () => {
    const [courses, setCourses] = useState([]);
    const [preview, setPreview] = useState(null);

    const [department, setDepartment] = useState("");
    const [semester, setSemester] = useState("");
    const [section, setSection] = useState("");
    const [courseId, setCourseId] = useState("");
    const [threshold, setThreshold] = useState(75);

    const [loadingCourses, setLoadingCourses] = useState(true);
    const [previewLoading, setPreviewLoading] = useState(false);
    const [sendLoading, setSendLoading] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [sendResult, setSendResult] = useState(null);

    useEffect(() => {
        loadCourses();
    }, []);

    const loadCourses = async () => {
        try {
            setLoadingCourses(true);
            setError("");

            const response = await api.get("/course");

            setCourses(response.data || []);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to load courses."
            );
        } finally {
            setLoadingCourses(false);
        }
    };

    const departments = useMemo(() => {
        return [
            ...new Set(
                courses
                    .map((course) => course.department)
                    .filter(Boolean)
            ),
        ].sort();
    }, [courses]);

    const semesters = useMemo(() => {
        return [
            ...new Set(
                courses
                    .filter(
                        (course) =>
                            !department ||
                            course.department === department
                    )
                    .map((course) => course.semester)
                    .filter((value) => value !== null && value !== undefined)
            ),
        ].sort((a, b) => a - b);
    }, [courses, department]);

    const sections = useMemo(() => {
        const selectedCourse = courses.find(
            (course) => String(course.id) === String(courseId)
        );

        if (!selectedCourse) {
            return [];
        }

        return section ? [section] : ["A", "B", "C", "D"];
    }, [courses, courseId, section]);

    const filteredCourses = useMemo(() => {
        return courses.filter((course) => {
            if (
                department &&
                course.department !== department
            ) {
                return false;
            }

            if (
                semester &&
                String(course.semester) !== String(semester)
            ) {
                return false;
            }

            return true;
        });
    }, [courses, department, semester]);

    const handleDepartmentChange = (value) => {
        setDepartment(value);
        setSemester("");
        setSection("");
        setCourseId("");
        setPreview(null);
        setSendResult(null);
        setSuccess("");
        setError("");
    };

    const handleSemesterChange = (value) => {
        setSemester(value);
        setCourseId("");
        setSection("");
        setPreview(null);
        setSendResult(null);
        setSuccess("");
        setError("");
    };

    const handleCourseChange = (value) => {
        setCourseId(value);
        setSection("");
        setPreview(null);
        setSendResult(null);
        setSuccess("");
        setError("");
    };

    const handlePreview = async () => {
        if (!department || !semester || !section || !courseId) {
            setError(
                "Please select department, semester, section and course."
            );
            return;
        }

        try {
            setPreviewLoading(true);
            setError("");
            setSuccess("");
            setSendResult(null);

            const response = await api.post(
                "/attendance-email/preview",
                {
                    courseId: Number(courseId),
                    department,
                    semester: Number(semester),
                    section,
                    threshold: Number(threshold),
                }
            );

            setPreview(response.data);
        } catch (err) {
            setPreview(null);

            setError(
                err.response?.data?.message ||
                err.response?.data ||
                "Unable to generate attendance preview."
            );
        } finally {
            setPreviewLoading(false);
        }
    };

    const handleSend = async () => {
        if (!preview || preview.totalStudents === 0) {
            setError(
                "There are no students available for this selection."
            );
            return;
        }

        const confirmed = window.confirm(
            `Send attendance reports to ${preview.totalStudents} student(s)?`
        );

        if (!confirmed) {
            return;
        }

        try {
            setSendLoading(true);
            setError("");
            setSuccess("");
            setSendResult(null);

            const response = await api.post(
                "/attendance-email/send",
                {
                    courseId: Number(courseId),
                    department,
                    semester: Number(semester),
                    section,
                    threshold: Number(threshold),
                }
            );

            setSendResult(response.data);

            if (response.data.failedCount === 0) {
                setSuccess(
                    "Attendance reports sent successfully to all students."
                );
            } else {
                setSuccess(
                    "Attendance reports were processed. Some emails failed."
                );
            }
        } catch (err) {
            setError(
                err.response?.data?.message ||
                err.response?.data ||
                "Unable to send attendance reports."
            );
        } finally {
            setSendLoading(false);
        }
    };

    const getStatusClass = (status) => {
        if (status === "GOOD") {
            return "attendance-email-status good";
        }

        if (status === "LOW_ATTENDANCE") {
            return "attendance-email-status low";
        }

        return "attendance-email-status";
    };

    return (
        <div className="admin-page">
            <div className="admin-page-header">
                <div>
                    <h1>Attendance Email Reports</h1>

                    <p>
                        Send individualized attendance reports to
                        students by section.
                    </p>
                </div>
            </div>

            <div className="admin-card">
                <div className="admin-card-header">
                    <div>
                        <h2>Report Configuration</h2>

                        <p>
                            Select the class group and attendance threshold.
                        </p>
                    </div>
                </div>

                <div className="admin-form-grid">
                    <div className="admin-form-group">
                        <label>Department</label>

                        <select
                            value={department}
                            onChange={(e) =>
                                handleDepartmentChange(e.target.value)
                            }
                            disabled={loadingCourses}
                        >
                            <option value="">
                                Select Department
                            </option>

                            {departments.map((item) => (
                                <option key={item} value={item}>
                                    {item}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="admin-form-group">
                        <label>Semester</label>

                        <select
                            value={semester}
                            onChange={(e) =>
                                handleSemesterChange(e.target.value)
                            }
                            disabled={!department}
                        >
                            <option value="">
                                Select Semester
                            </option>

                            {semesters.map((item) => (
                                <option key={item} value={item}>
                                    Semester {item}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="admin-form-group">
                        <label>Section</label>

                        <select
                            value={section}
                            onChange={(e) => {
                                setSection(e.target.value);
                                setPreview(null);
                                setSendResult(null);
                                setSuccess("");
                                setError("");
                            }}
                            disabled={!courseId}
                        >
                            <option value="">
                                Select Section
                            </option>

                            {sections.map((item) => (
                                <option key={item} value={item}>
                                    Section {item}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="admin-form-group">
                        <label>Course</label>

                        <select
                            value={courseId}
                            onChange={(e) =>
                                handleCourseChange(e.target.value)
                            }
                            disabled={
                                !department ||
                                !semester ||
                                loadingCourses
                            }
                        >
                            <option value="">
                                Select Course
                            </option>

                            {filteredCourses.map((course) => (
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

                    <div className="admin-form-group">
                        <label>
                            Required Attendance
                        </label>

                        <div className="attendance-email-threshold">
                            <input
                                type="range"
                                min="0"
                                max="100"
                                step="1"
                                value={threshold}
                                onChange={(e) => {
                                    setThreshold(e.target.value);
                                    setPreview(null);
                                    setSendResult(null);
                                    setSuccess("");
                                }}
                            />

                            <strong>{threshold}%</strong>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="admin-alert error">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="admin-alert success">
                        {success}
                    </div>
                )}

                <div className="admin-form-actions">
                    <button
                        type="button"
                        className="admin-primary-button"
                        onClick={handlePreview}
                        disabled={
                            previewLoading ||
                            !department ||
                            !semester ||
                            !section ||
                            !courseId
                        }
                    >
                        {previewLoading
                            ? "Generating Preview..."
                            : "Preview Attendance"}
                    </button>
                </div>
            </div>

            {preview && (
                <div className="admin-card attendance-email-preview">
                    <div className="admin-card-header">
                        <div>
                            <h2>
                                {preview.courseCode} -{" "}
                                {preview.courseName}
                            </h2>

                            <p>
                                {preview.department} · Semester{" "}
                                {preview.semester} · Section{" "}
                                {preview.section}
                            </p>
                        </div>
                    </div>

                    <div className="attendance-email-summary">
                        <div className="attendance-email-stat">
                            <span>Total Students</span>
                            <strong>
                                {preview.totalStudents}
                            </strong>
                        </div>

                        <div className="attendance-email-stat good">
                            <span>Good Attendance</span>
                            <strong>
                                {preview.goodAttendanceStudents}
                            </strong>
                        </div>

                        <div className="attendance-email-stat low">
                            <span>Low Attendance</span>
                            <strong>
                                {preview.lowAttendanceStudents}
                            </strong>
                        </div>

                        <div className="attendance-email-stat">
                            <span>Required</span>
                            <strong>
                                {preview.requiredPercentage}%
                            </strong>
                        </div>
                    </div>

                    <div className="attendance-email-table-wrapper">
                        <table className="attendance-email-table">
                            <thead>
                            <tr>
                                <th>Student</th>
                                <th>Registration</th>
                                <th>Email</th>
                                <th>Total</th>
                                <th>Present</th>
                                <th>Absent</th>
                                <th>Attendance</th>
                                <th>Status</th>
                            </tr>
                            </thead>

                            <tbody>
                            {preview.students?.length > 0 ? (
                                preview.students.map((student) => (
                                    <tr key={student.studentId}>
                                        <td>
                                            <strong>
                                                {student.studentName}
                                            </strong>
                                        </td>

                                        <td>
                                            {student.registrationNumber}
                                        </td>

                                        <td>
                                            {student.email || "No email"}
                                        </td>

                                        <td>
                                            {student.totalSessions}
                                        </td>

                                        <td>
                                            {student.presentCount}
                                        </td>

                                        <td>
                                            {student.absentCount}
                                        </td>

                                        <td>
                                            <strong>
                                                {student.attendancePercentage}%
                                            </strong>
                                        </td>

                                        <td>
                        <span
                            className={getStatusClass(
                                student.status
                            )}
                        >
                          {student.status ===
                          "LOW_ATTENDANCE"
                              ? "Low Attendance"
                              : "Good"}
                        </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan="8"
                                        className="attendance-email-empty"
                                    >
                                        No students found for the
                                        selected section.
                                    </td>
                                </tr>
                            )}
                            </tbody>
                        </table>
                    </div>

                    <div className="attendance-email-actions">
                        <button
                            type="button"
                            className="admin-primary-button"
                            onClick={handleSend}
                            disabled={
                                sendLoading ||
                                preview.totalStudents === 0
                            }
                        >
                            {sendLoading
                                ? "Sending Reports..."
                                : `Send Reports to ${preview.totalStudents} Students`}
                        </button>
                    </div>
                </div>
            )}

            {sendResult && (
                <div className="admin-card">
                    <div className="admin-card-header">
                        <div>
                            <h2>Email Delivery Result</h2>

                            <p>{sendResult.message}</p>
                        </div>
                    </div>

                    <div className="attendance-email-summary">
                        <div className="attendance-email-stat">
                            <span>Total</span>
                            <strong>
                                {sendResult.totalStudents}
                            </strong>
                        </div>

                        <div className="attendance-email-stat good">
                            <span>Sent</span>
                            <strong>
                                {sendResult.sentCount}
                            </strong>
                        </div>

                        <div className="attendance-email-stat low">
                            <span>Failed</span>
                            <strong>
                                {sendResult.failedCount}
                            </strong>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AttendanceEmail;