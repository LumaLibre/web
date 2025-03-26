import React, { useState } from "react";
import styles from "./Navbar.module.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHouse, faGavel, faCheckCircle, faStore, faMap, faBook, faRocket } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
import { STORE, WIKI } from "@/constants.ts";

interface NavbarProps {
    beforeNavbarList?: React.ReactNode;
    afterNavbarList?: React.ReactNode;
}


function Navbar({beforeNavbarList, afterNavbarList }: NavbarProps) {
    const [isMenuOpen, setMenuOpen] = useState(false);

    const toggleMenu = () => {
        setMenuOpen(!isMenuOpen);
    };

    return (
        <nav className={styles.navbar}>
            {beforeNavbarList && beforeNavbarList}

            <div className={`${styles.hamburger} ${isMenuOpen ? styles.open : ""}`} onClick={toggleMenu}>
                <div/>
                <div/>
                <div/>
            </div>

            <ul className={`${styles.navList} ${isMenuOpen ? styles.open : ""}`}>
                <li className={styles.navItem}>

                    <Link to="/" onClick={toggleMenu}>
                        <FontAwesomeIcon icon={faHouse} className={styles.navIcon}/>
                        <span className={styles.navText}>Home</span>
                    </Link>
                </li>
                <li className={styles.navItem}>
                    <Link to="/rules" onClick={toggleMenu}>
                        <FontAwesomeIcon icon={faGavel} className={styles.navIcon}/>
                        <span className={styles.navText}>Rules</span>
                    </Link>
                </li>
                <li className={styles.navItem}>
                    <Link to="/vote" onClick={toggleMenu}>
                        <FontAwesomeIcon icon={faCheckCircle} className={styles.navIcon}/>
                        <span className={styles.navText}>Vote</span>
                    </Link>
                </li>
                <li className={styles.navItem}>
                    <Link to="/news" onClick={toggleMenu}>
                        <FontAwesomeIcon icon={faRocket} className={styles.navIcon}/>
                        <span className={styles.navText}>News</span>
                    </Link>
                </li>
                <li className={styles.navItem}>
                    <a href={STORE} rel="noopener noreferrer" onClick={toggleMenu}>
                        <FontAwesomeIcon icon={faStore} className={styles.navIcon}/>
                        <span className={styles.navText}>Store</span>
                    </a>
                </li>
                <li className={styles.navItem}>
                    <a href="https://map.lumamc.net" rel="noopener noreferrer" onClick={toggleMenu}>
                        <FontAwesomeIcon icon={faMap} className={styles.navIcon}/>
                        <span className={styles.navText}>Map</span>
                    </a>
                </li>
                <li className={styles.navItem}>
                    <a href={WIKI} rel="noopener noreferrer" onClick={toggleMenu}>
                        <FontAwesomeIcon icon={faBook} className={styles.navIcon}/>
                        <span className={styles.navText}>Wiki</span>
                    </a>
                </li>
            </ul>

            {afterNavbarList && afterNavbarList}
        </nav>
    );
}



export default Navbar;
