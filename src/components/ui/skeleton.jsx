import { cn } from "@/lib/utils";
function Skeleton({ className, ...props }) {
    return <div className={cn("animate-ice-pulse rounded-md bg-accent", className)} {...props}/>;
}
export { Skeleton };
