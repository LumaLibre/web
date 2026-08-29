import {MINOTAR_API} from "@/constants.ts";

export class NewsPostSummary {
    constructor(
        public id: string,
        public title: string,
        public thumbnail: string,
        public author: string,
        public timestamp: number,
        public excerpt: string,
        public unlisted = false
    ) {}

    getAuthorAvatarURL(size = 180): string {
        return `${MINOTAR_API}helm/${this.author}/${size}.png`;
    }

    getDisplayTitle(): string {
        return this.title
            .replace(/\s*[-–—]\s*\d{1,2}\/\d{1,2}(?:\/\d{2,4})?\s*$/, "")
            .trim();
    }

    formatTimestampCard(): string {
        return new Date(this.timestamp).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            timeZone: "EST",
        });
    }
}

export class NewsPost extends NewsPostSummary {
    constructor(
        id: string,
        title: string,
        thumbnail: string,
        author: string,
        timestamp: number,
        public content: string,
        unlisted = false
    ) {
        super(id, title, thumbnail, author, timestamp, "", unlisted);
    }
}

export type NewsPostSummaryData = Pick<
    NewsPostSummary,
    "id" | "title" | "thumbnail" | "author" | "timestamp" | "excerpt" | "unlisted"
>;

export type NewsPostData = Pick<
    NewsPost,
    "id" | "title" | "thumbnail" | "author" | "timestamp" | "content" | "unlisted"
>;

export const reviveNewsPostSummary = (post: NewsPostSummaryData): NewsPostSummary =>
    new NewsPostSummary(
        post.id,
        post.title,
        post.thumbnail,
        post.author,
        post.timestamp,
        post.excerpt,
        post.unlisted,
    );

export const reviveNewsPost = (post: NewsPostData): NewsPost =>
    new NewsPost(
        post.id,
        post.title,
        post.thumbnail,
        post.author,
        post.timestamp,
        post.content,
        post.unlisted,
    );

export const displayNewsTitle = (title: string): string =>
    title.replace(/\s*[-–—]\s*\d{1,2}\/\d{1,2}(?:\/\d{2,4})?\s*$/, "").trim();
