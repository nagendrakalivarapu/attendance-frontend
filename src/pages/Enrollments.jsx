import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Enrollments() {
    const navigate = useNavigate();

    const [enrollments, setEnrollments] = useState([]);
    const [students, setStudents] = useState([]);
    const [courses, setCourses] = useState([]);

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");

    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [enrolling, setEnrolling] = useState(false);

    const [studentSearch, setStudentSearch] = useState("");
    const [selectedStudents, setSelectedStudents] = useState([]);

    const [formData, setFormData] = useState({
        courseId: ""
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);

            const [
                enrollmentResponse,
                studentResponse,
                courseResponse
            ] = await Promise.all([
                api.get("/enrollment"),
                api.get("/student"),
                api.get("/course")
            ]);

            setEnrollments(enrollmentResponse.data);
            setStudents(studentResponse.data);
            setCourses(courseResponse.data);

        } catch (error) {
            console.error("Error loading enrollment data:", error);
            alert("Failed to load enrollment data.");
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = () => {
        setFormData({
            courseId: ""
        });

        setStudentSearch("");
        setSelectedStudents([]);

        setShowForm(true);
    };

    const handleStudentSelect = (studentId) => {
        setSelectedStudents((prev) => {
            if (prev.includes(studentId)) {
                return prev.filter((id) => id !== studentId);
            }

            return [...prev, studentId];
        });
    };

    const handleSelectAll = () => {
        const filteredIds = filteredStudents.map(
            (student) => student.id
        );

        const allSelected = filteredIds.every(
            (id) => selectedStudents.includes(id)
        );

        if (allSelected) {
            setSelectedStudents((prev) =>
                prev.filter((id) => !filteredIds.includes(id))
            );
        } else {
            setSelectedStudents((prev) => [
                ...new Set([...prev, ...filteredIds])
            ]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.courseId) {
            alert("Please select a course.");
            return;
        }

        if (selectedStudents.length === 0) {
            alert("Please select at least one student.");
            return;
        }

        try {
            setEnrolling(true);

            let successCount = 0;
            let failedCount = 0;

            for (const studentId of selectedStudents) {
                try {
                    await api.post("/enrollment", {
                        studentId: Number(studentId),
                        courseId: Number(formData.courseId)
                    });

                    successCount++;

                } catch (error) {
                    console.error(
                        `Failed to enroll student ${studentId}`,
                        error
                    );

                    failedCount++;
                }
            }

            if (failedCount === 0) {
                alert(
                    `${successCount} student(s) enrolled successfully.`
                );
            } else {
                alert(
                    `${successCount} student(s) enrolled successfully.\n` +
                    `${failedCount} student(s) could not be enrolled.`
                );
            }

            setShowForm(false);
            setSelectedStudents([]);
            setStudentSearch("");

            await loadData();

        } catch (error) {
            console.error("Enrollment error:", error);
            alert("Failed to process enrollments.");
        } finally {
            setEnrolling(false);
        }
    };

    const handleStatusChange = async (id, status) => {
        try {
            await api.put(
                `/enrollment/${id}/status?status=${status}`
            );

            await loadData();

        } catch (error) {
            console.error("Error updating status:", error);

            const message =
                error.response?.data?.message ||
                "Failed to update enrollment status.";

            alert(message);
        }
    };

    const handleDelete = async (id) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this enrollment?"
        );

        if (!confirmed) {
            return;
        }

        try {
            await api.delete(`/enrollment/${id}`);

            alert("Enrollment deleted successfully.");

            await loadData();

        } catch (error) {
            console.error("Error deleting enrollment:", error);

            const message =
                error.response?.data?.message ||
                "Failed to delete enrollment.";

            alert(message);
        }
    };

    const filteredEnrollments = enrollments.filter((enrollment) => {
        const searchText = search.toLowerCase();

        const matchesSearch =
            enrollment.studentName
                ?.toLowerCase()
                .includes(searchText) ||
            enrollment.registrationNumber
                ?.toLowerCase()
                .includes(searchText) ||
            enrollment.courseCode
                ?.toLowerCase()
                .includes(searchText) ||
            enrollment.courseName
                ?.toLowerCase()
                .includes(searchText);

        const matchesStatus =
            statusFilter === "ALL" ||
            enrollment.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const filteredStudents = students.filter((student) => {
        const searchText = studentSearch.toLowerCase();

        return (
            student.studentName
                ?.toLowerCase()
                .includes(searchText) ||
            student.registrationNumber
                ?.toLowerCase()
                .includes(searchText) ||
            student.email
                ?.toLowerCase()
                .includes(searchText)
        );
    });

    const activeCount = enrollments.filter(
        (e) => e.status === "ACTIVE"
    ).length;

    const inactiveCount = enrollments.filter(
        (e) => e.status !== "ACTIVE"
    ).length;

    const allFilteredStudentsSelected =
        filteredStudents.length > 0 &&
        filteredStudents.every((student) =>
            selectedStudents.includes(student.id)
        );

    return (
        <div className="page-container">

            {/* Header */}
            <div className="page-header">

                <div>
                    <h1>Enrollment Management</h1>

                    <p>
                        Manage student course enrollments.
                    </p>
                </div>

                <div className="page-header-actions">

                    <button
                        className="btn-secondary"
                        onClick={() => navigate("/admin")}
                    >
                        ← Dashboard
                    </button>

                    <button
                        className="btn-primary"
                        onClick={handleAdd}
                    >
                        + Enroll Students
                    </button>

                </div>

            </div>

            {/* Statistics */}
            <div className="stats-grid">

                <div className="stat-card">
                    <div className="stat-icon">
                        📚
                    </div>

                    <div>
                        <span>Total Enrollments</span>
                        <strong>{enrollments.length}</strong>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">
                        ✅
                    </div>

                    <div>
                        <span>Active</span>
                        <strong>{activeCount}</strong>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">
                        📋
                    </div>

                    <div>
                        <span>Other Status</span>
                        <strong>{inactiveCount}</strong>
                    </div>
                </div>

            </div>

            {/* Main Content */}
            <div className="content-card">

                <div className="enrollment-toolbar">

                    <input
                        type="text"
                        className="search-input"
                        placeholder="Search student, registration number, course..."
                        value={search}
                        onChange={(e) =>
                            setSearch(e.target.value)
                        }
                    />

                    <select
                        className="filter-select"
                        value={statusFilter}
                        onChange={(e) =>
                            setStatusFilter(e.target.value)
                        }
                    >
                        <option value="ALL">
                            All Status
                        </option>

                        <option value="ACTIVE">
                            Active
                        </option>

                        <option value="DROPPED">
                            Dropped
                        </option>

                        <option value="COMPLETED">
                            Completed
                        </option>
                    </select>

                    <button
                        className="btn-secondary"
                        onClick={loadData}
                    >
                        Refresh
                    </button>

                </div>

                {loading ? (

                    <div className="loading-message">
                        Loading enrollments...
                    </div>

                ) : filteredEnrollments.length === 0 ? (

                    <div className="empty-state">

                        <div className="empty-icon">
                            📚
                        </div>

                        <h3>
                            No enrollments found
                        </h3>

                        <p>
                            Enroll students into courses to get started.
                        </p>

                    </div>

                ) : (

                    <div className="table-wrapper">

                        <table className="data-table">

                            <thead>
                            <tr>
                                <th>Student</th>
                                <th>Registration No.</th>
                                <th>Course</th>
                                <th>Course Name</th>
                                <th>Enrollment Date</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                            </thead>

                            <tbody>

                            {filteredEnrollments.map(
                                (enrollment) => (

                                    <tr key={enrollment.id}>

                                        <td>
                                            <strong>
                                                {enrollment.studentName}
                                            </strong>
                                        </td>

                                        <td>
                                                <span className="id-badge">
                                                    {enrollment.registrationNumber}
                                                </span>
                                        </td>

                                        <td>
                                            <strong>
                                                {enrollment.courseCode}
                                            </strong>
                                        </td>

                                        <td>
                                            {enrollment.courseName}
                                        </td>

                                        <td>
                                            {enrollment.enrollmentDate}
                                        </td>

                                        <td>
                                                <span
                                                    className={`status-badge status-${enrollment.status?.toLowerCase()}`}
                                                >
                                                    {enrollment.status}
                                                </span>
                                        </td>

                                        <td>

                                            <div className="action-buttons">

                                                <select
                                                    className="status-select"
                                                    value={enrollment.status}
                                                    onChange={(e) =>
                                                        handleStatusChange(
                                                            enrollment.id,
                                                            e.target.value
                                                        )
                                                    }
                                                >
                                                    <option value="ACTIVE">
                                                        Active
                                                    </option>

                                                    <option value="COMPLETED">
                                                        Completed
                                                    </option>
                                                </select>

                                                <button
                                                    className="btn-delete"
                                                    onClick={() =>
                                                        handleDelete(
                                                            enrollment.id
                                                        )
                                                    }
                                                >
                                                    Delete
                                                </button>

                                            </div>

                                        </td>

                                    </tr>

                                )
                            )}

                            </tbody>

                        </table>

                    </div>
                )}

            </div>

            {/* Multi Student Enrollment Modal */}
            {showForm && (

                <div className="modal-overlay">

                    <div className="form-modal bulk-enrollment-modal">

                        <div className="modal-header">

                            <div>
                                <h2>
                                    Enroll Students
                                </h2>

                                <p>
                                    Select multiple students and enroll
                                    them into a course.
                                </p>
                            </div>

                            <button
                                className="modal-close"
                                onClick={() =>
                                    setShowForm(false)
                                }
                            >
                                ×
                            </button>

                        </div>

                        <form onSubmit={handleSubmit}>

                            {/* Course */}
                            <div className="form-group">

                                <label>
                                    Course *
                                </label>

                                <select
                                    name="courseId"
                                    value={formData.courseId}
                                    onChange={(e) =>
                                        setFormData({
                                            courseId: e.target.value
                                        })
                                    }
                                    required
                                >

                                    <option value="">
                                        Select Course
                                    </option>

                                    {courses.map((course) => (

                                        <option
                                            key={course.id}
                                            value={course.id}
                                        >
                                            {course.courseCode}
                                            {" — "}
                                            {course.courseName}
                                        </option>

                                    ))}

                                </select>

                            </div>

                            {/* Student Search */}
                            <div className="form-group">

                                <label>
                                    Search Students
                                </label>

                                <input
                                    type="text"
                                    className="search-input"
                                    placeholder="Search by name, registration number or email..."
                                    value={studentSearch}
                                    onChange={(e) =>
                                        setStudentSearch(
                                            e.target.value
                                        )
                                    }
                                />

                            </div>

                            {/* Selection Header */}
                            <div className="student-selection-header">

                                <div>

                                    <strong>
                                        Select Students
                                    </strong>

                                    <span>
                                        {selectedStudents.length} selected
                                    </span>

                                </div>

                                <button
                                    type="button"
                                    className="select-all-btn"
                                    onClick={handleSelectAll}
                                >
                                    {allFilteredStudentsSelected
                                        ? "Deselect All"
                                        : "Select All"}
                                </button>

                            </div>

                            {/* Student List */}
                            <div className="student-selection-list">

                                {filteredStudents.length === 0 ? (

                                    <div className="no-students">
                                        No students found.
                                    </div>

                                ) : (

                                    filteredStudents.map(
                                        (student) => {

                                            const selected =
                                                selectedStudents.includes(
                                                    student.id
                                                );

                                            return (
                                                <label
                                                    key={student.id}
                                                    className={`student-selection-item ${
                                                        selected
                                                            ? "selected"
                                                            : ""
                                                    }`}
                                                >

                                                    <input
                                                        type="checkbox"
                                                        checked={selected}
                                                        onChange={() =>
                                                            handleStudentSelect(
                                                                student.id
                                                            )
                                                        }
                                                    />

                                                    <div className="student-selection-info">

                                                        <strong>
                                                            {student.studentName}
                                                        </strong>

                                                        <span>
                                                            {student.registrationNumber}
                                                            {" • "}
                                                            {student.department}
                                                            {" • "}
                                                            Semester{" "}
                                                            {student.semester}
                                                        </span>

                                                    </div>

                                                </label>
                                            );
                                        }
                                    )

                                )}

                            </div>

                            {/* Selection Summary */}
                            <div className="selection-summary">

                                <span>
                                    {selectedStudents.length} student
                                    {selectedStudents.length !== 1
                                        ? "s"
                                        : ""}{" "}
                                    selected
                                </span>

                                {formData.courseId && (
                                    <span>
                                        Course:{" "}
                                        {
                                            courses.find(
                                                (course) =>
                                                    String(course.id) ===
                                                    String(formData.courseId)
                                            )?.courseCode
                                        }
                                    </span>
                                )}

                            </div>

                            {/* Actions */}
                            <div className="modal-actions">

                                <button
                                    type="button"
                                    className="btn-secondary"
                                    onClick={() =>
                                        setShowForm(false)
                                    }
                                    disabled={enrolling}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="btn-primary"
                                    disabled={
                                        enrolling ||
                                        selectedStudents.length === 0 ||
                                        !formData.courseId
                                    }
                                >
                                    {enrolling
                                        ? "Enrolling..."
                                        : `Enroll ${selectedStudents.length} Student${
                                            selectedStudents.length !== 1
                                                ? "s"
                                                : ""
                                        }`}
                                </button>

                            </div>

                        </form>

                    </div>

                </div>
            )}

        </div>
    );
}

export default Enrollments;