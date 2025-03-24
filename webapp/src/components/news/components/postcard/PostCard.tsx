import styles from "./PostCard.module.scss";
import {NewsPostContainer} from "@/scripts/model/NewsPostContainer.tsx";
import {useNavigate} from "react-router-dom";


function NewsPost({ newsPost, biggerContainer }: { newsPost: NewsPostContainer, biggerContainer: boolean}) {
    const navigate = useNavigate();

    return (
        <div className={styles.postCard} onClick={() => navigate(`/news/${newsPost.id}`)}>
            <img src={newsPost.thumbnail} alt={newsPost.title} width={300} height={175}/>
            <div className={styles.container}>
                <h3>{newsPost.getAuthorAvatar()} • <span className={styles.titleFont}>{newsPost.title}</span></h3>
                {newsPost.renderContentSmall()}
            </div>
        </div>
    )
}

export default NewsPost;