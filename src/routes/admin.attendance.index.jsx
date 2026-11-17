import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, BarChart3, CheckCircle2, FileBarChart, Layers, Loader2, RefreshCw, Users, XCircle, } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/components/ui/table";
import { AttendanceLinks } from "@/components/app/attendance-nav";
import { AttendanceMeter, Code, EmptyState, ErrorState, Field, Initials, NativeSelect, Page, PageHeader, Panel, StatCard, TableSkeleton, } from "@/components/app/primitives";
import { api, asArray, errorMessage } from "@/lib/api";
import { initials, toNumber } from "@/lib/format";
import { pageHead } from "@/lib/seo";
export const Route = createFileRoute("/admin/attendance/")({
    head: () => pageHead("Attendance Reports", "Analyze course-wise student attendance performance."),
    component: ReportsPage,
});
const THRESHOLDS = [60, 65, 70, 75, 80, 85, 90];
function ReportsPage() {
    const [courseId, setCourseId] = React.useState("");
    const [threshold, setThreshold] = React.useState(75);
    const [params, setParams] = React.useState(null);
    const courses = useQuery({
        queryKey: ["courses"],
        queryFn: async () => asArray(await api.get("/course")),
    });
    React.useEffect(() => {
        const first = courses.data?.[0];
        if (first && !courseId)
            setCourseId(String(first.id));
    }, [courses.data, courseId]);
    const report = useQuery({
        queryKey: ["attendance", "course-report", params],
        enabled: !!params,
        queryFn: async () => {
            const p = params;
            const [analytics, students] = await Promise.all([
                api.get(`/attendance/course/${p.courseId}/analytics`, {
                    threshold: p.threshold,
                }),
                api.get(`/attendance/course/${p.courseId}/student-report`, { threshold: p.threshold }),
            ]);
            return { analytics, students: asArray(students) };
        },
    });
    const generate = () => courseId && setParams({ courseId, threshold });
    const shownThreshold = params?.threshold ?? threshold;
    const analytics = report.data?.analytics;
    const students = report.data?.students ?? [];
    const low = students.filter((s) => s.status === "LOW_ATTENDANCE").length;
    const good = students.filter((s) => s.status === "GOOD").length;
    const selectedCourse = courses.data?.find((c) => String(c.id) === String(params?.courseId));
    return (<Page>
      <PageHeader eyebrow="Attendance" title="Attendance reports" description="Analyze course-wise student attendance performance." actions={<AttendanceLinks current="/admin/attendance"/>}/>

      <div className="grid items-end gap-3 rounded-xl border bg-card p-4 shadow-panel md:grid-cols-[1fr_200px_auto_auto]">
        <Field label="Course" htmlFor="r-course">
          <NativeSelect id="r-course" value={courseId} onChange={(e) => {
            setCourseId(e.target.value);
            setParams(null);
        }} disabled={courses.isLoading}>
            <option value="">{courses.isLoading ? "Loading courses…" : "Select a course"}</option>
            {(courses.data ?? []).map((c) => (<option key={c.id} value={c.id}>
                {c.courseCode} - {c.courseName}
              </option>))}
          </NativeSelect>
        </Field>
        <Field label="Required attendance" htmlFor="r-threshold">
          <NativeSelect id="r-threshold" value={threshold} onChange={(e) => setThreshold(Number(e.target.value))}>
            {THRESHOLDS.map((t) => (<option key={t} value={t}>
                {t}%
              </option>))}
          </NativeSelect>
        </Field>
        <Button onClick={generate} disabled={!courseId || report.isFetching}>
          {report.isFetching ? <Loader2 className="animate-spin"/> : <FileBarChart />}
          {report.isFetching ? "Loading…" : "Generate report"}
        </Button>
        <Button variant="outline" onClick={() => {
            void courses.refetch();
            if (params)
                void report.refetch();
        }} disabled={courses.isFetching || report.isFetching}>
          <RefreshCw /> Refresh
        </Button>
      </div>

      {(courses.isError || report.isError) && (<ErrorState title="Unable to load report" message={errorMessage(courses.error || report.error, "Failed to load attendance report.")}/>)}

      {!params && !courses.isLoading && (<Panel>
          <EmptyState icon={BarChart3} title="Select a course" description="Choose a course above and generate a report to view detailed attendance analytics and student performance."/>
        </Panel>)}

      {params && report.isLoading && (<Panel>
          <TableSkeleton rows={5} cols={6}/>
        </Panel>)}

      {analytics && !report.isLoading && (<div className="grid gap-4 lg:grid-cols-12">
          <section className="flex flex-col justify-between gap-4 rounded-xl border bg-card p-5 shadow-panel sm:flex-row sm:items-center lg:col-span-12">
            <div className="space-y-1.5">
              <Code>{analytics.courseCode}</Code>
              <h2 className="text-xl font-bold">{analytics.courseName}</h2>
              <p className="text-sm text-muted-foreground">
                Required attendance:{" "}
                <span className="font-semibold text-foreground">{shownThreshold}%</span>
              </p>
            </div>
            <div className="min-w-[220px] rounded-lg bg-primary px-5 py-4 text-primary-foreground">
              <p className="text-xs text-primary-foreground/70">Overall attendance</p>
              <p className="font-mono text-3xl font-semibold">
                {analytics.averageAttendancePercentage ?? 0}%
              </p>
            </div>
          </section>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:col-span-12 xl:grid-cols-5">
            <StatCard label="Total students" value={analytics.totalStudents ?? 0} icon={Users}/>
            <StatCard label="Closed sessions" value={analytics.totalSessions ?? 0} icon={Layers} tone="slate"/>
            <StatCard label="Present" value={analytics.totalPresent ?? 0} icon={CheckCircle2} tone="success"/>
            <StatCard label="Absent" value={analytics.totalAbsent ?? 0} icon={XCircle} tone="destructive"/>
            <StatCard label="Low attendance" value={analytics.lowAttendanceStudents ?? 0} icon={AlertTriangle} tone="warning"/>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:col-span-12">
            <StatCard label="Students meeting requirement" value={good} icon={CheckCircle2} tone="success"/>
            <StatCard label="Students below requirement" value={low} icon={AlertTriangle} tone="destructive"/>
          </div>

          <Panel className="lg:col-span-12" title="Student attendance report" description={`Individual attendance performance for ${selectedCourse?.courseName || analytics.courseName}`} actions={<Badge variant="info">{students.length} students</Badge>} bodyClassName="p-0">
            {students.length === 0 ? (<EmptyState title="No student records" description="There are no enrolled students or attendance records for this course."/>) : (<Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Registration no.</TableHead>
                    <TableHead className="text-right">Sessions</TableHead>
                    <TableHead className="text-right">Present</TableHead>
                    <TableHead className="text-right">Absent</TableHead>
                    <TableHead>Attendance</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((s) => (<TableRow key={s.studentId}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Initials text={initials(s.studentName)}/>
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
                        <AttendanceMeter value={toNumber(s.attendancePercentage)} good={shownThreshold}/>
                      </TableCell>
                      <TableCell>
                        {s.status === "LOW_ATTENDANCE" ? (<Badge variant="destructive">Low attendance</Badge>) : (<Badge variant="success">Good</Badge>)}
                      </TableCell>
                    </TableRow>))}
                </TableBody>
              </Table>)}
          </Panel>
        </div>)}
    </Page>);
}
