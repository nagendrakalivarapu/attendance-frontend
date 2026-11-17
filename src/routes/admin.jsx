import { createFileRoute, Outlet } from "@tanstack/react-router";
import { RoleLayout } from "@/components/app/app-shell";
export const Route = createFileRoute("/admin")({
    component: Layout,
});
function Layout() {
    return (<RoleLayout role="ADMIN">
      <Outlet />
    </RoleLayout>);
}
