import styles from "./Header.module.scss";
import newLogo from "@/assets/LumaLogoBig.png";
import littleLuma from "@/assets/lumas/LumaMainLuma.png";
import SmallTextLogo from "@/assets/LumaText.webp";
import Button from "@/components/ui/Button";
import Navbar from "@/components/navbar/Navbar.tsx";
import Carousel from "@/components/homepage/components/carousel/Carousel.tsx";
import {DISCORD_INV, INVIS_CHAR, LUMA_IP_ADDRESS} from "@/constants.ts";
import {useState} from "react";

function Header() {
    const [playButtonText, setPlayButtonText] = useState("Join 0 Players!");

    return (
        <section className={styles.headerBackground}>
            <Navbar
                beforeNavbarList={<img src={SmallTextLogo} alt="Luma Logo" className={styles.miniLumaLogo}/>}
                afterNavbarList={<Button text="0 Users Online" href={DISCORD_INV}/>}
            />
            <div className={styles.welcomeText}>
                <h1>Welcome To</h1>
                <h1>Luma</h1>
            </div>
            <img src={newLogo} alt="Luma Logo" className={styles.newLogo} />
            <img src={littleLuma} alt="Little Luma" className={styles.littleLumaIcon}/>
            <div className={styles.descriptionContainer}>
                We're a TownySMP server focused on high-quality gameplay and a vibrant,
                welcoming community.
            </div>

            <Button
                className={styles.playButton}
                text={playButtonText}
                onClick={() => {
                    navigator.clipboard.writeText(LUMA_IP_ADDRESS);
                    setPlayButtonText(`${INVIS_CHAR(9)}Copied!${INVIS_CHAR(9)}`)
                }}
                onMouseEnter={() => {setPlayButtonText(`${INVIS_CHAR(1)}Click to Copy!`)}}
                onMouseLeave={() => {setPlayButtonText("Join 0 Players!")}}
            />

            <Carousel />

        </section>
    );
}

export default Header;
