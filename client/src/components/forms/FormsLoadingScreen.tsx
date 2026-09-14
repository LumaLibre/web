import fullLuma from "@/assets/lumas/FullLuma.webp";
import styles from "./FormsLoadingScreen.module.scss";

const MESSAGES = [
    "Getting things ready...",
    "Preparing the form...",
    "Loading the form...",
    "Almost there...",
    "Please wait...",
    "Getting everything set up...",
    "Preparing your experience...",
]

function FormsLoadingScreen({embedded = false}: {embedded?: boolean}) {
    return (
        <div
            className={`${styles.screen} ${embedded ? styles.embedded : ""}`}
            role="status"
            aria-live="polite"
        >
            <img src={fullLuma} alt="" aria-hidden="true"/>
            <p>{MESSAGES[Math.floor(Math.random() * MESSAGES.length)]}</p>
        </div>
    );
}

export default FormsLoadingScreen;
