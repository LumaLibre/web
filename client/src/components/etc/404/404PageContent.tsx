import styles from "./404PageContent.module.scss";
import softInterroBangLuma from "@/assets/lumas/SoftInterroBangLuma.webp";

function NotFoundPageContent() {
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
                    </p>
                </div>
            </div>
        </section>
    );
}

export default NotFoundPageContent;