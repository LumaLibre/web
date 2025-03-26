import styles from "./Header.module.scss";
import logo from "@/assets/LumaLogoBig.png";
import littleLuma from "@/assets/lumas/LumaMainLuma.png";
import SmallTextLogo from "@/assets/LumaText.webp";
import Button from "@/components/ui/Button";
import Navbar from "@/components/navbar/Navbar.tsx";
import Carousel from "@/components/homepage/carousel/Carousel.tsx";
import {DISCORD_INV, INVIS_CHAR, LUMA_IP_ADDRESS} from "@/constants.ts";
import {useState} from "react";
import LatestNews from "@/components/homepage/latest/LatestNews.tsx";

function Header() {
    const [playButtonText, setPlayButtonText] = useState("Join 0 Players!");

    return (
        <section className={styles.headerBackground}>
            <Navbar
                beforeNavbarList={<img src={SmallTextLogo} alt="Luma Logo" className={styles.miniLumaLogo}/>}
                afterNavbarList={<Button text="0 Users Online" href={DISCORD_INV} className={styles.discordButton}/>}
            />
            <img src={logo} alt="Luma Logo" className={styles.logo}/>
            <div className={styles.titleTextContainer}>
                <h1 className={styles.welcomeText}>
                    Welcome To
                    <span className={styles.welcomeTextUnderlying}>Luma</span>
                </h1>
                <img src={littleLuma} alt="Little Luma" className={styles.littleLumaIcon}/>
            </div>
            <div className={styles.descriptionContainer}>
                We're a TownySMP server focused on high-quality gameplay and a vibrant,
                welcoming community.
            </div>

            <Button
                className={styles.playButton}
                buttonBorderClassName={styles.playButtonBorder}
                buttonContentClassName={styles.playButtonContent}
                text={playButtonText}
                onClick={() => {
                    navigator.clipboard.writeText(LUMA_IP_ADDRESS);
                    setPlayButtonText(`${INVIS_CHAR(9)}Copied!${INVIS_CHAR(9)}`)
                }}
                onMouseEnter={() => {
                    setPlayButtonText(`${INVIS_CHAR(1)}Click to Copy!`)
                }}
                onMouseLeave={() => {
                    setPlayButtonText("Join 0 Players!")
                }}
            />
            <Button
                text="0 Users Online"
                href={DISCORD_INV}
                className={styles.discordButtonMobile}
                buttonContentClassName={styles.discordButtonMobileContent}
            />
            <Carousel/>
            <LatestNews/>
        </section>
    );
}

export default Header;
