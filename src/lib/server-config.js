/**
 * Addresses of the school's own attendance server (Spring Boot API) and the face
 * recognition service (FastAPI). Defaults come from VITE_* build variables and can be
 * overridden per browser from the sign-in screen, since each campus runs its own servers.
 */
const API_KEY = "sa.apiBaseUrl";
const FACE_KEY = "sa.faceApiBaseUrl";
export const DEFAULT_API_BASE_URL = import.meta.env["VITE_API_URL"] ?? "http://localhost:8080/api";
export const DEFAULT_FACE_API_BASE_URL = import.meta.env["VITE_FACE_API_URL"] ?? "http://127.0.0.1:8000";
function read(key) {
    if (typeof window === "undefined")
        return null;
    try {
        return window.localStorage.getItem(key);
    }
    catch {
        return null;
    }
}
function trimSlash(value) {
    return value.trim().replace(/\/+$/, "");
}
export function getApiBaseUrl() {
    return trimSlash(read(API_KEY) || DEFAULT_API_BASE_URL);
}
export function getFaceApiBaseUrl() {
    return trimSlash(read(FACE_KEY) || DEFAULT_FACE_API_BASE_URL);
}
/** Uploaded files (profile pictures) are served next to the API, at /uploads. */
export function getUploadsBaseUrl() {
    try {
        return `${new URL(getApiBaseUrl()).origin}/uploads`;
    }
    catch {
        return "http://localhost:8080/uploads";
    }
}
export function saveServerConfig(apiBaseUrl, faceApiBaseUrl) {
    const api = trimSlash(apiBaseUrl);
    const face = trimSlash(faceApiBaseUrl);
    if (!api || api === trimSlash(DEFAULT_API_BASE_URL))
        window.localStorage.removeItem(API_KEY);
    else
        window.localStorage.setItem(API_KEY, api);
    if (!face || face === trimSlash(DEFAULT_FACE_API_BASE_URL))
        window.localStorage.removeItem(FACE_KEY);
    else
        window.localStorage.setItem(FACE_KEY, face);
}
