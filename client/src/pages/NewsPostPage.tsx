import NewsPostPageContent from "@/components/news/NewsPostPageContent.tsx";
import Navbar from "@/components/navbar/Navbar.tsx";
import Footer from "@/components/footer/Footer.tsx";
import {fetchNewsPost, NewsFetchError} from "@/scripts/newsPosts.ts";
import {displayNewsTitle, reviveNewsPost} from "@/scripts/model/NewsPost.ts";
import {serverApiUrl} from "@/serverApi.ts";
import {seoMeta} from "@/seo.ts";
import {isRouteErrorResponse, useRouteError, type LoaderFunctionArgs} from "react-router";
import NotFoundPageContent from "@/components/etc/404/404PageContent.tsx";

export async function loader({params}: LoaderFunctionArgs) {
    if (!params.id) {
        throw new Response("News post not found", {status: 404});
    }

    try {
        const newsPost = await fetchNewsPost(params.id, serverApiUrl("/api"));
        return {newsPost};
    } catch (error) {
        if (error instanceof NewsFetchError && error.status === 404) {
            throw new Response("News post not found", {status: 404});
        }
        throw error;
    }
}

export const meta = ({data}: {data?: Awaited<ReturnType<typeof loader>>}) => {
    if (!data?.newsPost) {
        return seoMeta({title: "News post not found", path: "/news", noIndex: true});
    }
    const post = data.newsPost;
    const description = post.content
        .replace(/[#*_`>()]/g, " ")
        .replace(/\[|\]/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 160);
    return seoMeta({
        title: displayNewsTitle(post.title),
        description,
        path: `/news/${encodeURIComponent(post.id)}`,
        image: post.thumbnail,
        type: "article",
    });
};

/**
 * A component that displays a news post based on the URL.
 * @constructor NewsPostPage
 */
function NewsPostPage({loaderData}: {loaderData: Awaited<ReturnType<typeof loader>>}) {
    const newsPost = reviveNewsPost(loaderData.newsPost);
    const structuredData = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "NewsArticle",
        headline: displayNewsTitle(newsPost.title),
        image: [newsPost.thumbnail],
        datePublished: new Date(newsPost.timestamp).toISOString(),
        author: {"@type": "Person", name: newsPost.author},
        publisher: {"@type": "Organization", name: "LumaMC", url: "https://lumamc.net/"},
        mainEntityOfPage: `https://lumamc.net/news/${encodeURIComponent(newsPost.id)}`,
    }).replace(/</g, "\\u003c");

    return (
        <div>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{__html: structuredData}}
            />
            <Navbar />
            <NewsPostPageContent id={newsPost.id} initialNewsPost={newsPost}/>
            <Footer />
        </div>
    );
}

export function ErrorBoundary() {
    const error = useRouteError();
    const message = isRouteErrorResponse(error) && error.status === 404
        ? "That news post does not exist."
        : "The news post could not be loaded.";

    return (
        <div>
            <Navbar/>
            <NotFoundPageContent error={message}/>
            <Footer/>
        </div>
    );
}

export default NewsPostPage;
