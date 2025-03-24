import styles from "./LoadingPageContent.module.scss";
import blackLumaAlert from "@/assets/lumas/BlackLumaAlert.webp";
import breweryLuma from "@/assets/lumas/BreweryLuma.webp";
import fishingLuma from "@/assets/lumas/FishingLuma.webp";

const lumaImages = [
    blackLumaAlert,
    breweryLuma,
    fishingLuma
];

function getRandomElement<T>(list: T[]): T {
    const randomIndex = Math.floor(Math.random() * list.length);
    return list[randomIndex];
}

function LoadingPageContent() {
    return (
        <div className={styles.background}>
            <div className={styles.loadingLumaImageContainer}>
                <img src={getRandomElement(lumaImages)} alt="Loading Luma" className={styles.loadingLumaImage} />
            </div>
        </div>
    );
}

export default LoadingPageContent;