import { Link } from "@tanstack/react-router";
import { BarChart3, History, Mail, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
const LINKS = [
    { to: "/admin/attendance", label: "Reports", icon: BarChart3 },
    { to: "/admin/attendance/low", label: "Low attendance", icon: TrendingDown },
    { to: "/admin/attendance/history", label: "History", icon: History },
    { to: "/admin/attendance/email", label: "Email reports", icon: Mail },
];
/** Cross-links between the four attendance pages, omitting the current one. */
export function AttendanceLinks({ current }) {
    return (<>
      {LINKS.filter((l) => l.to !== current).map((l) => (<Button key={l.to} variant="outline" size="sm" asChild>
          <Link to={l.to}>
            <l.icon /> {l.label}
          </Link>
        </Button>))}
    </>);
}
