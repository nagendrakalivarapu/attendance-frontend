import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
    Activity, ArrowUpRight, BookOpen, ChevronDown, CircleHelp, GraduationCap,
    LayoutDashboard, LogOut, Menu, MoreHorizontal, School, Settings, ShieldCheck,
    UserRound, UsersRound, X,
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
    { label: "Total students", value: "3", helper: "+12% this month", icon: UsersRound, tone: "blue", detail: "3 active student accounts are ready for attendance tracking." },
    { label: "Total teachers", value: "1", helper: "Active faculty", icon: UserRound, tone: "violet", detail: "Your faculty directory is connected and operational." },
    { label: "Total courses", value: "2", helper: "Across 3 departments", icon: BookOpen, tone: "amber", detail: "2 courses are currently available for enrollment." },
    { label: "Attendance rate", value: "—", helper: "No records yet", icon: Activity, tone: "emerald", detail: "Attendance insights will appear after the first check-in." },
];

const services = ["Spring Boot API", "MySQL Database", "Face Recognition API"];
const spring = { type: "spring", stiffness: 400, damping: 30 };

function AdminDashboard() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);
    const [expandedStat, setExpandedStat] = useState(null);
    const [accountOpen, setAccountOpen] = useState(false);

    const goTo = (path) => {
        setMenuOpen(false);
        navigate(path);
    };

    return (
        <div className="admin-layout">
            <aside className={`admin-sidebar ${menuOpen ? "is-open" : ""}`}>
                <div className="sidebar-brand">
                    <div className="brand-mark"><School /></div>
                    <div><strong>Smart Attendance</strong><span>Admin workspace</span></div>
                    <button className="mobile-close" aria-label="Close navigation" onClick={() => setMenuOpen(false)}><X /></button>
                </div>
                <div className="sidebar-label">Workspace</div>
                <nav className="sidebar-nav" aria-label="Main navigation">
                    {navigation.map(({ label, icon: Icon, path }) => <button key={path} className={`sidebar-link ${path === "/admin" ? "active" : ""}`} onClick={() => goTo(path)}><Icon /><span>{label}</span>{label === "Dashboard" && <motion.span layoutId="nav-indicator" className="nav-indicator" transition={spring} />}</button>)}
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
                    <div className="account-wrap">
                        <motion.button whileTap={{ scale: .98 }} className="admin-profile" onClick={() => setAccountOpen((open) => !open)} aria-expanded={accountOpen}>
                            <div className="profile-copy"><strong>Administrator</strong><span>{user?.email}</span></div><div className="profile-avatar">{user?.email?.charAt(0).toUpperCase() || "A"}</div><ChevronDown className={accountOpen ? "chevron-up" : ""} />
                        </motion.button>
                        <AnimatePresence>{accountOpen && <motion.div initial={{ opacity: 0, y: -8, scale: .98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: .98 }} transition={spring} className="account-menu"><button onClick={() => goTo("/admin")}>Workspace settings</button><button onClick={logout}>Sign out</button></motion.div>}</AnimatePresence>
                    </div>
                </header>

                <motion.section className="welcome-card" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={spring}>
                    <div className="welcome-copy"><span className="welcome-kicker">SMART ATTENDANCE / TODAY</span><h2>Everything is in sync.</h2><p>Monitor your people, courses, and attendance from one calm, focused workspace.</p><motion.button whileHover={{ y: -2 }} whileTap={{ scale: .98 }} transition={spring} className="button button-light" onClick={() => goTo("/admin/students")}>View students <ArrowUpRight /></motion.button></div>
                    <div className="welcome-art" aria-hidden="true"><motion.div animate={{ rotate: 360 }} transition={{ duration: 24, repeat: Infinity, ease: "linear" }} className="art-ring art-ring-one" /><motion.div animate={{ rotate: -360 }} transition={{ duration: 18, repeat: Infinity, ease: "linear" }} className="art-ring art-ring-two" /><GraduationCap /></div>
                </motion.section>

                <section className="section-block">
                    <div className="section-heading"><div><span className="eyebrow">At a glance</span><h2>Workspace overview</h2></div><button className="button button-ghost">This month <ChevronDown /></button></div>
                    <motion.div layout className="stats-grid">{stats.map(({ label, value, helper, icon: Icon, tone, detail }, index) => <motion.article layout key={label} className={`stat-card ${expandedStat === index ? "is-expanded" : ""}`} whileHover={{ y: -3 }} transition={spring} onClick={() => setExpandedStat(expandedStat === index ? null : index)}><div className={`stat-icon ${tone}`}><Icon /></div><div className="stat-content"><span>{label}</span><strong>{value}</strong><small>{helper}</small><AnimatePresence>{expandedStat === index && <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={spring}>{detail}</motion.p>}</AnimatePresence></div><button className="icon-button" aria-label={`More options for ${label}`} onClick={(event) => event.stopPropagation()}><MoreHorizontal /></button></motion.article>)}</motion.div>
                </section>

                <div className="dashboard-columns">
                    <section className="section-block"><div className="section-heading"><div><span className="eyebrow">Get started</span><h2>Quick actions</h2></div></div><div className="quick-actions">{[["Manage students", "Add, edit, and manage accounts", "blue", UsersRound, "/admin/students"], ["Manage teachers", "Review faculty and assignments", "violet", UserRound, "/admin/teachers"], ["Manage courses", "Create and assign courses", "amber", BookOpen, "/admin/courses"], ["Attendance reports", "Review records and trends", "emerald", Activity, null]].map(([title, description, tone, Icon, path]) => <motion.button whileHover={{ x: 4 }} whileTap={{ scale: .99 }} transition={spring} key={title} className="action-card" onClick={() => path && goTo(path)}><span className={`action-icon ${tone}`}><Icon /></span><span><strong>{title}</strong><small>{description}</small></span><ArrowUpRight /></motion.button>)}</div></section>
                    <section className="section-block status-section"><div className="section-heading"><div><span className="eyebrow">Health monitor</span><h2>System status</h2></div><ShieldCheck className="section-status-icon" /></div><div className="status-card-list">{services.map((service, index) => <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ ...spring, delay: index * .06 }} className="status-card" key={service}><span className="status-dot" /><div><strong>{service}</strong><small>Operational and responding</small></div><span className="status-online">Online</span></motion.div>)}</div></section>
                </div>
            </main>
        </div>
    );
}

export default AdminDashboard;
