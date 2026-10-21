import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Teachers() {
    const navigate = useNavigate();

    const [teachers, setTeachers] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);

    const [showForm, setShowForm] = useState(false);
    const [editingTeacher, setEditingTeacher] = useState(null);

    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        password: "",
        employeeId: "",
        department: "",
        designation: "",
        phone: "",
        qualification: ""
    });

    useEffect(() => {
        loadTeachers();
    }, []);

    const loadTeachers = async () => {
        try {
            setLoading(true);

            const response = await api.get("/teacher");
            setTeachers(response.data);
        } catch (error) {
            console.error("Error loading teachers:", error);
            alert("Failed to load teachers.");
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
        setEditingTeacher(null);

        setFormData({
            fullName: "",
            email: "",
            password: "",
            employeeId: "",
            department: "",
            designation: "",
            phone: "",
            qualification: ""
        });

        setShowForm(true);
    };

    const handleEdit = (teacher) => {
        setEditingTeacher(teacher);

        setFormData({
            fullName: teacher.fullName || "",
            email: teacher.email || "",
            password: "",
            employeeId: teacher.employeeId || "",
            department: teacher.department || "",
            designation: teacher.designation || "",
            phone: teacher.phone || "",
            qualification: teacher.qualification || ""
        });

        setShowForm(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            let payload = {
                fullName: formData.fullName,
                email: formData.email,
                employeeId: formData.employeeId,
                department: formData.department,
                designation: formData.designation,
                phone: formData.phone,
                qualification: formData.qualification
            };

            // Password is required when creating a teacher
            if (!editingTeacher) {
                if (!formData.password.trim()) {
                    alert("Password is required when adding a teacher.");
                    return;
                }

                payload.password = formData.password;
            }

            // Password is optional when editing
            if (
                editingTeacher &&
                formData.password.trim()
            ) {
                payload.password = formData.password;
            }

            if (editingTeacher) {
                await api.put(
                    `/teacher/${editingTeacher.id}`,
                    payload
                );

                alert("Teacher updated successfully.");
            } else {
                await api.post("/teacher", payload);

                alert("Teacher added successfully.");
            }

            setShowForm(false);
            setEditingTeacher(null);

            await loadTeachers();

        } catch (error) {
            console.error("Error saving teacher:", error);

            const message =
                error.response?.data?.message ||
                "Failed to save teacher.";

            alert(message);
        }
    };

    const handleDelete = async (id) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this teacher?"
        );

        if (!confirmed) {
            return;
        }

        try {
            await api.delete(`/teacher/${id}`);

            alert("Teacher deleted successfully.");

            await loadTeachers();

        } catch (error) {
            console.error("Error deleting teacher:", error);

            const message =
                error.response?.data?.message ||
                "Failed to delete teacher.";

            alert(message);
        }
    };

    const filteredTeachers = teachers.filter((teacher) => {
        const searchText = search.toLowerCase();

        return (
            teacher.fullName?.toLowerCase().includes(searchText) ||
            teacher.email?.toLowerCase().includes(searchText) ||
            teacher.employeeId?.toLowerCase().includes(searchText) ||
            teacher.department?.toLowerCase().includes(searchText) ||
            teacher.designation?.toLowerCase().includes(searchText) ||
            teacher.qualification?.toLowerCase().includes(searchText)
        );
    });

    return (
        <div className="page-container">

            {/* Header */}
            <div className="page-header">

                <div>
                    <h1>Teacher Management</h1>
                    <p>
                        Manage teacher profiles, accounts and academic information.
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
                        + Add Teacher
                    </button>

                </div>
            </div>

            {/* Statistics */}
            <div className="stats-grid">

                <div className="stat-card">
                    <div className="stat-icon">
                        👨‍🏫
                    </div>

                    <div>
                        <span>Total Teachers</span>
                        <strong>{teachers.length}</strong>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">
                        🔎
                    </div>

                    <div>
                        <span>Search Results</span>
                        <strong>{filteredTeachers.length}</strong>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">
                        🏫
                    </div>

                    <div>
                        <span>Departments</span>
                        <strong>
                            {
                                new Set(
                                    teachers
                                        .map((teacher) => teacher.department)
                                        .filter(Boolean)
                                ).size
                            }
                        </strong>
                    </div>
                </div>

            </div>

            {/* Main content */}
            <div className="content-card">

                {/* Search */}
                <div className="search-bar-container">

                    <input
                        type="text"
                        className="search-input"
                        placeholder="Search by name, email, employee ID, department..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />

                    <button
                        className="btn-secondary"
                        onClick={loadTeachers}
                    >
                        Refresh
                    </button>

                </div>

                {/* Loading */}
                {loading ? (
                    <div className="loading-message">
                        Loading teachers...
                    </div>
                ) : filteredTeachers.length === 0 ? (

                    <div className="empty-state">

                        <div className="empty-icon">
                            👨‍🏫
                        </div>

                        <h3>No teachers found</h3>

                        <p>
                            Add a teacher or change your search.
                        </p>

                    </div>

                ) : (

                    <div className="table-wrapper">

                        <table className="data-table">

                            <thead>
                            <tr>
                                <th>Employee ID</th>
                                <th>Teacher</th>
                                <th>Email</th>
                                <th>Department</th>
                                <th>Designation</th>
                                <th>Qualification</th>
                                <th>Phone</th>
                                <th>Actions</th>
                            </tr>
                            </thead>

                            <tbody>

                            {filteredTeachers.map((teacher) => (

                                <tr key={teacher.id}>

                                    <td>
                                            <span className="id-badge">
                                                {teacher.employeeId}
                                            </span>
                                    </td>

                                    <td>
                                        <strong>
                                            {teacher.fullName}
                                        </strong>
                                    </td>

                                    <td>
                                        {teacher.email}
                                    </td>

                                    <td>
                                        {teacher.department}
                                    </td>

                                    <td>
                                        {teacher.designation}
                                    </td>

                                    <td>
                                        {teacher.qualification}
                                    </td>

                                    <td>
                                        {teacher.phone}
                                    </td>

                                    <td>

                                        <div className="action-buttons">

                                            <button
                                                className="btn-edit"
                                                onClick={() =>
                                                    handleEdit(teacher)
                                                }
                                            >
                                                Edit
                                            </button>

                                            <button
                                                className="btn-delete"
                                                onClick={() =>
                                                    handleDelete(teacher.id)
                                                }
                                            >
                                                Delete
                                            </button>

                                        </div>

                                    </td>

                                </tr>

                            ))}

                            </tbody>

                        </table>

                    </div>
                )}

            </div>

            {/* Add / Edit Modal */}
            {showForm && (

                <div className="modal-overlay">

                    <div className="form-modal">

                        <div className="modal-header">

                            <div>

                                <h2>
                                    {editingTeacher
                                        ? "Edit Teacher"
                                        : "Add Teacher"}
                                </h2>

                                <p>
                                    {editingTeacher
                                        ? "Update teacher and account information."
                                        : "Create a teacher profile and login account."}
                                </p>

                            </div>

                            <button
                                className="modal-close"
                                onClick={() => setShowForm(false)}
                            >
                                ×
                            </button>

                        </div>

                        <form onSubmit={handleSubmit}>

                            {/* Account Information */}
                            <div className="form-section-title">
                                Account Information
                            </div>

                            <div className="form-grid">

                                <div className="form-group">

                                    <label>
                                        Full Name *
                                    </label>

                                    <input
                                        type="text"
                                        name="fullName"
                                        value={formData.fullName}
                                        onChange={handleChange}
                                        placeholder="John Teacher"
                                        required
                                    />

                                </div>

                                <div className="form-group">

                                    <label>
                                        Email *
                                    </label>

                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="teacher@gmail.com"
                                        required
                                    />

                                </div>

                                <div className="form-group full-width">

                                    <label>
                                        Password
                                        {!editingTeacher && " *"}
                                    </label>

                                    <input
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder={
                                            editingTeacher
                                                ? "Leave blank to keep current password"
                                                : "Enter login password"
                                        }
                                        required={!editingTeacher}
                                    />

                                    {editingTeacher && (
                                        <small className="form-help">
                                            Leave blank if you do not want to
                                            change the teacher's password.
                                        </small>
                                    )}

                                </div>

                            </div>

                            {/* Professional Information */}
                            <div className="form-section-title">
                                Professional Information
                            </div>

                            <div className="form-grid">

                                <div className="form-group">

                                    <label>
                                        Employee ID *
                                    </label>

                                    <input
                                        type="text"
                                        name="employeeId"
                                        value={formData.employeeId}
                                        onChange={handleChange}
                                        placeholder="EMP001"
                                        required
                                    />

                                </div>

                                <div className="form-group">

                                    <label>
                                        Department *
                                    </label>

                                    <input
                                        type="text"
                                        name="department"
                                        value={formData.department}
                                        onChange={handleChange}
                                        placeholder="CSE"
                                        required
                                    />

                                </div>

                                <div className="form-group">

                                    <label>
                                        Designation *
                                    </label>

                                    <input
                                        type="text"
                                        name="designation"
                                        value={formData.designation}
                                        onChange={handleChange}
                                        placeholder="Assistant Professor"
                                        required
                                    />

                                </div>

                                <div className="form-group">

                                    <label>
                                        Phone *
                                    </label>

                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        placeholder="9876543210"
                                        required
                                    />

                                </div>

                                <div className="form-group full-width">

                                    <label>
                                        Qualification *
                                    </label>

                                    <input
                                        type="text"
                                        name="qualification"
                                        value={formData.qualification}
                                        onChange={handleChange}
                                        placeholder="M.Tech"
                                        required
                                    />

                                </div>

                            </div>

                            {/* Actions */}
                            <div className="modal-actions">

                                <button
                                    type="button"
                                    className="btn-secondary"
                                    onClick={() => setShowForm(false)}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="btn-primary"
                                >
                                    {editingTeacher
                                        ? "Update Teacher"
                                        : "Add Teacher"}
                                </button>

                            </div>

                        </form>

                    </div>

                </div>
            )}

        </div>
    );
}

export default Teachers;