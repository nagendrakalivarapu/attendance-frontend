import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowRight, BarChart3, BookOpen, CheckCircle2, CircleDot, Database, FileCheck2, GraduationCap, Layers, Lock, Percent, RefreshCw, ScanFace, Server, Users, XCircle, } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/components/ui/table";
import { AttendanceMeter, EmptyState, ErrorState, Page, PageHeader, Panel, SessionStatusBadge, StatCard, TableSkeleton, } from "@/components/app/primitives";
import { api, asArray, checkFaceHealth, errorMessage } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { formatDate, formatTime, sessionPercentage } from "@/lib/format";
import { pageHead } from "@/lib/seo";
import { cn } from "@/lib/utils";
export const Route = createFileRoute("/admin/")({
    head: () => pageHead("Admin Dashboard", "System-wide overview of students, courses and attendance."),
    component: AdminDashboard,
});
function AdminDashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const counts = useQuery({
        queryKey: ["admin", "counts"],
        queryFn: async () => {
            const [students, teachers, courses] = await Promise.all([
                api.get("/student"),
                api.get("/teacher"),
                api.get("/course"),
            ]);
            return {
                students: asArray(students).length,
                teachers: asArray(teachers).length,
                courses: asArray(courses).length,
            };
        },
    });
    const attendance = useQuery({
        queryKey: ["attendance", "admin-dashboard"],
        queryFn: () => api.get("/attendance/admin/dashboard"),
    });
    const recent = useQuery({
        queryKey: ["attendance-sessions", "admin-history"],
        queryFn: async () => asArray(await api.get("/attendance-sessions/admin/history")),
    });
    const status = useQuery({
        queryKey: ["admin", "system-status"],
        queryFn: async () => {
            let backend = "offline";
            let database = "unknown";
            try {
                // A successful authenticated request proves the API and its database are reachable.
                await api.get("/student");
                backend = "online";
                database = "online";
            }
            catch {
                backend = "offline";
                database = "unknown";
            }
            const face = (await checkFaceHealth()) ? "online" : "offline";
            return { backend, database, face };
        },
    });
    const refreshAll = () => {
        void queryClient.invalidateQueries({ queryKey: ["admin"] });
        void queryClient.invalidateQueries({ queryKey: ["attendance"] });
        void queryClient.invalidateQueries({ queryKey: ["attendance-sessions"] });
    };
    const recentSessions = (recent.data ?? []).slice(0, 6);
    const dash = attendance.data;
    const overall = Number(dash?.attendancePercentage ?? 0);
    return (<Page>
      <PageHeader eyebrow="Overview" title="Dashboard" description="Manage your Smart Attendance System." actions={<Button variant="outline" onClick={refreshAll}>
            <RefreshCw /> Refresh dashboard
          </Button>}/>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        {/* Welcome */}
        <section className="relative overflow-hidden rounded-xl bg-primary p-6 text-primary-foreground shadow-raised lg:col-span-8">
          <div className="bg-grid-faint absolute inset-0" aria-hidden/>
          <div className="relative flex h-full flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary-foreground/60">
                Welcome back
              </p>
              <h2 className="text-2xl font-bold">Hello, Administrator</h2>
              <p className="max-w-md text-sm text-primary-foreground/75">
                Monitor students, teachers, courses and attendance from one place.
              </p>
              <p className="text-xs text-primary-foreground/55">{user?.email}</p>
            </div>
            <div className="rounded-lg bg-primary-foreground/10 px-5 py-4 ring-1 ring-primary-foreground/15">
              <p className="text-xs text-primary-foreground/65">Overall attendance</p>
              {attendance.isLoading ? (<Skeleton className="mt-2 h-9 w-24 bg-primary-foreground/20"/>) : (<p className="font-mono text-4xl font-semibold">
                  {attendance.isError ? "--" : `${overall}%`}
                </p>)}
            </div>
          </div>
        </section>

        {/* System status */}
        <Panel className="lg:col-span-4" title="System status" description="Current application services" actions={<Button variant="ghost" size="icon-sm" aria-label="Check status" onClick={() => void status.refetch()} disabled={status.isFetching}>
              <RefreshCw className={cn(status.isFetching && "animate-spin")}/>
            </Button>} bodyClassName="space-y-2.5 p-4">
          <ServiceRow icon={Server} name="Spring Boot API" detail="Backend service" status={status.isFetching ? undefined : status.data?.backend}/>
          <ServiceRow icon={Database} name="MySQL Database" detail="Database service" status={status.isFetching ? undefined : status.data?.database}/>
          <ServiceRow icon={ScanFace} name="Face Recognition API" detail="AI recognition service" status={status.isFetching ? undefined : status.data?.face}/>
        </Panel>

        {/* Counts */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-12 xl:grid-cols-4">
          <StatCard label="Total students" value={counts.isError ? "--" : counts.data?.students} hint={counts.isError ? "Unable to load" : "Registered students"} icon={GraduationCap} loading={counts.isLoading}/>
          <StatCard label="Total teachers" value={counts.isError ? "--" : counts.data?.teachers} hint={counts.isError ? "Unable to load" : "Active teachers"} icon={Users} tone="slate" loading={counts.isLoading}/>
          <StatCard label="Total courses" value={counts.isError ? "--" : counts.data?.courses} hint={counts.isError ? "Unable to load" : "Available courses"} icon={BookOpen} tone="slate" loading={counts.isLoading}/>
          <StatCard label="Attendance" value={attendance.isError ? "--" : `${overall}%`} hint={attendance.isError ? "Unable to load" : "Overall percentage"} icon={Percent} tone="success" loading={attendance.isLoading}/>
        </div>

        {counts.isError && (<ErrorState className="lg:col-span-12" title="Unable to load dashboard counts" message={errorMessage(counts.error, "Failed to load dashboard statistics.")} onRetry={() => void counts.refetch()}/>)}

        {/* Attendance overview */}
        <Panel className="lg:col-span-8" title="Attendance overview" description="System-wide attendance session and record statistics">
          {attendance.isLoading ? (<div className="grid grid-cols-2 gap-3 md:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (<Skeleton key={i} className="h-20 rounded-lg"/>))}
            </div>) : attendance.isError ? (<ErrorState title="Unable to load attendance statistics" message={errorMessage(attendance.error, "Failed to load attendance statistics.")} onRetry={() => void attendance.refetch()}/>) : dash ? (<div className="space-y-5">
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                <Metric icon={Layers} label="Total sessions" value={dash.totalSessions} hint="All attendance sessions"/>
                <Metric icon={CircleDot} label="Open sessions" value={dash.openSessions} hint="Currently active" tone="success"/>
                <Metric icon={Lock} label="Closed sessions" value={dash.closedSessions} hint="Completed sessions"/>
                <Metric icon={FileCheck2} label="Attendance records" value={dash.totalAttendanceRecords} hint="Recorded entries"/>
                <Metric icon={CheckCircle2} label="Present" value={dash.presentCount} hint="Present records" tone="success"/>
                <Metric icon={XCircle} label="Absent" value={dash.absentCount} hint="Absent records" tone="destructive"/>
              </div>
              <div className="rounded-lg border bg-background p-4">
                <div className="mb-2 flex items-baseline justify-between">
                  <div>
                    <p className="text-sm font-semibold">Overall attendance</p>
                    <p className="text-xs text-muted-foreground">
                      Based on present and absent attendance records
                    </p>
                  </div>
                </div>
                <AttendanceMeter value={overall} digits={2} className="[&>span]:w-20"/>
              </div>
            </div>) : null}
        </Panel>

        {/* Trend */}
        <Panel className="flex flex-col lg:col-span-4" bodyClassName="flex flex-1 flex-col" title="Recent attendance trend" description="Attendance percentage for the latest sessions">
          {recent.isLoading ? (<Skeleton className="h-48 w-full rounded-lg"/>) : recentSessions.length === 0 ? (<EmptyState icon={BarChart3} title="No sessions yet" className="py-8"/>) : (<div className="flex min-h-48 flex-1 items-end gap-2.5 border-b border-dashed pb-px">
              {recentSessions.map((session) => {
                const pct = sessionPercentage(session);
                return (<button key={session.sessionId} type="button" title={`${session.courseCode || "Course"}: ${pct.toFixed(2)}%`} onClick={() => void navigate({ to: "/admin/attendance/history" })} className="group flex h-full flex-1 flex-col items-center justify-end gap-1.5">
                    <span className="font-mono text-[0.6875rem] font-medium text-muted-foreground transition-all duration-200 group-hover:text-primary">
                      {Math.round(pct)}%
                    </span>
                    <span className="w-full rounded-t-md bg-slate-blue/70 transition-all duration-200 ease-in-out group-hover:bg-primary" style={{ height: `${Math.min(Math.max(pct, 2), 100)}%` }}/>
                  </button>);
            })}
            </div>)}
        </Panel>

        {/* Quick actions */}
        <Panel className="lg:col-span-12" title="Quick actions" description="Common administration tasks" bodyClassName="grid gap-2 p-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            {
                to: "/admin/students",
                icon: GraduationCap,
                title: "Manage students",
                text: "Add, edit and manage student accounts",
            },
            {
                to: "/admin/teachers",
                icon: Users,
                title: "Manage teachers",
                text: "Manage teacher accounts and assignments",
            },
            {
                to: "/admin/courses",
                icon: BookOpen,
                title: "Manage courses",
                text: "Create and assign courses",
            },
            {
                to: "/admin/attendance",
                icon: BarChart3,
                title: "Attendance reports",
                text: "View attendance records and reports",
            },
        ].map((a) => (<Link key={a.to} to={a.to} className="group flex items-center gap-3 rounded-lg border border-transparent p-3 transition-all duration-200 ease-in-out hover:border-border hover:bg-primary-soft/60 active:scale-[0.98]">
              <span className="flex size-9 items-center justify-center rounded-lg bg-secondary text-slate-blue transition-all duration-200 group-hover:bg-primary group-hover:text-primary-foreground">
                <a.icon className="size-4"/>
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold">{a.title}</span>
                <span className="block truncate text-xs text-muted-foreground">{a.text}</span>
              </span>
              <ArrowRight className="size-4 text-muted-foreground transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-primary"/>
            </Link>))}
        </Panel>
        {/* Recent sessions */}
        <Panel className="lg:col-span-12" title="Recent attendance sessions" description="Latest attendance activity across the system" bodyClassName="p-0" actions={<Button variant="outline" size="sm" asChild>
              <Link to="/admin/attendance/history">
                View all <ArrowRight />
              </Link>
            </Button>}>
          {recent.isLoading ? (<TableSkeleton rows={4} cols={6}/>) : recent.isError ? (<div className="p-5">
              <ErrorState title="Unable to load recent sessions" message={errorMessage(recent.error, "Failed to load recent attendance sessions.")} onRetry={() => void recent.refetch()}/>
            </div>) : recentSessions.length === 0 ? (<EmptyState title="No attendance sessions found" description="Recent sessions will appear here when attendance is started."/>) : (<Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Session</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Teacher</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Present</TableHead>
                  <TableHead className="text-right">Absent</TableHead>
                  <TableHead>Attendance</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentSessions.map((s) => (<TableRow key={s.sessionId}>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      #{s.sessionId}
                    </TableCell>
                    <TableCell>
                      <p className="font-semibold">{s.courseCode || "—"}</p>
                      <p className="text-xs text-muted-foreground">{s.courseName || ""}</p>
                    </TableCell>
                    <TableCell>{s.teacherName || "—"}</TableCell>
                    <TableCell className="whitespace-nowrap">
                      <p className="font-medium">{formatDate(s.attendanceDate)}</p>
                      <p className="text-xs text-muted-foreground">
                        Started {formatTime(s.startedAt)}
                      </p>
                    </TableCell>
                    <TableCell className="text-right font-mono">{s.presentCount ?? 0}</TableCell>
                    <TableCell className="text-right font-mono">{s.absentCount ?? 0}</TableCell>
                    <TableCell>
                      <AttendanceMeter value={sessionPercentage(s)} digits={2} className="[&>span]:w-16"/>
                    </TableCell>
                    <TableCell>
                      <SessionStatusBadge status={s.status}/>
                    </TableCell>
                  </TableRow>))}
              </TableBody>
            </Table>)}
        </Panel>
      </div>
    </Page>);
}
function Metric({ icon: Icon, label, value, hint, tone, }) {
    return (<div className="rounded-lg border bg-background p-3.5 transition-all duration-200 ease-in-out hover:border-slate-blue/30 hover:bg-card">
      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
        <Icon className={cn("size-4 text-slate-blue", tone === "success" && "text-success", tone === "destructive" && "text-destructive")}/>
        {label}
      </div>
      <p className="mt-1.5 font-mono text-xl font-semibold">{value ?? 0}</p>
      <p className="text-[0.6875rem] text-muted-foreground">{hint}</p>
    </div>);
}
function ServiceRow({ icon: Icon, name, detail, status, }) {
    return (<div className="flex items-center gap-3 rounded-lg border bg-background px-3 py-2.5">
      <Icon className="size-4 text-slate-blue"/>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">{name}</p>
        <p className="text-xs text-muted-foreground">{detail}</p>
      </div>
      {status === undefined ? (<Badge variant="muted">Checking…</Badge>) : status === "online" ? (<Badge variant="success">
          <span className="size-1.5 rounded-full bg-success"/> Online
        </Badge>) : status === "unknown" ? (<Badge variant="warning">Unknown</Badge>) : (<Badge variant="destructive">Offline</Badge>)}
    </div>);
}
