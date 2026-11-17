import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { InlineAlert, Page, PageHeader, Panel } from "@/components/app/primitives";
import { emptyStudentForm, StudentForm, } from "@/components/app/student-form";
import { api, errorMessage } from "@/lib/api";
import { pageHead } from "@/lib/seo";
export const Route = createFileRoute("/admin/students/add")({
    head: () => pageHead("Add Student", "Create a new student account."),
    component: AddStudent,
});
function AddStudent() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const create = useMutation({
        mutationFn: (values) => api.post("/student", { ...values, semester: Number(values.semester) }),
        onSuccess: () => {
            toast.success("Student account created successfully.");
            void queryClient.invalidateQueries({ queryKey: ["students"] });
            void navigate({ to: "/admin/students" });
        },
    });
    return (<Page className="max-w-4xl">
      <PageHeader eyebrow="Students" title="Add student" description="Create a new student account." actions={<Button variant="outline" asChild>
            <Link to="/admin/students">
              <ArrowLeft /> Students
            </Link>
          </Button>}/>
      {create.isError && (<InlineAlert tone="destructive">
          {errorMessage(create.error, "Failed to create student.")}
        </InlineAlert>)}
      <Panel>
        <StudentForm mode="create" initial={emptyStudentForm} saving={create.isPending} onSubmit={(v) => create.mutate(v)} onCancel={() => void navigate({ to: "/admin/students" })}/>
      </Panel>
    </Page>);
}
