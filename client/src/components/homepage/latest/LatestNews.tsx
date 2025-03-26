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
    if (error) return <h2>Error: {error.message}</h2>;
    if (!newsPosts?.length) return <h2>No news posts found.</h2>;

    const latestNews = newsPosts.slice(0, 3);
    console.log(latestNews);
    const cardClasses = ["leftSideCard", "middleCard", "rightSideCard"];

    return (
        <section className={styles.latestNewsContainer}>
            {latestNews.map((news, index) => (
                <div key={index} className={styles[cardClasses[index]]}>
                    <img src={news.thumbnail} alt="News post thumbnail" className={styles.cardImage} />
                    <div className={styles.cardContent}>
                        <h3>{news.getAuthorAvatar()} • <span>{news.title}</span></h3>
                        {news.renderContentSmall()}
                    </div>
                </div>
            ))}
        </section>
    );
}

export default LatestNews;
