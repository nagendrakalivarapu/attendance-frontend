import * as React from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { ChevronsUpDown, LogOut, Search } from "lucide-react";
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarInset, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger, useSidebar, } from "@/components/ui/sidebar";
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, } from "@/components/ui/command";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { BrandMark } from "./brand";
import { isNavActive, NAV, ROLE_LABEL } from "./nav";
/* ---------------- Role gate ---------------- */
export function RoleGate({ role, children }) {
    const { user, ready } = useAuth();
    const navigate = useNavigate();
    const allowed = ready && user?.role === role;
    React.useEffect(() => {
        if (ready && !allowed)
            void navigate({ to: "/login", replace: true });
    }, [ready, allowed, navigate]);
    if (!allowed)
        return <ShellSkeleton />;
    return <>{children}</>;
}
function ShellSkeleton() {
    return (<div className="flex min-h-screen w-full bg-background">
      <div className="hidden w-64 border-r bg-card p-4 md:block">
        <Skeleton className="mb-8 h-9 w-40"/>
        {Array.from({ length: 6 }).map((_, i) => (<Skeleton key={i} className="mb-3 h-8 w-full"/>))}
      </div>
      <div className="flex-1 p-6">
        <Skeleton className="mb-6 h-10 w-full max-w-xl"/>
        <div className="grid gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (<Skeleton key={i} className="h-28 w-full rounded-xl"/>))}
        </div>
      </div>
    </div>);
}
/* ---------------- Sidebar ---------------- */
function AppSidebar({ role }) {
    const pathname = useRouterState({ select: (s) => s.location.pathname });
    const { state, isMobile, setOpenMobile } = useSidebar();
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const navRef = React.useRef(null);
    const [indicator, setIndicator] = React.useState(null);
    // Sliding active-route indicator: measure the active item and glide a bar to it.
    React.useLayoutEffect(() => {
        const measure = () => {
            const root = navRef.current;
            const active = root?.querySelector('[data-sidebar="menu-button"][data-active="true"]');
            if (!root || !active)
                return setIndicator(null);
            const rootBox = root.getBoundingClientRect();
            const box = active.getBoundingClientRect();
            setIndicator({ top: box.top - rootBox.top + root.scrollTop, height: box.height });
        };
        measure();
        const t = window.setTimeout(measure, 220);
        window.addEventListener("resize", measure);
        return () => {
            window.clearTimeout(t);
            window.removeEventListener("resize", measure);
        };
    }, [pathname, state, isMobile]);
    const handleLogout = () => {
        logout();
        void navigate({ to: "/login", replace: true });
    };
    return (<Sidebar collapsible="icon">
      <SidebarHeader className="px-3 pb-2 pt-4">
        <Link to={NAV[role][0]?.items[0]?.to ?? "/login"} className="flex items-center gap-2.5 rounded-lg px-1 py-1 transition-all duration-200 ease-in-out hover:opacity-90">
          <BrandMark />
          <div className="min-w-0 leading-tight group-data-[collapsible=icon]:hidden">
            <p className="truncate text-sm font-bold text-foreground">Smart Attendance</p>
            <p className="truncate text-xs text-muted-foreground">{ROLE_LABEL[role]} Console</p>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <div ref={navRef} className="relative">
          {indicator && (<span aria-hidden className="pointer-events-none absolute left-2 z-10 w-[3px] rounded-full bg-primary transition-all duration-200 ease-in-out group-data-[collapsible=icon]:left-1" style={{ top: indicator.top + 6, height: indicator.height - 12 }}/>)}
          {NAV[role].map((group) => (<SidebarGroup key={group.label} className="py-1.5">
              <SidebarGroupLabel className="eyebrow text-[0.625rem]">
                {group.label}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {group.items.map((item) => {
                const active = isNavActive(item, pathname);
                return (<SidebarMenuItem key={item.to}>
                        <SidebarMenuButton asChild isActive={active} tooltip={item.title} className={cn("h-9 pl-4 transition-all duration-200 ease-in-out group-data-[collapsible=icon]:!pl-2", active
                        ? "!bg-primary-soft !font-semibold !text-primary"
                        : "text-sidebar-foreground hover:!bg-secondary hover:!text-primary")}>
                          <Link to={item.to} onClick={() => {
                        if (isMobile)
                            setOpenMobile(false);
                    }}>
                            <item.icon />
                            <span>{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>);
            })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>))}
        </div>
      </SidebarContent>

      <SidebarFooter className="border-t p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Sign out" onClick={handleLogout} className="h-9 text-muted-foreground transition-all duration-200 ease-in-out hover:!bg-destructive-soft hover:!text-destructive">
              <LogOut />
              <span className="truncate">Sign out · {user?.email}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>);
}
/* ---------------- Header ---------------- */
function QuickSearch({ role }) {
    const [open, setOpen] = React.useState(false);
    const navigate = useNavigate();
    React.useEffect(() => {
        const onKey = (e) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((o) => !o);
            }
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, []);
    return (<>
      <button type="button" onClick={() => setOpen(true)} className="pressable flex h-9 w-full max-w-md items-center gap-2.5 rounded-lg border border-input bg-background px-3 text-sm text-muted-foreground hover:border-slate-blue/40 hover:bg-card">
        <Search className="size-4"/>
        <span className="flex-1 truncate text-left">Search pages…</span>
        <kbd className="hidden rounded border bg-card px-1.5 py-0.5 font-mono text-[0.625rem] font-medium sm:inline">
          Ctrl K
        </kbd>
      </button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Jump to a page…"/>
        <CommandList>
          <CommandEmpty>No matching pages.</CommandEmpty>
          {NAV[role].map((group) => (<CommandGroup key={group.label} heading={group.label}>
              {group.items.map((item) => (<CommandItem key={item.to} value={`${item.title} ${group.label} ${item.keywords ?? ""}`} onSelect={() => {
                    setOpen(false);
                    void navigate({ to: item.to });
                }}>
                  <item.icon className="text-slate-blue"/>
                  {item.title}
                </CommandItem>))}
            </CommandGroup>))}
        </CommandList>
      </CommandDialog>
    </>);
}
function UserMenu({ role }) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const letter = user?.email?.charAt(0).toUpperCase() || "U";
    return (<DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button type="button" className="pressable flex items-center gap-2.5 rounded-lg px-1.5 py-1 hover:bg-secondary">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-xs font-semibold text-primary-foreground">
            {letter}
          </span>
          <span className="hidden min-w-0 text-left leading-tight md:block">
            <span className="block text-sm font-semibold text-foreground">{ROLE_LABEL[role]}</span>
            <span className="block max-w-[180px] truncate text-xs text-muted-foreground">
              {user?.email}
            </span>
          </span>
          <ChevronsUpDown className="hidden size-4 text-muted-foreground md:block"/>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <p className="text-sm font-semibold">{ROLE_LABEL[role]}</p>
          <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-destructive focus:bg-destructive-soft focus:text-destructive" onSelect={() => {
            logout();
            void navigate({ to: "/login", replace: true });
        }}>
          <LogOut /> Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>);
}
/* ---------------- Shell ---------------- */
export function AppShell({ role, children }) {
    return (<SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar role={role}/>
        <SidebarInset className="min-w-0 bg-background">
          <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b bg-card/85 px-4 backdrop-blur-md md:px-6">
            <SidebarTrigger className="pressable text-slate-blue hover:bg-secondary hover:text-primary"/>
            <div className="h-5 w-px bg-border"/>
            <QuickSearch role={role}/>
            <div className="ml-auto">
              <UserMenu role={role}/>
            </div>
          </header>
          <main className="flex-1 px-4 py-6 md:px-8 md:py-8">{children}</main>
        </SidebarInset>
      </div>
    </SidebarProvider>);
}
export function RoleLayout({ role, children }) {
    return (<RoleGate role={role}>
      <AppShell role={role}>{children}</AppShell>
    </RoleGate>);
}
