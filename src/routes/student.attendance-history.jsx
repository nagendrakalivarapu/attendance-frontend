import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CalendarClock, CheckCircle2, Layers, Percent, ScanFace, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { AttendanceMeter, Code, EmptyState, ErrorState, Page, PageHeader, Panel, StatCard, } from "@/components/app/primitives";
import { api, asArray, errorMessage } from "@/lib/api";
import { toNumber } from "@/lib/format";
import { pageHead } from "@/lib/seo";
import { cn } from "@/lib/utils";
export const Route = createFileRoute("/student/attendance-history")({
    head: () => pageHead("Attendance History", "Your attendance performance across all enrolled courses."),
    component: StudentHistoryPage,
});
const FILTERS = [
    { value: "ALL", label: "All" },
    { value: "GOOD", label: "75%+" },
    { value: "LOW", label: "Below 75%" },
];
function StudentHistoryPage() {
    const [filter, setFilter] = React.useState("ALL");
    const history = useQuery({
        queryKey: ["attendance", "me", "courses"],
        queryFn: async () => asArray(await api.get("/attendance/me/courses")),
    });
    const courses = history.data ?? [];
    const filtered = courses.filter((c) => {
        const p = toNumber(c.attendancePercentage);
        if (filter === "GOOD")
            return p >= 75;
        if (filter === "LOW")
            return p < 75;
        return true;
    });
    const total = courses.reduce((n, c) => n + toNumber(c.totalSessions), 0);
    const present = courses.reduce((n, c) => n + toNumber(c.presentCount), 0);
    const absent = courses.reduce((n, c) => n + toNumber(c.absentCount), 0);
    const overall = total > 0 ? (present / total) * 100 : 0;
    return (<Page>
      <PageHeader eyebrow="Attendance" title="Attendance history" description="Review your attendance performance across all enrolled courses." actions={<Button asChild>
            <Link to="/student/attendance">
              <ScanFace /> Mark attendance
            </Link>
          </Button>}/>

      {history.isError ? (<ErrorState title="Unable to load history" message={errorMessage(history.error, "Unable to load your attendance history.")} onRetry={() => void history.refetch()}/>) : (<>
          <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
            <StatCard label="Total sessions" value={total} icon={Layers} loading={history.isLoading}/>
            <StatCard label="Present" value={present} icon={CheckCircle2} tone="success" loading={history.isLoading}/>
            <StatCard label="Absent" value={absent} icon={XCircle} tone="destructive" loading={history.isLoading}/>
            <StatCard label="Overall attendance" value={`${overall.toFixed(1)}%`} icon={Percent} loading={history.isLoading}/>
          </div>

          <Panel title="Attendance by course" description="Course breakdown" actions={<div className="flex rounded-lg border bg-background p-0.5" role="tablist">
                {FILTERS.map((f) => (<button key={f.value} type="button" role="tab" aria-selected={filter === f.value} onClick={() => setFilter(f.value)} className={cn("pressable rounded-md px-3 py-1.5 text-xs font-semibold", filter === f.value
                        ? "bg-primary text-primary-foreground shadow-panel"
                        : "text-muted-foreground hover:text-primary")}>
                    {f.label}
                  </button>))}
              </div>}>
            {history.isLoading ? (<div className="grid gap-3 md:grid-cols-2">
                {Array.from({ length: 4 }).map((_, i) => (<Skeleton key={i} className="h-32 rounded-lg"/>))}
              </div>) : filtered.length === 0 ? (<EmptyState icon={CalendarClock} title="No attendance records" description={courses.length === 0
                    ? "Attendance records will appear here after your courses have conducted classes."
                    : "No courses match the selected filter."}/>) : (<div className="grid gap-3 md:grid-cols-2">
                {filtered.map((c) => {
                    const p = toNumber(c.attendancePercentage);
                    return (<div key={c.courseId} className="animate-rise rounded-lg border bg-background p-4 transition-all duration-200 ease-in-out hover:border-slate-blue/30 hover:bg-card">
                      <div className="flex items-start gap-3">
                        <Code>{c.courseCode}</Code>
                        <div className="min-w-0">
                          <p className="truncate font-semibold">{c.courseName}</p>
                          <p className="text-xs text-muted-foreground">
                            {c.totalSessions} session{c.totalSessions === 1 ? "" : "s"} conducted
                          </p>
                        </div>
                      </div>
                      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                        <div className="rounded-md bg-success-soft py-2">
                          <p className="text-[0.6875rem] text-muted-foreground">Present</p>
                          <p className="font-mono font-semibold text-success">{c.presentCount}</p>
                        </div>
                        <div className="rounded-md bg-destructive-soft py-2">
                          <p className="text-[0.6875rem] text-muted-foreground">Absent</p>
                          <p className="font-mono font-semibold text-destructive">
                            {c.absentCount}
                          </p>
                        </div>
                        <div className="rounded-md bg-primary-soft py-2">
                          <p className="text-[0.6875rem] text-muted-foreground">Attendance</p>
                          <p className="font-mono font-semibold text-primary">{p.toFixed(1)}%</p>
                        </div>
                      </div>
                      <AttendanceMeter value={p} good={75} warn={60} showLabel={false} className="mt-3"/>
                    </div>);
                })}
              </div>)}
          </Panel>
        </>)}
    </Page>);
}
