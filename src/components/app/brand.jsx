import { ScanFace } from "lucide-react";
import { cn } from "@/lib/utils";
export function BrandMark({ className }) {
    return (<span className={cn("flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-panel", className)}>
      <ScanFace className="size-5"/>
    </span>);
}
