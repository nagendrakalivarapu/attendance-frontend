import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import StudentAttendance from "./pages/StudentAttendance";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import TeacherDashboard from "./pages/TeacherDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import Students from "./pages/Students";
import AddStudent from "./pages/AddStudent";
import EditStudent from "./pages/EditStudent";
import Courses from "./pages/Courses";
import Teachers from "./pages/Teachers";
import Enrollments from "./pages/Enrollments";
import { AuthProvider, useAuth } from "./context/AuthContext";

function ProtectedRoute({ children, allowedRoles }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function App() {
  return (
      <BrowserRouter>
        <Routes>

          <Route
              path="/login"
              element={<Login />}
          />

          <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={["ADMIN"]}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
          />

            <Route
                path="/admin/students"
                element={
                    <ProtectedRoute allowedRoles={["ADMIN"]}>
                        <Students />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/admin/students/add"
                element={
                    <ProtectedRoute allowedRoles={["ADMIN"]}>
                        <AddStudent />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/admin/students/edit/:id"
                element={
                    <ProtectedRoute allowedRoles={["ADMIN"]}>
                        <EditStudent />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/admin/courses"
                element={
                    <ProtectedRoute allowedRoles={["ADMIN"]}>
                        <Courses />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/admin/teachers"
                element={
                    <ProtectedRoute allowedRoles={["ADMIN"]}>
                        <Teachers />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/admin/enrollments"
                element={
                    <ProtectedRoute allowedRoles={["ADMIN"]}>
                        <Enrollments />
                    </ProtectedRoute>
                }
            />

          <Route
              path="/teacher"
              element={
                <ProtectedRoute allowedRoles={["TEACHER"]}>
                  <TeacherDashboard />
                </ProtectedRoute>
              }
          />

          <Route
              path="/student"
              element={
                <ProtectedRoute allowedRoles={["STUDENT"]}>
                  <StudentDashboard />
                </ProtectedRoute>
              }
          />
            <Route
                path="/student/attendance"
                element={
                    <ProtectedRoute allowedRoles={["STUDENT"]}>
                        <StudentAttendance />
                    </ProtectedRoute>
                }
            />


          <Route
              path="/"
              element={<Navigate to="/login" replace />}
          />

        </Routes>
      </BrowserRouter>
  );
}

export default App;