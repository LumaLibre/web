import React from "react";
import styles from "./VoteLinkButton.module.scss";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faArrowUpRightFromSquare} from "@fortawesome/free-solid-svg-icons";

interface VoteLinkButtonProps {
    href: string;
    label: string;
    index: number;
}

const VoteLinkButton: React.FC<VoteLinkButtonProps> = ({href, label, index}) => {
    return (
        <a
            className={styles.button}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
        >
            <span className={styles.index}>{String(index).padStart(2, '0')}</span>
            <span className={styles.label}>{label}</span>
            <span className={styles.action}>
                Vote
                <FontAwesomeIcon icon={faArrowUpRightFromSquare}/>
            </span>
        </a>
    );
};

export default VoteLinkButton;
