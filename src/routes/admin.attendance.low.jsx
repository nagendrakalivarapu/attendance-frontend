import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, CheckCircle2, FileBarChart, Gauge, Loader2, Percent, RefreshCw, } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/components/ui/table";
import { AttendanceLinks } from "@/components/app/attendance-nav";
import { AttendanceMeter, Code, EmptyState, ErrorState, Field, Initials, NativeSelect, Page, PageHeader, Panel, StatCard, TableSkeleton, } from "@/components/app/primitives";
import { api, asArray } from "@/lib/api";
import { toNumber } from "@/lib/format";
import { pageHead } from "@/lib/seo";
export const Route = createFileRoute("/admin/attendance/low")({
    head: () => pageHead("Low Attendance", "Identify students below the required attendance threshold."),
    component: LowAttendancePage,
});
const THRESHOLDS = [50, 60, 65, 70, 75, 80, 85, 90];
function LowAttendancePage() {
    const [courseId, setCourseId] = React.useState("");
    const [threshold, setThreshold] = React.useState(75);
    const [params, setParams] = React.useState(null);
    const courses = useQuery({
        queryKey: ["courses"],
        queryFn: async () => asArray(await api.get("/course")),
    });
    // Pick the first course and load its report straight away, like the original page.
    React.useEffect(() => {
        const first = courses.data?.[0];
        if (first && !courseId) {
            setCourseId(String(first.id));
            setParams({ courseId: String(first.id), threshold });
        }
    }, [courses.data, courseId, threshold]);
    const report = useQuery({
        queryKey: ["attendance", "low", params],
        enabled: !!params,
        queryFn: async () => asArray(await api.get(`/attendance/course/${params.courseId}/low-attendance`, {
            threshold: params.threshold,
        })),
    });
    const students = report.data ?? [];
    const shownThreshold = params?.threshold ?? threshold;
    const average = students.length > 0
        ? students.reduce((sum, s) => sum + toNumber(s.attendancePercentage), 0) / students.length
        : 0;
    const course = courses.data?.find((c) => String(c.id) === courseId);
    return (<Page>
      <PageHeader eyebrow="Attendance" title="Low attendance report" description="Identify students below the required attendance threshold." actions={<AttendanceLinks current="/admin/attendance/low"/>}/>

      <div className="grid items-end gap-3 rounded-xl border bg-card p-4 shadow-panel md:grid-cols-[1fr_200px_auto_auto]">
        <Field label="Course" htmlFor="l-course">
          <NativeSelect id="l-course" value={courseId} onChange={(e) => {
            setCourseId(e.target.value);
            if (e.target.value)
                setParams({ courseId: e.target.value, threshold });
        }} disabled={courses.isLoading}>
            {courses.isLoading ? (<option>Loading courses…</option>) : ((courses.data ?? []).map((c) => (<option key={c.id} value={c.id}>
                  {c.courseCode} - {c.courseName}
                </option>)))}
          </NativeSelect>
        </Field>
        <Field label="Attendance threshold" htmlFor="l-threshold">
          <NativeSelect id="l-threshold" value={threshold} onChange={(e) => setThreshold(Number(e.target.value))}>
            {THRESHOLDS.map((t) => (<option key={t} value={t}>
                Below {t}%
              </option>))}
          </NativeSelect>
        </Field>
        <Button onClick={() => courseId && setParams({ courseId, threshold })} disabled={!courseId || report.isFetching}>
          {report.isFetching ? <Loader2 className="animate-spin"/> : <FileBarChart />}
          {report.isFetching ? "Loading…" : "Generate report"}
        </Button>
        <Button variant="outline" onClick={() => void courses.refetch()} disabled={courses.isFetching}>
          <RefreshCw /> Refresh
        </Button>
      </div>

      {courses.isError && (<ErrorState message="Failed to load courses." onRetry={() => void courses.refetch()}/>)}
      {report.isError && (<ErrorState message="Failed to load low attendance report." onRetry={() => void report.refetch()}/>)}

      {course && (<section className="flex flex-col justify-between gap-4 rounded-xl border bg-card p-5 shadow-panel sm:flex-row sm:items-center">
          <div className="space-y-1.5">
            <Code>{course.courseCode}</Code>
            <h2 className="text-xl font-bold">{course.courseName}</h2>
            <p className="text-sm text-muted-foreground">
              {course.department} · Semester {course.semester}
            </p>
          </div>
          <div className="rounded-lg bg-primary px-5 py-4 text-primary-foreground">
            <p className="text-xs text-primary-foreground/70">Required attendance</p>
            <p className="font-mono text-3xl font-semibold">{shownThreshold}%</p>
          </div>
        </section>)}

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Low attendance students" value={students.length} icon={AlertTriangle} tone="destructive" loading={report.isLoading}/>
        <StatCard label="Average of flagged students" value={`${average.toFixed(2)}%`} icon={Percent} tone="warning" loading={report.isLoading}/>
        <StatCard label="Attendance threshold" value={`${shownThreshold}%`} icon={Gauge} tone="slate"/>
      </div>

      <Panel title="Students requiring attention" description={`Students whose attendance is below ${shownThreshold}%.`} actions={<Badge variant="destructive">
            {students.length} student{students.length !== 1 ? "s" : ""}
          </Badge>} bodyClassName="p-0">
        {report.isLoading ? (<TableSkeleton rows={4} cols={6}/>) : students.length === 0 ? (<EmptyState icon={CheckCircle2} title="No low attendance students" description="All students in this course are meeting the selected attendance threshold."/>) : (<Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Registration no.</TableHead>
                <TableHead className="text-right">Total sessions</TableHead>
                <TableHead className="text-right">Present</TableHead>
                <TableHead className="text-right">Absent</TableHead>
                <TableHead>Attendance</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((s) => {
                const pct = toNumber(s.attendancePercentage);
                return (<TableRow key={s.studentId}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Initials text={s.studentName?.charAt(0).toUpperCase() || "S"} className="bg-destructive-soft text-destructive"/>
                        <span className="font-semibold">{s.studentName}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Code>{s.registrationNumber}</Code>
                    </TableCell>
                    <TableCell className="text-right font-mono">{s.totalSessions}</TableCell>
                    <TableCell className="text-right font-mono text-success">
                      {s.presentCount}
                    </TableCell>
                    <TableCell className="text-right font-mono text-destructive">
                      {s.absentCount}
                    </TableCell>
                    <TableCell>
                      {/* Below 50% is critical, 50–60% warning, otherwise low. */}
                      <AttendanceMeter value={pct} good={101} warn={50} digits={2}/>
                    </TableCell>
                    <TableCell>
                      <Badge variant="destructive">Low attendance</Badge>
                    </TableCell>
                  </TableRow>);
            })}
            </TableBody>
          </Table>)}
      </Panel>
    </Page>);
}
