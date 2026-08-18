import {useState} from "react";
import {RecordedVoter} from "@/scripts/model/RecordedVoter.ts";
import styles from "./TopVoter.module.scss";
import {playerBodyRenderUrl, playerFaceUrl} from "@/scripts/playerRender.ts";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCrown} from "@fortawesome/free-solid-svg-icons";

const rankClasses = [styles.rankOne, styles.rankTwo, styles.rankThree];

const TopVoter = ({recordedVoter, index}: { recordedVoter: RecordedVoter, index: number }) => {
    const [renderState, setRenderState] = useState<"loading" | "loaded" | "failed">("loading");
    const name = recordedVoter.name || "Voter";

    return (
        <article className={`${styles.topVoterContainer} ${rankClasses[index - 1]}`}>
            <span className={styles.rankBadge}>
                {index === 1 && <FontAwesomeIcon icon={faCrown}/>}#{index}
            </span>

            <div className={styles.renderSlot}>
                <img
                    className={`${styles.face} ${renderState === "loaded" ? styles.faceHidden : ""}`}
                    src={playerFaceUrl(recordedVoter.uuid)}
                    alt=""
                    aria-hidden="true"
                />

                {renderState !== "failed" && (
                    <img
                        className={`${styles.render} ${renderState === "loaded" ? styles.renderVisible : ""}`}
                        src={playerBodyRenderUrl(recordedVoter.uuid, index - 1)}
                        alt=""
                        aria-hidden="true"
                        loading="lazy"
                        onLoad={() => setRenderState("loaded")}
                        onError={() => setRenderState("failed")}
                    />
                )}
            </div>

            <div className={styles.details}>
                <h3 title={name}>{name}</h3>
                <span>{recordedVoter.votes} votes</span>
            </div>
        </article>
    );
};

export default TopVoter;
