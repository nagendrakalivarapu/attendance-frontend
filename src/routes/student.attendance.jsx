import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Camera, CameraOff, CheckCircle2, CircleDot, Loader2, RefreshCw, ScanFace, ShieldCheck, TriangleAlert, Users, VideoOff, } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState, ErrorState, InlineAlert, Page, PageHeader, Panel, } from "@/components/app/primitives";
import { api, asArray, detectFace, errorMessage, messageFrom, } from "@/lib/api";
import { formatDate, formatTime } from "@/lib/format";
import { pageHead } from "@/lib/seo";
import { cn } from "@/lib/utils";
export const Route = createFileRoute("/student/attendance")({
    head: () => pageHead("Mark Attendance", "Use face recognition to mark attendance for an active class."),
    component: MarkAttendancePage,
});
const FAILURE_MESSAGES = {
    NO_FACE: { status: "no-face", message: "No face detected. Please move into the camera frame." },
    MULTIPLE_FACES: {
        status: "multiple",
        message: "Multiple faces detected. Only one person should be visible.",
    },
    FACE_TOO_SMALL: {
        status: "quality-error",
        message: "Your face is too far away. Please move closer.",
    },
    BLURRY_IMAGE: {
        status: "quality-error",
        message: "The image is blurry. Please hold the camera steady.",
    },
    LOW_BRIGHTNESS: {
        status: "quality-error",
        message: "The image is too dark. Please improve the lighting.",
    },
    HIGH_BRIGHTNESS: {
        status: "quality-error",
        message: "The image is too bright. Please adjust the lighting.",
    },
    LOW_DETECTION_CONFIDENCE: {
        status: "quality-error",
        message: "Face detection confidence is low. Please look directly at the camera.",
    },
};
const STATUS_UI = {
    idle: {
        title: "Camera ready",
        tone: "border-border bg-muted text-muted-foreground",
        icon: ScanFace,
    },
    checking: {
        title: "Checking",
        tone: "border-slate-blue/25 bg-primary-soft text-primary",
        icon: Loader2,
    },
    ready: {
        title: "Ready",
        tone: "border-success/25 bg-success-soft text-success",
        icon: CheckCircle2,
    },
    multiple: {
        title: "Multiple faces",
        tone: "border-warning/25 bg-warning-soft text-warning",
        icon: Users,
    },
    "no-face": {
        title: "Face not detected",
        tone: "border-warning/25 bg-warning-soft text-warning",
        icon: ScanFace,
    },
    "quality-error": {
        title: "Image quality",
        tone: "border-warning/25 bg-warning-soft text-warning",
        icon: TriangleAlert,
    },
    error: {
        title: "Detection error",
        tone: "border-destructive/25 bg-destructive-soft text-destructive",
        icon: TriangleAlert,
    },
};
function waitForVideoReady(video) {
    return new Promise((resolve, reject) => {
        const timeout = window.setTimeout(() => reject(new Error("Camera video did not become ready.")), 10000);
        const check = () => {
            if (video.readyState >= 2 && video.videoWidth > 0 && video.videoHeight > 0) {
                window.clearTimeout(timeout);
                resolve();
                return;
            }
            requestAnimationFrame(check);
        };
        check();
    });
}
function waitForVideoFrame(video) {
    return new Promise((resolve) => {
        if ("requestVideoFrameCallback" in video) {
            video.requestVideoFrameCallback(() => resolve());
        }
        else {
            window.setTimeout(resolve, 300);
        }
    });
}
function MarkAttendancePage() {
    const queryClient = useQueryClient();
    const videoRef = React.useRef(null);
    const canvasRef = React.useRef(null);
    const streamRef = React.useRef(null);
    const timerRef = React.useRef(null);
    const detectingRef = React.useRef(false);
    const [cameraOn, setCameraOn] = React.useState(false);
    const [cameraLoading, setCameraLoading] = React.useState(false);
    const [cameraError, setCameraError] = React.useState("");
    const [markingId, setMarkingId] = React.useState(null);
    const [error, setError] = React.useState("");
    const [success, setSuccess] = React.useState("");
    const [faceStatus, setFaceStatus] = React.useState("idle");
    const [faceMessage, setFaceMessage] = React.useState("Start the camera to begin face detection.");
    const [quality, setQuality] = React.useState(null);
    const faceStatusRef = React.useRef("idle");
    faceStatusRef.current = faceStatus;
    const data = useQuery({
        queryKey: ["student", "attendance"],
        queryFn: async () => {
            const [student, sessions] = await Promise.all([
                api.get("/student/me"),
                api.get("/attendance-sessions/my-open"),
            ]);
            return { student, sessions: asArray(sessions) };
        },
    });
    const student = data.data?.student;
    const sessions = data.data?.sessions ?? [];
    const stopCamera = React.useCallback(() => {
        if (timerRef.current)
            window.clearTimeout(timerRef.current);
        timerRef.current = null;
        detectingRef.current = false;
        streamRef.current?.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
        if (videoRef.current) {
            videoRef.current.pause();
            videoRef.current.srcObject = null;
        }
        setCameraOn(false);
        setFaceStatus("idle");
        setFaceMessage("Start the camera to begin face detection.");
        setQuality(null);
    }, []);
    React.useEffect(() => () => stopCamera(), [stopCamera]);
    const captureImage = async () => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (!video || !canvas)
            throw new Error("Camera is not ready.");
        if (!streamRef.current)
            throw new Error("Camera is not active.");
        if (video.readyState < 2 || video.videoWidth <= 0 || video.videoHeight <= 0)
            throw new Error("Camera frame is not ready. Please wait a moment.");
        await waitForVideoFrame(video);
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d");
        if (!ctx)
            throw new Error("Unable to access image canvas.");
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        return new Promise((resolve, reject) => canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("Failed to capture image."))), "image/jpeg", 0.92));
    };
    const applyFailure = (result) => {
        setQuality(null);
        const known = result?.code ? FAILURE_MESSAGES[result.code] : undefined;
        if (known) {
            setFaceStatus(known.status);
            setFaceMessage(known.message);
        }
        else {
            setFaceStatus("error");
            setFaceMessage(result?.message || "Unable to detect your face.");
        }
    };
    const runDetection = async () => {
        if (detectingRef.current || !streamRef.current)
            return;
        const video = videoRef.current;
        if (!video)
            return;
        if (video.readyState < 2 || video.videoWidth <= 0) {
            setFaceStatus("checking");
            setFaceMessage("Waiting for a camera frame...");
            return;
        }
        detectingRef.current = true;
        try {
            const blob = await captureImage();
            const { ok, data: result } = await detectFace(blob, "camera-frame.jpg");
            if (!ok)
                throw new Error(result?.message || "Face detection failed.");
            if (!result?.success)
                return applyFailure(result);
            setFaceStatus("ready");
            setFaceMessage("Face detected. You are ready to mark attendance.");
            setQuality(result.quality || null);
        }
        catch (err) {
            setFaceStatus("error");
            setFaceMessage(err instanceof Error ? err.message : "Unable to check your face.");
            setQuality(null);
        }
        finally {
            detectingRef.current = false;
        }
    };
    const startDetectionLoop = () => {
        if (timerRef.current)
            window.clearTimeout(timerRef.current);
        const loop = async () => {
            if (!streamRef.current)
                return;
            await runDetection();
            // About once per second, so the face service isn't flooded.
            if (streamRef.current)
                timerRef.current = window.setTimeout(loop, 1000);
        };
        void loop();
    };
    const startCamera = async () => {
        setCameraError("");
        setError("");
        setSuccess("");
        setCameraLoading(true);
        setFaceStatus("checking");
        setFaceMessage("Starting camera...");
        try {
            if (!navigator.mediaDevices?.getUserMedia)
                throw new Error("Camera access is not supported by this browser.");
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
                audio: false,
            });
            streamRef.current = stream;
            const video = videoRef.current;
            if (!video)
                throw new Error("Camera video element is not available.");
            video.srcObject = stream;
            video.muted = true;
            video.playsInline = true;
            await waitForVideoReady(video);
            await video.play();
            await waitForVideoFrame(video);
            setCameraOn(true);
            setFaceMessage("Camera ready. Checking your face...");
            startDetectionLoop();
        }
        catch (err) {
            stopCamera();
            const name = err?.name;
            if (name === "NotAllowedError")
                setCameraError("Camera permission was denied. Please allow camera access in your browser.");
            else if (name === "NotFoundError")
                setCameraError("No camera was found on this device.");
            else if (name === "NotReadableError")
                setCameraError("The camera is already being used by another application.");
            else
                setCameraError(err instanceof Error ? err.message : "Unable to access the camera.");
            setFaceStatus("error");
            setFaceMessage("Camera could not be started.");
        }
        finally {
            setCameraLoading(false);
        }
    };
    const markAttendance = async (sessionId) => {
        setError("");
        setSuccess("");
        if (!student)
            return setError("Student information is not available.");
        if (!student.faceRegistered)
            return setError("Face recognition is not registered for your account.");
        if (!streamRef.current)
            return setError("Please start the camera first.");
        if (faceStatusRef.current !== "ready")
            return setError(faceMessage || "Please position exactly one face in the camera.");
        setMarkingId(sessionId);
        try {
            // Capture a fresh frame and re-check it before submitting that exact image.
            const blob = await captureImage();
            const { ok, data: check } = await detectFace(blob, "attendance-check.jpg");
            if (!ok || !check?.success) {
                applyFailure(check);
                setError(check?.message || "Please position your face correctly and try again.");
                return;
            }
            const form = new FormData();
            form.append("image", blob, "attendance.jpg");
            const response = await api.post(`/attendance/face/${sessionId}`, form);
            setSuccess(messageFrom(response, "Attendance marked successfully."));
            queryClient.setQueryData(["student", "attendance"], (prev) => prev ? { ...prev, sessions: prev.sessions.filter((s) => s.id !== sessionId) } : prev);
            void queryClient.invalidateQueries({ queryKey: ["student", "dashboard"] });
            void queryClient.invalidateQueries({ queryKey: ["attendance", "me"] });
        }
        catch (err) {
            setError(errorMessage(err, "Unable to mark attendance."));
        }
        finally {
            setMarkingId(null);
        }
    };
    const ui = STATUS_UI[faceStatus];
    return (<Page>
      <PageHeader eyebrow="Attendance" title="Mark attendance" description="Use face recognition to mark your attendance for an active class." actions={<Button variant="outline" onClick={() => void data.refetch()} disabled={data.isFetching}>
            <RefreshCw className={data.isFetching ? "animate-spin" : ""}/> Refresh
          </Button>}/>

      {data.isError && (<ErrorState message={errorMessage(data.error, "Failed to load attendance information.")} onRetry={() => void data.refetch()}/>)}
      {error && (<InlineAlert tone="destructive" onDismiss={() => setError("")}>
          {error}
        </InlineAlert>)}
      {success && <InlineAlert onDismiss={() => setSuccess("")}>{success}</InlineAlert>}

      <div className="grid gap-4 lg:grid-cols-12">
        {/* Camera */}
        <Panel className="lg:col-span-7" title="Face recognition" description="Position your face clearly inside the camera frame." actions={student?.faceRegistered ? (<Badge variant="success">
                <ShieldCheck /> Face registered
              </Badge>) : student ? (<Badge variant="warning">Face not registered</Badge>) : null}>
          <div className="relative aspect-[4/3] overflow-hidden rounded-lg border bg-foreground">
            <video ref={videoRef} autoPlay muted playsInline className={cn("h-full w-full -scale-x-100 object-cover transition-opacity duration-200", cameraOn ? "opacity-100" : "opacity-0")}/>
            {!cameraOn && (<div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-secondary text-slate-blue">
                <span className="flex size-14 items-center justify-center rounded-full bg-card shadow-panel">
                  {cameraLoading ? (<Loader2 className="size-6 animate-spin"/>) : (<VideoOff className="size-6"/>)}
                </span>
                <p className="text-sm font-medium">
                  {cameraLoading ? "Starting camera…" : "Camera is not active"}
                </p>
              </div>)}
            {cameraOn && (<div aria-hidden className={cn("pointer-events-none absolute left-1/2 top-1/2 h-[62%] w-[42%] -translate-x-1/2 -translate-y-1/2 rounded-[45%] border-2 border-dashed transition-all duration-200", faceStatus === "ready" ? "border-success" : "border-primary-foreground/60")}/>)}
          </div>
          <canvas ref={canvasRef} className="hidden"/>

          {cameraError && (<div className="mt-4">
              <InlineAlert tone="destructive">{cameraError}</InlineAlert>
            </div>)}

          {cameraOn && (<div className={cn("mt-4 flex animate-rise items-start gap-3 rounded-lg border p-3.5", ui.tone)}>
              <ui.icon className={cn("mt-0.5 size-5 shrink-0", faceStatus === "checking" && "animate-spin")}/>
              <div className="min-w-0 text-sm">
                <p className="font-semibold">{ui.title}</p>
                <p className="text-foreground/80">{faceMessage}</p>
                {quality && (<p className="mt-1 font-mono text-xs text-foreground/60">
                    Detection {(quality.detectionScore * 100).toFixed(1)}% · Face{" "}
                    {quality.faceWidth} × {quality.faceHeight} px
                  </p>)}
              </div>
            </div>)}

          <div className="mt-4">
            {cameraOn ? (<Button variant="outline" className="w-full" onClick={stopCamera}>
                <CameraOff /> Stop camera
              </Button>) : (<Button className="w-full" size="lg" onClick={startCamera} disabled={cameraLoading}>
                {cameraLoading ? <Loader2 className="animate-spin"/> : <Camera />}
                {cameraLoading ? "Starting camera…" : "Start camera"}
              </Button>)}
          </div>
        </Panel>

        {/* Sessions */}
        <Panel className="lg:col-span-5" title="Active attendance" description="Attendance sessions currently available for your courses." bodyClassName="space-y-3">
          {data.isLoading ? (Array.from({ length: 2 }).map((_, i) => (<Skeleton key={i} className="h-36 rounded-lg"/>))) : sessions.length === 0 ? (<EmptyState icon={CheckCircle2} title="No active attendance" description="There are currently no open attendance sessions for your courses."/>) : (sessions.map((s) => {
            const marking = markingId === s.id;
            return (<div key={s.id} className="animate-rise rounded-lg border bg-background p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <Badge variant="success">
                      <CircleDot className="animate-pulse"/> Live
                    </Badge>
                    <span className="font-mono text-xs text-muted-foreground">Session #{s.id}</span>
                  </div>
                  <p className="font-semibold">Course #{s.courseId}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(s.attendanceDate)} · Started {formatTime(s.startedAt)}
                  </p>
                  <Button className="mt-3 w-full" onClick={() => void markAttendance(s.id)} disabled={faceStatus !== "ready" || marking || !student?.faceRegistered}>
                    {marking ? <Loader2 className="animate-spin"/> : <ScanFace />}
                    {marking
                    ? "Recognizing…"
                    : faceStatus === "ready"
                        ? "Mark attendance"
                        : "Waiting for face…"}
                  </Button>
                </div>);
        }))}
        </Panel>
      </div>
    </Page>);
}
