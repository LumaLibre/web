import styles from "./LatestNews.module.scss";
import {useQuery} from "@tanstack/react-query";
import {NewsPostContainer} from "@/scripts/model/NewsPostContainer.tsx";
import {fetchAllNewsPosts} from "@/scripts/newsPosts.ts";

function LatestNews() {
    const {
        data: newsPosts,
        isLoading,
        error,
    } = useQuery<NewsPostContainer[]>({
        queryKey: ["allNewsPosts"],
        queryFn: fetchAllNewsPosts, // todo: func to just get 3 latest news
    });

    if (isLoading) return <div></div>;
    if (error) return <h2>Error fetching news posts: {error.message}</h2>;
    if (!newsPosts) return <h2>No news posts found.</h2>;

    const leftSideNews = newsPosts[0];
    const middleNews = newsPosts[1];
    const rightSideNews = newsPosts[2];

    return (
        <section className={styles.latestNewsContainer}>
            <div className={styles.leftSideCard}>
                <img src={leftSideNews.thumbnail} alt="News post thumbnail" className={styles.cardImage} />
            </div>
            <div className={styles.middleCard}>
                <img src={middleNews.thumbnail} alt="News post thumbnail" className={styles.cardImage} />
            </div>
            <div className={styles.rightSideCard}>
                <img src={rightSideNews.thumbnail} alt="News post thumbnail" className={styles.cardImage} />
            </div>
        </section>
    );
}

export default LatestNews;
