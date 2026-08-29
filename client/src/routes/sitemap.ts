import type {LoaderFunctionArgs} from "react-router";
import {serverApiUrl} from "@/serverApi.ts";

interface NewsSummaryDto {
    id: string;
    timestamp: number;
    unlisted?: boolean;
}

const escapeXml = (value: string) => value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

export async function loader({request}: LoaderFunctionArgs) {
    const origin = new URL(request.url).origin;
    const staticPaths = ["/", "/rules", "/vote", "/news", "/privacy", "/store"];
    let articles: NewsSummaryDto[] = [];

    try {
        const response = await fetch(serverApiUrl("/api/news/summaries"), {
            signal: AbortSignal.timeout(3_000),
        });
        if (response.ok) {
            articles = (Object.values(await response.json()) as NewsSummaryDto[])
                .filter(article => !article.unlisted);
        }
    } catch {
        // A temporary backend failure must not take down the static portion of the sitemap.
    }

    const urls: Array<{loc: string; lastmod?: string}> = [
        ...staticPaths.map(path => ({loc: new URL(path, origin).toString()})),
        ...articles.map(article => ({
            loc: new URL(`/news/${encodeURIComponent(article.id)}`, origin).toString(),
            lastmod: new Date(article.timestamp).toISOString(),
        })),
    ];
    const body = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
        ...urls.map(url => [
            "  <url>",
            `    <loc>${escapeXml(url.loc)}</loc>`,
            ...(url.lastmod ? [`    <lastmod>${url.lastmod}</lastmod>`] : []),
            "  </url>",
        ].join("\n")),
        "</urlset>",
    ].join("\n");

    return new Response(body, {
        headers: {
            "Content-Type": "application/xml; charset=utf-8",
            "Cache-Control": "public, max-age=300, stale-while-revalidate=3600",
        },
    });
}
