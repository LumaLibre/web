const DEFAULT_BACKEND_ORIGIN = "http://127.0.0.1:7070";

export function serverApiUrl(path: string): string {
    const origin = process.env.LUMA_BACKEND_ORIGIN ?? DEFAULT_BACKEND_ORIGIN;
    return new URL(path, origin.endsWith("/") ? origin : `${origin}/`).toString();
}
