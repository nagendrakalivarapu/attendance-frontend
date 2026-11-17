import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { RefreshCw, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect, Page, PageHeader, Panel } from "@/components/app/primitives";
import { TeacherHistoryTable, useTeacherHistory } from "@/components/app/teacher-history";
import { pageHead } from "@/lib/seo";
export const Route = createFileRoute("/teacher/history")({
    head: () => pageHead("Attendance History", "Review your completed and active attendance sessions."),
    component: TeacherHistoryPage,
});
function TeacherHistoryPage() {
    const history = useTeacherHistory();
    const [search, setSearch] = React.useState("");
    const [status, setStatus] = React.useState("ALL");
    const q = search.trim().toLowerCase();
    const sessions = (history.data ?? []).filter((s) => (!q || s.courseCode?.toLowerCase().includes(q) || s.courseName?.toLowerCase().includes(q)) &&
        (status === "ALL" || s.status === status));
    return (<Page>
      <PageHeader eyebrow="Teaching" title="Attendance history" description="Review your completed and active attendance sessions." actions={<Button variant="outline" onClick={() => void history.refetch()} disabled={history.isFetching}>
            <RefreshCw className={history.isFetching ? "animate-spin" : ""}/> Refresh
          </Button>}/>
      <Panel title="All sessions" description={`${sessions.length} session${sessions.length === 1 ? "" : "s"}`} bodyClassName="p-0" actions={<div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <div className="relative sm:w-64">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"/>
              <Input placeholder="Search course…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" aria-label="Search sessions"/>
            </div>
            <NativeSelect value={status} onChange={(e) => setStatus(e.target.value)} className="sm:w-36" aria-label="Status">
              <option value="ALL">All</option>
              <option value="OPEN">Open</option>
              <option value="CLOSED">Closed</option>
            </NativeSelect>
          </div>}>
        <TeacherHistoryTable sessions={sessions} isLoading={history.isLoading} error={history.error} onRetry={() => void history.refetch()}/>
      </Panel>
    </Page>);
}
