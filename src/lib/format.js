export function formatDate(value) {
    if (!value)
        return "—";
    const date = new Date(`${value}T00:00:00`);
    if (Number.isNaN(date.getTime()))
        return value;
    return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}
export function formatDateTime(value) {
    if (!value)
        return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime()))
        return value;
    return date.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}
export function formatTime(value) {
    if (!value)
        return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime()))
        return value;
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
export function initials(name, fallback = "?") {
    if (!name)
        return fallback;
    return (name
        .split(" ")
        .filter(Boolean)
        .map((part) => part.charAt(0))
        .join("")
        .substring(0, 2)
        .toUpperCase() || fallback);
}
export function toNumber(value) {
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
}
/** Session percentage: use the server value, else derive from present / (present + absent). */
export function sessionPercentage(session) {
    const value = Number(session?.attendancePercentage);
    if (session?.attendancePercentage != null && Number.isFinite(value))
        return value;
    const present = toNumber(session?.presentCount);
    const absent = toNumber(session?.absentCount);
    const total = present + absent;
    return total > 0 ? (present / total) * 100 : 0;
}
/** Tone for a percentage: at/above `good` is healthy, at/above `warn` needs attention, else low. */
export function attendanceTone(percentage, good = 75, warn = good - 10) {
    if (percentage >= good)
        return "success";
    if (percentage >= warn)
        return "warning";
    return "destructive";
}
