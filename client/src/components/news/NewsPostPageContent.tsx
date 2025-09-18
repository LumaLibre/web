import { useQuery } from "@tanstack/react-query";
import { fetchNewsPost } from "@/scripts/newsPosts.ts";
import {NewsPostContainer} from "@/scripts/model/NewsPostContainer.tsx";
import styles from "./NewsPostPageContent.module.scss";
import {JSX} from "react";
import Label from "@/components/label/Label.tsx";
import NotFoundPageContent from "@/components/etc/404/404PageContent.tsx";
import LoadingPageContent from "@/components/loading/LoadingPageContent.tsx";


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


    if (isLoading) return <LoadingPageContent />;
    if (error) return <NotFoundPageContent />;
    if (!newsPost) return <NotFoundPageContent />;

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
