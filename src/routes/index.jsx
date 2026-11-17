import { createFileRoute, redirect } from "@tanstack/react-router";
// The sign-in screen decides where a signed-in person goes next.
export const Route = createFileRoute("/")({
    beforeLoad: () => {
        throw redirect({ to: "/login", replace: true });
    },
    head: () => ({
        meta: [
            { title: "Smart Attendance" },
            {
                name: "description",
                content: "Face recognition attendance for students, teachers and administrators.",
            },
            { property: "og:title", content: "Smart Attendance" },
            {
                property: "og:description",
                content: "Face recognition attendance for students, teachers and administrators.",
            },
            { property: "og:type", content: "website" },
            { name: "twitter:card", content: "summary_large_image" },
        ],
    }),
});
