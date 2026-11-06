import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

function AdminManagement() {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [admins, setAdmins] = useState([]);
    const [search, setSearch] = useState("");

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [showForm, setShowForm] = useState(false);
    const [editingAdmin, setEditingAdmin] = useState(null);

    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        password: "",
    });

    useEffect(() => {
        void loadAdmins();
    }, []);

    // ============================================================
    // LOAD ADMINS
    // ============================================================

    const loadAdmins = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/admin");

            setAdmins(
                Array.isArray(response.data)
                    ? response.data
                    : []
            );

        } catch (err) {
            console.error("Failed to load admins:", err);

            setError(
                err.response?.data?.message ||
                "Unable to load administrators."
            );
        } finally {
            setLoading(false);
        }
    };

    // ============================================================
    // FORM HANDLING
    // ============================================================

    const handleInputChange = (event) => {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const resetForm = () => {
        setFormData({
            fullName: "",
            email: "",
            password: "",
        });

        setEditingAdmin(null);
        setShowForm(false);
    };

    const handleAddAdmin = () => {
        setSuccess("");
        setError("");

        setEditingAdmin(null);

        setFormData({
            fullName: "",
            email: "",
            password: "",
        });

        setShowForm(true);
    };

    const handleEditAdmin = (admin) => {
        setSuccess("");
        setError("");

        setEditingAdmin(admin);

        setFormData({
            fullName: admin.fullName || "",
            email: admin.email || "",
            password: "",
        });

        setShowForm(true);
    };

    // ============================================================
    // CREATE / UPDATE
    // ============================================================

    const handleSubmit = async (event) => {
        event.preventDefault();

        setError("");
        setSuccess("");

        if (!formData.fullName.trim()) {
            setError("Full name is required.");
            return;
        }

        if (!formData.email.trim()) {
            setError("Email is required.");
            return;
        }

        if (!editingAdmin && !formData.password.trim()) {
            setError("Password is required when creating an admin.");
            return;
        }

        if (
            formData.password.trim() &&
            formData.password.trim().length < 6
        ) {
            setError(
                "Password must contain at least 6 characters."
            );
            return;
        }

        try {
            setSaving(true);

            const payload = {
                fullName: formData.fullName.trim(),
                email: formData.email.trim(),
                password: formData.password.trim(),
            };

            if (editingAdmin) {

                await api.put(
                    `/admin/${editingAdmin.id}`,
                    payload
                );

                setSuccess(
                    "Administrator updated successfully."
                );

            } else {

                await api.post(
                    "/admin",
                    payload
                );

                setSuccess(
                    "Administrator created successfully."
                );
            }

            resetForm();

            await loadAdmins();

        } catch (err) {
            console.error("Failed to save admin:", err);

            setError(
                err.response?.data?.message ||
                "Unable to save administrator."
            );
        } finally {
            setSaving(false);
        }
    };

    // ============================================================
    // DELETE ADMIN
    // ============================================================

    const handleDeleteAdmin = async (admin) => {

        if (admin.email === user?.email) {
            setError(
                "You cannot delete the currently authenticated account."
            );
            return;
        }

        const confirmed = window.confirm(
            `Are you sure you want to delete ${admin.fullName}?`
        );

        if (!confirmed) {
            return;
        }

        try {
            setError("");
            setSuccess("");

            await api.delete(
                `/admin/${admin.id}`
            );

            setSuccess(
                "Administrator deleted successfully."
            );

            await loadAdmins();

        } catch (err) {
            console.error("Failed to delete admin:", err);

            setError(
                err.response?.data?.message ||
                "Unable to delete administrator."
            );
        }
    };

    // ============================================================
    // SEARCH
    // ============================================================

    const filteredAdmins = useMemo(() => {

        const searchText =
            search.trim().toLowerCase();

        if (!searchText) {
            return admins;
        }

        return admins.filter((admin) =>
            admin.fullName
                ?.toLowerCase()
                .includes(searchText) ||

            admin.email
                ?.toLowerCase()
                .includes(searchText)
        );

    }, [admins, search]);

    // ============================================================
    // PAGE
    // ============================================================

    return (
        <div className="admin-page">

            {/* ====================================================
                HEADER
            ==================================================== */}

            <div className="admin-page-header">

                <div>
                    <p className="admin-page-eyebrow">
                        ADMINISTRATION
                    </p>

                    <h1>
                        Admin Management
                    </h1>

                    <p>
                        Manage administrator accounts and access.
                    </p>
                </div>

                <div className="admin-page-header-actions">

                    <button
                        type="button"
                        className="admin-secondary-button"
                        onClick={() => navigate("/admin")}
                    >
                        Dashboard
                    </button>

                    <button
                        type="button"
                        className="admin-primary-button"
                        onClick={handleAddAdmin}
                    >
                        Add Administrator
                    </button>

                </div>

            </div>


            {/* ====================================================
                ALERTS
            ==================================================== */}

            {error && (
                <div className="admin-management-alert admin-management-alert-error">
                    {error}
                </div>
            )}

            {success && (
                <div className="admin-management-alert admin-management-alert-success">
                    {success}
                </div>
            )}


            {/* ====================================================
                STATISTICS
            ==================================================== */}

            <div className="admin-management-stats">

                <div className="admin-management-stat-card">
                    <span>Total Administrators</span>
                    <strong>{admins.length}</strong>
                </div>

                <div className="admin-management-stat-card">
                    <span>Search Results</span>
                    <strong>{filteredAdmins.length}</strong>
                </div>

                <div className="admin-management-stat-card">
                    <span>Active Administrators</span>
                    <strong>
                        {
                            admins.filter(
                                (admin) => admin.enabled
                            ).length
                        }
                    </strong>
                </div>

            </div>


            {/* ====================================================
                FORM
            ==================================================== */}

            {showForm && (
                <section className="admin-management-form-card">

                    <div className="admin-management-section-header">

                        <div>
                            <h2>
                                {editingAdmin
                                    ? "Edit Administrator"
                                    : "Add Administrator"}
                            </h2>

                            <p>
                                {editingAdmin
                                    ? "Update the administrator account details."
                                    : "Create a new administrator account."}
                            </p>
                        </div>

                        <button
                            type="button"
                            className="admin-form-close-button"
                            onClick={resetForm}
                            disabled={saving}
                        >
                            Close
                        </button>

                    </div>


                    <form onSubmit={handleSubmit}>

                        <div className="admin-management-form-grid">

                            <div className="admin-management-field">

                                <label htmlFor="admin-full-name">
                                    Full Name
                                </label>

                                <input
                                    id="admin-full-name"
                                    name="fullName"
                                    type="text"
                                    value={formData.fullName}
                                    onChange={handleInputChange}
                                    placeholder="Enter full name"
                                    disabled={saving}
                                />

                            </div>


                            <div className="admin-management-field">

                                <label htmlFor="admin-email">
                                    Email
                                </label>

                                <input
                                    id="admin-email"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    placeholder="admin@example.com"
                                    disabled={saving}
                                />

                            </div>


                            <div className="admin-management-field">

                                <label htmlFor="admin-password">

                                    Password

                                    {editingAdmin && (
                                        <span className="admin-field-hint">
                                            Leave blank to keep current password
                                        </span>
                                    )}

                                </label>

                                <input
                                    id="admin-password"
                                    name="password"
                                    type="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    placeholder={
                                        editingAdmin
                                            ? "Enter new password"
                                            : "Enter password"
                                    }
                                    disabled={saving}
                                />

                            </div>

                        </div>


                        <div className="admin-management-form-actions">

                            <button
                                type="button"
                                className="admin-secondary-button"
                                onClick={resetForm}
                                disabled={saving}
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                className="admin-primary-button"
                                disabled={saving}
                            >
                                {saving
                                    ? "Saving..."
                                    : editingAdmin
                                        ? "Update Administrator"
                                        : "Create Administrator"}
                            </button>

                        </div>

                    </form>

                </section>
            )}


            {/* ====================================================
                ADMIN LIST
            ==================================================== */}

            <section className="admin-management-list-card">

                <div className="admin-management-list-header">

                    <div>
                        <h2>
                            Administrators
                        </h2>

                        <p>
                            Accounts with administrative access.
                        </p>
                    </div>

                    <div className="admin-management-search">

                        <input
                            type="search"
                            value={search}
                            onChange={(event) =>
                                setSearch(event.target.value)
                            }
                            placeholder="Search by name or email"
                        />

                    </div>

                </div>


                {loading ? (

                    <div className="admin-management-state">
                        <div className="admin-management-spinner"></div>
                        <p>Loading administrators...</p>
                    </div>

                ) : filteredAdmins.length === 0 ? (

                    <div className="admin-management-state">
                        <h3>
                            No administrators found
                        </h3>

                        <p>
                            {search
                                ? "Try a different search."
                                : "No administrator accounts are available."}
                        </p>
                    </div>

                ) : (

                    <div className="admin-management-table-wrapper">

                        <table className="admin-management-table">

                            <thead>
                            <tr>
                                <th>Administrator</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                            </thead>

                            <tbody>

                            {filteredAdmins.map((admin) => {

                                const isCurrentUser =
                                    admin.email === user?.email;

                                return (
                                    <tr key={admin.id}>

                                        <td>
                                            <div className="admin-table-user">

                                                <div className="admin-table-avatar">
                                                    {admin.fullName
                                                        ?.charAt(0)
                                                        .toUpperCase() || "A"}
                                                </div>

                                                <div>
                                                    <strong>
                                                        {admin.fullName}
                                                    </strong>

                                                    {isCurrentUser && (
                                                        <span>
                                                                Current account
                                                            </span>
                                                    )}
                                                </div>

                                            </div>
                                        </td>


                                        <td>
                                            {admin.email}
                                        </td>


                                        <td>
                                                <span className="admin-role-badge">
                                                    {admin.role}
                                                </span>
                                        </td>


                                        <td>

                                                <span
                                                    className={
                                                        admin.enabled
                                                            ? "admin-status-badge admin-status-active"
                                                            : "admin-status-badge admin-status-disabled"
                                                    }
                                                >
                                                    {admin.enabled
                                                        ? "Active"
                                                        : "Disabled"}
                                                </span>

                                        </td>


                                        <td>

                                            <div className="admin-table-actions">

                                                <button
                                                    type="button"
                                                    className="admin-table-edit-button"
                                                    onClick={() =>
                                                        handleEditAdmin(admin)
                                                    }
                                                    disabled={isCurrentUser}
                                                    title={
                                                        isCurrentUser
                                                            ? "The primary admin is managed through application.properties."
                                                            : "Edit administrator"
                                                    }
                                                >
                                                    Edit
                                                </button>

                                                <button
                                                    type="button"
                                                    className="admin-table-delete-button"
                                                    onClick={() =>
                                                        handleDeleteAdmin(admin)
                                                    }
                                                    disabled={isCurrentUser}
                                                >
                                                    Delete
                                                </button>

                                            </div>

                                        </td>

                                    </tr>
                                );
                            })}

                            </tbody>

                        </table>

                    </div>
                )}

            </section>

        </div>
    );
}

export default AdminManagement;