import * as React from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState, InlineAlert, Page, PageHeader, Panel } from "@/components/app/primitives";
import { StudentForm } from "@/components/app/student-form";
import { api, errorMessage } from "@/lib/api";
import { pageHead } from "@/lib/seo";
export const Route = createFileRoute("/admin/students/edit/$id")({
    head: () => pageHead("Edit Student", "Update student information."),
    component: EditStudent,
});
function EditStudent() {
    const { id } = Route.useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const student = useQuery({
        queryKey: ["students", id],
        queryFn: () => api.get(`/student/${id}`),
    });
    const initial = React.useMemo(() => {
        const s = student.data;
        if (!s)
            return null;
        return {
            fullName: s.studentName || "",
            email: s.email || "",
            password: "",
            registrationNumber: s.registrationNumber || "",
            department: s.department || "",
            semester: s.semester != null ? String(s.semester) : "",
            section: s.section || "",
            phone: s.phone || "",
            dateOfBirth: s.dateOfBirth || "",
            gender: s.gender || "",
            address: s.address || "",
        };
    }, [student.data]);
    const update = useMutation({
        mutationFn: (values) => api.put(`/student/${id}`, { ...values, semester: Number(values.semester) }),
        onSuccess: () => {
            toast.success("Student updated successfully.");
            void queryClient.invalidateQueries({ queryKey: ["students"] });
            void navigate({ to: "/admin/students" });
        },
    });
    return (<Page className="max-w-4xl">
      <PageHeader eyebrow="Students" title="Edit student" description="Update student information." actions={<Button variant="outline" asChild>
            <Link to="/admin/students">
              <ArrowLeft /> Students
            </Link>
          </Button>}/>
      {update.isError && (<InlineAlert tone="destructive">
          {errorMessage(update.error, "Failed to update student.")}
        </InlineAlert>)}
      {student.isError ? (<ErrorState title="Unable to load student" message={errorMessage(student.error, "Failed to load student.")} onRetry={() => void student.refetch()}/>) : (<Panel>
          {!initial ? (<div className="grid gap-4 sm:grid-cols-2">
              {Array.from({ length: 8 }).map((_, i) => (<Skeleton key={i} className="h-16"/>))}
            </div>) : (<StudentForm mode="edit" initial={initial} saving={update.isPending} onSubmit={(v) => update.mutate(v)} onCancel={() => void navigate({ to: "/admin/students" })}/>)}
        </Panel>)}
    </Page>);
}
