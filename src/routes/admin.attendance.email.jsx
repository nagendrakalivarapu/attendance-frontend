import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { AlertTriangle, CheckCircle2, Eye, Loader2, Mail, Send, Users, XCircle, Gauge, } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/components/ui/table";
import { AttendanceLinks } from "@/components/app/attendance-nav";
import { AttendanceMeter, Code, ConfirmDialog, ErrorState, Field, InlineAlert, NativeSelect, Page, PageHeader, Panel, StatCard, } from "@/components/app/primitives";
import { api, asArray, errorMessage } from "@/lib/api";
import { toNumber } from "@/lib/format";
import { pageHead } from "@/lib/seo";
export const Route = createFileRoute("/admin/attendance/email")({
    head: () => pageHead("Email Reports", "Send individualized attendance reports to students by section."),
    component: EmailReportsPage,
});
const SECTIONS = ["A", "B", "C", "D"];
function EmailReportsPage() {
    const [department, setDepartment] = React.useState("");
    const [semester, setSemester] = React.useState("");
    const [section, setSection] = React.useState("");
    const [courseId, setCourseId] = React.useState("");
    const [threshold, setThreshold] = React.useState(75);
    const [preview, setPreview] = React.useState(null);
    const [sendResult, setSendResult] = React.useState(null);
    const [error, setError] = React.useState("");
    const [success, setSuccess] = React.useState("");
    const [confirmOpen, setConfirmOpen] = React.useState(false);
    const courses = useQuery({
        queryKey: ["courses"],
        queryFn: async () => asArray(await api.get("/course")),
    });
    const all = courses.data ?? [];
    const departments = React.useMemo(() => [...new Set(all.map((c) => c.department).filter(Boolean))].sort(), [all]);
    const semesters = React.useMemo(() => [
        ...new Set(all
            .filter((c) => !department || c.department === department)
            .map((c) => c.semester)
            .filter((v) => v !== null && v !== undefined)),
    ].sort((a, b) => a - b), [all, department]);
    const filteredCourses = all.filter((c) => (!department || c.department === department) &&
        (!semester || String(c.semester) === semester));
    const clearResults = () => {
        setPreview(null);
        setSendResult(null);
        setSuccess("");
        setError("");
    };
    const body = () => ({
        courseId: Number(courseId),
        department,
        semester: Number(semester),
        section,
        threshold: Number(threshold),
    });
    const previewMutation = useMutation({
        mutationFn: () => api.post("/attendance-email/preview", body()),
        onMutate: () => {
            setError("");
            setSuccess("");
            setSendResult(null);
        },
        onSuccess: (data) => setPreview(data),
        onError: (err) => {
            setPreview(null);
            setError(errorMessage(err, "Unable to generate attendance preview."));
        },
    });
    const sendMutation = useMutation({
        mutationFn: () => api.post("/attendance-email/send", body()),
        onMutate: () => {
            setError("");
            setSuccess("");
            setSendResult(null);
        },
        onSuccess: (data) => {
            setSendResult(data);
            setSuccess(data?.failedCount === 0
                ? "Attendance reports sent successfully to all students."
                : "Attendance reports were processed. Some emails failed.");
        },
        onError: (err) => setError(errorMessage(err, "Unable to send attendance reports.")),
    });
    const handlePreview = () => {
        if (!department || !semester || !section || !courseId) {
            setError("Please select department, semester, section and course.");
            return;
        }
        previewMutation.mutate();
    };
    const handleSend = () => {
        if (!preview || preview.totalStudents === 0) {
            setError("There are no students available for this selection.");
            return;
        }
        setConfirmOpen(true);
    };
    return (<Page>
      <PageHeader eyebrow="Attendance" title="Attendance email reports" description="Send individualized attendance reports to students by section." actions={<AttendanceLinks current="/admin/attendance/email"/>}/>

      {courses.isError && (<ErrorState message={errorMessage(courses.error, "Unable to load courses.")} onRetry={() => void courses.refetch()}/>)}

      <Panel title="Report configuration" description="Select the class group and attendance threshold.">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Field label="Department" htmlFor="m-dept">
            <NativeSelect id="m-dept" value={department} disabled={courses.isLoading} onChange={(e) => {
            setDepartment(e.target.value);
            setSemester("");
            setSection("");
            setCourseId("");
            clearResults();
        }}>
              <option value="">Select department</option>
              {departments.map((d) => (<option key={d} value={d}>
                  {d}
                </option>))}
            </NativeSelect>
          </Field>
          <Field label="Semester" htmlFor="m-sem">
            <NativeSelect id="m-sem" value={semester} disabled={!department} onChange={(e) => {
            setSemester(e.target.value);
            setCourseId("");
            setSection("");
            clearResults();
        }}>
              <option value="">Select semester</option>
              {semesters.map((s) => (<option key={s} value={s}>
                  Semester {s}
                </option>))}
            </NativeSelect>
          </Field>
          <Field label="Course" htmlFor="m-course">
            <NativeSelect id="m-course" value={courseId} disabled={!department || !semester || courses.isLoading} onChange={(e) => {
            setCourseId(e.target.value);
            setSection("");
            clearResults();
        }}>
              <option value="">Select course</option>
              {filteredCourses.map((c) => (<option key={c.id} value={c.id}>
                  {c.courseCode} - {c.courseName}
                </option>))}
            </NativeSelect>
          </Field>
          <Field label="Section" htmlFor="m-section">
            <NativeSelect id="m-section" value={section} disabled={!courseId} onChange={(e) => {
            setSection(e.target.value);
            clearResults();
        }}>
              <option value="">Select section</option>
              {(courseId ? SECTIONS : []).map((s) => (<option key={s} value={s}>
                  Section {s}
                </option>))}
            </NativeSelect>
          </Field>
        </div>

        <div className="mt-5 grid items-end gap-4 border-t pt-5 md:grid-cols-[1fr_auto]">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-[0.8125rem] font-medium">Required attendance</label>
              <span className="rounded-md bg-primary-soft px-2 py-0.5 font-mono text-sm font-semibold text-primary">
                {threshold}%
              </span>
            </div>
            <Slider min={0} max={100} step={1} value={[threshold]} onValueChange={([v]) => {
            setThreshold(v ?? 0);
            setPreview(null);
            setSendResult(null);
            setSuccess("");
        }} aria-label="Required attendance"/>
          </div>
          <Button onClick={handlePreview} disabled={previewMutation.isPending || !department || !semester || !section || !courseId}>
            {previewMutation.isPending ? <Loader2 className="animate-spin"/> : <Eye />}
            {previewMutation.isPending ? "Generating preview…" : "Preview attendance"}
          </Button>
        </div>
      </Panel>

      {error && <InlineAlert tone="destructive">{error}</InlineAlert>}
      {success && <InlineAlert>{success}</InlineAlert>}

      {preview && (<div className="animate-rise space-y-4">
          <section className="flex flex-col gap-1 rounded-xl border bg-card p-5 shadow-panel">
            <div className="flex items-center gap-2">
              <Code>{preview.courseCode}</Code>
              <h2 className="text-lg font-bold">{preview.courseName}</h2>
            </div>
            <p className="text-sm text-muted-foreground">
              {preview.department} · Semester {preview.semester} · Section {preview.section}
            </p>
          </section>

          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard label="Total students" value={preview.totalStudents} icon={Users}/>
            <StatCard label="Good attendance" value={preview.goodAttendanceStudents ?? 0} icon={CheckCircle2} tone="success"/>
            <StatCard label="Low attendance" value={preview.lowAttendanceStudents ?? 0} icon={AlertTriangle} tone="destructive"/>
            <StatCard label="Required" value={`${preview.requiredPercentage ?? threshold}%`} icon={Gauge} tone="slate"/>
          </div>

          <Panel title="Students in this report" bodyClassName="p-0" actions={<Button onClick={handleSend} disabled={sendMutation.isPending || preview.totalStudents === 0}>
                {sendMutation.isPending ? <Loader2 className="animate-spin"/> : <Send />}
                {sendMutation.isPending
                    ? "Sending reports…"
                    : `Send reports to ${preview.totalStudents} students`}
              </Button>}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Registration</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Present</TableHead>
                  <TableHead className="text-right">Absent</TableHead>
                  <TableHead>Attendance</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {preview.students && preview.students.length > 0 ? (preview.students.map((s) => (<TableRow key={s.studentId}>
                      <TableCell className="font-semibold">{s.studentName}</TableCell>
                      <TableCell>
                        <Code>{s.registrationNumber}</Code>
                      </TableCell>
                      <TableCell className="text-xs">{s.email || "No email"}</TableCell>
                      <TableCell className="text-right font-mono">{s.totalSessions}</TableCell>
                      <TableCell className="text-right font-mono text-success">
                        {s.presentCount}
                      </TableCell>
                      <TableCell className="text-right font-mono text-destructive">
                        {s.absentCount}
                      </TableCell>
                      <TableCell>
                        <AttendanceMeter value={toNumber(s.attendancePercentage)} good={threshold}/>
                      </TableCell>
                      <TableCell>
                        {s.status === "LOW_ATTENDANCE" ? (<Badge variant="destructive">Low attendance</Badge>) : (<Badge variant="success">Good</Badge>)}
                      </TableCell>
                    </TableRow>))) : (<TableRow>
                    <TableCell colSpan={8} className="py-10 text-center text-sm text-muted-foreground">
                      No students found for the selected section.
                    </TableCell>
                  </TableRow>)}
              </TableBody>
            </Table>
          </Panel>
        </div>)}

      {sendResult && (<Panel title="Email delivery result" description={sendResult.message}>
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard label="Total" value={sendResult.totalStudents ?? 0} icon={Mail}/>
            <StatCard label="Sent" value={sendResult.sentCount ?? 0} icon={CheckCircle2} tone="success"/>
            <StatCard label="Failed" value={sendResult.failedCount ?? 0} icon={XCircle} tone="destructive"/>
          </div>
        </Panel>)}

      <ConfirmDialog open={confirmOpen} onOpenChange={setConfirmOpen} title="Send attendance reports?" description={`Send attendance reports to ${preview?.totalStudents ?? 0} student(s)?`} confirmLabel="Send reports" onConfirm={() => sendMutation.mutate()}/>
    </Page>);
}
