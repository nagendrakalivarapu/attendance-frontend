import { BarChart3, BookOpen, CalendarClock, ClipboardList, GraduationCap, History, LayoutDashboard, Mail, ScanFace, ShieldCheck, TrendingDown, Users, } from "lucide-react";
export const NAV = {
    ADMIN: [
        {
            label: "Overview",
            items: [{ title: "Dashboard", to: "/admin", icon: LayoutDashboard, exact: true }],
        },
        {
            label: "People",
            items: [
                {
                    title: "Students",
                    to: "/admin/students",
                    icon: GraduationCap,
                    keywords: "face add edit",
                },
                { title: "Teachers", to: "/admin/teachers", icon: Users, exact: true },
                { title: "Administrators", to: "/admin/admins", icon: ShieldCheck, exact: true },
            ],
        },
        {
            label: "Academics",
            items: [
                { title: "Courses", to: "/admin/courses", icon: BookOpen, exact: true },
                { title: "Enrollments", to: "/admin/enrollments", icon: ClipboardList, exact: true },
            ],
        },
        {
            label: "Attendance",
            items: [
                { title: "Reports", to: "/admin/attendance", icon: BarChart3, exact: true },
                { title: "Low Attendance", to: "/admin/attendance/low", icon: TrendingDown, exact: true },
                { title: "Session History", to: "/admin/attendance/history", icon: History, exact: true },
                { title: "Email Reports", to: "/admin/attendance/email", icon: Mail, exact: true },
            ],
        },
    ],
    TEACHER: [
        {
            label: "Teaching",
            items: [
                { title: "My Courses", to: "/teacher", icon: LayoutDashboard, exact: true },
                { title: "Attendance History", to: "/teacher/history", icon: History, exact: true },
            ],
        },
    ],
    STUDENT: [
        {
            label: "My Attendance",
            items: [
                { title: "Dashboard", to: "/student", icon: LayoutDashboard, exact: true },
                { title: "Mark Attendance", to: "/student/attendance", icon: ScanFace, exact: true },
                {
                    title: "Attendance History",
                    to: "/student/attendance-history",
                    icon: CalendarClock,
                    exact: true,
                },
            ],
        },
    ],
};
export const ROLE_LABEL = {
    ADMIN: "Administrator",
    TEACHER: "Teacher",
    STUDENT: "Student",
};
export function isNavActive(item, pathname) {
    const path = pathname.replace(/\/+$/, "") || "/";
    if (item.exact)
        return path === item.to;
    return path === item.to || path.startsWith(`${item.to}/`);
}
