import * as React from "react";
import { cn } from "@/lib/utils";
const Textarea = React.forwardRef(({ className, ...props }, ref) => {
    return (<textarea className={cn("flex min-h-[60px] w-full rounded-lg border border-input bg-card px-3 py-2 text-base shadow-panel transition-all duration-200 ease-in-out hover:border-slate-blue/40 placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-slate-blue focus-visible:ring-3 focus-visible:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm", className)} ref={ref} {...props}/>);
});
Textarea.displayName = "Textarea";
export { Textarea };
