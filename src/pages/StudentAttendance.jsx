import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function StudentAttendance() {
    const navigate = useNavigate();

    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const streamRef = useRef(null);
    const detectionTimerRef = useRef(null);
    const detectingRef = useRef(false);

    const [student, setStudent] = useState(null);
    const [sessions, setSessions] = useState([]);

    const [loading, setLoading] = useState(true);
    const [cameraLoading, setCameraLoading] = useState(false);
    const [markingSessionId, setMarkingSessionId] = useState(null);

    const [cameraError, setCameraError] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // ============================================================
    // LIVE FACE STATUS
    // ============================================================

    const [faceStatus, setFaceStatus] = useState("idle");
    const [faceMessage, setFaceMessage] = useState(
        "Start the camera to begin face detection."
    );

    const [faceQuality, setFaceQuality] = useState(null);

    /*
        faceStatus values:

        idle
        checking
        no-face
        ready
        multiple
        quality-error
        error
    */

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
                    api.get("/attendance-sessions/my-open"),
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
            setError("");
            setSuccess("");
            setCameraLoading(true);

            setFaceStatus("checking");
            setFaceMessage("Starting camera...");

            if (
                !navigator.mediaDevices ||
                !navigator.mediaDevices.getUserMedia
            ) {
                throw new Error(
                    "Camera access is not supported by this browser."
                );
            }

            const stream =
                await navigator.mediaDevices.getUserMedia({
                    video: {
                        facingMode: "user",
                        width: {
                            ideal: 640,
                        },
                        height: {
                            ideal: 480,
                        },
                    },
                    audio: false,
                });

            streamRef.current = stream;

            const video = videoRef.current;

            if (!video) {
                throw new Error(
                    "Camera video element is not available."
                );
            }

            video.srcObject = stream;

            video.muted = true;
            video.playsInline = true;

            /*
                Wait until the browser actually knows
                the camera video's dimensions.
            */

            await waitForVideoReady(video);

            await video.play();

            /*
                Wait for an actual rendered frame.
                This prevents capturing an empty frame.
            */

            await waitForVideoFrame(video);

            setFaceStatus("checking");
            setFaceMessage(
                "Camera ready. Checking your face..."
            );

            /*
                Start continuous face detection.
            */

            startFaceDetection();

        } catch (err) {
            console.error(err);

            stopCamera();

            if (err.name === "NotAllowedError") {
                setCameraError(
                    "Camera permission was denied. Please allow camera access in your browser."
                );
            } else if (err.name === "NotFoundError") {
                setCameraError(
                    "No camera was found on this device."
                );
            } else if (err.name === "NotReadableError") {
                setCameraError(
                    "The camera is already being used by another application."
                );
            } else {
                setCameraError(
                    err.message ||
                    "Unable to access the camera."
                );
            }

            setFaceStatus("error");
            setFaceMessage(
                "Camera could not be started."
            );
        } finally {
            setCameraLoading(false);
        }
    };

    // ============================================================
    // WAIT FOR VIDEO READY
    // ============================================================

    const waitForVideoReady = (video) => {
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(
                    new Error(
                        "Camera video did not become ready."
                    )
                );
            }, 10000);

            const check = () => {
                if (
                    video.readyState >= 2 &&
                    video.videoWidth > 0 &&
                    video.videoHeight > 0
                ) {
                    clearTimeout(timeout);
                    resolve();
                    return;
                }

                requestAnimationFrame(check);
            };

            check();
        });
    };

    // ============================================================
    // WAIT FOR ACTUAL VIDEO FRAME
    // ============================================================

    const waitForVideoFrame = (video) => {
        return new Promise((resolve) => {
            if ("requestVideoFrameCallback" in video) {
                video.requestVideoFrameCallback(() => {
                    resolve();
                });
            } else {
                setTimeout(resolve, 300);
            }
        });
    };

    // ============================================================
    // STOP CAMERA
    // ============================================================

    const stopCamera = () => {
        /*
            Stop detection loop.
        */

        if (detectionTimerRef.current) {
            clearTimeout(
                detectionTimerRef.current
            );

            detectionTimerRef.current = null;
        }

        detectingRef.current = false;

        /*
            Stop camera tracks.
        */

        if (streamRef.current) {
            streamRef.current
                .getTracks()
                .forEach((track) => {
                    track.stop();
                });

            streamRef.current = null;
        }

        /*
            Clear video.
        */

        if (videoRef.current) {
            videoRef.current.pause();
            videoRef.current.srcObject = null;
        }

        setFaceStatus("idle");
        setFaceMessage(
            "Start the camera to begin face detection."
        );
        setFaceQuality(null);
    };

    // ============================================================
    // CAPTURE IMAGE
    // ============================================================

    const captureImage = async () => {
        const video = videoRef.current;
        const canvas = canvasRef.current;

        if (!video || !canvas) {
            throw new Error(
                "Camera is not ready."
            );
        }

        /*
            Make sure the stream still exists.
        */

        if (!streamRef.current) {
            throw new Error(
                "Camera is not active."
            );
        }

        /*
            Make sure video contains actual dimensions.
        */

        if (
            video.readyState < 2 ||
            video.videoWidth <= 0 ||
            video.videoHeight <= 0
        ) {
            throw new Error(
                "Camera frame is not ready. Please wait a moment."
            );
        }

        /*
            Wait for the newest frame.
        */

        await waitForVideoFrame(video);

        const width = video.videoWidth;
        const height = video.videoHeight;

        canvas.width = width;
        canvas.height = height;

        const context =
            canvas.getContext("2d", {
                willReadFrequently: false,
            });

        if (!context) {
            throw new Error(
                "Unable to access image canvas."
            );
        }

        /*
            Draw the actual camera frame.
        */

        context.drawImage(
            video,
            0,
            0,
            width,
            height
        );

        return new Promise((resolve, reject) => {
            canvas.toBlob(
                (blob) => {
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
                0.92
            );
        });
    };

    // ============================================================
    // CHECK FACE USING FASTAPI
    // ============================================================

    const detectFace = async () => {
        /*
            Don't run two detection requests simultaneously.
        */

        if (detectingRef.current) {
            return;
        }

        if (!streamRef.current) {
            return;
        }

        const video = videoRef.current;

        if (!video) {
            return;
        }

        if (
            video.readyState < 2 ||
            video.videoWidth <= 0 ||
            video.videoHeight <= 0
        ) {
            setFaceStatus("checking");
            setFaceMessage(
                "Waiting for a camera frame..."
            );

            return;
        }

        detectingRef.current = true;

        try {
            const imageBlob =
                await captureImage();

            const formData =
                new FormData();

            formData.append(
                "image",
                imageBlob,
                "camera-frame.jpg"
            );

            /*
                IMPORTANT:

                /face/detect is served by FastAPI.
                Your api.js should point to the Spring Boot
                backend, so we call FastAPI directly here.
            */

            const response =
                await fetch(
                    "http://127.0.0.1:8000/face/detect",
                    {
                        method: "POST",
                        body: formData,
                    }
                );

            let data = null;

            try {
                data = await response.json();
            } catch {
                throw new Error(
                    "Invalid response from Face Recognition API."
                );
            }

            /*
                FASTAPI REJECTED THE IMAGE
            */

            if (!response.ok) {
                throw new Error(
                    data?.message ||
                    "Face detection failed."
                );
            }

            if (!data.success) {
                handleFaceDetectionFailure(
                    data
                );

                return;
            }

            /*
                EXACTLY ONE FACE
            */

            setFaceStatus("ready");

            setFaceMessage(
                "Face detected. You are ready to mark attendance."
            );

            setFaceQuality(
                data.quality || null
            );

        } catch (err) {
            console.error(
                "Live face detection error:",
                err
            );

            setFaceStatus("error");

            setFaceMessage(
                err.message ||
                "Unable to check your face."
            );

            setFaceQuality(null);

        } finally {
            detectingRef.current = false;
        }
    };

    // ============================================================
    // HANDLE FASTAPI FACE ERRORS
    // ============================================================

    const handleFaceDetectionFailure = (
        data
    ) => {
        const code = data?.code;

        setFaceQuality(null);

        if (code === "NO_FACE") {
            setFaceStatus("no-face");

            setFaceMessage(
                "No face detected. Please move into the camera frame."
            );

            return;
        }

        if (code === "MULTIPLE_FACES") {
            setFaceStatus("multiple");

            setFaceMessage(
                "Multiple faces detected. Only one person should be visible."
            );

            return;
        }

        if (code === "FACE_TOO_SMALL") {
            setFaceStatus("quality-error");

            setFaceMessage(
                "Your face is too far away. Please move closer."
            );

            return;
        }

        if (code === "BLURRY_IMAGE") {
            setFaceStatus("quality-error");

            setFaceMessage(
                "The image is blurry. Please hold the camera steady."
            );

            return;
        }

        if (code === "LOW_BRIGHTNESS") {
            setFaceStatus("quality-error");

            setFaceMessage(
                "The image is too dark. Please improve the lighting."
            );

            return;
        }

        if (code === "HIGH_BRIGHTNESS") {
            setFaceStatus("quality-error");

            setFaceMessage(
                "The image is too bright. Please adjust the lighting."
            );

            return;
        }

        if (code === "LOW_DETECTION_CONFIDENCE") {
            setFaceStatus("quality-error");

            setFaceMessage(
                "Face detection confidence is low. Please look directly at the camera."
            );

            return;
        }

        setFaceStatus("error");

        setFaceMessage(
            data?.message ||
            "Unable to detect your face."
        );
    };

    // ============================================================
    // CONTINUOUS FACE DETECTION
    // ============================================================

    const startFaceDetection = () => {
        /*
            Clear any existing timer.
        */

        if (detectionTimerRef.current) {
            clearTimeout(
                detectionTimerRef.current
            );
        }

        const runDetection = async () => {
            if (!streamRef.current) {
                return;
            }

            await detectFace();

            if (!streamRef.current) {
                return;
            }

            /*
                Run detection approximately once per second.

                This avoids flooding FastAPI with requests.
            */

            detectionTimerRef.current =
                setTimeout(
                    runDetection,
                    1000
                );
        };

        runDetection();
    };

    // ============================================================
    // MARK ATTENDANCE
    // ============================================================

    const markAttendance = async (
        sessionId
    ) => {
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

            /*
                IMPORTANT:
                Don't allow attendance unless
                exactly one face is currently detected.
            */

            if (faceStatus !== "ready") {
                setError(
                    faceMessage ||
                    "Please position exactly one face in the camera."
                );

                return;
            }

            setMarkingSessionId(
                sessionId
            );

            /*
                Capture a FRESH frame immediately
                before sending attendance.
            */

            const imageBlob =
                await captureImage();

            /*
                One more detection check on the
                exact frame we are about to submit.
            */

            const detectFormData =
                new FormData();

            detectFormData.append(
                "image",
                imageBlob,
                "attendance-check.jpg"
            );

            const detectResponse =
                await fetch(
                    "http://127.0.0.1:8000/face/detect",
                    {
                        method: "POST",
                        body: detectFormData,
                    }
                );

            const detectData =
                await detectResponse.json();

            if (
                !detectResponse.ok ||
                !detectData.success
            ) {
                handleFaceDetectionFailure(
                    detectData
                );

                setError(
                    detectData?.message ||
                    "Please position your face correctly and try again."
                );

                return;
            }

            /*
                EXACT FRAME PASSED FACE DETECTION.
            */

            const formData =
                new FormData();

            formData.append(
                "image",
                imageBlob,
                "attendance.jpg"
            );

            /*
                Send to Spring Boot.
            */

            const response =
                await api.post(
                    `/attendance/face/${sessionId}`,
                    formData
                );

            setSuccess(
                response.data?.message ||
                "Attendance marked successfully."
            );

            /*
                Remove completed session.
            */

            setSessions((prev) =>
                prev.filter(
                    (session) =>
                        session.id !== sessionId
                )
            );

        } catch (err) {
            console.error(err);

            const message =
                err.response?.data?.message ||
                err.response?.data ||
                err.message ||
                "Unable to mark attendance.";

            setError(message);

        } finally {
            setMarkingSessionId(null);
        }
    };

    // ============================================================
    // FACE STATUS UI HELPERS
    // ============================================================

    const getFaceStatusClass = () => {
        switch (faceStatus) {
            case "ready":
                return "ready";

            case "multiple":
                return "multiple";

            case "no-face":
                return "no-face";

            case "quality-error":
                return "quality-error";

            case "error":
                return "error";

            case "checking":
                return "checking";

            default:
                return "idle";
        }
    };

    const getFaceStatusTitle = () => {
        switch (faceStatus) {
            case "ready":
                return "Ready";

            case "multiple":
                return "Multiple Faces";

            case "no-face":
                return "Face Not Detected";

            case "quality-error":
                return "Image Quality";

            case "error":
                return "Detection Error";

            case "checking":
                return "Checking";

            default:
                return "Camera Ready";
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

            {/* ================================================== */}
            {/* HEADER */}
            {/* ================================================== */}

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

                <div className="student-attendance-header-actions">

                    <button
                        type="button"
                        className="student-attendance-nav-button secondary"
                        onClick={() =>
                            navigate("/student")
                        }
                    >
                        Dashboard
                    </button>

                    <button
                        type="button"
                        className="student-attendance-nav-button secondary"
                        onClick={() =>
                            navigate(
                                "/student/attendance-history"
                            )
                        }
                    >
                        Attendance History
                    </button>

                    <button
                        type="button"
                        className="student-attendance-nav-button"
                        onClick={() =>
                            loadAttendanceData()
                        }
                        disabled={loading}
                    >
                        Refresh
                    </button>

                </div>

            </div>


            {/* ================================================== */}
            {/* ERROR */}
            {/* ================================================== */}

            {error && (
                <div className="student-attendance-alert error">
                    {error}
                </div>
            )}


            {/* ================================================== */}
            {/* SUCCESS */}
            {/* ================================================== */}

            {success && (
                <div className="student-attendance-alert success">
                    {success}
                </div>
            )}


            {/* ================================================== */}
            {/* CAMERA */}
            {/* ================================================== */}

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
                            Face Registered
                        </span>
                    )}

                </div>


                {/* ================================================== */}
                {/* CAMERA */}
                {/* ================================================== */}

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
                                Camera
                            </div>

                            <p>
                                Camera is not active
                            </p>

                        </div>
                    )}

                </div>


                {/* ================================================== */}
                {/* HIDDEN CANVAS */}
                {/* ================================================== */}

                <canvas
                    ref={canvasRef}
                    style={{
                        display: "none",
                    }}
                />


                {/* ================================================== */}
                {/* CAMERA ERROR */}
                {/* ================================================== */}

                {cameraError && (
                    <div className="student-camera-error">
                        {cameraError}
                    </div>
                )}


                {/* ================================================== */}
                {/* LIVE FACE STATUS */}
                {/* ================================================== */}

                {streamRef.current && (
                    <div
                        className={`student-face-status ${getFaceStatusClass()}`}
                    >

                        <div className="student-face-status-indicator">
                            {faceStatus === "ready"
                                ? "READY"
                                : faceStatus === "multiple"
                                    ? "!"
                                    : faceStatus === "checking"
                                        ? "..."
                                        : "!"}
                        </div>

                        <div className="student-face-status-content">

                            <strong>
                                {getFaceStatusTitle()}
                            </strong>

                            <span>
                                {faceMessage}
                            </span>

                            {faceQuality && (
                                <small>
                                    Detection:{" "}
                                    {(
                                        faceQuality.detectionScore *
                                        100
                                    ).toFixed(1)}
                                    %
                                    {" • "}
                                    Face:{" "}
                                    {faceQuality.faceWidth}
                                    ×
                                    {faceQuality.faceHeight}
                                    px
                                </small>
                            )}

                        </div>

                    </div>
                )}


                {/* ================================================== */}
                {/* CAMERA ACTIONS */}
                {/* ================================================== */}

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


            {/* ================================================== */}
            {/* ACTIVE SESSIONS */}
            {/* ================================================== */}

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
                            OK
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

                        {sessions.map((session) => (

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


                                {/* ================================================== */}
                                {/* MARK ATTENDANCE */}
                                {/* ================================================== */}

                                <button
                                    type="button"
                                    className="student-mark-attendance-btn"
                                    onClick={() =>
                                        markAttendance(
                                            session.id
                                        )
                                    }
                                    disabled={
                                        faceStatus !== "ready" ||
                                        markingSessionId ===
                                        session.id ||
                                        !student?.faceRegistered
                                    }
                                >

                                    {markingSessionId ===
                                    session.id
                                        ? "Recognizing..."
                                        : faceStatus ===
                                        "ready"
                                            ? "Mark Attendance"
                                            : "Waiting for Face..."}

                                </button>

                            </div>

                        ))}

                    </div>
                )}

            </div>

        </div>
    );
}