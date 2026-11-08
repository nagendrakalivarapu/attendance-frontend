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
            <div >

                <div  />

                <p >
                    Loading student...
                </p>

            </div>
        );

    }

    // ============================================================
    // UI
    // ============================================================

    return (

        <div >

            {/* HEADER */}

            <div >

                <div>

                    <h2>
                        Edit Student
                    </h2>

                    <p >
                        Update student information
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


            {/* ERROR */}

            {error && (

                <div >

                    {error}

                </div>

            )}


            {/* SUCCESS */}

            {success && (

                <div >

                     {success}

                </div>

            )}


            <div >

                <div >

                    <form onSubmit={handleSubmit}>

                        {/* ================================================= */}
                        {/* USER ACCOUNT */}
                        {/* ================================================= */}

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
                                    
                                    placeholder="Student full name"
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
                                    
                                    placeholder="student@gmail.com"
                                    value={form.email}
                                    onChange={handleChange}
                                    required
                                />

                            </div>


                            {/* PASSWORD */}

                            <div >

                                <label >
                                    New Password
                                </label>

                                <input
                                    type="password"
                                    name="password"
                                    
                                    placeholder="Leave blank to keep current password"
                                    value={form.password}
                                    onChange={handleChange}
                                />

                                <small >
                                    Leave blank if you don't want
                                    to change the password.
                                </small>

                            </div>

                        </div>


                        <hr />


                        {/* ================================================= */}
                        {/* STUDENT INFORMATION */}
                        {/* ================================================= */}

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
                                    
                                    value={
                                        form.registrationNumber
                                    }
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
                                    
                                    value={form.phone}
                                    onChange={handleChange}
                                    required
                                />

                            </div>


                            {/* DATE OF BIRTH */}

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
                                    value={form.address}
                                    onChange={handleChange}
                                />

                            </div>

                        </div>


                        {/* BUTTONS */}

                        <div >

                            <button
                                type="submit"
                                
                                disabled={saving}
                            >

                                {saving
                                    ? "Saving Changes..."
                                    : "Save Changes"}

                            </button>


                            <button
                                type="button"
                                
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