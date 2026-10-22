import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
    Activity,
    ArrowUpRight,
    BookOpen,
    ChevronDown,
    CircleHelp,
    GraduationCap,
    LayoutDashboard,
    LogOut,
    Menu,
    MoreHorizontal,
    School,
    Settings,
    ShieldCheck,
    UserRound,
    UsersRound,
    X,
} from "lucide-react";
import { useState } from "react";

const navigation = [
    { label: "Dashboard", icon: LayoutDashboard, path: "/admin" },
    { label: "Students", icon: UsersRound, path: "/admin/students" },
    { label: "Teachers", icon: UserRound, path: "/admin/teachers" },
    { label: "Courses", icon: BookOpen, path: "/admin/courses" },
    { label: "Enrollments", icon: GraduationCap, path: "/admin/enrollments" },
];

const stats = [
    { label: "Total students", value: "3", helper: "+12% this month", icon: UsersRound, tone: "blue" },
    { label: "Total teachers", value: "1", helper: "Active faculty", icon: UserRound, tone: "violet" },
    { label: "Total courses", value: "2", helper: "Across 3 departments", icon: BookOpen, tone: "amber" },
    { label: "Attendance rate", value: "—", helper: "No records yet", icon: Activity, tone: "emerald" },
];

const services = ["Spring Boot API", "MySQL Database", "Face Recognition API"];

function AdminDashboard() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);

    const goTo = (path) => {
        setMenuOpen(false);
        navigate(path);
    };

    return (
        <div className="admin-layout">
            <aside className={`admin-sidebar ${menuOpen ? "is-open" : ""}`}>
                <div className="sidebar-brand">
                    <div className="brand-mark"><School /></div>
                    <div>
                        <strong>Smart Attendance</strong>
                        <span>Admin workspace</span>
                    </div>
                    <button className="mobile-close" aria-label="Close navigation" onClick={() => setMenuOpen(false)}><X /></button>
                </div>

                <div className="sidebar-label">Workspace</div>
                <nav className="sidebar-nav" aria-label="Main navigation">
                    {navigation.map(({ label, icon: Icon, path }) => (
                        <button key={path} className={`sidebar-link ${path === "/admin" ? "active" : ""}`} onClick={() => goTo(path)}>
                            <Icon />
                            <span>{label}</span>
                            {label === "Dashboard" && <span className="nav-indicator" />}
                        </button>
                    ))}
                </nav>

                <div className="sidebar-spacer" />
                <div className="sidebar-footer">
                    <button className="sidebar-link" onClick={() => goTo("/admin")}><Settings /><span>Settings</span></button>
                    <button className="sidebar-link logout-link" onClick={logout}><LogOut /><span>Sign out</span></button>
                    <div className="sidebar-support"><CircleHelp /><div><strong>Need help?</strong><span>Open support center</span></div></div>
                </div>
            </aside>

            <main className="admin-main">
                <header className="admin-topbar">
                    <button className="mobile-menu" aria-label="Open navigation" onClick={() => setMenuOpen(true)}><Menu /></button>
                    <div className="page-heading"><span className="eyebrow">Overview</span><h1>Good morning, Admin</h1><p>Here&apos;s what&apos;s happening across your attendance workspace.</p></div>
                    <div className="admin-profile">
                        <div className="profile-copy"><strong>Administrator</strong><span>{user?.email}</span></div>
                        <div className="profile-avatar">{user?.email?.charAt(0).toUpperCase() || "A"}</div>
                        <button className="profile-menu" aria-label="Open account menu"><ChevronDown /></button>
                    </div>
                </header>

                <section className="welcome-card">
                    <div className="welcome-copy"><span className="welcome-kicker">SMART ATTENDANCE / TODAY</span><h2>Everything is in sync.</h2><p>Monitor your people, courses, and attendance from one calm, focused workspace.</p><button className="button button-light" onClick={() => goTo("/admin/students")}>View students <ArrowUpRight /></button></div>
                    <div className="welcome-art" aria-hidden="true"><div className="art-ring art-ring-one" /><div className="art-ring art-ring-two" /><GraduationCap /></div>
                </section>

                <section className="section-block">
                    <div className="section-heading"><div><span className="eyebrow">At a glance</span><h2>Workspace overview</h2></div><button className="button button-ghost">This month <ChevronDown /></button></div>
                    <div className="stats-grid">
                        {stats.map(({ label, value, helper, icon: Icon, tone }) => <article className="stat-card" key={label}><div className={`stat-icon ${tone}`}><Icon /></div><div className="stat-content"><span>{label}</span><strong>{value}</strong><small>{helper}</small></div><button className="icon-button" aria-label={`More options for ${label}`}><MoreHorizontal /></button></article>)}
                    </div>
                </section>

                <div className="dashboard-columns">
                    <section className="section-block">
                        <div className="section-heading"><div><span className="eyebrow">Get started</span><h2>Quick actions</h2></div></div>
                        <div className="quick-actions">
                            <button className="action-card" onClick={() => goTo("/admin/students")}><span className="action-icon blue"><UsersRound /></span><span><strong>Manage students</strong><small>Add, edit, and manage accounts</small></span><ArrowUpRight /></button>
                            <button className="action-card" onClick={() => goTo("/admin/teachers")}><span className="action-icon violet"><UserRound /></span><span><strong>Manage teachers</strong><small>Review faculty and assignments</small></span><ArrowUpRight /></button>
                            <button className="action-card" onClick={() => goTo("/admin/courses")}><span className="action-icon amber"><BookOpen /></span><span><strong>Manage courses</strong><small>Create and assign courses</small></span><ArrowUpRight /></button>
                            <button className="action-card"><span className="action-icon emerald"><Activity /></span><span><strong>Attendance reports</strong><small>Review records and trends</small></span><ArrowUpRight /></button>
                        </div>
                    </section>

                    <section className="section-block status-section">
                        <div className="section-heading"><div><span className="eyebrow">Health monitor</span><h2>System status</h2></div><ShieldCheck className="section-status-icon" /></div>
                        <div className="status-card-list">{services.map((service) => <div className="status-card" key={service}><span className="status-dot" /><div><strong>{service}</strong><small>Operational and responding</small></div><span className="status-online">Online</span></div>)}</div>
                    </section>
                </div>
            </main>
        </div>
    );
}

export default AdminDashboard;
