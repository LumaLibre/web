import { useQuery } from "@tanstack/react-query";
import { fetchNewsPost } from "@/scripts/newsPosts.ts";
import {NewsPostContainer} from "@/scripts/model/NewsPostContainer.tsx";
import styles from "./NewsPostPageContent.module.scss";
import {JSX} from "react";
import Label from "@/components/label/Label.tsx";


const newsPostPageSection = (element: JSX.Element)=> {
    return (
        <section className={styles.newsPostBackground}>
            <Label />
            {element}
        </section>
    );
};

/**
 * NewsPostPageContent component, displays a single news post in a page.
 * @param id The id of the news post to display.
 * @constructor NewsPostPageContent
 */
function NewsPostPageContent({ id }: { id: string }) {

    const {
        data: newsPost,
        isLoading,
        error,
    } = useQuery<NewsPostContainer>({
        queryKey: [id, id],
        queryFn: ({ queryKey }) => {
            const [, postId] = queryKey as [string, string];
            return fetchNewsPost(postId);
        },
    });


    if (isLoading) return newsPostPageSection(<h2>Loading news post...</h2>);
    if (error) return newsPostPageSection(<h2>Error fetching news post: {error.message}</h2>);
    if (!newsPost) return newsPostPageSection(<h2>No news post found.</h2>);

    return (
        newsPostPageSection(
            <div className={styles.articleCard}>
                <img src={newsPost.thumbnail} alt={newsPost.title} className={styles.articleImage}/>
                <div className={styles.articleCardText}>
                    <h1>{newsPost.title}</h1>
                    <div className={styles.articleAuthorContainer}>
                        <img src={newsPost.getAuthorAvatarURL()} alt={newsPost.author}
                             className={styles.articleAuthorImageContainer}/>
                        By {newsPost.author} • On {newsPost.formatTimestampWithOrdinal()}
                    </div>
                    {newsPost.renderContent()}
                </div>
            </div>
        )
    );
}

export default NewsPostPageContent;
