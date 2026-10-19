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

        <div className="container-fluid p-4">


            {/* ================================================= */}
            {/* HEADER */}
            {/* ================================================= */}

            <div className="d-flex justify-content-between align-items-center mb-4">

                <div>

                    <h2 className="fw-bold mb-1">
                        Students
                    </h2>

                    <p className="text-muted mb-0">
                        Manage registered students
                    </p>

                </div>


                <div className="d-flex gap-2">

                    <button
                        className="btn btn-outline-secondary"
                        onClick={loadStudents}
                        disabled={loading}
                    >

                        ↻ Refresh

                    </button>


                    <button
                        className="btn btn-primary"
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
                    className="alert alert-success alert-dismissible"
                    role="alert"
                >

                    ✓ {success}

                    <button
                        type="button"
                        className="btn-close"
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
                    className="alert alert-danger alert-dismissible"
                    role="alert"
                >

                    {error}

                    <button
                        type="button"
                        className="btn-close"
                        onClick={() =>
                            setError("")
                        }
                    />

                </div>

            )}


            {/* ================================================= */}
            {/* STATISTICS */}
            {/* ================================================= */}

            <div className="row g-3 mb-4">


                {/* TOTAL */}

                <div className="col-md-4">

                    <div className="card shadow-sm border-0">

                        <div className="card-body">

                            <div className="text-muted">
                                Total Students
                            </div>

                            <h3 className="fw-bold mb-0">
                                {totalStudents}
                            </h3>

                        </div>

                    </div>

                </div>


                {/* REGISTERED */}

                <div className="col-md-4">

                    <div className="card shadow-sm border-0">

                        <div className="card-body">

                            <div className="text-muted">
                                Faces Registered
                            </div>

                            <h3 className="fw-bold text-success mb-0">
                                {registeredFaces}
                            </h3>

                        </div>

                    </div>

                </div>


                {/* PENDING */}

                <div className="col-md-4">

                    <div className="card shadow-sm border-0">

                        <div className="card-body">

                            <div className="text-muted">
                                Face Registration Pending
                            </div>

                            <h3 className="fw-bold text-warning mb-0">
                                {pendingFaces}
                            </h3>

                        </div>

                    </div>

                </div>

            </div>


            {/* ================================================= */}
            {/* SEARCH */}
            {/* ================================================= */}

            <div className="card shadow-sm border-0 mb-4">

                <div className="card-body">

                    <div className="row">

                        <div className="col-md-6">

                            <label className="form-label fw-semibold">
                                Search Students
                            </label>

                            <input
                                type="text"
                                className="form-control"
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

            <div className="card shadow-sm border-0">

                <div className="card-body p-0">

                    {loading ? (

                        <div className="text-center py-5">

                            <div
                                className="spinner-border text-primary"
                                role="status"
                            />

                            <p className="mt-3 text-muted">
                                Loading students...
                            </p>

                        </div>

                    ) : filteredStudents.length === 0 ? (

                        <div className="text-center py-5">

                            <h5>
                                No students found
                            </h5>

                            <p className="text-muted">
                                Try changing your search
                                or add a new student.
                            </p>

                        </div>

                    ) : (

                        <div className="table-responsive">

                            <table className="table table-hover align-middle mb-0">


                                {/* TABLE HEADER */}

                                <thead className="table-dark">

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

                                                    <div className="small text-muted">
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

                                                    <span className="badge bg-success">

                                                        ✓ Registered

                                                    </span>

                                                ) : (

                                                    <span className="badge bg-warning text-dark">

                                                        ⚠ Pending

                                                    </span>

                                                )}

                                            </td>


                                            {/* ACTIONS */}

                                            <td>

                                                <div className="d-flex gap-1 flex-wrap">


                                                    {/* EDIT */}

                                                    <button
                                                        className="btn btn-sm btn-outline-primary"
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
                                                        style={{
                                                            display:
                                                                "none"
                                                        }}
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
                                                        className={`btn btn-sm ${
                                                            uploadingId ===
                                                            student.id
                                                                ? "btn-secondary disabled"
                                                                : student.faceRegistered
                                                                    ? "btn-outline-success"
                                                                    : "btn-success"
                                                        }`}
                                                        style={{
                                                            cursor:
                                                                uploadingId ===
                                                                student.id
                                                                    ? "not-allowed"
                                                                    : "pointer"
                                                        }}
                                                    >

                                                        {uploadingId ===
                                                        student.id ? (

                                                            <>
                                                                <span
                                                                    className="spinner-border spinner-border-sm me-1"
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
                                                        className="btn btn-sm btn-outline-danger"
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
                                                                className="spinner-border spinner-border-sm"
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

                    <div className="text-muted small mt-3">

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