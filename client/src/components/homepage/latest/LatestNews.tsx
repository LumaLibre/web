import styles from "./LatestNews.module.scss";
import {useQuery} from "@tanstack/react-query";
import {NewsPostContainer} from "@/scripts/model/NewsPostContainer.tsx";
import {fetchAllNewsPosts} from "@/scripts/newsPosts.ts";
import Button from "@/components/ui/Button.tsx";
import {useNavigate} from "react-router-dom";
import useIsMobile from "@/components/ui/UseIsMobile.tsx";

function LatestNews() {
    const isMobile = useIsMobile();
    const navigate = useNavigate();
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
    const cardClasses = ["leftSideCard", "middleCard", "rightSideCard"];

    return (
        <>
            <div className={styles.latestNewsContainer}>
                {latestNews.map((news, index) => (
                    <div
                        key={index}
                        className={styles[cardClasses[index]]}
                        onClick={() => {
                            navigate(`/news/${news.id}`);
                            window.scrollTo(0, 0);
                        }}>
                        <img src={news.thumbnail} alt="News post thumbnail" className={styles.cardImage} />
                        <div className={styles.cardContent}>
                            <h3>{news.getAuthorAvatar()} • <span>{news.title}</span></h3>
                            {!isMobile ? news.renderContentSmall() : news.renderContentTiny(15, 6)}
                        </div>
                    </div>
                ))}
            </div>
            <Button text="View all articles" className={styles.viewAllButton} href="/news" />
        </>
    );
}

export default LatestNews;
