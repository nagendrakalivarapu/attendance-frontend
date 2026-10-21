import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../services/api";

function EditStudent() {
    const navigate = useNavigate();
    const { id } = useParams();

    const [form, setForm] = useState({
        fullName: "",
        email: "",
        password: "",
        registrationNumber: "",
        department: "",
        semester: "",
        section: "",
        phone: "",
        dateOfBirth: "",
        gender: "",
        address: "",
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // ============================================================
    // LOAD STUDENT
    // ============================================================

    useEffect(() => {

        const loadStudent = async () => {

            try {

                setLoading(true);
                setError("");

                const response =
                    await api.get(`/student/${id}`);

                const student = response.data;

                setForm({
                    fullName: student.studentName || "",
                    email: student.email || "",
                    password: "",
                    registrationNumber:
                        student.registrationNumber || "",
                    department:
                        student.department || "",
                    semester:
                        student.semester || "",
                    section:
                        student.section || "",
                    phone:
                        student.phone || "",
                    dateOfBirth:
                        student.dateOfBirth || "",
                    gender:
                        student.gender || "",
                    address:
                        student.address || "",
                });

            } catch (err) {

                console.error(err);

                setError(
                    err.response?.data?.message ||
                    err.response?.data ||
                    "Failed to load student."
                );

            } finally {

                setLoading(false);

            }
        };

        loadStudent();

    }, [id]);

    // ============================================================
    // HANDLE INPUT
    // ============================================================

    const handleChange = (e) => {

        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });

    };

    // ============================================================
    // UPDATE STUDENT
    // ============================================================

    const handleSubmit = async (e) => {

        e.preventDefault();

        setError("");
        setSuccess("");
        setSaving(true);

        try {

            const request = {
                ...form,
                semester: Number(form.semester),
            };

            await api.put(
                `/student/${id}`,
                request
            );

            setSuccess(
                "Student updated successfully."
            );

            setTimeout(() => {

                navigate("/admin/students");

            }, 1000);

        } catch (err) {

            console.error(err);

            setError(
                err.response?.data?.message ||
                err.response?.data ||
                "Failed to update student."
            );

        } finally {

            setSaving(false);

        }
    };

    // ============================================================
    // LOADING
    // ============================================================

    if (loading) {

        return (
            <div className="container mt-5 text-center">

                <div className="spinner-border text-primary" />

                <p className="mt-3 text-muted">
                    Loading student...
                </p>

            </div>
        );

    }

    // ============================================================
    // UI
    // ============================================================

    return (

        <div className="container mt-4">

            {/* HEADER */}

            <div className="d-flex justify-content-between align-items-center mb-4">

                <div>

                    <h2>
                        Edit Student
                    </h2>

                    <p className="text-muted mb-0">
                        Update student information
                    </p>

                </div>

                <button
                    className="btn btn-secondary"
                    onClick={() =>
                        navigate("/admin/students")
                    }
                >
                    Back
                </button>

            </div>


            {/* ERROR */}

            {error && (

                <div className="alert alert-danger">

                    {error}

                </div>

            )}


            {/* SUCCESS */}

            {success && (

                <div className="alert alert-success">

                    ✓ {success}

                </div>

            )}


            <div className="card shadow-sm">

                <div className="card-body">

                    <form onSubmit={handleSubmit}>

                        {/* ================================================= */}
                        {/* USER ACCOUNT */}
                        {/* ================================================= */}

                        <h5 className="mb-3">
                            Student Account
                        </h5>

                        <div className="row">

                            {/* FULL NAME */}

                            <div className="col-md-6 mb-3">

                                <label className="form-label">
                                    Full Name
                                </label>

                                <input
                                    type="text"
                                    name="fullName"
                                    className="form-control"
                                    placeholder="Student full name"
                                    value={form.fullName}
                                    onChange={handleChange}
                                    required
                                />

                            </div>


                            {/* EMAIL */}

                            <div className="col-md-6 mb-3">

                                <label className="form-label">
                                    Email
                                </label>

                                <input
                                    type="email"
                                    name="email"
                                    className="form-control"
                                    placeholder="student@gmail.com"
                                    value={form.email}
                                    onChange={handleChange}
                                    required
                                />

                            </div>


                            {/* PASSWORD */}

                            <div className="col-md-6 mb-4">

                                <label className="form-label">
                                    New Password
                                </label>

                                <input
                                    type="password"
                                    name="password"
                                    className="form-control"
                                    placeholder="Leave blank to keep current password"
                                    value={form.password}
                                    onChange={handleChange}
                                />

                                <small className="text-muted">
                                    Leave blank if you don't want
                                    to change the password.
                                </small>

                            </div>

                        </div>


                        <hr />


                        {/* ================================================= */}
                        {/* STUDENT INFORMATION */}
                        {/* ================================================= */}

                        <h5 className="mb-3">
                            Student Information
                        </h5>

                        <div className="row">

                            {/* REGISTRATION NUMBER */}

                            <div className="col-md-6 mb-3">

                                <label className="form-label">
                                    Registration Number
                                </label>

                                <input
                                    type="text"
                                    name="registrationNumber"
                                    className="form-control"
                                    value={
                                        form.registrationNumber
                                    }
                                    onChange={handleChange}
                                    required
                                />

                            </div>


                            {/* DEPARTMENT */}

                            <div className="col-md-6 mb-3">

                                <label className="form-label">
                                    Department
                                </label>

                                <input
                                    type="text"
                                    name="department"
                                    className="form-control"
                                    value={form.department}
                                    onChange={handleChange}
                                    required
                                />

                            </div>


                            {/* SEMESTER */}

                            <div className="col-md-4 mb-3">

                                <label className="form-label">
                                    Semester
                                </label>

                                <input
                                    type="number"
                                    name="semester"
                                    className="form-control"
                                    min="1"
                                    max="12"
                                    value={form.semester}
                                    onChange={handleChange}
                                    required
                                />

                            </div>


                            {/* SECTION */}

                            <div className="col-md-4 mb-3">

                                <label className="form-label">
                                    Section
                                </label>

                                <input
                                    type="text"
                                    name="section"
                                    className="form-control"
                                    value={form.section}
                                    onChange={handleChange}
                                    required
                                />

                            </div>


                            {/* PHONE */}

                            <div className="col-md-4 mb-3">

                                <label className="form-label">
                                    Phone
                                </label>

                                <input
                                    type="tel"
                                    name="phone"
                                    className="form-control"
                                    value={form.phone}
                                    onChange={handleChange}
                                    required
                                />

                            </div>


                            {/* DATE OF BIRTH */}

                            <div className="col-md-4 mb-3">

                                <label className="form-label">
                                    Date of Birth
                                </label>

                                <input
                                    type="date"
                                    name="dateOfBirth"
                                    className="form-control"
                                    value={form.dateOfBirth}
                                    onChange={handleChange}
                                />

                            </div>


                            {/* GENDER */}

                            <div className="col-md-4 mb-3">

                                <label className="form-label">
                                    Gender
                                </label>

                                <select
                                    name="gender"
                                    className="form-select"
                                    value={form.gender}
                                    onChange={handleChange}
                                >

                                    <option value="">
                                        Select
                                    </option>

                                    <option value="Male">
                                        Male
                                    </option>

                                    <option value="Female">
                                        Female
                                    </option>

                                    <option value="Other">
                                        Other
                                    </option>

                                </select>

                            </div>


                            {/* ADDRESS */}

                            <div className="col-12 mb-3">

                                <label className="form-label">
                                    Address
                                </label>

                                <textarea
                                    name="address"
                                    className="form-control"
                                    rows="3"
                                    value={form.address}
                                    onChange={handleChange}
                                />

                            </div>

                        </div>


                        {/* BUTTONS */}

                        <div className="d-flex gap-2">

                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={saving}
                            >

                                {saving
                                    ? "Saving Changes..."
                                    : "Save Changes"}

                            </button>


                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={() =>
                                    navigate(
                                        "/admin/students"
                                    )
                                }
                            >
                                Cancel
                            </button>

                        </div>

                    </form>

                </div>

            </div>

        </div>
    );
}

export default EditStudent;