import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Pencil, Plus, Search, ShieldCheck, Trash2, UserCheck } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/components/ui/table";
import { ConfirmDialog, EmptyState, ErrorState, Field, InlineAlert, Initials, Page, PageHeader, Panel, StatCard, TableSkeleton, useConfirm, } from "@/components/app/primitives";
import { api, asArray, errorMessage } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { pageHead } from "@/lib/seo";
export const Route = createFileRoute("/admin/admins")({
    head: () => pageHead("Administrators", "Manage administrator accounts and access."),
    component: AdminsPage,
});
const emptyForm = { fullName: "", email: "", password: "" };
function AdminsPage() {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [search, setSearch] = React.useState("");
    const [open, setOpen] = React.useState(false);
    const [editing, setEditing] = React.useState(null);
    const [form, setForm] = React.useState(emptyForm);
    const [formError, setFormError] = React.useState("");
    const confirm = useConfirm();
    const admins = useQuery({
        queryKey: ["admins"],
        queryFn: async () => asArray(await api.get("/admin")),
    });
    const save = useMutation({
        mutationFn: async () => {
            const payload = {
                fullName: form.fullName.trim(),
                email: form.email.trim(),
                password: form.password.trim(),
            };
            if (editing)
                await api.put(`/admin/${editing.id}`, payload);
            else
                await api.post("/admin", payload);
        },
        onSuccess: () => {
            toast.success(editing ? "Administrator updated successfully." : "Administrator created successfully.");
            setOpen(false);
            setEditing(null);
            setForm(emptyForm);
            void queryClient.invalidateQueries({ queryKey: ["admins"] });
        },
        onError: (err) => setFormError(errorMessage(err, "Unable to save administrator.")),
    });
    const remove = useMutation({
        mutationFn: (a) => api.delete(`/admin/${a.id}`),
        onSuccess: () => {
            toast.success("Administrator deleted successfully.");
            void queryClient.invalidateQueries({ queryKey: ["admins"] });
        },
        onError: (err) => toast.error(errorMessage(err, "Unable to delete administrator.")),
    });
    const submit = (e) => {
        e.preventDefault();
        setFormError("");
        if (!form.fullName.trim())
            return setFormError("Full name is required.");
        if (!form.email.trim())
            return setFormError("Email is required.");
        if (!editing && !form.password.trim())
            return setFormError("Password is required when creating an admin.");
        if (form.password.trim() && form.password.trim().length < 6)
            return setFormError("Password must contain at least 6 characters.");
        save.mutate();
    };
    const openAdd = () => {
        setEditing(null);
        setForm(emptyForm);
        setFormError("");
        setOpen(true);
    };
    const openEdit = (a) => {
        setEditing(a);
        setForm({ fullName: a.fullName || "", email: a.email || "", password: "" });
        setFormError("");
        setOpen(true);
    };
    const all = admins.data ?? [];
    const filtered = React.useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q)
            return all;
        return all.filter((a) => a.fullName?.toLowerCase().includes(q) || a.email?.toLowerCase().includes(q));
    }, [all, search]);
    const change = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    return (<Page>
      <PageHeader eyebrow="Administration" title="Administrators" description="Manage administrator accounts and access." actions={<Button onClick={openAdd}>
            <Plus /> Add administrator
          </Button>}/>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total administrators" value={all.length} icon={ShieldCheck} loading={admins.isLoading}/>
        <StatCard label="Search results" value={filtered.length} icon={Search} tone="slate" loading={admins.isLoading}/>
        <StatCard label="Active administrators" value={all.filter((a) => a.enabled).length} icon={UserCheck} tone="success" loading={admins.isLoading}/>
      </div>

      <Panel title="Administrators" description="Accounts with administrative access." bodyClassName="p-0" actions={<div className="relative w-full sm:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"/>
            <Input type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or email" className="pl-9" aria-label="Search administrators"/>
          </div>}>
        {admins.isLoading ? (<TableSkeleton rows={4} cols={4}/>) : admins.isError ? (<div className="p-5">
            <ErrorState message={errorMessage(admins.error, "Unable to load administrators.")} onRetry={() => void admins.refetch()}/>
          </div>) : filtered.length === 0 ? (<EmptyState icon={ShieldCheck} title="No administrators found" description={search ? "Try a different search." : "No administrator accounts are available."}/>) : (<Table>
            <TableHeader>
              <TableRow>
                <TableHead>Administrator</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((a) => {
                const isCurrent = a.email === user?.email;
                return (<TableRow key={a.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Initials text={a.fullName?.charAt(0).toUpperCase() || "A"}/>
                        <div>
                          <p className="font-semibold">{a.fullName}</p>
                          {isCurrent && <p className="text-xs text-slate-blue">Current account</p>}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{a.email}</TableCell>
                    <TableCell>
                      <Badge variant="info">{a.role}</Badge>
                    </TableCell>
                    <TableCell>
                      {a.enabled ? (<Badge variant="success">Active</Badge>) : (<Badge variant="muted">Disabled</Badge>)}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="sm" onClick={() => openEdit(a)} disabled={isCurrent} title={isCurrent
                        ? "The primary admin is managed through application.properties."
                        : "Edit administrator"}>
                          <Pencil /> Edit
                        </Button>
                        <Button variant="destructive-ghost" size="icon-sm" aria-label={`Delete ${a.fullName}`} disabled={isCurrent} onClick={() => confirm.ask(a)}>
                          <Trash2 />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>);
            })}
            </TableBody>
          </Table>)}
      </Panel>

      <Dialog open={open} onOpenChange={(o) => !save.isPending && setOpen(o)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit administrator" : "Add administrator"}</DialogTitle>
            <DialogDescription>
              {editing
            ? "Update the administrator account details."
            : "Create a new administrator account."}
            </DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={submit}>
            {formError && <InlineAlert tone="destructive">{formError}</InlineAlert>}
            <Field label="Full name" htmlFor="admin-full-name">
              <Input id="admin-full-name" name="fullName" value={form.fullName} onChange={change} placeholder="Enter full name" disabled={save.isPending}/>
            </Field>
            <Field label="Email" htmlFor="admin-email">
              <Input id="admin-email" name="email" type="email" value={form.email} onChange={change} placeholder="admin@example.com" disabled={save.isPending}/>
            </Field>
            <Field label="Password" htmlFor="admin-password" hint={editing ? "Leave blank to keep current password." : "At least 6 characters."}>
              <Input id="admin-password" name="password" type="password" value={form.password} onChange={change} placeholder={editing ? "Enter new password" : "Enter password"} disabled={save.isPending}/>
            </Field>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={save.isPending}>
                Cancel
              </Button>
              <Button type="submit" disabled={save.isPending}>
                {save.isPending && <Loader2 className="animate-spin"/>}
                {save.isPending
            ? "Saving…"
            : editing
                ? "Update administrator"
                : "Create administrator"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog {...confirm.dialogProps} title="Delete administrator?" description={`Are you sure you want to delete ${confirm.target?.fullName || "this administrator"}?`} confirmLabel="Delete" destructive onConfirm={() => {
            const target = confirm.target;
            if (!target)
                return;
            if (target.email === user?.email)
                return void toast.error("You cannot delete the currently authenticated account.");
            remove.mutate(target);
        }}/>
    </Page>);
}
