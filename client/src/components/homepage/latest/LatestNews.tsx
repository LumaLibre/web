import styles from "./LatestNews.module.scss";
import {useQuery} from "@tanstack/react-query";
import {NewsPostSummary} from "@/scripts/model/NewsPost.ts";
import {fetchNewsSummaries} from "@/scripts/newsPosts.ts";
import Button from "@/components/ui/Button.tsx";
import {useNavigate} from "react-router-dom";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCalendarDays} from "@fortawesome/free-solid-svg-icons";

function LatestNews() {
    const navigate = useNavigate();
    const {
        data: newsPosts,
        isLoading,
        error,
    } = useQuery<NewsPostSummary[]>({
        queryKey: ["newsSummaries", 3],
        queryFn: () => fetchNewsSummaries(3),
    });

    if (isLoading) return <div></div>;
    if (error) return <h2>Error: {error.message}</h2>;
    if (!newsPosts?.length) return <h2>No news posts found.</h2>;

    const latestNews = newsPosts.slice(0, 3);

    const openPost = (id: string) => {
        navigate(`/news/${id}`);
    };

    const viewAllArticles = () => {
        navigate("/news");
        window.scrollTo({top: 0, left: 0, behavior: "auto"});
    };

    return (
        <>
            <div className={styles.latestNewsContainer}>
                {latestNews.map((news) => (
                    <div
                        key={news.id}
                        className={styles.newsCard}
                        onClick={() => openPost(news.id)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(event) => {
                            if (event.key === "Enter" || event.key === " ") openPost(news.id);
                        }}
                    >
                        <div className={styles.imageWrapper}>
                            <img
                                src={news.thumbnail}
                                alt=""
                                className={styles.cardImage}
                            />
                            <time
                                className={styles.dateBadge}
                                dateTime={new Date(news.timestamp).toISOString()}
                            >
                                <FontAwesomeIcon icon={faCalendarDays}/>
                                {news.formatTimestampCard()}
                            </time>
                        </div>

                        <div className={styles.cardBody}>
                            <h3 className={styles.cardTitle} title={news.getDisplayTitle()}>
                                {news.getDisplayTitle()}
                            </h3>
                            <p className={styles.excerpt}>{news.excerpt}</p>

                            <div className={styles.cardFooter}>
                                <div className={styles.author}>
                                    <img src={news.getAuthorAvatarURL(32)} alt=""/>
                                    <span>{news.author}</span>
                                </div>
                                <span className={styles.readMore}>Read article</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <Button
                text="View all articles"
                className={styles.viewAllButton}
                onClick={viewAllArticles}
            />
        </>
    );
}

export default LatestNews;
