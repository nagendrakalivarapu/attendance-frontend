import { describe, expect, it } from "vitest";
import { homeForRole } from "@/lib/auth";
import { attendanceTone, sessionPercentage } from "@/lib/format";
import { isNavActive, NAV } from "@/components/app/nav";
describe("attendance rules", () => {
    it("treats 75% as meeting the default requirement", () => {
        expect(attendanceTone(75)).toBe("success");
        expect(attendanceTone(74.9)).toBe("warning");
    });
    it("flags attendance more than 10 points under the requirement as low", () => {
        expect(attendanceTone(65, 75)).toBe("warning");
        expect(attendanceTone(64.9, 75)).toBe("destructive");
    });
    it("derives a session percentage from present and absent counts when none is given", () => {
        expect(sessionPercentage({ presentCount: 3, absentCount: 1 })).toBe(75);
        expect(sessionPercentage({ presentCount: 0, absentCount: 0 })).toBe(0);
        expect(sessionPercentage({ attendancePercentage: 42, presentCount: 3, absentCount: 1 })).toBe(42);
    });
});
describe("role routing", () => {
    it("sends each role to its own workspace", () => {
        expect(homeForRole("ADMIN")).toBe("/admin");
        expect(homeForRole("TEACHER")).toBe("/teacher");
        expect(homeForRole("STUDENT")).toBe("/student");
        expect(homeForRole("GUEST")).toBeNull();
    });
    it("keeps Students highlighted on the add and edit student pages", () => {
        const students = NAV.ADMIN.flatMap((g) => g.items).find((i) => i.to === "/admin/students");
        expect(isNavActive(students, "/admin/students/edit/4")).toBe(true);
        const dashboard = NAV.ADMIN.flatMap((g) => g.items).find((i) => i.to === "/admin");
        expect(isNavActive(dashboard, "/admin/students")).toBe(false);
    });
});
