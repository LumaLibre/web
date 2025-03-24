import styles from "./LeadContent.module.scss";
import generalStyles from "../HeaderSector.module.scss";
import groundImg from "@/assets/GroundBackground.webp";
import houseImg from "@/assets/House.webp";
import crossPlatformImg from "@/assets/lumas/CrossplatformLuma.webp";
import eventImg from "@/assets/lumas/EventLuma.webp";

function LeadContent() {
    return (
        <section className={generalStyles.contentBackground}>
            <img src={groundImg} alt="Main Background" className={generalStyles.contentImage} />
            <div className={styles.leadContentText}>
                <h1>Welcome to Luma</h1>
                <p>
                    {/* This description kind of sucks - TODO: Change this */}
                    We're a TownySMP server focused on high-quality gameplay and a vibrant,
                    welcoming community. Join us to enjoy unique features like custom items,
                    a seasonal world, item wraps, mcMMO, and Towny!
                </p>
                <div className={styles.imageContainer}>
                    <img src={crossPlatformImg} alt="Cross Platform" className={styles.smallImage} />
                    <img src={houseImg} alt="House" className={styles.smallImage} />
                    <img src={eventImg} alt="Events" className={styles.smallImage} />
                </div>
            </div>
        </section>
    );
}

export default LeadContent;
