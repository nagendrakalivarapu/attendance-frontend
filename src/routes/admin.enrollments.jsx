import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, ClipboardList, Loader2, Plus, RefreshCw, Search, Trash2, UserPlus, CircleSlash, } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/components/ui/table";
import { Code, ConfirmDialog, EmptyState, ErrorState, Field, NativeSelect, Page, PageHeader, Panel, StatCard, TableSkeleton, useConfirm, } from "@/components/app/primitives";
import { api, asArray, errorMessage } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { pageHead } from "@/lib/seo";
import { cn } from "@/lib/utils";
export const Route = createFileRoute("/admin/enrollments")({
    head: () => pageHead("Enrollments", "Manage student course enrollments."),
    component: EnrollmentsPage,
});
function statusVariant(status) {
    if (status === "ACTIVE")
        return "success";
    if (status === "COMPLETED")
        return "info";
    if (status === "DROPPED")
        return "destructive";
    return "muted";
}
function EnrollmentsPage() {
    const queryClient = useQueryClient();
    const [search, setSearch] = React.useState("");
    const [statusFilter, setStatusFilter] = React.useState("ALL");
    const [open, setOpen] = React.useState(false);
    const [courseId, setCourseId] = React.useState("");
    const [studentSearch, setStudentSearch] = React.useState("");
    const [selected, setSelected] = React.useState([]);
    const [enrolling, setEnrolling] = React.useState(false);
    const confirm = useConfirm();
    const data = useQuery({
        queryKey: ["enrollments", "with-lookups"],
        queryFn: async () => {
            const [enrollments, students, courses] = await Promise.all([
                api.get("/enrollment"),
                api.get("/student"),
                api.get("/course"),
            ]);
            return {
                enrollments: asArray(enrollments),
                students: asArray(students),
                courses: asArray(courses),
            };
        },
    });
    const refresh = () => queryClient.invalidateQueries({ queryKey: ["enrollments"] });
    const setStatus = useMutation({
        mutationFn: ({ id, status }) => api.put(`/enrollment/${id}/status`, undefined, { status }),
        onSuccess: () => void refresh(),
        onError: (err) => toast.error(errorMessage(err, "Failed to update enrollment status.")),
    });
    const remove = useMutation({
        mutationFn: (e) => api.delete(`/enrollment/${e.id}`),
        onSuccess: () => {
            toast.success("Enrollment deleted successfully.");
            void refresh();
        },
        onError: (err) => toast.error(errorMessage(err, "Failed to delete enrollment.")),
    });
    const enrollments = data.data?.enrollments ?? [];
    const students = data.data?.students ?? [];
    const courses = data.data?.courses ?? [];
    const q = search.toLowerCase();
    const filtered = enrollments.filter((e) => [e.studentName, e.registrationNumber, e.courseCode, e.courseName].some((v) => v?.toLowerCase().includes(q)) &&
        (statusFilter === "ALL" || e.status === statusFilter));
    const sq = studentSearch.toLowerCase();
    const filteredStudents = students.filter((s) => [s.studentName, s.registrationNumber, s.email].some((v) => v?.toLowerCase().includes(sq)));
    const allFilteredSelected = filteredStudents.length > 0 && filteredStudents.every((s) => selected.includes(s.id));
    const toggleAll = () => {
        const ids = filteredStudents.map((s) => s.id);
        setSelected((prev) => allFilteredSelected
            ? prev.filter((id) => !ids.includes(id))
            : [...new Set([...prev, ...ids])]);
    };
    const openAdd = () => {
        setCourseId("");
        setStudentSearch("");
        setSelected([]);
        setOpen(true);
    };
    const submit = async (event) => {
        event.preventDefault();
        if (!courseId)
            return void toast.error("Please select a course.");
        if (selected.length === 0)
            return void toast.error("Please select at least one student.");
        setEnrolling(true);
        let ok = 0;
        let failed = 0;
        // One request per student, matching the server's enrollment endpoint.
        for (const studentId of selected) {
            try {
                await api.post("/enrollment", { studentId: Number(studentId), courseId: Number(courseId) });
                ok++;
            }
            catch {
                failed++;
            }
        }
        setEnrolling(false);
        if (failed === 0)
            toast.success(`${ok} student(s) enrolled successfully.`);
        else
            toast.warning(`${ok} student(s) enrolled successfully. ${failed} student(s) could not be enrolled.`);
        setOpen(false);
        setSelected([]);
        void refresh();
    };
    const activeCount = enrollments.filter((e) => e.status === "ACTIVE").length;
    const selectedCourse = courses.find((c) => String(c.id) === courseId);
    return (<Page>
      <PageHeader eyebrow="Academics" title="Enrollments" description="Manage student course enrollments." actions={<>
            <Button variant="outline" onClick={() => void data.refetch()} disabled={data.isFetching}>
              <RefreshCw className={data.isFetching ? "animate-spin" : ""}/> Refresh
            </Button>
            <Button onClick={openAdd}>
              <Plus /> Enroll students
            </Button>
          </>}/>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total enrollments" value={enrollments.length} icon={ClipboardList} loading={data.isLoading}/>
        <StatCard label="Active" value={activeCount} icon={CheckCircle2} tone="success" loading={data.isLoading}/>
        <StatCard label="Other status" value={enrollments.length - activeCount} icon={CircleSlash} tone="slate" loading={data.isLoading}/>
      </div>

      <Panel title="All enrollments" bodyClassName="p-0" actions={<div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <div className="relative sm:w-72">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"/>
              <Input placeholder="Search student, registration, course…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" aria-label="Search enrollments"/>
            </div>
            <NativeSelect value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="sm:w-40" aria-label="Status">
              <option value="ALL">All status</option>
              <option value="ACTIVE">Active</option>
              <option value="DROPPED">Dropped</option>
              <option value="COMPLETED">Completed</option>
            </NativeSelect>
          </div>}>
        {data.isLoading ? (<TableSkeleton rows={6} cols={6}/>) : data.isError ? (<div className="p-5">
            <ErrorState message={errorMessage(data.error, "Failed to load enrollment data.")} onRetry={() => void data.refetch()}/>
          </div>) : filtered.length === 0 ? (<EmptyState icon={ClipboardList} title="No enrollments found" description="Enroll students into courses to get started."/>) : (<Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Registration no.</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Enrolled</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((e) => (<TableRow key={e.id}>
                  <TableCell className="font-semibold">{e.studentName}</TableCell>
                  <TableCell>
                    <Code>{e.registrationNumber}</Code>
                  </TableCell>
                  <TableCell>
                    <p className="font-semibold">{e.courseCode}</p>
                    <p className="text-xs text-muted-foreground">{e.courseName}</p>
                  </TableCell>
                  <TableCell>{formatDate(e.enrollmentDate)}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariant(e.status)}>{e.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      <NativeSelect value={e.status} onChange={(ev) => setStatus.mutate({ id: e.id, status: ev.target.value })} className="h-8 w-32 text-xs" aria-label="Change status">
                        <option value="ACTIVE">Active</option>
                        <option value="COMPLETED">Completed</option>
                        {e.status === "DROPPED" && <option value="DROPPED">Dropped</option>}
                      </NativeSelect>
                      <Button variant="destructive-ghost" size="icon-sm" aria-label="Delete enrollment" onClick={() => confirm.ask(e)}>
                        <Trash2 />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>))}
            </TableBody>
          </Table>)}
      </Panel>

      <Dialog open={open} onOpenChange={(o) => !enrolling && setOpen(o)}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Enroll students</DialogTitle>
            <DialogDescription>
              Select multiple students and enroll them into a course.
            </DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={submit}>
            <Field label="Course" htmlFor="e-course" required>
              <NativeSelect id="e-course" value={courseId} onChange={(e) => setCourseId(e.target.value)} required>
                <option value="">Select course</option>
                {courses.map((c) => (<option key={c.id} value={c.id}>
                    {c.courseCode} — {c.courseName}
                  </option>))}
              </NativeSelect>
            </Field>
            <Field label="Search students" htmlFor="e-search">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"/>
                <Input id="e-search" placeholder="Search by name, registration number or email…" value={studentSearch} onChange={(e) => setStudentSearch(e.target.value)} className="pl-9"/>
              </div>
            </Field>

            <div className="overflow-hidden rounded-lg border">
              <div className="flex items-center justify-between border-b bg-muted/60 px-3 py-2">
                <p className="text-sm font-semibold">
                  Select students{" "}
                  <span className="font-normal text-muted-foreground">
                    · {selected.length} selected
                  </span>
                </p>
                <Button type="button" variant="ghost" size="sm" onClick={toggleAll}>
                  {allFilteredSelected ? "Deselect all" : "Select all"}
                </Button>
              </div>
              <div className="max-h-72 divide-y overflow-y-auto">
                {filteredStudents.length === 0 ? (<p className="p-6 text-center text-sm text-muted-foreground">
                    No students found.
                  </p>) : (filteredStudents.map((s) => {
            const checked = selected.includes(s.id);
            return (<label key={s.id} className={cn("flex cursor-pointer items-center gap-3 px-3 py-2.5 transition-all duration-200 ease-in-out hover:bg-primary-soft/60", checked && "bg-primary-soft")}>
                        <Checkbox checked={checked} onCheckedChange={() => setSelected((prev) => prev.includes(s.id)
                    ? prev.filter((id) => id !== s.id)
                    : [...prev, s.id])}/>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold">{s.studentName}</p>
                          <p className="text-xs text-muted-foreground">
                            {s.registrationNumber} · {s.department} · Semester {s.semester}
                          </p>
                        </div>
                      </label>);
        }))}
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              {selected.length} student{selected.length !== 1 ? "s" : ""} selected
              {selectedCourse && <> · Course: {selectedCourse.courseCode}</>}
            </p>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={enrolling}>
                Cancel
              </Button>
              <Button type="submit" disabled={enrolling || selected.length === 0 || !courseId}>
                {enrolling ? <Loader2 className="animate-spin"/> : <UserPlus />}
                {enrolling
            ? "Enrolling…"
            : `Enroll ${selected.length} student${selected.length !== 1 ? "s" : ""}`}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog {...confirm.dialogProps} title="Delete enrollment?" description={`Remove ${confirm.target?.studentName || "this student"} from ${confirm.target?.courseCode || "this course"}?`} confirmLabel="Delete" destructive onConfirm={() => confirm.target && remove.mutate(confirm.target)}/>
    </Page>);
}
