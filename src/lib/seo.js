/** Per-page head metadata. Pages are behind sign-in, so no preview image is set. */
export function pageHead(title, description) {
    const full = `${title} · Smart Attendance`;
    return {
        meta: [
            { title: full },
            { name: "description", content: description },
            { property: "og:title", content: full },
            { property: "og:description", content: description },
            { property: "og:type", content: "website" },
            { name: "twitter:card", content: "summary_large_image" },
            { name: "robots", content: "noindex" },
        ],
    };
}
