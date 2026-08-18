import {useQuery} from "@tanstack/react-query";
import { fetchNewsPost } from "@/scripts/newsPosts.ts";
import {NewsPost} from "@/scripts/model/NewsPost.ts";
import styles from "./NewsPostPageContent.module.scss";
import React, {JSX} from "react";
import Label from "@/components/label/Label.tsx";
import NotFoundPageContent from "@/components/etc/404/404PageContent.tsx";
import LoadingPageContent from "@/components/loading/LoadingPageContent.tsx";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCalendarDays, faEyeSlash} from "@fortawesome/free-solid-svg-icons";
import {loadNewsPostBody} from "@/components/news/newsPostBodyLoader.ts";

const NewsPostBody = React.lazy(loadNewsPostBody);


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
    } = useQuery<NewsPost>({
        queryKey: ["newsPost", id],
        queryFn: () => fetchNewsPost(id)
    });


    if (isLoading) return <LoadingPageContent />;
    if (error) return <NotFoundPageContent error={error.message} />;
    if (!newsPost) return <NotFoundPageContent />;

    return (
        newsPostPageSection(
            <div className={styles.articleCard}>
                <div className={styles.articleImageWrapper}>
                    <img src={newsPost.thumbnail} alt="" className={styles.articleImage}/>
                    <div className={styles.articleBadges}>
                        <time
                            className={styles.articleDate}
                            dateTime={new Date(newsPost.timestamp).toISOString()}
                        >
                            <FontAwesomeIcon icon={faCalendarDays}/>
                            {newsPost.formatTimestampCard()}
                        </time>
                        {newsPost.unlisted && (
                            <span className={styles.unlistedBadge} title="This article is only available by direct link">
                                <FontAwesomeIcon icon={faEyeSlash}/>
                                Unlisted
                            </span>
                        )}
                    </div>
                </div>
                <div className={styles.articleCardText}>
                    <h1>{newsPost.getDisplayTitle()}</h1>
                    <div className={styles.articleAuthorContainer}>
                        <img src={newsPost.getAuthorAvatarURL()} alt={newsPost.author}
                             className={styles.articleAuthorImageContainer}/>
                        By {newsPost.author}
                    </div>
                    <React.Suspense fallback={<p>Loading article…</p>}>
                        <NewsPostBody content={newsPost.content}/>
                    </React.Suspense>
                </div>
            </div>
        )
    );
}

export default NewsPostPageContent;
