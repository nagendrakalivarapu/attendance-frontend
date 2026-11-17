import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";
const badgeVariants = cva("inline-flex items-center gap-1.5 whitespace-nowrap rounded-md border px-2 py-0.5 text-xs font-semibold transition-all duration-200 ease-in-out [&_svg]:size-3", {
    variants: {
        variant: {
            default: "border-transparent bg-primary text-primary-foreground",
            info: "border-slate-blue/20 bg-primary-soft text-primary",
            secondary: "border-transparent bg-secondary text-secondary-foreground",
            success: "border-success/20 bg-success-soft text-success",
            warning: "border-warning/25 bg-warning-soft text-warning",
            destructive: "border-destructive/20 bg-destructive-soft text-destructive",
            muted: "border-border bg-muted text-muted-foreground",
            outline: "border-border text-foreground",
        },
    },
    defaultVariants: {
        variant: "default",
    },
});
function Badge({ className, variant, ...props }) {
    return <div className={cn(badgeVariants({ variant }), className)} {...props}/>;
}
export { Badge, badgeVariants };
