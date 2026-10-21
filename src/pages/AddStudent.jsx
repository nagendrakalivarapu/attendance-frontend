import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function AddStudent() {
    const navigate = useNavigate();

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

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setSuccess("");
        setLoading(true);

        try {
            const request = {
                ...form,
                semester: Number(form.semester),
            };

            await api.post("/student", request);

            setSuccess("Student account created successfully.");

            setTimeout(() => {
                navigate("/admin/students");
            }, 1000);

        } catch (err) {
            console.error(err);

            setError(
                err.response?.data?.message ||
                err.response?.data ||
                "Failed to create student."
            );

        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mt-4">

            <div className="d-flex justify-content-between align-items-center mb-4">

                <div>
                    <h2>Add Student</h2>

                    <p className="text-muted">
                        Create a new student account
                    </p>
                </div>

                <button
                    className="btn btn-secondary"
                    onClick={() => navigate("/admin/students")}
                >
                    Back
                </button>

            </div>

            {error && (
                <div className="alert alert-danger">
                    {error}
                </div>
            )}

            {success && (
                <div className="alert alert-success">
                    ✓ {success}
                </div>
            )}

            <div className="card shadow-sm">

                <div className="card-body">

                    <form onSubmit={handleSubmit}>

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
                                    placeholder="Rahul Sharma"
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
                                    placeholder="rahul@gmail.com"
                                    value={form.email}
                                    onChange={handleChange}
                                    required
                                />

                            </div>

                            {/* PASSWORD */}
                            <div className="col-md-6 mb-4">

                                <label className="form-label">
                                    Password
                                </label>

                                <input
                                    type="password"
                                    name="password"
                                    className="form-control"
                                    placeholder="Enter password"
                                    value={form.password}
                                    onChange={handleChange}
                                    required
                                />

                            </div>

                        </div>

                        <hr />

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
                                    placeholder="12314516"
                                    value={form.registrationNumber}
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
                                    placeholder="CSE"
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
                                    placeholder="A"
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
                                    placeholder="9876543210"
                                    value={form.phone}
                                    onChange={handleChange}
                                    required
                                />

                            </div>

                            {/* DOB */}
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
                                    placeholder="Enter student's address"
                                    value={form.address}
                                    onChange={handleChange}
                                />

                            </div>

                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={loading}
                        >
                            {loading
                                ? "Creating Student..."
                                : "Create Student"}
                        </button>

                    </form>

                </div>

            </div>

        </div>
    );
}

export default AddStudent;