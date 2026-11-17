import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { GraduationCap, Loader2, Pencil, Plus, RefreshCw, ScanFace, Search, Trash2, UserCheck, UserX, } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/components/ui/table";
import { Code, ConfirmDialog, EmptyState, ErrorState, Initials, Page, PageHeader, Panel, StatCard, TableSkeleton, useConfirm, } from "@/components/app/primitives";
import { api, asArray, errorMessage } from "@/lib/api";
import { initials } from "@/lib/format";
import { pageHead } from "@/lib/seo";
export const Route = createFileRoute("/admin/students/")({
    head: () => pageHead("Students", "Manage registered students and face registration."),
    component: StudentsPage,
});
const MAX_FACE_BYTES = 10 * 1024 * 1024;
function StudentsPage() {
    const queryClient = useQueryClient();
    const [search, setSearch] = React.useState("");
    const [uploadingId, setUploadingId] = React.useState(null);
    const confirm = useConfirm();
    const students = useQuery({
        queryKey: ["students"],
        queryFn: async () => asArray(await api.get("/student")),
    });
    const remove = useMutation({
        mutationFn: (s) => api.delete(`/student/${s.id}`),
        onSuccess: () => {
            toast.success("Student deleted successfully.");
            void queryClient.invalidateQueries({ queryKey: ["students"] });
        },
        onError: (err) => toast.error(errorMessage(err, "Failed to delete student.")),
    });
    const registerFace = async (studentId, file) => {
        if (!file)
            return;
        if (!file.type.startsWith("image/"))
            return void toast.error("Please select a valid image file.");
        if (file.size > MAX_FACE_BYTES)
            return void toast.error("Image size must be less than 10 MB.");
        const form = new FormData();
        form.append("image", file);
        try {
            setUploadingId(studentId);
            await api.post(`/student/${studentId}/face`, form);
            toast.success("Face registered successfully.");
            await queryClient.invalidateQueries({ queryKey: ["students"] });
        }
        catch (err) {
            toast.error(errorMessage(err, "Face registration failed."));
        }
        finally {
            setUploadingId(null);
        }
    };
    const all = students.data ?? [];
    const query = search.toLowerCase().trim();
    const filtered = query
        ? all.filter((s) => [s.registrationNumber, s.studentName, s.email, s.department, s.section].some((v) => v?.toLowerCase().includes(query)))
        : all;
    const registered = all.filter((s) => s.faceRegistered).length;
    return (<Page>
      <PageHeader eyebrow="People" title="Students" description="Manage registered students." actions={<>
            <Button variant="outline" onClick={() => void students.refetch()} disabled={students.isFetching}>
              <RefreshCw className={students.isFetching ? "animate-spin" : ""}/> Refresh
            </Button>
            <Button asChild>
              <Link to="/admin/students/add">
                <Plus /> Add student
              </Link>
            </Button>
          </>}/>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total students" value={all.length} icon={GraduationCap} loading={students.isLoading}/>
        <StatCard label="Faces registered" value={registered} icon={UserCheck} tone="success" loading={students.isLoading}/>
        <StatCard label="Face registration pending" value={all.length - registered} icon={UserX} tone="warning" loading={students.isLoading}/>
      </div>

      <Panel title="All students" description={!students.isLoading && all.length > 0
            ? `Showing ${filtered.length} of ${all.length} students`
            : undefined} bodyClassName="p-0" actions={<div className="relative w-full sm:w-80">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"/>
            <Input placeholder="Search by name, registration number, email…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" aria-label="Search students"/>
          </div>}>
        {students.isLoading ? (<TableSkeleton rows={6} cols={6}/>) : students.isError ? (<div className="p-5">
            <ErrorState message={errorMessage(students.error, "Failed to load students.")} onRetry={() => void students.refetch()}/>
          </div>) : filtered.length === 0 ? (<EmptyState icon={GraduationCap} title="No students found" description="Try changing your search or add a new student."/>) : (<Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Registration</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Face</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((s) => (<TableRow key={s.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Initials text={initials(s.studentName, "S")}/>
                      <div className="min-w-0">
                        <p className="font-semibold">{s.studentName || "-"}</p>
                        <p className="truncate text-xs text-muted-foreground">{s.email || "-"}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Code>{s.registrationNumber}</Code>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <p className="font-medium">{s.department}</p>
                    <p className="text-xs text-muted-foreground">
                      Semester {s.semester} · Section {s.section}
                    </p>
                  </TableCell>
                  <TableCell className="font-mono text-xs">{s.phone}</TableCell>
                  <TableCell>
                    {s.faceRegistered ? (<Badge variant="success">Registered</Badge>) : (<Badge variant="warning">Pending</Badge>)}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="sm" asChild>
                        <Link to="/admin/students/edit/$id" params={{ id: String(s.id) }}>
                          <Pencil /> Edit
                        </Link>
                      </Button>
                      <input type="file" id={`face-${s.id}`} accept="image/*" className="sr-only" onChange={(e) => {
                    void registerFace(s.id, e.target.files?.[0]);
                    e.target.value = "";
                }}/>
                      <Button variant="ghost" size="sm" asChild disabled={uploadingId === s.id}>
                        <label htmlFor={`face-${s.id}`} className="cursor-pointer">
                          {uploadingId === s.id ? (<Loader2 className="animate-spin"/>) : (<ScanFace />)}
                          {uploadingId === s.id
                    ? "Uploading…"
                    : s.faceRegistered
                        ? "Update face"
                        : "Register face"}
                        </label>
                      </Button>
                      <Button variant="destructive-ghost" size="icon-sm" aria-label={`Delete ${s.studentName || s.registrationNumber}`} disabled={remove.isPending && remove.variables?.id === s.id} onClick={() => confirm.ask(s)}>
                        {remove.isPending && remove.variables?.id === s.id ? (<Loader2 className="animate-spin"/>) : (<Trash2 />)}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>))}
            </TableBody>
          </Table>)}
      </Panel>

      <ConfirmDialog {...confirm.dialogProps} title="Delete student?" description={`Are you sure you want to delete ${confirm.target?.studentName || confirm.target?.registrationNumber || "this student"}? This cannot be undone.`} confirmLabel="Delete" destructive onConfirm={() => confirm.target && remove.mutate(confirm.target)}/>
    </Page>);
}
