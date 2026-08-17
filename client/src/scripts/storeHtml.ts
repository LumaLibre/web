import DOMPurify from "dompurify";

export function sanitizeStoreHtml(html: string): string {
    return DOMPurify.sanitize(html ?? "", {
        ALLOWED_TAGS: [
            "p", "br", "hr", "strong", "b", "em", "i", "u", "s", "span", "div",
            "ul", "ol", "li", "a", "img",
            "h1", "h2", "h3", "h4", "h5", "h6",
            "blockquote", "code", "pre", "table", "thead", "tbody", "tr", "th", "td"
        ],
        ALLOWED_ATTR: ["href", "target", "rel", "src", "alt", "title", "class"],
        ALLOWED_URI_REGEXP: /^(?:https?:|mailto:|#|\/)/i
    });
}

export const storeHtml = (html: string) => ({__html: sanitizeStoreHtml(html)});
