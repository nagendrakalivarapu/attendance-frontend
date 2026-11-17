import * as React from "react";
import { AlertTriangle, CheckCircle2, Inbox, RefreshCw } from "lucide-react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, } from "@/components/ui/alert-dialog";
import { attendanceTone } from "@/lib/format";
/* ---------------- Page layout ---------------- */
export function Page({ children, className }) {
    return (<div className={cn("mx-auto w-full max-w-[1400px] animate-rise space-y-6", className)}>
      {children}
    </div>);
}
export function PageHeader({ eyebrow, title, description, actions, }) {
    return (<div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="space-y-1">
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1 className="text-2xl font-bold text-foreground md:text-[1.75rem]">{title}</h1>
        {description && <p className="max-w-2xl text-sm text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>);
}
export function Panel({ title, description, actions, children, className, bodyClassName, id, }) {
    return (<section id={id} className={cn("rounded-xl border bg-card text-card-foreground shadow-panel", className)}>
      {(title || actions) && (<header className="flex flex-col gap-3 border-b px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            {title && <h2 className="text-[0.9375rem] font-semibold text-foreground">{title}</h2>}
            {description && <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>}
          </div>
          {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
        </header>)}
      <div className={cn("p-5", bodyClassName)}>{children}</div>
    </section>);
}
/* ---------------- Stat cards ---------------- */
const statIconVariants = cva("flex size-10 shrink-0 items-center justify-center rounded-lg", {
    variants: {
        tone: {
            primary: "bg-primary-soft text-primary",
            slate: "bg-secondary text-slate-blue",
            success: "bg-success-soft text-success",
            warning: "bg-warning-soft text-warning",
            destructive: "bg-destructive-soft text-destructive",
        },
    },
    defaultVariants: { tone: "primary" },
});
export function StatCard({ label, value, hint, icon: Icon, tone, loading, className, }) {
    return (<div className={cn("group rounded-xl border bg-card p-5 shadow-panel transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:border-slate-blue/30 hover:shadow-raised", className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1.5">
          <p className="text-[0.8125rem] font-medium text-muted-foreground">{label}</p>
          {loading ? (<Skeleton className="h-8 w-20"/>) : (<p className="font-mono text-[1.75rem] font-semibold leading-none tracking-tight text-foreground">
              {value}
            </p>)}
          {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
        </div>
        {Icon && (<div className={statIconVariants({ tone })}>
            <Icon className="size-5"/>
          </div>)}
      </div>
    </div>);
}
/* ---------------- States ---------------- */
export function EmptyState({ icon: Icon = Inbox, title, description, action, className, }) {
    return (<div className={cn("flex flex-col items-center justify-center gap-2 px-6 py-12 text-center", className)}>
      <div className="mb-1 flex size-12 items-center justify-center rounded-full bg-primary-soft text-slate-blue">
        <Icon className="size-5"/>
      </div>
      <p className="font-semibold text-foreground">{title}</p>
      {description && <p className="max-w-sm text-sm text-muted-foreground">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>);
}
export function ErrorState({ title = "Something went wrong", message, onRetry, className, }) {
    return (<div role="alert" className={cn("flex flex-col items-start gap-3 rounded-xl border border-destructive/20 bg-destructive-soft p-4 sm:flex-row sm:items-center", className)}>
      <AlertTriangle className="size-5 shrink-0 text-destructive"/>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-destructive">{title}</p>
        <p className="text-sm text-foreground/80">{message}</p>
      </div>
      {onRetry && (<Button variant="outline" size="sm" onClick={onRetry}>
          <RefreshCw /> Try again
        </Button>)}
    </div>);
}
export function InlineAlert({ tone = "success", children, onDismiss, }) {
    const Icon = tone === "success" ? CheckCircle2 : AlertTriangle;
    return (<div role="alert" className={cn("flex animate-rise items-start gap-3 rounded-xl border p-3.5 text-sm", tone === "success"
            ? "border-success/20 bg-success-soft text-success"
            : "border-destructive/20 bg-destructive-soft text-destructive")}>
      <Icon className="mt-0.5 size-4 shrink-0"/>
      <div className="flex-1 text-foreground/85">{children}</div>
      {onDismiss && (<button type="button" onClick={onDismiss} className="pressable rounded px-1 text-xs font-medium text-muted-foreground hover:text-foreground">
          Dismiss
        </button>)}
    </div>);
}
export function TableSkeleton({ rows = 5, cols = 5 }) {
    return (<div className="space-y-3 p-5" aria-busy="true" aria-label="Loading">
      <Skeleton className="h-8 w-full"/>
      {Array.from({ length: rows }).map((_, r) => (<div key={r} className="flex gap-4">
          {Array.from({ length: cols }).map((_, c) => (<Skeleton key={c} className={cn("h-5", c === 0 ? "w-1/4" : "flex-1")}/>))}
        </div>))}
    </div>);
}
export function CardGridSkeleton({ count = 3 }) {
    return (<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3" aria-busy="true">
      {Array.from({ length: count }).map((_, i) => (<div key={i} className="space-y-3 rounded-xl border bg-card p-5 shadow-panel">
          <Skeleton className="h-5 w-24"/>
          <Skeleton className="h-6 w-3/4"/>
          <Skeleton className="h-16 w-full"/>
          <Skeleton className="h-9 w-full"/>
        </div>))}
    </div>);
}
/* ---------------- Data display ---------------- */
export function Initials({ text, className }) {
    return (<span className={cn("flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-xs font-semibold text-primary", className)}>
      {text}
    </span>);
}
export function Code({ children }) {
    return (<span className="rounded-md border border-slate-blue/20 bg-secondary px-1.5 py-0.5 font-mono text-xs font-medium text-secondary-foreground">
      {children}
    </span>);
}
const meterFill = {
    success: "bg-success",
    warning: "bg-warning",
    destructive: "bg-destructive",
};
const meterText = {
    success: "text-success",
    warning: "text-warning",
    destructive: "text-destructive",
};
export function AttendanceMeter({ value, good = 75, warn, digits = 1, className, showLabel = true, }) {
    const tone = attendanceTone(value, good, warn);
    const width = Math.min(Math.max(value, 0), 100);
    return (<div className={cn("flex min-w-[120px] items-center gap-2.5", className)}>
      {showLabel && (<span className={cn("w-14 font-mono text-sm font-semibold", meterText[tone])}>
          {value.toFixed(digits)}%
        </span>)}
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
        <div className={cn("h-full rounded-full transition-all duration-500 ease-out", meterFill[tone])} style={{ width: `${width}%` }}/>
      </div>
    </div>);
}
export function SessionStatusBadge({ status }) {
    if (status === "OPEN")
        return (<Badge variant="success">
        <span className="size-1.5 animate-pulse rounded-full bg-success"/> Open
      </Badge>);
    if (status === "CLOSED")
        return <Badge variant="muted">Closed</Badge>;
    return <Badge variant="muted">{status || "Unknown"}</Badge>;
}
/* ---------------- Forms ---------------- */
export function Field({ label, htmlFor, hint, required, children, className, }) {
    return (<div className={cn("space-y-1.5", className)}>
      <label htmlFor={htmlFor} className="text-[0.8125rem] font-medium text-foreground">
        {label}
        {required && <span className="ml-0.5 text-destructive">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>);
}
export const NativeSelect = React.forwardRef(({ className, children, ...props }, ref) => (<select ref={ref} className={cn("select-chevron h-10 w-full cursor-pointer appearance-none rounded-lg border border-input bg-card pl-3 pr-9 text-sm text-foreground shadow-panel transition-all duration-200 ease-in-out hover:border-slate-blue/40 focus-visible:border-slate-blue focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-50", className)} {...props}>
    {children}
  </select>));
NativeSelect.displayName = "NativeSelect";
export function FormSection({ title, children }) {
    return (<fieldset className="space-y-4">
      <legend className="eyebrow mb-3">{title}</legend>
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </fieldset>);
}
/* ---------------- Confirmation ---------------- */
export function ConfirmDialog({ open, onOpenChange, title, description, confirmLabel = "Confirm", destructive, onConfirm, }) {
    return (<AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          {description && <AlertDialogDescription>{description}</AlertDialogDescription>}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction className={cn(destructive && "bg-destructive text-destructive-foreground hover:bg-destructive/90")} onClick={onConfirm}>
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>);
}
/** Small hook pairing a pending item with ConfirmDialog. */
export function useConfirm() {
    const [target, setTarget] = React.useState(null);
    return {
        target,
        ask: (value) => setTarget(value),
        dialogProps: {
            open: target !== null,
            onOpenChange: (open) => {
                if (!open)
                    setTarget(null);
            },
        },
    };
}
