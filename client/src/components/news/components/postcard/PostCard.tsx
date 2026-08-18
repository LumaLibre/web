import styles from "./PostCard.module.scss";
import {NewsPostSummary} from "@/scripts/model/NewsPost.ts";
import {useNavigate} from "react-router-dom";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCalendarDays} from "@fortawesome/free-solid-svg-icons";
import {newsPostPath} from "@/scripts/newsPosts.ts";


function NewsPost({newsPost}: { newsPost: NewsPostSummary}) {
    const navigate = useNavigate();
    const openPost = () => navigate(newsPostPath(newsPost.id));

    return (
        <div
            className={styles.postCard}
            onClick={openPost}
            role="button"
            tabIndex={0}
            onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") openPost();
            }}
        >
            <div className={styles.imageWrapper}>
                <img src={newsPost.thumbnail} alt=""/>
                <time
                    className={styles.dateBadge}
                    dateTime={new Date(newsPost.timestamp).toISOString()}
                >
                    <FontAwesomeIcon icon={faCalendarDays}/>
                    {newsPost.formatTimestampCard()}
                </time>
            </div>

            <div className={styles.body}>
                <h3 className={styles.title} title={newsPost.getDisplayTitle()}>
                    {newsPost.getDisplayTitle()}
                </h3>
                <p className={styles.excerpt}>{newsPost.excerpt}</p>

                <div className={styles.footer}>
                    <div className={styles.author}>
                        <img src={newsPost.getAuthorAvatarURL(32)} alt=""/>
                        <span>{newsPost.author}</span>
                    </div>
                    <span className={styles.readMore}>Read article</span>
                </div>
            </div>
        </div>
    )
}

export default NewsPost;
