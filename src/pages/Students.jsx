import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Students() {

    const navigate = useNavigate();

    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [search, setSearch] = useState("");
    const [uploadingId, setUploadingId] = useState(null);
    const [deletingId, setDeletingId] = useState(null);


    // ============================================================
    // LOAD STUDENTS
    // ============================================================

    const loadStudents = async () => {

        try {

            setLoading(true);
            setError("");

            const response = await api.get("/student");

            setStudents(response.data);

        } catch (err) {

            console.error(err);

            if (err.response?.data?.message) {

                setError(err.response.data.message);

            } else {

                setError("Failed to load students.");

            }

        } finally {

            setLoading(false);

        }
    };


    // ============================================================
    // LOAD STUDENTS ON PAGE LOAD
    // ============================================================

    useEffect(() => {

        loadStudents();

    }, []);


    // ============================================================
    // REGISTER FACE
    // ============================================================

    const handleFaceRegistration = async (
        studentId,
        file
    ) => {

        if (!file) {
            return;
        }

        // Basic image validation
        if (!file.type.startsWith("image/")) {

            setError(
                "Please select a valid image file."
            );

            return;
        }

        // 10 MB limit
        if (file.size > 10 * 1024 * 1024) {

            setError(
                "Image size must be less than 10 MB."
            );

            return;
        }

        try {

            setUploadingId(studentId);

            setError("");
            setSuccess("");

            const formData = new FormData();

            formData.append(
                "image",
                file
            );

            await api.post(
                `/student/${studentId}/face`,
                formData,
                {
                    headers: {
                        "Content-Type":
                            "multipart/form-data"
                    }
                }
            );

            setSuccess(
                "Face registered successfully."
            );

            // Reload students so faceRegistered changes
            await loadStudents();

        } catch (err) {

            console.error(err);

            if (err.response?.data?.message) {

                setError(
                    err.response.data.message
                );

            } else if (
                typeof err.response?.data === "string"
            ) {

                setError(
                    err.response.data
                );

            } else {

                setError(
                    "Face registration failed."
                );

            }

        } finally {

            setUploadingId(null);

        }
    };


    // ============================================================
    // DELETE STUDENT
    // ============================================================

    const handleDelete = async (student) => {

        const confirmed = window.confirm(
            `Are you sure you want to delete ${student.studentName || student.registrationNumber}?`
        );

        if (!confirmed) {
            return;
        }

        try {

            setDeletingId(student.id);

            setError("");
            setSuccess("");

            await api.delete(
                `/student/${student.id}`
            );

            setSuccess(
                "Student deleted successfully."
            );

            // Remove student from current list
            setStudents((currentStudents) =>
                currentStudents.filter(
                    (item) =>
                        item.id !== student.id
                )
            );

        } catch (err) {

            console.error(err);

            if (err.response?.data?.message) {

                setError(
                    err.response.data.message
                );

            } else {

                setError(
                    "Failed to delete student."
                );

            }

        } finally {

            setDeletingId(null);

        }
    };


    // ============================================================
    // SEARCH
    // ============================================================

    const filteredStudents = students.filter(
        (student) => {

            const query =
                search.toLowerCase().trim();

            if (!query) {
                return true;
            }

            return (

                student.registrationNumber
                    ?.toLowerCase()
                    .includes(query)

                ||

                student.studentName
                    ?.toLowerCase()
                    .includes(query)

                ||

                student.email
                    ?.toLowerCase()
                    .includes(query)

                ||

                student.department
                    ?.toLowerCase()
                    .includes(query)

                ||

                student.section
                    ?.toLowerCase()
                    .includes(query)

            );

        }
    );


    // ============================================================
    // COUNTS
    // ============================================================

    const totalStudents =
        students.length;

    const registeredFaces =
        students.filter(
            (student) =>
                student.faceRegistered
        ).length;

    const pendingFaces =
        totalStudents -
        registeredFaces;


    // ============================================================
    // UI
    // ============================================================

    return (

        <div >


            {/* ================================================= */}
            {/* HEADER */}
            {/* ================================================= */}

            <div >

                <div>

                    <h2 >
                        Students
                    </h2>

                    <p >
                        Manage registered students
                    </p>

                </div>


                <div >

                    <button
                        
                        onClick={() => navigate("/admin")}
                    >
                        Dashboard
                    </button>

                    <button
                        
                        onClick={() => navigate("/admin/teachers")}
                    >
                        Teachers
                    </button>

                    <button
                        
                        onClick={() => navigate("/admin/courses")}
                    >
                        Courses
                    </button>

                    <button
                        
                        onClick={() => navigate("/admin/enrollments")}
                    >
                        Enrollments
                    </button>

                    <button
                        
                        onClick={() => navigate("/admin/attendance")}
                    >
                        Attendance
                    </button>

                    <button
                        
                        onClick={loadStudents}
                        disabled={loading}
                    >
                        ↻ Refresh
                    </button>

                    <button
                        
                        onClick={() =>
                            navigate(
                                "/admin/students/add"
                            )
                        }
                    >
                        + Add Student
                    </button>

                </div>

            </div>


            {/* ================================================= */}
            {/* SUCCESS MESSAGE */}
            {/* ================================================= */}

            {success && (

                <div
                    
                    role="alert"
                >

                     {success}

                    <button
                        type="button"
                        
                        onClick={() =>
                            setSuccess("")
                        }
                    />

                </div>

            )}


            {/* ================================================= */}
            {/* ERROR MESSAGE */}
            {/* ================================================= */}

            {error && (

                <div
                    
                    role="alert"
                >

                    {error}

                    <button
                        type="button"
                        
                        onClick={() =>
                            setError("")
                        }
                    />

                </div>

            )}


            {/* ================================================= */}
            {/* STATISTICS */}
            {/* ================================================= */}

            <div >


                {/* TOTAL */}

                <div >

                    <div >

                        <div >

                            <div >
                                Total Students
                            </div>

                            <h3 >
                                {totalStudents}
                            </h3>

                        </div>

                    </div>

                </div>


                {/* REGISTERED */}

                <div >

                    <div >

                        <div >

                            <div >
                                Faces Registered
                            </div>

                            <h3 >
                                {registeredFaces}
                            </h3>

                        </div>

                    </div>

                </div>


                {/* PENDING */}

                <div >

                    <div >

                        <div >

                            <div >
                                Face Registration Pending
                            </div>

                            <h3 >
                                {pendingFaces}
                            </h3>

                        </div>

                    </div>

                </div>

            </div>


            {/* ================================================= */}
            {/* SEARCH */}
            {/* ================================================= */}

            <div >

                <div >

                    <div >

                        <div >

                            <label >
                                Search Students
                            </label>

                            <input
                                type="text"
                                
                                placeholder="Search by name, registration number, email..."
                                value={search}
                                onChange={(e) =>
                                    setSearch(
                                        e.target.value
                                    )
                                }
                            />

                        </div>

                    </div>

                </div>

            </div>


            {/* ================================================= */}
            {/* STUDENT TABLE */}
            {/* ================================================= */}

            <div >

                <div >

                    {loading ? (

                        <div >

                            <div
                                
                                role="status"
                            />

                            <p >
                                Loading students...
                            </p>

                        </div>

                    ) : filteredStudents.length === 0 ? (

                        <div >

                            <h5>
                                No students found
                            </h5>

                            <p >
                                Try changing your search
                                or add a new student.
                            </p>

                        </div>

                    ) : (

                        <div >

                            <table >


                                {/* TABLE HEADER */}

                                <thead >

                                <tr>

                                    <th>ID</th>

                                    <th>
                                        Registration
                                    </th>

                                    <th>
                                        Student
                                    </th>

                                    <th>
                                        Department
                                    </th>

                                    <th>
                                        Semester
                                    </th>

                                    <th>
                                        Section
                                    </th>

                                    <th>
                                        Phone
                                    </th>

                                    <th>
                                        Face
                                    </th>

                                    <th>
                                        Actions
                                    </th>

                                </tr>

                                </thead>


                                {/* TABLE BODY */}

                                <tbody>

                                {filteredStudents.map(
                                    (student) => (

                                        <tr
                                            key={
                                                student.id
                                            }
                                        >


                                            {/* ID */}

                                            <td>
                                                {student.id}
                                            </td>


                                            {/* REGISTRATION */}

                                            <td>

                                                <strong>
                                                    {
                                                        student.registrationNumber
                                                    }
                                                </strong>

                                            </td>


                                            {/* STUDENT */}

                                            <td>

                                                <div>

                                                    <strong>
                                                        {
                                                            student.studentName ||
                                                            "-"
                                                        }
                                                    </strong>

                                                    <div >
                                                        {
                                                            student.email ||
                                                            "-"
                                                        }
                                                    </div>

                                                </div>

                                            </td>


                                            {/* DEPARTMENT */}

                                            <td>
                                                {
                                                    student.department
                                                }
                                            </td>


                                            {/* SEMESTER */}

                                            <td>
                                                {
                                                    student.semester
                                                }
                                            </td>


                                            {/* SECTION */}

                                            <td>
                                                {
                                                    student.section
                                                }
                                            </td>


                                            {/* PHONE */}

                                            <td>
                                                {
                                                    student.phone
                                                }
                                            </td>


                                            {/* FACE */}

                                            <td>

                                                {student.faceRegistered ? (

                                                    <span >

                                                         Registered

                                                    </span>

                                                ) : (

                                                    <span >

                                                         Pending

                                                    </span>

                                                )}

                                            </td>


                                            {/* ACTIONS */}

                                            <td>

                                                <div >


                                                    {/* EDIT */}

                                                    <button
                                                        
                                                        onClick={() =>
                                                            navigate(
                                                                `/admin/students/edit/${student.id}`
                                                            )
                                                        }
                                                    >

                                                        Edit

                                                    </button>


                                                    {/* FACE REGISTRATION */}

                                                    <input
                                                        type="file"
                                                        id={`face-${student.id}`}
                                                        accept="image/*"
                                                        
                                                        onChange={(
                                                            e
                                                        ) => {

                                                            const file =
                                                                e
                                                                    .target
                                                                    .files?.[0];

                                                            handleFaceRegistration(
                                                                student.id,
                                                                file
                                                            );

                                                            // Allow selecting
                                                            // same file again
                                                            e.target.value =
                                                                "";

                                                        }}
                                                    />


                                                    <label
                                                        htmlFor={`face-${student.id}`}
                                                        
                                                        
                                                    >

                                                        {uploadingId ===
                                                        student.id ? (

                                                            <>
                                                                <span
                                                                    
                                                                />

                                                                Uploading...

                                                            </>

                                                        ) : student.faceRegistered ? (

                                                            "Update Face"

                                                        ) : (

                                                            "Register Face"

                                                        )}

                                                    </label>


                                                    {/* DELETE */}

                                                    <button
                                                        
                                                        disabled={
                                                            deletingId ===
                                                            student.id
                                                        }
                                                        onClick={() =>
                                                            handleDelete(
                                                                student
                                                            )
                                                        }
                                                    >

                                                        {deletingId ===
                                                        student.id ? (

                                                            <span
                                                                
                                                            />

                                                        ) : (

                                                            "Delete"

                                                        )}

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

            </div>


            {/* ================================================= */}
            {/* FOOTER */}
            {/* ================================================= */}

            {!loading &&
                students.length > 0 && (

                    <div >

                        Showing{" "}
                        <strong>
                            {filteredStudents.length}
                        </strong>{" "}
                        of{" "}
                        <strong>
                            {students.length}
                        </strong>{" "}
                        students

                    </div>

                )}

        </div>

    );
}

export default Students;