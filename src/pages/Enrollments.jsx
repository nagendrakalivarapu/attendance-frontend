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

    const [formData, setFormData] = useState({
        studentId: "",
        courseId: ""
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);

            const [enrollmentResponse, studentResponse, courseResponse] =
                await Promise.all([
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

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleAdd = () => {
        setFormData({
            studentId: "",
            courseId: ""
        });

        setShowForm(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.studentId || !formData.courseId) {
            alert("Please select both student and course.");
            return;
        }

        try {
            await api.post("/enrollment", {
                studentId: Number(formData.studentId),
                courseId: Number(formData.courseId)
            });

            alert("Student enrolled successfully.");

            setShowForm(false);

            setFormData({
                studentId: "",
                courseId: ""
            });

            await loadData();

        } catch (error) {
            console.error("Error creating enrollment:", error);

            const message =
                error.response?.data?.message ||
                "Failed to create enrollment.";

            alert(message);
        }
    };

    const handleStatusChange = async (id, status) => {
        try {
            await api.put(
                `/enrollment/${id}/status?status=${status}`
            );

            alert("Enrollment status updated.");

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

    const activeCount = enrollments.filter(
        (e) => e.status === "ACTIVE"
    ).length;

    const inactiveCount = enrollments.filter(
        (e) => e.status !== "ACTIVE"
    ).length;

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
                        + Enroll Student
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

            {/* Main content */}
            <div className="content-card">

                {/* Search and filter */}
                <div className="enrollment-toolbar">

                    <input
                        type="text"
                        className="search-input"
                        placeholder="Search student, registration number, course..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
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

                {/* Table */}
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
                            Enroll a student into a course to get started.
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

                                                    <option value="DROPPED">
                                                        Dropped
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

            {/* Add Enrollment Modal */}
            {showForm && (

                <div className="modal-overlay">

                    <div className="form-modal">

                        <div className="modal-header">

                            <div>

                                <h2>
                                    Enroll Student
                                </h2>

                                <p>
                                    Add a student to a course.
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

                            {/* Student */}
                            <div className="form-group">

                                <label>
                                    Student *
                                </label>

                                <select
                                    name="studentId"
                                    value={formData.studentId}
                                    onChange={handleChange}
                                    required
                                >

                                    <option value="">
                                        Select Student
                                    </option>

                                    {students.map((student) => (

                                        <option
                                            key={student.id}
                                            value={student.id}
                                        >
                                            {student.studentName}
                                            {" — "}
                                            {student.registrationNumber}
                                        </option>

                                    ))}

                                </select>

                            </div>

                            {/* Course */}
                            <div className="form-group">

                                <label>
                                    Course *
                                </label>

                                <select
                                    name="courseId"
                                    value={formData.courseId}
                                    onChange={handleChange}
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

                            {/* Actions */}
                            <div className="modal-actions">

                                <button
                                    type="button"
                                    className="btn-secondary"
                                    onClick={() =>
                                        setShowForm(false)
                                    }
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="btn-primary"
                                >
                                    Enroll Student
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