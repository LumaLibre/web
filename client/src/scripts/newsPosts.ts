import {NewsPostContainer} from "./model/NewsPostContainer.tsx";
import {API_ENDPOINT} from "@/constants.ts";

const endpoint: string = `${API_ENDPOINT}/news/`;

/**
 * Fetches all news posts from the webserver API.
 * @returns An array of NewsPostContainer objects.
 */
export async function fetchAllNewsPosts(): Promise<NewsPostContainer[]> {
    const response = await fetch(endpoint);

    if (!response.ok) {
        throw new Error(`Failed to fetch news posts: ${response.status} ${response.statusText}`);
    }

    const jsonData = await response.json();

    // Explicitly assert the type of the values returned from the API.
    const newsPostsArray = Object.values(jsonData) as Array<{
        id: string;
        title: string;
        thumbnail: string;
        author: string;
        timestamp: number;
        content: string;
    }>;

    return newsPostsArray.map((newsPost) =>
        new NewsPostContainer(
            newsPost.id,
            newsPost.title,
            newsPost.thumbnail,
            newsPost.author,
            newsPost.timestamp,
            newsPost.content
        )
    );
}


/**
 * Fetches a specific news post by its ID from the webserver API.
 * @param id The ID of the news post to fetch.
 */
export async function fetchNewsPost(id: string): Promise<NewsPostContainer> {
    return fetch(endpoint + id)
        .then(response => response.json())
        .then(newsPost => new NewsPostContainer(newsPost.id, newsPost.title, newsPost.thumbnail, newsPost.author, newsPost.timestamp, newsPost.content));
}