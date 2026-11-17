import * as React from "react";
import { Server } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, } from "@/components/ui/dialog";
import { DEFAULT_API_BASE_URL, DEFAULT_FACE_API_BASE_URL, getApiBaseUrl, getFaceApiBaseUrl, saveServerConfig, } from "@/lib/server-config";
import { Field } from "./primitives";
export function ServerSettings() {
    const [open, setOpen] = React.useState(false);
    const [api, setApi] = React.useState("");
    const [face, setFace] = React.useState("");
    React.useEffect(() => {
        if (open) {
            setApi(getApiBaseUrl());
            setFace(getFaceApiBaseUrl());
        }
    }, [open]);
    return (<Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-muted-foreground">
          <Server /> Server settings
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Server settings</DialogTitle>
          <DialogDescription>
            Where this browser finds your attendance server and face recognition service.
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={(e) => {
            e.preventDefault();
            saveServerConfig(api, face);
            setOpen(false);
        }}>
          <Field label="Attendance server address" htmlFor="api-url" hint={`Default: ${DEFAULT_API_BASE_URL}`}>
            <Input id="api-url" value={api} onChange={(e) => setApi(e.target.value)} type="url" required/>
          </Field>
          <Field label="Face recognition address" htmlFor="face-url" hint={`Default: ${DEFAULT_FACE_API_BASE_URL}`}>
            <Input id="face-url" value={face} onChange={(e) => setFace(e.target.value)} type="url" required/>
          </Field>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => {
            setApi(DEFAULT_API_BASE_URL);
            setFace(DEFAULT_FACE_API_BASE_URL);
        }}>
              Reset to defaults
            </Button>
            <Button type="submit">Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>);
}
