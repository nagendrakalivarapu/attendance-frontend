import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BookOpen, Loader2, Pencil, Plus, RefreshCw, Search, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/components/ui/table";
import { Code, ConfirmDialog, EmptyState, ErrorState, Field, Initials, NativeSelect, Page, PageHeader, Panel, TableSkeleton, useConfirm, } from "@/components/app/primitives";
import { api, asArray, errorMessage } from "@/lib/api";
import { pageHead } from "@/lib/seo";
export const Route = createFileRoute("/admin/courses")({
    head: () => pageHead("Courses", "Create and manage courses and teacher assignments."),
    component: CoursesPage,
});
const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8];
const emptyForm = {
    courseCode: "",
    courseName: "",
    department: "",
    semester: "",
    credits: "",
    totalClasses: "",
    teacherId: "",
};
function teacherLabel(t) {
    return t.teacherName || t.fullName || t.name || `Teacher #${t.id}`;
}
function CoursesPage() {
    const queryClient = useQueryClient();
    const [open, setOpen] = React.useState(false);
    const [editing, setEditing] = React.useState(null);
    const [form, setForm] = React.useState(emptyForm);
    const [search, setSearch] = React.useState("");
    const [teacherFilter, setTeacherFilter] = React.useState("");
    const [semesterFilter, setSemesterFilter] = React.useState("");
    const [departmentFilter, setDepartmentFilter] = React.useState("");
    const confirm = useConfirm();
    const courses = useQuery({
        queryKey: ["courses"],
        queryFn: async () => asArray(await api.get("/course")),
    });
    const teachers = useQuery({
        queryKey: ["teachers"],
        queryFn: async () => asArray(await api.get("/teacher")),
    });
    const save = useMutation({
        mutationFn: async () => {
            const body = {
                courseCode: form.courseCode,
                courseName: form.courseName,
                department: form.department,
                semester: Number(form.semester),
                credits: Number(form.credits),
                totalClasses: Number(form.totalClasses),
                teacherId: form.teacherId ? Number(form.teacherId) : null,
            };
            if (editing)
                await api.put(`/course/${editing.id}`, body);
            else
                await api.post("/course", body);
        },
        onSuccess: () => {
            toast.success(editing ? "Course updated." : "Course created.");
            setOpen(false);
            setEditing(null);
            setForm(emptyForm);
            void queryClient.invalidateQueries({ queryKey: ["courses"] });
        },
        onError: (err) => toast.error(errorMessage(err, `Failed to ${editing ? "update" : "create"} course.`)),
    });
    const remove = useMutation({
        mutationFn: (c) => api.delete(`/course/${c.id}`),
        onSuccess: () => {
            toast.success("Course deleted.");
            void queryClient.invalidateQueries({ queryKey: ["courses"] });
        },
        onError: (err) => toast.error(errorMessage(err, "Failed to delete course.")),
    });
    const openAdd = () => {
        setEditing(null);
        setForm(emptyForm);
        setOpen(true);
    };
    const openEdit = (c) => {
        setEditing(c);
        setForm({
            courseCode: c.courseCode || "",
            courseName: c.courseName || "",
            department: c.department || "",
            semester: c.semester != null ? String(c.semester) : "",
            credits: c.credits != null ? String(c.credits) : "",
            totalClasses: c.totalClasses != null ? String(c.totalClasses) : "",
            teacherId: c.teacherId != null ? String(c.teacherId) : "",
        });
        setOpen(true);
    };
    const change = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    const all = courses.data ?? [];
    const teacherList = teachers.data ?? [];
    const departments = React.useMemo(() => [...new Set(all.map((c) => c.department).filter(Boolean))].sort(), [all]);
    const filtered = React.useMemo(() => {
        const q = search.trim().toLowerCase();
        return all.filter((c) => (!q ||
            c.courseCode?.toLowerCase().includes(q) ||
            c.courseName?.toLowerCase().includes(q)) &&
            (!teacherFilter || String(c.teacherId) === teacherFilter) &&
            (!semesterFilter || String(c.semester) === semesterFilter) &&
            (!departmentFilter || c.department === departmentFilter));
    }, [all, search, teacherFilter, semesterFilter, departmentFilter]);
    const hasFilters = search || teacherFilter || semesterFilter || departmentFilter;
    const loadError = courses.error || teachers.error;
    return (<Page>
      <PageHeader eyebrow="Academics" title="Courses" description="Create and manage courses." actions={<>
            <Button variant="outline" onClick={() => void courses.refetch()} disabled={courses.isFetching}>
              <RefreshCw className={courses.isFetching ? "animate-spin" : ""}/> Refresh
            </Button>
            <Button onClick={openAdd}>
              <Plus /> Add course
            </Button>
          </>}/>

      {loadError && (<ErrorState message={errorMessage(loadError, "Failed to load courses.")} onRetry={() => void courses.refetch()}/>)}

      <div className="grid gap-3 rounded-xl border bg-card p-4 shadow-panel md:grid-cols-[1fr_repeat(3,minmax(0,180px))_auto]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"/>
          <Input placeholder="Search by course code or course name…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" aria-label="Search courses"/>
        </div>
        <NativeSelect value={teacherFilter} onChange={(e) => setTeacherFilter(e.target.value)} aria-label="Teacher">
          <option value="">All teachers</option>
          {teacherList.map((t) => (<option key={t.id} value={t.id}>
              {teacherLabel(t)}
            </option>))}
        </NativeSelect>
        <NativeSelect value={semesterFilter} onChange={(e) => setSemesterFilter(e.target.value)} aria-label="Semester">
          <option value="">All semesters</option>
          {SEMESTERS.map((s) => (<option key={s} value={s}>
              Semester {s}
            </option>))}
        </NativeSelect>
        <NativeSelect value={departmentFilter} onChange={(e) => setDepartmentFilter(e.target.value)} aria-label="Department">
          <option value="">All departments</option>
          {departments.map((d) => (<option key={d} value={d}>
              {d}
            </option>))}
        </NativeSelect>
        <Button variant="ghost" disabled={!hasFilters} onClick={() => {
            setSearch("");
            setTeacherFilter("");
            setSemesterFilter("");
            setDepartmentFilter("");
        }}>
          <X /> Clear
        </Button>
      </div>

      <Panel title="All courses" description={`Showing ${filtered.length} of ${all.length} courses`} bodyClassName="p-0">
        {courses.isLoading ? (<TableSkeleton rows={5} cols={6}/>) : filtered.length === 0 ? (<EmptyState icon={BookOpen} title="No courses found" description="Try changing your search or filters."/>) : (<Table>
            <TableHeader>
              <TableRow>
                <TableHead>Course</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Semester</TableHead>
                <TableHead className="text-right">Credits</TableHead>
                <TableHead className="text-right">Total classes</TableHead>
                <TableHead>Teacher</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((c) => (<TableRow key={c.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Code>{c.courseCode}</Code>
                      <div>
                        <p className="font-semibold">{c.courseName}</p>
                        <p className="text-xs text-muted-foreground">Course #{c.id}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="info">{c.department}</Badge>
                  </TableCell>
                  <TableCell>Semester {c.semester}</TableCell>
                  <TableCell className="text-right font-mono">{c.credits}</TableCell>
                  <TableCell className="text-right font-mono">{c.totalClasses}</TableCell>
                  <TableCell>
                    {c.teacherName ? (<div className="flex items-center gap-2">
                        <Initials text={c.teacherName.charAt(0).toUpperCase()} className="size-7 text-[0.6875rem]"/>
                        <span>{c.teacherName}</span>
                      </div>) : (<Badge variant="muted">Unassigned</Badge>)}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon-sm" aria-label="Edit course" onClick={() => openEdit(c)}>
                        <Pencil />
                      </Button>
                      <Button variant="destructive-ghost" size="icon-sm" aria-label="Delete course" onClick={() => confirm.ask(c)}>
                        <Trash2 />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>))}
            </TableBody>
          </Table>)}
      </Panel>

      <Dialog open={open} onOpenChange={(o) => !save.isPending && setOpen(o)}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit course" : "Create new course"}</DialogTitle>
            <DialogDescription>
              {editing
            ? "Update course information and teacher assignment."
            : "Add a course and assign a teacher."}
            </DialogDescription>
          </DialogHeader>
          <form className="space-y-6" onSubmit={(e) => {
            e.preventDefault();
            save.mutate();
        }}>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Course code" htmlFor="c-code" required>
                <Input id="c-code" name="courseCode" value={form.courseCode} onChange={change} placeholder="CSE301" required/>
              </Field>
              <Field label="Course name" htmlFor="c-name" required>
                <Input id="c-name" name="courseName" value={form.courseName} onChange={change} placeholder="Data Structures" required/>
              </Field>
              <Field label="Department" htmlFor="c-dept" required>
                <Input id="c-dept" name="department" value={form.department} onChange={change} placeholder="CSE" required/>
              </Field>
              <Field label="Semester" htmlFor="c-sem" required>
                <NativeSelect id="c-sem" name="semester" value={form.semester} onChange={change} required>
                  <option value="">Select semester</option>
                  {SEMESTERS.map((s) => (<option key={s} value={s}>
                      Semester {s}
                    </option>))}
                </NativeSelect>
              </Field>
              <Field label="Credits" htmlFor="c-credits" required>
                <Input id="c-credits" name="credits" type="number" min={1} max={10} value={form.credits} onChange={change} required/>
              </Field>
              <Field label="Total classes" htmlFor="c-classes" required>
                <Input id="c-classes" name="totalClasses" type="number" min={1} value={form.totalClasses} onChange={change} required/>
              </Field>
              <Field label="Assign teacher" htmlFor="c-teacher" className="sm:col-span-2">
                <NativeSelect id="c-teacher" name="teacherId" value={form.teacherId} onChange={change}>
                  <option value="">No teacher assigned</option>
                  {teacherList.map((t) => (<option key={t.id} value={t.id}>
                      {teacherLabel(t)}
                    </option>))}
                </NativeSelect>
              </Field>
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={save.isPending}>
                Cancel
              </Button>
              <Button type="submit" disabled={save.isPending}>
                {save.isPending && <Loader2 className="animate-spin"/>}
                {save.isPending ? "Saving…" : editing ? "Update course" : "Create course"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog {...confirm.dialogProps} title="Delete course?" description={`Are you sure you want to delete ${confirm.target?.courseCode || "this course"}?`} confirmLabel="Delete" destructive onConfirm={() => confirm.target && remove.mutate(confirm.target)}/>
    </Page>);
}
