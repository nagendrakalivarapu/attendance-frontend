import { useQuery } from "@tanstack/react-query";
import { History } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/components/ui/table";
import { api, asArray, errorMessage } from "@/lib/api";
import { formatDate, toNumber } from "@/lib/format";
import { AttendanceMeter, EmptyState, ErrorState, SessionStatusBadge, TableSkeleton, } from "./primitives";
export const teacherHistoryQuery = {
    queryKey: ["attendance-sessions", "my-history"],
    queryFn: async () => asArray(await api.get("/attendance-sessions/my-history")),
};
export function useTeacherHistory() {
    return useQuery(teacherHistoryQuery);
}
export function TeacherHistoryTable({ sessions, isLoading, error, onRetry, }) {
    if (isLoading)
        return <TableSkeleton rows={5} cols={7}/>;
    if (error)
        return (<div className="p-5">
        <ErrorState title="Unable to load history" message={errorMessage(error, "Unable to load attendance history.")} onRetry={onRetry}/>
      </div>);
    if (sessions.length === 0)
        return <EmptyState icon={History} title="No attendance sessions have been recorded yet."/>;
    return (<Table>
      <TableHeader>
        <TableRow>
          <TableHead>Session</TableHead>
          <TableHead>Course</TableHead>
          <TableHead>Date</TableHead>
          <TableHead className="text-right">Students</TableHead>
          <TableHead className="text-right">Present</TableHead>
          <TableHead className="text-right">Absent</TableHead>
          <TableHead>Attendance</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sessions.map((s) => (<TableRow key={s.sessionId || s.id}>
            <TableCell className="font-mono text-xs font-semibold">
              #{s.sessionId || s.id}
            </TableCell>
            <TableCell>
              <p className="font-semibold">{s.courseCode || "—"}</p>
              <p className="text-xs text-muted-foreground">{s.courseName || "—"}</p>
            </TableCell>
            <TableCell className="whitespace-nowrap">{formatDate(s.attendanceDate)}</TableCell>
            <TableCell className="text-right font-mono">{s.totalStudents ?? 0}</TableCell>
            <TableCell className="text-right font-mono text-success">
              {s.presentCount ?? 0}
            </TableCell>
            <TableCell className="text-right font-mono text-destructive">
              {s.absentCount ?? 0}
            </TableCell>
            <TableCell>
              <AttendanceMeter value={toNumber(s.attendancePercentage)} good={75} warn={60}/>
            </TableCell>
            <TableCell>
              <SessionStatusBadge status={s.status}/>
            </TableCell>
          </TableRow>))}
      </TableBody>
    </Table>);
}
