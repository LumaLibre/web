import { useState } from "react";
import styles from "./Navbar.module.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHouse, faGavel, faCheckCircle, faStore, faMap, faBook, faRocket } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
import { STORE, WIKI } from "@/constants.ts";


function HomepageNavbar() {
    const [isMenuOpen, setMenuOpen] = useState(false);

    const toggleMenu = () => {
        setMenuOpen(!isMenuOpen);
    };

    return (
        <nav className={styles.navbar}>

            <div className={`${styles.hamburger} ${isMenuOpen ? styles.open : ""}`} onClick={toggleMenu}>
                <div/>
                <div/>
                <div/>
            </div>

            <ul className={`${styles.navList} ${isMenuOpen ? styles.open : ""}`}>
                <li className={styles.navItem}>

                    <Link to="/" className={styles.navLink} onClick={toggleMenu}>
                        <FontAwesomeIcon icon={faHouse} className={styles.navIcon}/>
                        <span>Home</span>
                    </Link>
                </li>
                <li className={styles.navItem}>
                    <Link to="/rules" className={styles.navLink} onClick={toggleMenu}>
                        <FontAwesomeIcon icon={faGavel} className={styles.navIcon}/>
                        <span>Rules</span>
                    </Link>
                </li>
                <li className={styles.navItem}>
                    <Link to="/vote" className={styles.navLink} onClick={toggleMenu}>
                        <FontAwesomeIcon icon={faCheckCircle} className={styles.navIcon}/>
                        <span>Vote</span>
                    </Link>
                </li>
                <li className={styles.navItem}>
                    <Link to="/news" className={styles.navLink} onClick={toggleMenu}>
                        <FontAwesomeIcon icon={faRocket} className={styles.navIcon}/>
                        <span>News</span>
                    </Link>
                </li>
                <li className={styles.navItem}>
                    <a href={STORE} rel="noopener noreferrer" onClick={toggleMenu}>
                        <FontAwesomeIcon icon={faStore} className={styles.navIcon}/>
                        <span>Store</span>
                    </a>
                </li>
                <li className={styles.navItem}>
                    <a href="https://map.lumamc.net" rel="noopener noreferrer" onClick={toggleMenu}>
                        <FontAwesomeIcon icon={faMap} className={styles.navIcon}/>
                        <span>Map</span>
                    </a>
                </li>
                <li className={styles.navItem}>
                    <a href={WIKI} rel="noopener noreferrer" onClick={toggleMenu}>
                        <FontAwesomeIcon icon={faBook} className={styles.navIcon}/>
                        <span>Wiki</span>
                    </a>
                </li>
            </ul>
        </nav>
    );
}

export default HomepageNavbar;
