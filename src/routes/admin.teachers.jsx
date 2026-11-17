import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Building2, Loader2, Pencil, Plus, RefreshCw, Search, Trash2, Users } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/components/ui/table";
import { Code, ConfirmDialog, EmptyState, ErrorState, Field, FormSection, Initials, Page, PageHeader, Panel, StatCard, TableSkeleton, useConfirm, } from "@/components/app/primitives";
import { api, asArray, errorMessage } from "@/lib/api";
import { initials } from "@/lib/format";
import { pageHead } from "@/lib/seo";
export const Route = createFileRoute("/admin/teachers")({
    head: () => pageHead("Teachers", "Manage teacher profiles, accounts and academic information."),
    component: TeachersPage,
});
const emptyForm = {
    fullName: "",
    email: "",
    password: "",
    employeeId: "",
    department: "",
    designation: "",
    phone: "",
    qualification: "",
};
function TeachersPage() {
    const queryClient = useQueryClient();
    const [search, setSearch] = React.useState("");
    const [open, setOpen] = React.useState(false);
    const [editing, setEditing] = React.useState(null);
    const [form, setForm] = React.useState(emptyForm);
    const confirm = useConfirm();
    const teachers = useQuery({
        queryKey: ["teachers"],
        queryFn: async () => asArray(await api.get("/teacher")),
    });
    const save = useMutation({
        mutationFn: async () => {
            const payload = {
                fullName: form.fullName,
                email: form.email,
                employeeId: form.employeeId,
                department: form.department,
                designation: form.designation,
                phone: form.phone,
                qualification: form.qualification,
            };
            if (!editing && !form.password.trim())
                throw new Error("Password is required when adding a teacher.");
            if (form.password.trim())
                payload["password"] = form.password;
            if (editing)
                await api.put(`/teacher/${editing.id}`, payload);
            else
                await api.post("/teacher", payload);
        },
        onSuccess: () => {
            toast.success(editing ? "Teacher updated successfully." : "Teacher added successfully.");
            setOpen(false);
            setEditing(null);
            void queryClient.invalidateQueries({ queryKey: ["teachers"] });
        },
        onError: (err) => toast.error(errorMessage(err, "Failed to save teacher.")),
    });
    const remove = useMutation({
        mutationFn: (t) => api.delete(`/teacher/${t.id}`),
        onSuccess: () => {
            toast.success("Teacher deleted successfully.");
            void queryClient.invalidateQueries({ queryKey: ["teachers"] });
        },
        onError: (err) => toast.error(errorMessage(err, "Failed to delete teacher.")),
    });
    const openAdd = () => {
        setEditing(null);
        setForm(emptyForm);
        save.reset();
        setOpen(true);
    };
    const openEdit = (t) => {
        setEditing(t);
        setForm({
            fullName: t.fullName || "",
            email: t.email || "",
            password: "",
            employeeId: t.employeeId || "",
            department: t.department || "",
            designation: t.designation || "",
            phone: t.phone || "",
            qualification: t.qualification || "",
        });
        save.reset();
        setOpen(true);
    };
    const change = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    const all = teachers.data ?? [];
    const q = search.toLowerCase();
    const filtered = all.filter((t) => [t.fullName, t.email, t.employeeId, t.department, t.designation, t.qualification].some((v) => v?.toLowerCase().includes(q)));
    const departments = new Set(all.map((t) => t.department).filter(Boolean)).size;
    return (<Page>
      <PageHeader eyebrow="People" title="Teachers" description="Manage teacher profiles, accounts and academic information." actions={<>
            <Button variant="outline" onClick={() => void teachers.refetch()} disabled={teachers.isFetching}>
              <RefreshCw className={teachers.isFetching ? "animate-spin" : ""}/> Refresh
            </Button>
            <Button onClick={openAdd}>
              <Plus /> Add teacher
            </Button>
          </>}/>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total teachers" value={all.length} icon={Users} loading={teachers.isLoading}/>
        <StatCard label="Search results" value={filtered.length} icon={Search} tone="slate" loading={teachers.isLoading}/>
        <StatCard label="Departments" value={departments} icon={Building2} tone="slate" loading={teachers.isLoading}/>
      </div>

      <Panel title="All teachers" bodyClassName="p-0" actions={<div className="relative w-full sm:w-80">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"/>
            <Input placeholder="Search by name, email, employee ID, department…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" aria-label="Search teachers"/>
          </div>}>
        {teachers.isLoading ? (<TableSkeleton rows={5} cols={6}/>) : teachers.isError ? (<div className="p-5">
            <ErrorState message={errorMessage(teachers.error, "Failed to load teachers.")} onRetry={() => void teachers.refetch()}/>
          </div>) : filtered.length === 0 ? (<EmptyState icon={Users} title="No teachers found" description="Add a teacher or change your search."/>) : (<Table>
            <TableHeader>
              <TableRow>
                <TableHead>Teacher</TableHead>
                <TableHead>Employee ID</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Designation</TableHead>
                <TableHead>Qualification</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((t) => (<TableRow key={t.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Initials text={initials(t.fullName, "T")}/>
                      <div className="min-w-0">
                        <p className="font-semibold">{t.fullName}</p>
                        <p className="truncate text-xs text-muted-foreground">{t.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Code>{t.employeeId}</Code>
                  </TableCell>
                  <TableCell>{t.department}</TableCell>
                  <TableCell>{t.designation}</TableCell>
                  <TableCell>{t.qualification}</TableCell>
                  <TableCell className="font-mono text-xs">{t.phone}</TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(t)}>
                        <Pencil /> Edit
                      </Button>
                      <Button variant="destructive-ghost" size="icon-sm" aria-label={`Delete ${t.fullName}`} onClick={() => confirm.ask(t)}>
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
            <DialogTitle>{editing ? "Edit teacher" : "Add teacher"}</DialogTitle>
            <DialogDescription>
              {editing
            ? "Update teacher and account information."
            : "Create a teacher profile and login account."}
            </DialogDescription>
          </DialogHeader>
          <form className="space-y-6" onSubmit={(e) => {
            e.preventDefault();
            save.mutate();
        }}>
            <FormSection title="Account information">
              <Field label="Full name" htmlFor="t-name" required>
                <Input id="t-name" name="fullName" value={form.fullName} onChange={change} placeholder="John Teacher" required/>
              </Field>
              <Field label="Email" htmlFor="t-email" required>
                <Input id="t-email" name="email" type="email" value={form.email} onChange={change} placeholder="teacher@gmail.com" required/>
              </Field>
              <Field label="Password" htmlFor="t-pass" required={!editing} hint={editing
            ? "Leave blank if you do not want to change the teacher's password."
            : undefined} className="sm:col-span-2">
                <Input id="t-pass" name="password" type="password" value={form.password} onChange={change} placeholder={editing ? "Leave blank to keep current password" : "Enter login password"} required={!editing}/>
              </Field>
            </FormSection>
            <FormSection title="Professional information">
              <Field label="Employee ID" htmlFor="t-emp" required>
                <Input id="t-emp" name="employeeId" value={form.employeeId} onChange={change} placeholder="EMP001" required/>
              </Field>
              <Field label="Department" htmlFor="t-dept" required>
                <Input id="t-dept" name="department" value={form.department} onChange={change} placeholder="CSE" required/>
              </Field>
              <Field label="Designation" htmlFor="t-des" required>
                <Input id="t-des" name="designation" value={form.designation} onChange={change} placeholder="Assistant Professor" required/>
              </Field>
              <Field label="Phone" htmlFor="t-phone" required>
                <Input id="t-phone" name="phone" type="tel" value={form.phone} onChange={change} placeholder="9876543210" required/>
              </Field>
              <Field label="Qualification" htmlFor="t-qual" required>
                <Input id="t-qual" name="qualification" value={form.qualification} onChange={change} placeholder="M.Tech" required/>
              </Field>
            </FormSection>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={save.isPending}>
                Cancel
              </Button>
              <Button type="submit" disabled={save.isPending}>
                {save.isPending && <Loader2 className="animate-spin"/>}
                {editing ? "Update teacher" : "Add teacher"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog {...confirm.dialogProps} title="Delete teacher?" description={`Are you sure you want to delete ${confirm.target?.fullName || "this teacher"}?`} confirmLabel="Delete" destructive onConfirm={() => confirm.target && remove.mutate(confirm.target)}/>
    </Page>);
}
