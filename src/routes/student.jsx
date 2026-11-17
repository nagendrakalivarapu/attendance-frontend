import { createFileRoute, Outlet } from "@tanstack/react-router";
import { RoleLayout } from "@/components/app/app-shell";
export const Route = createFileRoute("/student")({
    component: Layout,
});
function Layout() {
    return (<RoleLayout role="STUDENT">
      <Outlet />
    </RoleLayout>);
}
