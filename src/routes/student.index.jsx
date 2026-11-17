import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, CalendarClock, CheckCircle2, Layers, ClipboardList, ScanFace, ShieldAlert, ShieldCheck, XCircle, } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AttendanceMeter, Code, EmptyState, ErrorState, Page, PageHeader, Panel, StatCard, } from "@/components/app/primitives";
import { api, asArray, errorMessage } from "@/lib/api";
import { toNumber } from "@/lib/format";
import { pageHead } from "@/lib/seo";
import { getUploadsBaseUrl } from "@/lib/server-config";
export const Route = createFileRoute("/student/")({
    head: () => pageHead("Student Dashboard", "Your profile, courses and attendance at a glance."),
    component: StudentDashboard,
});
function StudentDashboard() {
    const data = useQuery({
        queryKey: ["student", "dashboard"],
        queryFn: async () => {
            const [student, courses, summary, courseAttendance] = await Promise.all([
                api.get("/student/me"),
                api.get("/enrollment/my-courses"),
                api.get("/attendance/me/summary"),
                api.get("/attendance/me/courses"),
            ]);
            return {
                student,
                courses: asArray(courses),
                summary,
                courseAttendance: asArray(courseAttendance),
            };
        },
    });
    if (data.isLoading) {
        return (<Page>
        <Skeleton className="h-32 w-full rounded-xl"/>
        <div className="grid gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (<Skeleton key={i} className="h-24 rounded-xl"/>))}
        </div>
        <Skeleton className="h-64 w-full rounded-xl"/>
      </Page>);
    }
    if (data.isError) {
        return (<Page>
        <ErrorState title="Unable to load dashboard" message={errorMessage(data.error, "Unable to load dashboard.")} onRetry={() => void data.refetch()}/>
      </Page>);
    }
    const student = data.data?.student;
    if (!student) {
        return (<Page>
        <Panel>
          <EmptyState title="Student information not found" description="Please contact the administrator."/>
        </Panel>
      </Page>);
    }
    const courses = data.data?.courses ?? [];
    const courseAttendance = data.data?.courseAttendance ?? [];
    const summary = data.data?.summary;
    const pct = toNumber(summary?.attendancePercentage);
    return (<Page>
      <PageHeader eyebrow="Student dashboard" title={`Welcome, ${student.studentName ?? "student"}`} description="Here's an overview of your academic information and attendance." actions={<>
            <Button variant="outline" asChild>
              <Link to="/student/attendance-history">
                <CalendarClock /> Attendance history
              </Link>
            </Button>
            <Button asChild>
              <Link to="/student/attendance">
                <ScanFace /> Mark attendance
              </Link>
            </Button>
          </>}/>

      <div className="grid gap-4 lg:grid-cols-12">
        {/* Profile */}
        <section className="relative overflow-hidden rounded-xl bg-primary p-6 text-primary-foreground shadow-raised lg:col-span-7">
          <div className="bg-grid-faint absolute inset-0" aria-hidden/>
          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center">
            {student.profilePicture ? (<img src={`${getUploadsBaseUrl()}/profile-pictures/${student.profilePicture}`} alt={student.studentName} className="size-20 rounded-xl object-cover ring-2 ring-primary-foreground/20"/>) : (<span className="flex size-20 items-center justify-center rounded-xl bg-primary-foreground/10 text-3xl font-bold ring-1 ring-primary-foreground/20">
                {student.studentName?.charAt(0)?.toUpperCase()}
              </span>)}
            <div className="min-w-0 flex-1 space-y-1">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary-foreground/60">
                Student
              </p>
              <h2 className="truncate text-2xl font-bold">{student.studentName}</h2>
              <p className="truncate text-sm text-primary-foreground/70">{student.email}</p>
              <span className="mt-2 inline-flex items-center gap-1.5 rounded-md bg-primary-foreground/10 px-2 py-1 text-xs font-medium">
                {student.faceRegistered ? (<ShieldCheck className="size-3.5"/>) : (<ShieldAlert className="size-3.5"/>)}
                {student.faceRegistered
            ? "Face recognition registered"
            : "Face recognition pending"}
              </span>
            </div>
          </div>
        </section>

        {/* Overall attendance */}
        <section className="flex flex-col justify-between rounded-xl border bg-card p-6 shadow-panel lg:col-span-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="eyebrow">Attendance</p>
              <h2 className="text-lg font-bold">Attendance overview</h2>
            </div>
            <span className="font-mono text-4xl font-semibold text-primary">{pct.toFixed(0)}%</span>
          </div>
          <AttendanceMeter value={pct} showLabel={false} className="my-4 [&>div]:h-2.5"/>
          <div className="grid grid-cols-3 gap-2 text-center">
            {[
            ["Sessions", summary?.totalSessions ?? 0],
            ["Present", summary?.presentCount ?? 0],
            ["Absent", summary?.absentCount ?? 0],
        ].map(([label, value]) => (<div key={label} className="rounded-lg bg-background px-2 py-2.5">
                <p className="text-[0.6875rem] text-muted-foreground">{label}</p>
                <p className="font-mono text-lg font-semibold">{value}</p>
              </div>))}
          </div>
        </section>

        <div className="grid grid-cols-2 gap-4 lg:col-span-12 xl:grid-cols-4">
          <StatCard label="Registration number" value={<span className="text-xl">{student.registrationNumber}</span>} icon={Layers}/>
          <StatCard label="Department" value={<span className="text-xl">{student.department}</span>} icon={BookOpen} tone="slate"/>
          <StatCard label="Semester" value={student.semester} icon={CalendarClock} tone="slate"/>
          <StatCard label="Enrolled courses" value={courses.length} icon={ClipboardList} tone="success"/>
        </div>

        {/* Personal info */}
        <Panel className="lg:col-span-8" title="Personal information">
          <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
            ["Full name", student.studentName],
            ["Email", student.email],
            ["Phone", student.phone || "Not provided"],
            ["Gender", student.gender || "Not provided"],
            ["Date of birth", student.dateOfBirth || "Not provided"],
            ["Section", student.section],
            ["Department", student.department],
            ["Semester", student.semester],
            ["Address", student.address || "Not provided"],
        ].map(([label, value]) => (<div key={label} className="min-w-0">
                <dt className="text-xs text-muted-foreground">{label}</dt>
                <dd className="truncate text-sm font-semibold">{value ?? "—"}</dd>
              </div>))}
          </dl>
        </Panel>

        {/* Face */}
        <Panel className="lg:col-span-4" title="Face recognition">
          <div className="flex items-start gap-3">
            <span className={student.faceRegistered
            ? "flex size-10 items-center justify-center rounded-lg bg-success-soft text-success"
            : "flex size-10 items-center justify-center rounded-lg bg-warning-soft text-warning"}>
              {student.faceRegistered ? (<CheckCircle2 className="size-5"/>) : (<ShieldAlert className="size-5"/>)}
            </span>
            <div>
              <p className="font-semibold">
                {student.faceRegistered ? "Face registered" : "Registration pending"}
              </p>
              <p className="text-sm text-muted-foreground">
                {student.faceRegistered
            ? "Your face is registered and can be used for attendance."
            : "Please contact the administrator to register your face."}
              </p>
            </div>
          </div>
        </Panel>

        {/* Course attendance */}
        <Panel className="lg:col-span-12" title="Course attendance">
          {courseAttendance.length === 0 ? (<EmptyState title="No attendance records available yet." className="py-8"/>) : (<div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {courseAttendance.map((c) => (<div key={c.courseId} className="rounded-lg border bg-background p-4 transition-all duration-200 ease-in-out hover:border-slate-blue/30 hover:bg-card">
                  <div className="mb-3 flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <Code>{c.courseCode}</Code>
                      <p className="mt-1.5 truncate text-sm font-semibold">{c.courseName}</p>
                    </div>
                  </div>
                  <AttendanceMeter value={toNumber(c.attendancePercentage)}/>
                  <div className="mt-3 flex gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Layers className="size-3.5"/> {c.totalSessions}
                    </span>
                    <span className="flex items-center gap-1 text-success">
                      <CheckCircle2 className="size-3.5"/> {c.presentCount}
                    </span>
                    <span className="flex items-center gap-1 text-destructive">
                      <XCircle className="size-3.5"/> {c.absentCount}
                    </span>
                  </div>
                </div>))}
            </div>)}
        </Panel>

        {/* My courses */}
        <Panel className="lg:col-span-12" title="My courses" actions={<Badge variant="info">
              {courses.length} {courses.length === 1 ? "course" : "courses"}
            </Badge>}>
          {courses.length === 0 ? (<EmptyState icon={BookOpen} title="You are not enrolled in any courses yet." className="py-8"/>) : (<div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {courses.map((course) => {
                const att = courseAttendance.find((a) => a.courseId === course.courseId);
                return (<div key={course.id} className="rounded-lg border p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <Code>{course.courseCode}</Code>
                      <Badge variant={course.status === "ACTIVE" ? "success" : "muted"}>
                        {course.status}
                      </Badge>
                    </div>
                    <p className="font-semibold">{course.courseName}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {course.department || student.department} · Semester{" "}
                      {course.semester || student.semester}
                    </p>
                    {att && (<AttendanceMeter value={toNumber(att.attendancePercentage)} className="mt-3"/>)}
                  </div>);
            })}
            </div>)}
        </Panel>
      </div>
    </Page>);
}
