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
        <div >

            <div >

                <div>
                    <h2>Add Student</h2>

                    <p >
                        Create a new student account
                    </p>
                </div>

                <div >
                    <button
                        
                        onClick={() => navigate("/admin")}
                    >
                        Dashboard
                    </button>
                    <button
                        
                        onClick={() => navigate("/admin/students")}
                    >
                        Students
                    </button>
                </div>

            </div>

            {error && (
                <div >
                    {error}
                </div>
            )}

            {success && (
                <div >
                     {success}
                </div>
            )}

            <div >

                <div >

                    <form onSubmit={handleSubmit}>

                        <h5 >
                            Student Account
                        </h5>

                        <div >

                            {/* FULL NAME */}
                            <div >

                                <label >
                                    Full Name
                                </label>

                                <input
                                    type="text"
                                    name="fullName"
                                    
                                    placeholder="Rahul Sharma"
                                    value={form.fullName}
                                    onChange={handleChange}
                                    required
                                />

                            </div>

                            {/* EMAIL */}
                            <div >

                                <label >
                                    Email
                                </label>

                                <input
                                    type="email"
                                    name="email"
                                    
                                    placeholder="rahul@gmail.com"
                                    value={form.email}
                                    onChange={handleChange}
                                    required
                                />

                            </div>

                            {/* PASSWORD */}
                            <div >

                                <label >
                                    Password
                                </label>

                                <input
                                    type="password"
                                    name="password"
                                    
                                    placeholder="Enter password"
                                    value={form.password}
                                    onChange={handleChange}
                                    required
                                />

                            </div>

                        </div>

                        <hr />

                        <h5 >
                            Student Information
                        </h5>

                        <div >

                            {/* REGISTRATION NUMBER */}
                            <div >

                                <label >
                                    Registration Number
                                </label>

                                <input
                                    type="text"
                                    name="registrationNumber"
                                    
                                    placeholder="12314516"
                                    value={form.registrationNumber}
                                    onChange={handleChange}
                                    required
                                />

                            </div>

                            {/* DEPARTMENT */}
                            <div >

                                <label >
                                    Department
                                </label>

                                <input
                                    type="text"
                                    name="department"
                                    
                                    placeholder="CSE"
                                    value={form.department}
                                    onChange={handleChange}
                                    required
                                />

                            </div>

                            {/* SEMESTER */}
                            <div >

                                <label >
                                    Semester
                                </label>

                                <input
                                    type="number"
                                    name="semester"
                                    
                                    min="1"
                                    max="12"
                                    value={form.semester}
                                    onChange={handleChange}
                                    required
                                />

                            </div>

                            {/* SECTION */}
                            <div >

                                <label >
                                    Section
                                </label>

                                <input
                                    type="text"
                                    name="section"
                                    
                                    placeholder="A"
                                    value={form.section}
                                    onChange={handleChange}
                                    required
                                />

                            </div>

                            {/* PHONE */}
                            <div >

                                <label >
                                    Phone
                                </label>

                                <input
                                    type="tel"
                                    name="phone"
                                    
                                    placeholder="9876543210"
                                    value={form.phone}
                                    onChange={handleChange}
                                    required
                                />

                            </div>

                            {/* DOB */}
                            <div >

                                <label >
                                    Date of Birth
                                </label>

                                <input
                                    type="date"
                                    name="dateOfBirth"
                                    
                                    value={form.dateOfBirth}
                                    onChange={handleChange}
                                />

                            </div>

                            {/* GENDER */}
                            <div >

                                <label >
                                    Gender
                                </label>

                                <select
                                    name="gender"
                                    
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
                            <div >

                                <label >
                                    Address
                                </label>

                                <textarea
                                    name="address"
                                    
                                    rows="3"
                                    placeholder="Enter student's address"
                                    value={form.address}
                                    onChange={handleChange}
                                />

                            </div>

                        </div>

                        <button
                            type="submit"
                            
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