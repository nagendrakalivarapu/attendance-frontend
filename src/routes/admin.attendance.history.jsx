import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, CircleDot, History, Layers, Lock, Percent, RefreshCw, Search, X, } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/components/ui/table";
import { AttendanceLinks } from "@/components/app/attendance-nav";
import { AttendanceMeter, EmptyState, ErrorState, Initials, NativeSelect, Page, PageHeader, Panel, SessionStatusBadge, StatCard, TableSkeleton, } from "@/components/app/primitives";
import { api, asArray, errorMessage } from "@/lib/api";
import { formatDate, formatDateTime, initials, toNumber } from "@/lib/format";
import { pageHead } from "@/lib/seo";
export const Route = createFileRoute("/admin/attendance/history")({
    head: () => pageHead("Attendance History", "View all attendance sessions across the system."),
    component: HistoryPage,
});
function HistoryPage() {
    const [search, setSearch] = React.useState("");
    const [status, setStatus] = React.useState("ALL");
    const history = useQuery({
        queryKey: ["attendance-sessions", "admin-history"],
        queryFn: async () => asArray(await api.get("/attendance-sessions/admin/history")),
    });
    const sessions = history.data ?? [];
    const filtered = React.useMemo(() => {
        const q = search.trim().toLowerCase();
        return sessions.filter((s) => (!q ||
            s.courseCode?.toLowerCase().includes(q) ||
            s.courseName?.toLowerCase().includes(q) ||
            s.teacherName?.toLowerCase().includes(q)) &&
            (status === "ALL" || s.status === status));
    }, [sessions, search, status]);
    const open = sessions.filter((s) => s.status === "OPEN").length;
    const closed = sessions.filter((s) => s.status === "CLOSED").length;
    const present = sessions.reduce((sum, s) => sum + toNumber(s.presentCount), 0);
    const absent = sessions.reduce((sum, s) => sum + toNumber(s.absentCount), 0);
    const overall = present + absent > 0 ? ((present / (present + absent)) * 100).toFixed(2) : "0.00";
    return (<Page>
      <PageHeader eyebrow="Attendance" title="Attendance history" description="View all attendance sessions across the system." actions={<>
            <AttendanceLinks current="/admin/attendance/history"/>
            <Button variant="outline" size="sm" onClick={() => void history.refetch()} disabled={history.isFetching}>
              <RefreshCw className={history.isFetching ? "animate-spin" : ""}/> Refresh
            </Button>
          </>}/>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
        <StatCard label="Total sessions" value={sessions.length} icon={Layers} loading={history.isLoading}/>
        <StatCard label="Open sessions" value={open} icon={CircleDot} tone="success" loading={history.isLoading}/>
        <StatCard label="Closed sessions" value={closed} icon={Lock} tone="slate" loading={history.isLoading}/>
        <StatCard label="Total present" value={present} icon={CheckCircle2} tone="success" loading={history.isLoading}/>
        <StatCard label="Overall attendance" value={`${overall}%`} icon={Percent} loading={history.isLoading}/>
      </div>

      {history.isError && (<ErrorState title="Unable to load history" message={errorMessage(history.error, "Failed to load attendance history.")} onRetry={() => void history.refetch()}/>)}

      <Panel title="Attendance sessions" description="System-wide attendance session history." bodyClassName="p-0" actions={<div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <div className="relative sm:w-64">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"/>
              <Input placeholder="Course, teacher…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" aria-label="Search sessions"/>
            </div>
            <NativeSelect value={status} onChange={(e) => setStatus(e.target.value)} className="sm:w-40" aria-label="Session status">
              <option value="ALL">All sessions</option>
              <option value="OPEN">Open</option>
              <option value="CLOSED">Closed</option>
            </NativeSelect>
            <Button variant="ghost" disabled={!search && status === "ALL"} onClick={() => {
                setSearch("");
                setStatus("ALL");
            }}>
              <X /> Clear
            </Button>
            <Badge variant="info" className="self-center">
              {filtered.length} sessions
            </Badge>
          </div>}>
        {history.isLoading ? (<TableSkeleton rows={6} cols={7}/>) : filtered.length === 0 ? (<EmptyState icon={History} title="No sessions found" description="No attendance sessions match the selected filters."/>) : (<Table>
            <TableHeader>
              <TableRow>
                <TableHead>Session</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Teacher</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Started</TableHead>
                <TableHead>Closed</TableHead>
                <TableHead className="text-right">Students</TableHead>
                <TableHead className="text-right">Present</TableHead>
                <TableHead className="text-right">Absent</TableHead>
                <TableHead>Attendance</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((s) => (<TableRow key={s.sessionId}>
                  <TableCell className="font-mono text-xs font-semibold">#{s.sessionId}</TableCell>
                  <TableCell>
                    <p className="font-semibold">{s.courseCode}</p>
                    <p className="text-xs text-muted-foreground">{s.courseName}</p>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Initials text={initials(s.teacherName)} className="size-7 text-[0.6875rem]"/>
                      <span>{s.teacherName || "Unknown"}</span>
                    </div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {formatDate(s.attendanceDate)}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-xs">
                    {formatDateTime(s.startedAt)}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-xs">
                    {formatDateTime(s.closedAt)}
                  </TableCell>
                  <TableCell className="text-right font-mono">{s.totalStudents}</TableCell>
                  <TableCell className="text-right font-mono text-success">
                    {s.presentCount}
                  </TableCell>
                  <TableCell className="text-right font-mono text-destructive">
                    {s.absentCount}
                  </TableCell>
                  <TableCell>
                    <AttendanceMeter value={toNumber(s.attendancePercentage)} good={75} warn={60}/>
                  </TableCell>
                  <TableCell>
                    <SessionStatusBadge status={s.status}/>
                  </TableCell>
                </TableRow>))}
            </TableBody>
          </Table>)}
      </Panel>
    </Page>);
}
