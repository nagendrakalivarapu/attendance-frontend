import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowRight, BookOpen, CircleDot, Clock, Loader2, Play, RefreshCw, Square, Users, } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CardGridSkeleton, Code, ConfirmDialog, EmptyState, ErrorState, Page, PageHeader, Panel, StatCard, } from "@/components/app/primitives";
import { TeacherHistoryTable, useTeacherHistory } from "@/components/app/teacher-history";
import { api, asArray, errorMessage } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { formatTime } from "@/lib/format";
import { pageHead } from "@/lib/seo";
import { cn } from "@/lib/utils";
export const Route = createFileRoute("/teacher/")({
    head: () => pageHead("Teacher Dashboard", "Your courses, enrolled students and live attendance sessions."),
    component: TeacherDashboard,
});
function TeacherDashboard() {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const history = useTeacherHistory();
    const [closing, setClosing] = React.useState(null);
    const data = useQuery({
        queryKey: ["teacher", "courses"],
        queryFn: async () => {
            const courses = asArray(await api.get("/course/my-courses"));
            const students = {};
            const sessions = {};
            await Promise.all(courses.map(async (course) => {
                try {
                    students[course.id] = asArray(await api.get(`/enrollment/course/${course.id}`));
                }
                catch {
                    students[course.id] = [];
                }
                try {
                    const session = await api.get(`/attendance-sessions/course/${course.id}/open`);
                    if (session?.status === "OPEN" && session.courseId === course.id)
                        sessions[course.id] = session;
                }
                catch {
                    // No open attendance session for this course.
                }
            }));
            return { courses, students, sessions };
        },
    });
    const start = useMutation({
        mutationFn: (courseId) => api.post("/attendance-sessions", { courseId }),
        onSuccess: (session, courseId) => {
            toast.success("Attendance session started.");
            queryClient.setQueryData(["teacher", "courses"], (prev) => prev ? { ...prev, sessions: { ...prev.sessions, [courseId]: session } } : prev);
            void queryClient.invalidateQueries({ queryKey: ["attendance-sessions", "my-history"] });
        },
        onError: (err) => toast.error(errorMessage(err, "Failed to start attendance session.")),
    });
    const close = useMutation({
        mutationFn: (sessionId) => api.put(`/attendance-sessions/${sessionId}/close`),
        onSuccess: () => {
            toast.success("Attendance session closed successfully.");
            void queryClient.invalidateQueries({ queryKey: ["teacher", "courses"] });
            void queryClient.invalidateQueries({ queryKey: ["attendance-sessions", "my-history"] });
        },
        onError: (err) => toast.error(errorMessage(err, "Failed to close attendance session.")),
    });
    const courses = data.data?.courses ?? [];
    const sessions = data.data?.sessions ?? {};
    const studentsBy = data.data?.students ?? {};
    const openCount = Object.keys(sessions).length;
    const totalStudents = Object.values(studentsBy).reduce((n, list) => n + list.length, 0);
    return (<Page>
      <PageHeader eyebrow="Teacher dashboard" title="My courses" description={<>Welcome, {user?.email}. Start or close attendance for your assigned courses.</>} actions={<Button variant="outline" onClick={() => void data.refetch()} disabled={data.isFetching}>
            <RefreshCw className={data.isFetching ? "animate-spin" : ""}/> Refresh
          </Button>}/>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Assigned courses" value={courses.length} icon={BookOpen} loading={data.isLoading}/>
        <StatCard label="Enrolled students" value={totalStudents} icon={Users} tone="slate" loading={data.isLoading}/>
        <StatCard label="Live sessions" value={openCount} icon={CircleDot} tone="success" loading={data.isLoading}/>
      </div>

      {data.isLoading ? (<CardGridSkeleton count={3}/>) : data.isError ? (<ErrorState message={errorMessage(data.error, "Failed to load your courses.")} onRetry={() => void data.refetch()}/>) : courses.length === 0 ? (<Panel>
          <EmptyState icon={BookOpen} title="No courses have been assigned to you."/>
        </Panel>) : (<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {courses.map((course) => {
                const students = studentsBy[course.id] ?? [];
                const session = sessions[course.id];
                const isOpen = session?.status === "OPEN";
                return (<article key={course.id} className={cn("flex flex-col rounded-xl border bg-card shadow-panel transition-all duration-200 ease-in-out hover:shadow-raised", isOpen && "border-success/40 ring-2 ring-success/15")}>
                <div className="space-y-3 p-5">
                  <div className="flex items-center justify-between">
                    <Code>{course.courseCode}</Code>
                    <Badge variant="muted">Semester {course.semester}</Badge>
                  </div>
                  <h3 className="text-lg font-bold leading-snug">{course.courseName}</h3>
                  <dl className="grid grid-cols-3 gap-2 rounded-lg bg-background p-3 text-center">
                    {[
                        ["Department", course.department],
                        ["Credits", course.credits],
                        ["Classes", course.totalClasses],
                    ].map(([label, value]) => (<div key={label}>
                        <dt className="text-[0.6875rem] text-muted-foreground">{label}</dt>
                        <dd className="font-mono text-sm font-semibold">{value ?? "—"}</dd>
                      </div>))}
                  </dl>
                </div>

                <div className="flex-1 border-t px-5 py-4">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-sm font-semibold">Students</p>
                    <Badge variant="info">{students.length}</Badge>
                  </div>
                  {students.length > 0 ? (<ul className="max-h-44 space-y-1 overflow-y-auto pr-1">
                      {students.map((e) => (<li key={e.id} className="flex items-center justify-between gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-secondary">
                          <span className="min-w-0">
                            <span className="block truncate font-medium">{e.studentName}</span>
                            <span className="block font-mono text-[0.6875rem] text-muted-foreground">
                              {e.registrationNumber}
                            </span>
                          </span>
                          <Badge variant={e.status === "ACTIVE" ? "success" : "muted"}>
                            {e.status}
                          </Badge>
                        </li>))}
                    </ul>) : (<p className="py-3 text-sm text-muted-foreground">
                      No students enrolled in this course.
                    </p>)}
                </div>

                <div className="border-t p-4">
                  {isOpen ? (<div className="space-y-3">
                      <div className="flex items-center justify-between rounded-lg bg-success-soft px-3 py-2 text-sm">
                        <span className="flex items-center gap-2 font-semibold text-success">
                          <span className="size-2 animate-pulse rounded-full bg-success"/>{" "}
                          Attendance open
                        </span>
                        <span className="flex items-center gap-1 text-xs text-foreground/70">
                          <Clock className="size-3.5"/> {formatTime(session.startedAt)}
                        </span>
                      </div>
                      <Button variant="destructive" className="w-full" onClick={() => setClosing(course)} disabled={close.isPending}>
                        {close.isPending && close.variables === session.id ? (<Loader2 className="animate-spin"/>) : (<Square />)}
                        Close attendance
                      </Button>
                    </div>) : (<Button className="w-full" onClick={() => start.mutate(course.id)} disabled={students.length === 0 || (start.isPending && start.variables === course.id)}>
                      {start.isPending && start.variables === course.id ? (<Loader2 className="animate-spin"/>) : (<Play />)}
                      Start attendance
                    </Button>)}
                </div>
              </article>);
            })}
        </div>)}

      <Panel id="teacher-attendance-history" title="Recent attendance history" description="Your latest completed and active attendance sessions." bodyClassName="p-0" actions={<Button variant="outline" size="sm" asChild>
            <Link to="/teacher/history">
              View all <ArrowRight />
            </Link>
          </Button>}>
        <TeacherHistoryTable sessions={(history.data ?? []).slice(0, 20)} isLoading={history.isLoading} error={history.error} onRetry={() => void history.refetch()}/>
      </Panel>

      <ConfirmDialog open={closing !== null} onOpenChange={(o) => !o && setClosing(null)} title="Close attendance session?" description={`Students in ${closing?.courseCode ?? "this course"} will no longer be able to mark attendance.`} confirmLabel="Close attendance" destructive onConfirm={() => {
            const session = closing ? sessions[closing.id] : undefined;
            if (session)
                close.mutate(session.id);
        }}/>
    </Page>);
}
