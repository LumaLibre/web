import {fetchDiscordStatus, fetchServerStatus} from "@/scripts/serverStatuses.ts";
import {DISCORD_INV, DISCORD_INV_SHORT, LUMA_IP_ADDRESS} from "@/constants.ts";
import {useState} from "react";
import logo from "@/assets/LumaText.webp";
import styles from "./Label.module.scss";
import {useQuery} from "@tanstack/react-query";
import {Link} from "react-router-dom";

const PLAY_BUTTON = "/PlayButtonHeading.webp"
const DISCORD_BUTTON = "/DiscordButtonHeading.webp"

const Label = () => {
    // querying
    // eslint-disable-next-line prefer-const
    let {data: mcStatus, isLoading: mcStatusIsLoading, isError: mcStatusError} = useQuery<string>({
        queryKey: ["mcServerStatus"],
        queryFn: fetchServerStatus
    });
    // eslint-disable-next-line prefer-const
    let {data: discordStatus, isLoading: discordStatusIsLoading, isError: discordStatusError} = useQuery<string>({
        queryKey: ["discordServerStatus"],
        queryFn: fetchDiscordStatus
    });
    if (mcStatusIsLoading || mcStatusError || !mcStatus) {
        mcStatus = 'Loading...';
    }
    if (discordStatusIsLoading || discordStatusError || !discordStatus) {
        discordStatus = 'Loading...'
    }

    const [mcHoverText, mcSetHoverText] = useState(LUMA_IP_ADDRESS);
    const [discordHoverText, discordSetHoverText] = useState(DISCORD_INV_SHORT);

    return (
        <div className={styles.labelContainer}>
            <div className={styles.playBtnContainer}>
                <div className={styles.playBtnImg}
                     onMouseEnter={() => mcSetHoverText("Click to copy!")}
                     onMouseLeave={() => mcSetHoverText(LUMA_IP_ADDRESS)}
                     onClick={() => {
                         navigator.clipboard.writeText(LUMA_IP_ADDRESS);
                         mcSetHoverText("Copied, see you there!");
                     }}
                >
                    <img src={PLAY_BUTTON} alt="Play Button"/>
                    <h2>{mcStatus}</h2>
                    <h3>{mcHoverText}</h3>
                </div>
            </div>
            <Link to="/">
                <img src={logo} alt="Luma Logo" className={styles.logoImage}/>
            </Link>
            <div className={styles.discordBtnContainer}>
                <div className={styles.discordBtnImg}
                     onMouseEnter={() => discordSetHoverText("Click to join!")}
                     onMouseLeave={() => discordSetHoverText(DISCORD_INV_SHORT)}
                     onClick={() => {
                         window.open(DISCORD_INV, "_blank");
                         discordSetHoverText("Woo, see you there!");
                     }}
                >
                    <img src={DISCORD_BUTTON} alt="Discord Button"/>
                    <h2>{discordStatus}</h2>
                    <h3>{discordHoverText}</h3>
                </div>
            </div>
        </div>
    );
};

export default Label;