import {NewsPost, NewsPostSummary} from "./model/NewsPost.ts";
import {API_ENDPOINT} from "@/constants.ts";

const endpoint: string = `${API_ENDPOINT}/news/`;

export const newsPostPath = (id: string) => `/news/${encodeURIComponent(id)}`;

export async function fetchNewsSummaries(limit?: number): Promise<NewsPostSummary[]> {
    const query = limit === undefined ? "" : `?limit=${limit}`;
    const response = await fetch(`${endpoint}summaries${query}`);

    if (!response.ok) {
        throw new Error(`Failed to fetch news posts: ${response.status} ${response.statusText}`);
    }

    const jsonData = await response.json();

    // Explicitly assert the type of the values returned from the API.
    const summaries = Object.values(jsonData) as Array<{
        id: string;
        title: string;
        thumbnail: string;
        author: string;
        timestamp: number;
        excerpt: string;
        unlisted?: boolean;
    }>;

    return summaries
        .filter(summary => !summary.unlisted)
        .map(summary =>
            new NewsPostSummary(
                summary.id,
                summary.title,
                summary.thumbnail,
                summary.author,
                summary.timestamp,
                summary.excerpt,
                summary.unlisted ?? false
            )
        );
}


/**
 * Fetches a specific news post by its ID from the webserver API.
 * @param id The ID of the news post to fetch.
 */
export async function fetchNewsPost(id: string): Promise<NewsPost> {
    return fetch(endpoint + encodeURIComponent(id))
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to fetch news post: ${response.status} ${response.statusText}`);
            }
            return response.json();
        })
        .then(newsPost => new NewsPost(
            newsPost.id,
            newsPost.title,
            newsPost.thumbnail,
            newsPost.author,
            newsPost.timestamp,
            newsPost.content,
            newsPost.unlisted ?? false
        ));
}
