export function reportLovableError(error, context = {}) {
    if (typeof window === "undefined")
        return;
    window.__lovableEvents?.captureException?.(error, {
        source: "react_error_boundary",
        route: window.location.pathname,
        ...context,
    }, {
        mechanism: "react_error_boundary",
        handled: false,
        severity: "error",
    });
    // Prod React does not rethrow boundary-caught errors to window.onerror, so the
    // editor's telemetry never sees them. Forward to lovable.js's reporting hook,
    // which is present only inside the editor preview.
    const stack = error instanceof Error ? error.stack : undefined;
    window.__lovableReportRuntimeError?.({
        message: describeThrown(error),
        ...(stack !== undefined && { stack }),
        filename: window.location.pathname,
    });
}
const MAX_SERIALIZED_LENGTH = 2000;
// Loaders and server fns throw raw Responses and plain objects (a Supabase
// `{ message, code, details }`), which String() reduces to "[object ...]".
function describeThrown(error) {
    if (error instanceof Response) {
        return `Response ${error.status}${error.url ? ` at ${error.url}` : ""}`;
    }
    if (error instanceof Error)
        return error.message;
    if (typeof error === "string")
        return error;
    const { message } = (error ?? {});
    if (typeof message === "string" && message.length > 0)
        return message;
    try {
        return JSON.stringify(error)?.slice(0, MAX_SERIALIZED_LENGTH) ?? String(error);
    }
    catch {
        return String(error);
    }
}
