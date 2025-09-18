import styles from "./404PageContent.module.scss";
import softInterroBangLuma from "@/assets/lumas/SoftInterrobangLuma.webp";
import {useLocation} from "react-router-dom";

function NotFoundPageContent({ error } : { error?: String }) {
    const location = useLocation();
    const fullSlug = location.pathname;

    return (
        <section className={styles.background}>
            <div className={styles.contentContainer}>
                <div className={styles.imageContainer}>
                    <img src={softInterroBangLuma} alt="404" className={styles.image} />
                </div>
                <div className={styles.textContainer}>
                    <h1 className={styles.titleText}>
                        404
                    </h1>
                    <p className={styles.text}>
                        <strong>This little Luma searched far and wide, but couldn't find the page you're looking for...</strong>
                        <br/>
                        ({error ? error : <><strong>{fullSlug}</strong> isn't a page.</>})
                    </p>
                </div>
            </div>
        </section>
    );
}

export default NotFoundPageContent;