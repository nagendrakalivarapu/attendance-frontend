import { getApiBaseUrl, getFaceApiBaseUrl } from "./server-config";
export const TOKEN_KEY = "token";
export const USER_KEY = "user";
export class ApiError extends Error {
    status;
    data;
    constructor(message, status, data) {
        super(message);
        this.name = "ApiError";
        this.status = status;
        this.data = data;
    }
}
function buildUrl(base, path, params) {
    const url = new URL(`${base}${path.startsWith("/") ? path : `/${path}`}`);
    if (params) {
        for (const [key, value] of Object.entries(params)) {
            if (value !== undefined && value !== null)
                url.searchParams.set(key, String(value));
        }
    }
    return url.toString();
}
async function parseBody(response) {
    const text = await response.text();
    if (!text)
        return null;
    try {
        return JSON.parse(text);
    }
    catch {
        return text;
    }
}
/** Mirrors the original app: prefer the server's `message`, then a plain-text body. */
export function messageFrom(data, fallback) {
    if (data && typeof data === "object" && "message" in data) {
        const message = data.message;
        if (typeof message === "string" && message.trim())
            return message;
    }
    if (typeof data === "string" && data.trim() && !data.trim().startsWith("<"))
        return data;
    return fallback;
}
async function request(method, path, options = {}) {
    const headers = { Accept: "application/json" };
    const token = typeof window !== "undefined" ? window.localStorage.getItem(TOKEN_KEY) : null;
    if (token)
        headers["Authorization"] = `Bearer ${token}`;
    let body;
    if (options.body instanceof FormData) {
        body = options.body;
    }
    else if (options.body !== undefined) {
        headers["Content-Type"] = "application/json";
        body = JSON.stringify(options.body);
    }
    let response;
    try {
        response = await fetch(buildUrl(getApiBaseUrl(), path, options.params), {
            method,
            headers,
            body: body ?? null,
        });
    }
    catch {
        throw new ApiError(`Cannot reach the attendance server at ${getApiBaseUrl()}. Check that it is running and allows this site.`, 0, null);
    }
    const data = await parseBody(response);
    if (!response.ok) {
        throw new ApiError(messageFrom(data, `Request failed (${response.status}).`), response.status, data);
    }
    return data;
}
export const api = {
    get: (path, params) => request("GET", path, { params }),
    post: (path, body) => request("POST", path, { body }),
    put: (path, body, params) => request("PUT", path, { body, params }),
    delete: (path) => request("DELETE", path),
};
export function errorMessage(error, fallback) {
    if (error instanceof ApiError)
        return error.message || fallback;
    if (error instanceof Error && error.message)
        return error.message;
    return fallback;
}
export function asArray(value) {
    return Array.isArray(value) ? value : [];
}
export async function detectFace(image, filename) {
    const form = new FormData();
    form.append("image", image, filename);
    let response;
    try {
        response = await fetch(`${getFaceApiBaseUrl()}/face/detect`, { method: "POST", body: form });
    }
    catch {
        throw new Error(`Cannot reach the face recognition service at ${getFaceApiBaseUrl()}.`);
    }
    let data = null;
    try {
        data = (await response.json());
    }
    catch {
        throw new Error("Invalid response from Face Recognition API.");
    }
    return { ok: response.ok, data };
}
export async function checkFaceHealth() {
    try {
        const response = await fetch(`${getFaceApiBaseUrl()}/face/health`, { method: "GET" });
        return response.ok;
    }
    catch {
        return false;
    }
}
