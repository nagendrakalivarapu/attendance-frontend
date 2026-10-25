import { useEffect, useRef, useState } from "react";
import api from "../services/api";

export default function StudentAttendance() {

    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const streamRef = useRef(null);

    const [student, setStudent] = useState(null);
    const [sessions, setSessions] = useState([]);

    const [loading, setLoading] = useState(true);
    const [cameraLoading, setCameraLoading] = useState(false);
    const [markingSessionId, setMarkingSessionId] = useState(null);

    const [cameraError, setCameraError] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // ============================================================
    // LOAD STUDENT + OPEN SESSIONS
    // ============================================================

    useEffect(() => {
        loadAttendanceData();

        return () => {
            stopCamera();
        };
    }, []);

    const loadAttendanceData = async () => {

        try {

            setLoading(true);
            setError("");

            const [studentResponse, sessionResponse] =
                await Promise.all([
                    api.get("/student/me"),
                    api.get("/attendance-sessions/my-open")
                ]);

            setStudent(studentResponse.data);
            setSessions(sessionResponse.data);

        } catch (err) {

            console.error(err);

            setError(
                err.response?.data?.message ||
                "Failed to load attendance information."
            );

        } finally {

            setLoading(false);
        }
    };


    // ============================================================
    // START CAMERA
    // ============================================================

    const startCamera = async () => {

        try {

            setCameraError("");
            setCameraLoading(true);

            if (!navigator.mediaDevices ||
                !navigator.mediaDevices.getUserMedia) {

                throw new Error(
                    "Camera access is not supported by this browser."
                );
            }

            const stream =
                await navigator.mediaDevices.getUserMedia({
                    video: {
                        facingMode: "user",
                        width: {
                            ideal: 640
                        },
                        height: {
                            ideal: 480
                        }
                    },
                    audio: false
                });

            streamRef.current = stream;

            if (videoRef.current) {

                videoRef.current.srcObject = stream;

                await videoRef.current.play();
            }

        } catch (err) {

            console.error(err);

            if (err.name === "NotAllowedError") {

                setCameraError(
                    "Camera permission was denied. Please allow camera access in your browser."
                );

            } else if (err.name === "NotFoundError") {

                setCameraError(
                    "No camera was found on this device."
                );

            } else {

                setCameraError(
                    err.message ||
                    "Unable to access the camera."
                );
            }

        } finally {

            setCameraLoading(false);
        }
    };


    // ============================================================
    // STOP CAMERA
    // ============================================================

    const stopCamera = () => {

        if (streamRef.current) {

            streamRef.current
                .getTracks()
                .forEach(track => track.stop());

            streamRef.current = null;
        }

        if (videoRef.current) {

            videoRef.current.srcObject = null;
        }
    };


    // ============================================================
    // CAPTURE IMAGE
    // ============================================================

    const captureImage = () => {

        if (!videoRef.current ||
            !canvasRef.current) {

            throw new Error(
                "Camera is not ready."
            );
        }

        const video = videoRef.current;
        const canvas = canvasRef.current;

        const width = video.videoWidth || 640;
        const height = video.videoHeight || 480;

        canvas.width = width;
        canvas.height = height;

        const context =
            canvas.getContext("2d");

        context.drawImage(
            video,
            0,
            0,
            width,
            height
        );

        return new Promise((resolve, reject) => {

            canvas.toBlob(
                blob => {

                    if (!blob) {

                        reject(
                            new Error(
                                "Failed to capture image."
                            )
                        );

                        return;
                    }

                    resolve(blob);
                },
                "image/jpeg",
                0.9
            );
        });
    };


    // ============================================================
    // MARK ATTENDANCE
    // ============================================================

    const markAttendance = async (sessionId) => {

        try {

            setError("");
            setSuccess("");

            if (!student) {

                setError(
                    "Student information is not available."
                );

                return;
            }

            if (!student.faceRegistered) {

                setError(
                    "Face recognition is not registered for your account."
                );

                return;
            }

            if (!streamRef.current) {

                setError(
                    "Please start the camera first."
                );

                return;
            }

            setMarkingSessionId(sessionId);

            const imageBlob =
                await captureImage();

            const formData =
                new FormData();

            formData.append(
                "image",
                imageBlob,
                "attendance.jpg"
            );

            const response =
                await api.post(
                    `/attendance/face/${sessionId}`,
                    formData,
                    {
                        headers: {
                            "Content-Type":
                                "multipart/form-data"
                        }
                    }
                );

            setSuccess(
                response.data?.message ||
                "Attendance marked successfully."
            );

            // Remove the completed session
            setSessions(prev =>
                prev.filter(
                    session =>
                        session.id !== sessionId
                )
            );

        } catch (err) {

            console.error(err);

            const message =
                err.response?.data?.message ||
                err.response?.data ||
                "Unable to mark attendance.";

            setError(message);

        } finally {

            setMarkingSessionId(null);
        }
    };


    // ============================================================
    // LOADING
    // ============================================================

    if (loading) {

        return (
            <div className="student-attendance-page">

                <div className="student-attendance-loading">
                    <div className="student-attendance-spinner"></div>

                    <p>
                        Loading attendance...
                    </p>
                </div>

            </div>
        );
    }


    // ============================================================
    // PAGE
    // ============================================================

    return (
        <div className="student-attendance-page">

            {/* HEADER */}

            <div className="student-attendance-header">

                <div>

                    <p className="student-attendance-label">
                        ATTENDANCE
                    </p>

                    <h1>
                        Mark Attendance
                    </h1>

                    <p>
                        Use face recognition to mark your
                        attendance for an active class.
                    </p>

                </div>

            </div>


            {/* ERROR */}

            {error && (
                <div className="student-attendance-alert error">
                    {error}
                </div>
            )}


            {/* SUCCESS */}

            {success && (
                <div className="student-attendance-alert success">
                    {success}
                </div>
            )}


            {/* CAMERA */}

            <div className="student-attendance-camera-card">

                <div className="student-attendance-section-header">

                    <div>

                        <h2>
                            Face Recognition
                        </h2>

                        <p>
                            Position your face clearly inside
                            the camera frame.
                        </p>

                    </div>

                    {student?.faceRegistered && (
                        <span className="student-face-ready">
                            ✓ Face Registered
                        </span>
                    )}

                </div>


                <div className="student-camera-wrapper">

                    <video
                        ref={videoRef}
                        className="student-attendance-video"
                        autoPlay
                        muted
                        playsInline
                    />

                    {!streamRef.current && (
                        <div className="student-camera-placeholder">

                            <div className="student-camera-icon">
                                📷
                            </div>

                            <p>
                                Camera is not active
                            </p>

                        </div>
                    )}

                </div>


                <canvas
                    ref={canvasRef}
                    style={{
                        display: "none"
                    }}
                />


                {cameraError && (
                    <div className="student-camera-error">
                        {cameraError}
                    </div>
                )}


                <div className="student-camera-actions">

                    {!streamRef.current ? (

                        <button
                            type="button"
                            className="student-camera-start-btn"
                            onClick={startCamera}
                            disabled={cameraLoading}
                        >
                            {cameraLoading
                                ? "Starting Camera..."
                                : "Start Camera"}
                        </button>

                    ) : (

                        <button
                            type="button"
                            className="student-camera-stop-btn"
                            onClick={stopCamera}
                        >
                            Stop Camera
                        </button>

                    )}

                </div>

            </div>


            {/* ACTIVE SESSIONS */}

            <div className="student-active-attendance">

                <div className="student-attendance-section-header">

                    <div>

                        <h2>
                            Active Attendance
                        </h2>

                        <p>
                            Attendance sessions currently
                            available for your courses.
                        </p>

                    </div>

                </div>


                {sessions.length === 0 ? (

                    <div className="student-no-active-attendance">

                        <div className="student-no-attendance-icon">
                            ✓
                        </div>

                        <h3>
                            No Active Attendance
                        </h3>

                        <p>
                            There are currently no open
                            attendance sessions for your courses.
                        </p>

                    </div>

                ) : (

                    <div className="student-active-session-grid">

                        {sessions.map(session => (

                            <div
                                key={session.id}
                                className="student-active-session-card"
                            >

                                <div className="student-active-session-top">

                                    <span className="student-live-badge">
                                        <span className="student-live-dot"></span>
                                        LIVE
                                    </span>

                                    <span>
                                        Session #{session.id}
                                    </span>

                                </div>


                                <h3>
                                    Course #{session.courseId}
                                </h3>


                                <p>
                                    Attendance date:{" "}
                                    {session.attendanceDate}
                                </p>


                                <p>
                                    Started:{" "}
                                    {new Date(
                                        session.startedAt
                                    ).toLocaleTimeString()}
                                </p>


                                <button
                                    type="button"
                                    className="student-mark-attendance-btn"
                                    onClick={() =>
                                        markAttendance(session.id)
                                    }
                                    disabled={
                                        !streamRef.current ||
                                        markingSessionId === session.id ||
                                        !student?.faceRegistered
                                    }
                                >

                                    {markingSessionId === session.id
                                        ? "Recognizing..."
                                        : "Mark Attendance"}

                                </button>

                            </div>

                        ))}

                    </div>
                )}

            </div>

        </div>
    );
}