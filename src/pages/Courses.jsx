import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Courses() {
    const navigate = useNavigate();

    const [courses, setCourses] = useState([]);
    const [teachers, setTeachers] = useState([]);

    const [showForm, setShowForm] = useState(false);
    const [editingCourse, setEditingCourse] = useState(null);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    // Search and filters
    const [search, setSearch] = useState("");
    const [teacherFilter, setTeacherFilter] = useState("");
    const [semesterFilter, setSemesterFilter] = useState("");
    const [departmentFilter, setDepartmentFilter] = useState("");

    const emptyForm = {
        courseCode: "",
        courseName: "",
        department: "",
        semester: "",
        credits: "",
        totalClasses: "",
        teacherId: ""
    };

    const [form, setForm] = useState(emptyForm);

    useEffect(() => {
        loadCourses();
        loadTeachers();
    }, []);

    const loadCourses = async () => {
        try {
            setLoading(true);

            const response = await api.get("/course");

            setCourses(response.data);
            setError("");
        } catch (err) {
            console.error(err);

            setError(
                err.response?.data?.message ||
                "Failed to load courses."
            );
        } finally {
            setLoading(false);
        }
    };

    const loadTeachers = async () => {
        try {
            const response = await api.get("/teacher");

            setTeachers(response.data);
        } catch (err) {
            console.error(err);

            setError(
                err.response?.data?.message ||
                "Failed to load teachers."
            );
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm((previous) => ({
            ...previous,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setSaving(true);
            setError("");

            const request = {
                courseCode: form.courseCode,
                courseName: form.courseName,
                department: form.department,
                semester: Number(form.semester),
                credits: Number(form.credits),
                totalClasses: Number(form.totalClasses),
                teacherId: form.teacherId
                    ? Number(form.teacherId)
                    : null
            };

            if (editingCourse) {

                await api.put(
                    `/course/${editingCourse.id}`,
                    request
                );

            } else {

                await api.post(
                    "/course",
                    request
                );
            }

            setForm(emptyForm);
            setEditingCourse(null);
            setShowForm(false);

            await loadCourses();

        } catch (err) {
            console.error(err);

            setError(
                err.response?.data?.message ||
                `Failed to ${
                    editingCourse ? "update" : "create"
                } course.`
            );
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (course) => {

        setEditingCourse(course);

        setForm({
            courseCode: course.courseCode || "",
            courseName: course.courseName || "",
            department: course.department || "",
            semester: course.semester || "",
            credits: course.credits || "",
            totalClasses: course.totalClasses || "",
            teacherId: course.teacherId || ""
        });

        setShowForm(true);

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    };

    const handleCancel = () => {
        setForm(emptyForm);
        setEditingCourse(null);
        setShowForm(false);
    };

    const handleDelete = async (id) => {

        const confirmed = window.confirm(
            "Are you sure you want to delete this course?"
        );

        if (!confirmed) {
            return;
        }

        try {
            setError("");

            await api.delete(`/course/${id}`);

            await loadCourses();

        } catch (err) {
            console.error(err);

            setError(
                err.response?.data?.message ||
                "Failed to delete course."
            );
        }
    };

    /*
     * Get unique departments from courses.
     */
    const departments = useMemo(() => {

        return [
            ...new Set(
                courses
                    .map((course) => course.department)
                    .filter(Boolean)
            )
        ].sort();

    }, [courses]);

    /*
     * Filter courses on the frontend.
     */
    const filteredCourses = useMemo(() => {

        return courses.filter((course) => {

            const searchText = search
                .trim()
                .toLowerCase();

            const matchesSearch =
                !searchText ||
                course.courseCode
                    ?.toLowerCase()
                    .includes(searchText) ||
                course.courseName
                    ?.toLowerCase()
                    .includes(searchText);

            const matchesTeacher =
                !teacherFilter ||
                String(course.teacherId) ===
                String(teacherFilter);

            const matchesSemester =
                !semesterFilter ||
                String(course.semester) ===
                String(semesterFilter);

            const matchesDepartment =
                !departmentFilter ||
                course.department === departmentFilter;

            return (
                matchesSearch &&
                matchesTeacher &&
                matchesSemester &&
                matchesDepartment
            );
        });

    }, [
        courses,
        search,
        teacherFilter,
        semesterFilter,
        departmentFilter
    ]);

    const clearFilters = () => {
        setSearch("");
        setTeacherFilter("");
        setSemesterFilter("");
        setDepartmentFilter("");
    };

    return (
        <div className="admin-layout">

            {/* SIDEBAR */}
            <aside className="admin-sidebar">

                <div className="sidebar-brand">

                    <div className="brand-icon">
                        SA
                    </div>

                    <div>
                        <h4>Smart Attendance</h4>
                        <small>Admin Panel</small>
                    </div>

                </div>


                <nav className="sidebar-nav">

                    <button
                        className="sidebar-link"
                        onClick={() => navigate("/admin")}
                    >
                        <span>📊</span>
                        Dashboard
                    </button>

                    <button
                        className="sidebar-link"
                        onClick={() =>
                            navigate("/admin/students")
                        }
                    >
                        <span>👨‍🎓</span>
                        Students
                    </button>

                    <button className="sidebar-link">
                        <span>👨‍🏫</span>
                        Teachers
                    </button>

                    <button className="sidebar-link active">
                        <span>📚</span>
                        Courses
                    </button>

                    <button className="sidebar-link">
                        <span>📝</span>
                        Enrollments
                    </button>

                    <button className="sidebar-link">
                        <span>📅</span>
                        Attendance
                    </button>

                </nav>


                <div className="sidebar-bottom">

                    <button className="sidebar-link">
                        <span>⚙️</span>
                        Settings
                    </button>

                </div>

            </aside>


            {/* MAIN CONTENT */}
            <main className="admin-main">

                {/* TOPBAR */}
                <header className="admin-topbar">

                    <div>
                        <h2>Courses</h2>

                        <p>
                            Create and manage courses
                        </p>
                    </div>

                    <button
                        className="course-add-button"
                        onClick={() => {

                            if (showForm) {
                                handleCancel();
                            } else {
                                setEditingCourse(null);
                                setForm(emptyForm);
                                setShowForm(true);
                            }

                        }}
                    >
                        {showForm
                            ? "✕ Close"
                            : "+ Add Course"}
                    </button>

                </header>


                {/* ERROR */}
                {error && (
                    <div className="course-alert">
                        {error}
                    </div>
                )}


                {/* ADD / EDIT FORM */}
                {showForm && (

                    <section className="course-form-card">

                        <div className="course-form-header">

                            <div>

                                <h3>
                                    {editingCourse
                                        ? "Edit Course"
                                        : "Create New Course"}
                                </h3>

                                <p>
                                    {editingCourse
                                        ? "Update course information and teacher assignment"
                                        : "Add a course and assign a teacher"}
                                </p>

                            </div>

                        </div>


                        <form onSubmit={handleSubmit}>

                            <div className="course-form-grid">

                                <div className="course-field">

                                    <label>
                                        Course Code
                                    </label>

                                    <input
                                        type="text"
                                        name="courseCode"
                                        value={form.courseCode}
                                        onChange={handleChange}
                                        placeholder="CSE301"
                                        required
                                    />

                                </div>


                                <div className="course-field">

                                    <label>
                                        Course Name
                                    </label>

                                    <input
                                        type="text"
                                        name="courseName"
                                        value={form.courseName}
                                        onChange={handleChange}
                                        placeholder="Data Structures"
                                        required
                                    />

                                </div>


                                <div className="course-field">

                                    <label>
                                        Department
                                    </label>

                                    <input
                                        type="text"
                                        name="department"
                                        value={form.department}
                                        onChange={handleChange}
                                        placeholder="CSE"
                                        required
                                    />

                                </div>


                                <div className="course-field">

                                    <label>
                                        Semester
                                    </label>

                                    <select
                                        name="semester"
                                        value={form.semester}
                                        onChange={handleChange}
                                        required
                                    >

                                        <option value="">
                                            Select semester
                                        </option>

                                        {[1,2,3,4,5,6,7,8].map(
                                            (semester) => (

                                                <option
                                                    key={semester}
                                                    value={semester}
                                                >
                                                    Semester {semester}
                                                </option>

                                            )
                                        )}

                                    </select>

                                </div>


                                <div className="course-field">

                                    <label>
                                        Credits
                                    </label>

                                    <input
                                        type="number"
                                        name="credits"
                                        value={form.credits}
                                        onChange={handleChange}
                                        min="1"
                                        max="10"
                                        required
                                    />

                                </div>


                                <div className="course-field">

                                    <label>
                                        Total Classes
                                    </label>

                                    <input
                                        type="number"
                                        name="totalClasses"
                                        value={form.totalClasses}
                                        onChange={handleChange}
                                        min="1"
                                        required
                                    />

                                </div>


                                <div className="course-field full-width">

                                    <label>
                                        Assign Teacher
                                    </label>

                                    <select
                                        name="teacherId"
                                        value={form.teacherId}
                                        onChange={handleChange}
                                    >

                                        <option value="">
                                            No teacher assigned
                                        </option>

                                        {teachers.map(
                                            (teacher) => (

                                                <option
                                                    key={teacher.id}
                                                    value={teacher.id}
                                                >
                                                    {teacher.teacherName ||
                                                        teacher.fullName ||
                                                        teacher.name ||
                                                        `Teacher #${teacher.id}`}
                                                </option>

                                            )
                                        )}

                                    </select>

                                </div>

                            </div>


                            <div className="course-form-actions">

                                <button
                                    type="button"
                                    className="course-cancel-button"
                                    onClick={handleCancel}
                                >
                                    Cancel
                                </button>


                                <button
                                    type="submit"
                                    className="course-save-button"
                                    disabled={saving}
                                >
                                    {saving
                                        ? "Saving..."
                                        : editingCourse
                                            ? "Update Course"
                                            : "Create Course"}
                                </button>

                            </div>

                        </form>

                    </section>

                )}


                {/* SEARCH / FILTERS */}
                <section className="course-filter-card">

                    <div className="course-search-box">

                        <span>🔎</span>

                        <input
                            type="text"
                            placeholder="Search by course code or course name..."
                            value={search}
                            onChange={(e) =>
                                setSearch(e.target.value)
                            }
                        />

                    </div>


                    <select
                        value={teacherFilter}
                        onChange={(e) =>
                            setTeacherFilter(e.target.value)
                        }
                    >

                        <option value="">
                            All Teachers
                        </option>

                        {teachers.map((teacher) => (

                            <option
                                key={teacher.id}
                                value={teacher.id}
                            >
                                {teacher.teacherName ||
                                    teacher.fullName ||
                                    teacher.name ||
                                    `Teacher #${teacher.id}`}
                            </option>

                        ))}

                    </select>


                    <select
                        value={semesterFilter}
                        onChange={(e) =>
                            setSemesterFilter(e.target.value)
                        }
                    >

                        <option value="">
                            All Semesters
                        </option>

                        {[1,2,3,4,5,6,7,8].map(
                            (semester) => (

                                <option
                                    key={semester}
                                    value={semester}
                                >
                                    Semester {semester}
                                </option>

                            )
                        )}

                    </select>


                    <select
                        value={departmentFilter}
                        onChange={(e) =>
                            setDepartmentFilter(e.target.value)
                        }
                    >

                        <option value="">
                            All Departments
                        </option>

                        {departments.map(
                            (department) => (

                                <option
                                    key={department}
                                    value={department}
                                >
                                    {department}
                                </option>

                            )
                        )}

                    </select>


                    <button
                        className="course-clear-button"
                        onClick={clearFilters}
                    >
                        Clear
                    </button>

                </section>


                {/* COURSE LIST */}
                <section className="course-list-card">

                    <div className="course-list-header">

                        <div>

                            <h3>
                                All Courses
                            </h3>

                            <p>
                                Showing {filteredCourses.length}
                                {" "}of{" "}
                                {courses.length} courses
                            </p>

                        </div>

                        <button
                            className="course-refresh-button"
                            onClick={loadCourses}
                        >
                            ↻ Refresh
                        </button>

                    </div>


                    {loading ? (

                        <div className="course-empty">
                            Loading courses...
                        </div>

                    ) : filteredCourses.length === 0 ? (

                        <div className="course-empty">

                            <div>
                                🔍
                            </div>

                            <h4>
                                No courses found
                            </h4>

                            <p>
                                Try changing your search or filters.
                            </p>

                        </div>

                    ) : (

                        <div className="course-table-wrapper">

                            <table className="course-table">

                                <thead>

                                <tr>

                                    <th>
                                        Course
                                    </th>

                                    <th>
                                        Department
                                    </th>

                                    <th>
                                        Semester
                                    </th>

                                    <th>
                                        Credits
                                    </th>

                                    <th>
                                        Total Classes
                                    </th>

                                    <th>
                                        Teacher
                                    </th>

                                    <th>
                                        Actions
                                    </th>

                                </tr>

                                </thead>


                                <tbody>

                                {filteredCourses.map(
                                    (course) => (

                                        <tr key={course.id}>

                                            <td>

                                                <div className="course-name-cell">

                                                    <div className="course-code">
                                                        {course.courseCode}
                                                    </div>

                                                    <div>

                                                        <strong>
                                                            {course.courseName}
                                                        </strong>

                                                        <small>
                                                            Course #{course.id}
                                                        </small>

                                                    </div>

                                                </div>

                                            </td>


                                            <td>

                                                    <span className="course-badge">
                                                        {course.department}
                                                    </span>

                                            </td>


                                            <td>
                                                Semester {course.semester}
                                            </td>


                                            <td>
                                                {course.credits}
                                            </td>


                                            <td>
                                                {course.totalClasses}
                                            </td>


                                            <td>

                                                {course.teacherName ? (

                                                    <div className="teacher-cell">

                                                        <div className="teacher-avatar">
                                                            {course.teacherName
                                                                .charAt(0)
                                                                .toUpperCase()}
                                                        </div>

                                                        <span>
                                                                {course.teacherName}
                                                            </span>

                                                    </div>

                                                ) : (

                                                    <span className="unassigned">
                                                            Unassigned
                                                        </span>

                                                )}

                                            </td>


                                            <td>

                                                <div className="course-actions">

                                                    <button
                                                        className="course-edit-button"
                                                        onClick={() =>
                                                            handleEdit(course)
                                                        }
                                                        title="Edit course"
                                                    >
                                                        ✏️
                                                    </button>


                                                    <button
                                                        className="course-delete-button"
                                                        onClick={() =>
                                                            handleDelete(
                                                                course.id
                                                            )
                                                        }
                                                        title="Delete course"
                                                    >
                                                        🗑️
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

                </section>

            </main>

        </div>
    );
}

export default Courses;